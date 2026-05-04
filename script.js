/* ═══════════════════════════════════════════════════════════
   MediaPlayer — script.js
   Pure vanilla JS. No dependencies. Works on GitHub Pages.
   ═══════════════════════════════════════════════════════════ */

// ── Constants ────────────────────────────────────────────────
const AUDIO_EXT = ['.mp3','.ogg','.wav','.flac','.aac','.m4a','.opus','.weba'];
const VIDEO_EXT = ['.mp4','.webm','.mkv','.mov','.ogv'];
const LS_KEY    = 'mediaplayer-order';

// ── State ────────────────────────────────────────────────────
let tracks       = [];      // MediaFile[]
let currentIdx   = -1;
let isPlaying    = false;
let repeatMode   = 'all';   // 'none' | 'one' | 'all'
let shuffled     = false;
let shuffleOrder = [];
let dragSrcIdx   = null;
let searchQuery  = '';

// ── DOM Refs ─────────────────────────────────────────────────
const audioEl      = document.getElementById('audioEl');
const videoEl      = document.getElementById('videoEl');
const videoWrap    = document.getElementById('videoWrap');
const artWrap      = document.getElementById('artWrap');
const vinyl        = document.getElementById('vinyl');
const trackNameEl  = document.getElementById('trackName');
const seekBar      = document.getElementById('seekBar');
const volBar       = document.getElementById('volBar');
const volLabel     = document.getElementById('volLabel');
const currentTimeEl= document.getElementById('currentTime');
const totalTimeEl  = document.getElementById('totalTime');
const btnPlay      = document.getElementById('btnPlay');
const btnPrev      = document.getElementById('btnPrev');
const btnNext      = document.getElementById('btnNext');
const btnStop      = document.getElementById('btnStop');
const btnShuffle   = document.getElementById('btnShuffle');
const btnRepeat    = document.getElementById('btnRepeat');
const btnMute      = document.getElementById('btnMute');
const btnShuffleList = document.getElementById('btnShuffleList');
const btnExport    = document.getElementById('btnExport');
const importFile   = document.getElementById('importFile');
const searchInput  = document.getElementById('searchInput');
const trackList    = document.getElementById('trackList');
const emptyState   = document.getElementById('emptyState');
const trackCount   = document.getElementById('trackCount');
const demoBanner   = document.getElementById('demoBanner');
const btnGuide     = document.getElementById('btnGuide');
const guideModal   = document.getElementById('guideModal');
const modalClose   = document.getElementById('modalClose');

// ── Helpers ──────────────────────────────────────────────────
function getExt(name) {
  const m = name.match(/\.[^.]+$/);
  return m ? m[0].toLowerCase() : '';
}
function isAudio(name) { return AUDIO_EXT.includes(getExt(name)); }
function isVideo(name) { return VIDEO_EXT.includes(getExt(name)); }
function isMedia(name) { return isAudio(name) || isVideo(name); }
function stripExt(name) { return name.replace(/\.[^.]+$/, ''); }
function fmtTime(s) {
  if (!isFinite(s) || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2,'0')}`;
}
function getMediaEl() {
  if (currentIdx < 0 || !tracks[currentIdx]) return null;
  return tracks[currentIdx].type === 'video' ? videoEl : audioEl;
}

// ── Load media list ──────────────────────────────────────────
async function loadTracks() {
  // Try music/index.json first
  try {
    const res = await fetch('music/index.json');
    if (res.ok) {
      const data = await res.json();
      const files = Array.isArray(data) ? data : (data.files || []);
      const media = files.filter(isMedia);
      if (media.length > 0) {
        tracks = media.map(f => ({
          filename: f,
          name: stripExt(f),
          url: 'music/' + encodeURIComponent(f),
          type: isVideo(f) ? 'video' : 'audio'
        }));
        restoreSavedOrder();
        renderList();
        return;
      }
    }
  } catch(e) {}

  // No real files — show demo
  tracks = [
    { filename:'demo1.mp3', name:'Chill Lo-Fi Beat',       url:'', type:'audio' },
    { filename:'demo2.mp3', name:'Acoustic Guitar Session', url:'', type:'audio' },
    { filename:'demo3.mp3', name:'Epic Cinematic Score',    url:'', type:'audio' },
    { filename:'demo4.mp3', name:'Deep House Groove',       url:'', type:'audio' },
    { filename:'demo5.mp3', name:'Jazz Trio Live',          url:'', type:'audio' },
    { filename:'demo6.mp3', name:'Ambient Soundscape',      url:'', type:'audio' },
    { filename:'demo7.mp3', name:'Rock Anthem',             url:'', type:'audio' },
    { filename:'demo8.mp3', name:'Piano Nocturne',          url:'', type:'audio' },
    { filename:'demo9.mp4', name:'Sample Music Video',      url:'', type:'video' },
  ];
  demoBanner.classList.remove('hidden');
  renderList();
}

function restoreSavedOrder() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (!saved) return;
    const { playlist } = JSON.parse(saved);
    const map = new Map(tracks.map(t => [t.filename, t]));
    const ordered = [];
    for (const fn of playlist) { if (map.has(fn)) { ordered.push(map.get(fn)); map.delete(fn); } }
    for (const t of map.values()) ordered.push(t);
    if (ordered.length === tracks.length) tracks = ordered;
  } catch(e) {}
}

// ── Render playlist ──────────────────────────────────────────
function renderList() {
  trackCount.textContent = tracks.length;
  const q = searchQuery.toLowerCase();
  const filtered = q
    ? tracks.map((t, i) => ({ t, i })).filter(({ t }) => t.name.toLowerCase().includes(q))
    : tracks.map((t, i) => ({ t, i }));

  // Remove existing track items (keep emptyState)
  Array.from(trackList.querySelectorAll('.track-item')).forEach(el => el.remove());

  if (filtered.length === 0) {
    emptyState.style.display = '';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach(({ t, i }, listPos) => {
    const li = document.createElement('li');
    li.className = 'track-item' + (i === currentIdx ? ' active' : '');
    li.dataset.idx = i;
    li.draggable = !q;

    // Drag handle
    const grip = document.createElement('span');
    grip.className = 'drag-handle';
    grip.textContent = '⠿';

    // Number / waveform
    const numWrap = document.createElement('span');
    if (i === currentIdx && isPlaying) {
      numWrap.innerHTML = `<span class="wave-bars">
        <span class="wave-bar"></span><span class="wave-bar"></span>
        <span class="wave-bar"></span><span class="wave-bar"></span>
      </span>`;
    } else {
      numWrap.className = 'track-num';
      numWrap.textContent = String(listPos + 1).padStart(2, '0');
    }

    // Type icon
    const icon = document.createElement('span');
    icon.className = 'track-type-icon';
    icon.textContent = t.type === 'video' ? '🎬' : '🎵';

    // Name
    const info = document.createElement('div');
    info.className = 'track-info';
    info.innerHTML = `<div class="track-info-name">${escHtml(t.name)}</div>`;

    li.appendChild(grip);
    li.appendChild(numWrap);
    li.appendChild(icon);
    li.appendChild(info);

    if (t.type === 'video') {
      const badge = document.createElement('span');
      badge.className = 'badge-video';
      badge.textContent = 'Video';
      li.appendChild(badge);
    }

    // Click to play
    li.addEventListener('click', () => playTrack(i, true));

    // Drag events
    if (!q) {
      li.addEventListener('dragstart', e => { dragSrcIdx = i; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
      li.addEventListener('dragover',  e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; li.classList.add('drag-over'); });
      li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
      li.addEventListener('dragend',   () => { li.classList.remove('dragging'); dragSrcIdx = null; });
      li.addEventListener('drop', e => {
        e.preventDefault();
        li.classList.remove('drag-over');
        if (dragSrcIdx === null || dragSrcIdx === i) return;
        const moved = tracks.splice(dragSrcIdx, 1)[0];
        const newIdx = dragSrcIdx < i ? i : i;
        tracks.splice(dragSrcIdx < i ? i - 1 : i, 0, moved);
        // Adjust currentIdx
        if (currentIdx === dragSrcIdx) currentIdx = tracks.indexOf(moved);
        saveOrder();
        renderList();
      });
    }

    trackList.appendChild(li);
  });
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Playback ─────────────────────────────────────────────────
function playTrack(idx, autoplay = false) {
  const track = tracks[idx];
  if (!track) return;

  // Pause both
  audioEl.pause(); videoEl.pause();

  currentIdx = idx;

  const isVid = track.type === 'video';
  videoWrap.classList.toggle('hidden', !isVid);
  artWrap.style.display = isVid ? 'none' : '';

  const el = isVid ? videoEl : audioEl;
  el.src = track.url || '';
  el.volume = parseFloat(volBar.value);
  el.load();

  trackNameEl.textContent = track.name;
  seekBar.value = 0;
  currentTimeEl.textContent = '0:00';
  totalTimeEl.textContent = '0:00';

  if (autoplay && track.url) {
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  } else {
    setPlaying(false);
  }

  renderList();
}

function setPlaying(val) {
  isPlaying = val;
  btnPlay.textContent = val ? '⏸' : '▶';
  vinyl.classList.toggle('spinning', val && tracks[currentIdx]?.type === 'audio');
}

function getNextIdx(cur) {
  if (shuffled && shuffleOrder.length) {
    const pos = shuffleOrder.indexOf(cur);
    return shuffleOrder[(pos + 1) % shuffleOrder.length];
  }
  return (cur + 1) % tracks.length;
}
function getPrevIdx(cur) {
  if (shuffled && shuffleOrder.length) {
    const pos = shuffleOrder.indexOf(cur);
    return shuffleOrder[(pos - 1 + shuffleOrder.length) % shuffleOrder.length];
  }
  return (cur - 1 + tracks.length) % tracks.length;
}

// ── Controls ─────────────────────────────────────────────────
btnPlay.addEventListener('click', () => {
  if (currentIdx < 0) { if (tracks.length) playTrack(0, true); return; }
  const el = getMediaEl();
  if (!el) return;
  if (isPlaying) { el.pause(); setPlaying(false); }
  else {
    if (el.src && el.src !== window.location.href) {
      el.play().then(() => setPlaying(true)).catch(() => {});
    }
  }
});

btnPrev.addEventListener('click', () => {
  if (!tracks.length) return;
  const el = getMediaEl();
  if (el && el.currentTime > 3) { el.currentTime = 0; return; }
  playTrack(currentIdx < 0 ? 0 : getPrevIdx(currentIdx), true);
});

btnNext.addEventListener('click', () => {
  if (!tracks.length) return;
  playTrack(currentIdx < 0 ? 0 : getNextIdx(currentIdx), true);
});

btnStop.addEventListener('click', () => {
  const el = getMediaEl();
  if (!el) return;
  el.pause(); el.currentTime = 0;
  setPlaying(false);
  seekBar.value = 0; currentTimeEl.textContent = '0:00';
});

btnShuffle.addEventListener('click', () => {
  shuffled = !shuffled;
  btnShuffle.classList.toggle('active', shuffled);
  shuffleOrder = shuffled
    ? Array.from({length: tracks.length}, (_,i) => i).sort(() => Math.random() - .5)
    : [];
});

btnRepeat.addEventListener('click', () => {
  repeatMode = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none';
  btnRepeat.classList.toggle('active', repeatMode !== 'none');
  btnRepeat.textContent = repeatMode === 'one' ? '🔂' : '↺';
  btnRepeat.title = 'Repeat: ' + repeatMode;
});

let prevVol = 0.8;
btnMute.addEventListener('click', () => {
  const el = getMediaEl();
  if (parseFloat(volBar.value) > 0) {
    prevVol = parseFloat(volBar.value);
    volBar.value = 0;
  } else {
    volBar.value = prevVol;
  }
  const v = parseFloat(volBar.value);
  audioEl.volume = v; videoEl.volume = v;
  if (el) el.volume = v;
  volLabel.textContent = Math.round(v * 100);
  btnMute.textContent = v === 0 ? '🔇' : v < 0.5 ? '🔉' : '🔊';
  updateRangeStyle(volBar, v, 0, 1);
});

volBar.addEventListener('input', () => {
  const v = parseFloat(volBar.value);
  audioEl.volume = v; videoEl.volume = v;
  const el = getMediaEl(); if (el) el.volume = v;
  volLabel.textContent = Math.round(v * 100);
  btnMute.textContent = v === 0 ? '🔇' : v < 0.5 ? '🔉' : '🔊';
  updateRangeStyle(volBar, v, 0, 1);
});

seekBar.addEventListener('input', () => {
  const el = getMediaEl(); if (!el) return;
  el.currentTime = parseFloat(seekBar.value);
});

// ── Media events ─────────────────────────────────────────────
function wireMediaEl(el) {
  el.addEventListener('timeupdate', () => {
    if (el !== getMediaEl()) return;
    currentTimeEl.textContent = fmtTime(el.currentTime);
    if (!isNaN(el.duration) && el.duration > 0) {
      seekBar.value = el.currentTime;
      updateRangeStyle(seekBar, el.currentTime, 0, el.duration);
    }
  });
  el.addEventListener('durationchange', () => {
    if (el !== getMediaEl()) return;
    const d = el.duration;
    totalTimeEl.textContent = fmtTime(d);
    seekBar.max = isFinite(d) ? d : 100;
  });
  el.addEventListener('play',  () => { if (el === getMediaEl()) setPlaying(true);  });
  el.addEventListener('pause', () => { if (el === getMediaEl()) setPlaying(false); });
  el.addEventListener('ended', () => {
    if (el !== getMediaEl()) return;
    if (repeatMode === 'one') { el.currentTime = 0; el.play(); return; }
    if (repeatMode === 'none' && currentIdx === tracks.length - 1) { setPlaying(false); return; }
    playTrack(getNextIdx(currentIdx), true);
  });
}
wireMediaEl(audioEl);
wireMediaEl(videoEl);

// ── Range fill helper ─────────────────────────────────────────
function updateRangeStyle(input, val, min, max) {
  const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
  input.style.setProperty('--fill', pct + '%');
  input.style.background =
    `linear-gradient(to right, var(--primary) ${pct}%, var(--border) ${pct}%)`;
}
// Init volume fill
updateRangeStyle(volBar, 0.8, 0, 1);

// ── Playlist actions ──────────────────────────────────────────
btnShuffleList.addEventListener('click', () => {
  tracks = tracks.sort(() => Math.random() - .5);
  currentIdx = -1;
  saveOrder(); renderList();
});

btnExport.addEventListener('click', () => {
  const data = { playlist: tracks.map(t => t.filename), version: 1 };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'playlist.json'; a.click();
  URL.revokeObjectURL(url);
});

importFile.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const data = JSON.parse(evt.target.result);
      const order = Array.isArray(data) ? data : (data.playlist || []);
      if (!order.length) return;
      const map = new Map(tracks.map(t => [t.filename, t]));
      const ordered = [];
      for (const fn of order) { if (map.has(fn)) { ordered.push(map.get(fn)); map.delete(fn); } }
      for (const t of map.values()) ordered.push(t);
      tracks = ordered; currentIdx = -1;
      saveOrder(); renderList();
    } catch { alert('Invalid playlist file.'); }
  };
  reader.readAsText(file);
  e.target.value = '';
});

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  renderList();
});

// ── Persist order ────────────────────────────────────────────
function saveOrder() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ playlist: tracks.map(t => t.filename) }));
  } catch(e) {}
}

// ── Guide modal ───────────────────────────────────────────────
btnGuide.addEventListener('click',  () => guideModal.classList.remove('hidden'));
modalClose.addEventListener('click',() => guideModal.classList.add('hidden'));
guideModal.addEventListener('click', e => { if (e.target === guideModal) guideModal.classList.add('hidden'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') guideModal.classList.add('hidden'); });

// ── Keyboard shortcuts ────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space') { e.preventDefault(); btnPlay.click(); }
  if (e.code === 'ArrowRight') btnNext.click();
  if (e.code === 'ArrowLeft')  btnPrev.click();
  if (e.code === 'KeyS')       btnStop.click();
});

// ── Init ──────────────────────────────────────────────────────
loadTracks();
