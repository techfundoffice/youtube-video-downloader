# 🚀 Push to GitHub - Simple Instructions

## Quick Copy-Paste Commands

Run these commands in your terminal:

```bash
cd youtube-downloader-standalone

# Initialize git (if not already done)
git init
git add .

# Create the commit
git commit -m "Initial commit: Standalone YouTube video downloader with React + Flask"

# Create a new repo on GitHub via the GitHub CLI or web interface
# Then add remote and push:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/youtube-video-downloader.git
git push -u origin main
```

## OR Use the GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `youtube-video-downloader`
3. Description: "Standalone YouTube video downloader with real-time progress tracking"
4. Click "Create repository"
5. Follow the "push an existing repository" instructions shown

## OR Use GitHub CLI (Easiest!)

```bash
cd youtube-downloader-standalone

# Login to GitHub (first time only)
gh auth login

# Create repo and push in one command
gh repo create youtube-video-downloader --public --source=. --remote=origin --push
```

That's it! Your standalone YouTube downloader will be live on GitHub! 🎉

## After Pushing to GitHub

Share the repository URL and anyone can:
```bash
git clone https://github.com/YOUR_USERNAME/youtube-video-downloader.git
cd youtube-video-downloader
./start-dev.sh  # On macOS/Linux
# OR
start-dev.bat   # On Windows
```
