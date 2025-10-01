# 🚀 Quick Start Guide

## Easiest Way to Run

### On macOS/Linux:
```bash
./start-dev.sh
```

### On Windows:
```bash
start-dev.bat
```

This will automatically:
1. Create Python virtual environment (if needed)
2. Install all backend dependencies
3. Install all frontend dependencies  
4. Start Flask backend on port 5000
5. Start React frontend on port 5173 with Vite proxy

The **Vite proxy** automatically forwards all API requests, Socket.IO connections, and video requests to the Flask backend - no CORS issues!

Then open **http://localhost:5173** in your browser!

---

## Manual Setup (Alternative)

### Backend (Terminal 1)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Backend runs on **http://localhost:5000**

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173** with Vite proxy enabled

The Vite dev server automatically proxies:
- `/api/*` → Flask backend
- `/socket.io/*` → Socket.IO WebSockets  
- `/videos/*` → Downloaded videos

---

## Production Deployment

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Run the production server:**
   ```bash
   cd ../backend
   source venv/bin/activate  # Windows: venv\Scripts\activate
   python app.py
   ```

The Flask server will serve both API and frontend from **http://localhost:5000**

---

## Troubleshooting

### Backend won't start
- Make sure Python 3.8+ is installed
- Try: `pip install --upgrade pip`
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Make sure Node.js 18+ is installed
- Delete `node_modules` and `package-lock.json`
- Run: `npm install` again

### Socket.IO connection issues
- Make sure backend is running on port 5000
- Check that eventlet is installed: `pip list | grep eventlet`
- Verify no firewall is blocking port 5000

### Video downloads fail
- YouTube may have restrictions on certain videos
- Try a different video
- Check yt-dlp version: `pip show yt-dlp`
- Update yt-dlp: `pip install --upgrade yt-dlp`

---

## 📁 Project Structure

```
youtube-downloader-standalone/
├── backend/              # Flask backend
├── frontend/             # React frontend  
├── videos/              # Downloaded videos
├── README.md            # Full documentation
├── QUICK_START.md       # This file
├── start-dev.sh         # macOS/Linux startup
└── start-dev.bat        # Windows startup
```

---

## 🎯 How to Use

1. Paste a YouTube video URL
2. Click "Download Video"
3. Watch real-time progress
4. Download the MP4 file when ready!

---

## 📚 Need More Help?

See the full **[README.md](README.md)** for:
- Detailed API documentation
- Technical architecture
- Configuration options
- Contributing guidelines
