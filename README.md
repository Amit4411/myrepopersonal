# 🎵 Corrupted Music Player

> **Your own ad-free personal music & video player hosted on GitHub Pages**

Tired of YouTube ads after every song?

Same.

That’s why I built **Corrupted Music Player** — a self-hosted music player where **you fully control your songs, videos, playlists, and playback order.**

---

## ❤️ Support

If you're reading this on my repository page and want to support me, please do.

You’ll find the **Support** button on the right side of GitHub.

You can also support me through:

- **Ko-fi** (sidebar)
- Fiverr: **Corrupted_Game**

Need a Minecraft server setup too? 👀

---

# Why I Built This

I got tired of:

- YouTube ads every few songs
- No full control over playlist order
- Depending on streaming platforms

As a developer, music is always playing while I work.

So I made this.

A simple GitHub Pages based music player where you can host your own songs for free.

---

# ✨ Features

## 🎶 Play Music & Video
Supports your personal media library.

---

## 📥 Download Directly From YouTube
Download songs/videos using GitHub Issues.

---

## 📃 Playlist Download Support
Download full YouTube playlists.

---

## ⏯ Drag & Reorder Songs
Customize playback sequence.

---

## 🔀 Shuffle Playlist

---

## 💾 Import / Export Playlist Order

---

## 🌐 Hosted Free on GitHub Pages

---

# 🚀 Setup Guide

---

# 1. Install Chrome Extension

Install:

**GetCookies.txt LOCALLY**

---

# 2. Fork This Repository

Click **Fork** (top-right)

While creating fork:

✅ Choose any repository name  
✅ Tick **Copy main branch only**

Then click:

**Create Fork**

---

# 3. Enable Issues

Go to:

**Settings → General → Features**

Enable:

✅ Issues

This is required for downloading from YouTube.

---

# 4. Enable GitHub Pages

Go to:

**Settings → Pages**

Under **Build and deployment**

Change source to:

**GitHub Actions**

---

# 5. Add Repository Secret

Go to:

**Settings → Secrets and variables → Actions**

Create:

## Secret Name
`YOUTUBE_COOKIES`

(Must be exact and uppercase)

---

# 6. Export YouTube Cookies

1. Open YouTube while logged in
2. Click Extensions (puzzle icon)
3. Open **GetCookies.txt LOCALLY**
4. Click **Export**

A TXT file will download.

---

# 7. Add Cookies

Copy everything inside downloaded TXT file.

Paste into your GitHub secret.

Save.

---

## ⚠ Important

Never share your cookies.

They are private.

---

# 8. Activate Your Site

Go to:

**Actions**

You will see 2 workflows:

### Download Audio from YouTube via YTDLP
Downloads songs/videos

### Deploy Music Player onto GitHub Pages
Publishes your website

Run:

**Deploy Music Player onto GitHub Pages**

---

# Download Songs

Go to:

**Issues → New Issue**

Only use the **title**

No description needed.

---

## Single Song / Video

Use:

`ytdlp: YOUTUBE_LINK`

Example:

`ytdlp: https://youtube.com/watch?v=...`

---

## Full Playlist

Use:

`ytdlp: PLAYLIST_LINK`

Playlist must be **public**

---

## Partial Playlist Download

Use:

`ytdlp: PLAYLIST_LINK start:20 end:24`

This downloads only videos 20 to 24.

---

# If Download Fails

This is almost always because your cookies expired.

## Fix

### 1. Export fresh cookies from YouTube

### 2. Delete current secret
`YOUTUBE_COOKIES`

### 3. Create new one with fresh cookies

### 4. Resume download using:

`start:X end:Y`

---

## Important Note

If an action fails while downloading:

❌ Files downloaded during that failed action are deleted

✅ Previously downloaded songs remain safe

That’s exactly why the **start / end** feature exists.

It lets you continue where download stopped.

---

## If Download Fails For Any Other Reason

Please report it on my **main repository**

---

# Successful Download

If successful:

✅ Issue closes automatically

If failed:

❌ Issue stays open

---

# After Downloading

Downloaded songs will NOT appear instantly.

You must redeploy.

Go to:

**Actions → Deploy Music Player onto GitHub Pages**

Click:

**Run workflow**

---

# Refresh Correctly

Use:

`Ctrl + Shift + R`

Normal refresh may show cached files.

---

# Manual Upload

Upload songs directly into:

`/music`

---

# Playlist Order

Controlled by:

`/music/index.json`

---

# Player Controls

Your site lets you:

- Play any song instantly
- Adjust volume
- Shuffle playlist
- Drag songs up/down

---

# Save Playlist Order

## Option 1 — Export JSON
Download your playlist order

Later import it back

---

## Option 2 — Permanent Save

Replace contents of:

`/music/index.json`

Commit changes

Done.

---

# Website URL

`https://YOUR_USERNAME.github.io/REPOSITORY_NAME`

---

# Repository Structure

```txt
/
├── index.html
├── style.css
├── script.js
├── README.md
├── LICENSE
└── music/
    ├── songs
    └── index.json
```

---

# Troubleshooting

## Site Not Updating
Use:

`Ctrl + Shift + R`

---

## Download Failed
Refresh cookies

---

## Action Failed Midway
Resume using:

`start:X end:Y`

---

# Made By

**Corrupted_Game**

Music should be uninterrupted.

---

# ⭐ Enjoy

Fork it.  
Edit it.  
Make it yours.
