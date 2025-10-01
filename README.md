# YouTube Video Downloader

A standalone, full-stack YouTube video downloader with real-time progress updates. Download YouTube videos in high-quality MP4 format with a beautiful, modern user interface.

## 🌟 Features

- **Fast Downloads**: Download YouTube videos quickly with optimized processing
- **High Quality**: Get videos in MP4 format up to 720p resolution
- **Real-time Updates**: Socket.IO powered real-time progress tracking
- **Beautiful UI**: Modern, responsive interface with purple gradient design
- **Processing Logs**: Detailed real-time logs showing download status
- **Error Handling**: Robust fallback mechanisms for YouTube restrictions

## 🏗️ Tech Stack

### Backend
- **Flask**: Python web framework
- **Flask-SocketIO**: Real-time bidirectional communication
- **eventlet**: Async server for WebSocket support
- **yt-dlp**: YouTube video downloader with SABR workarounds
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible UI components
- **Socket.IO Client**: Real-time client library
- **Lucide Icons**: Modern icon library

## 📦 Project Structure

```
youtube-downloader-standalone/
├── backend/
│   ├── app.py                    # Flask app with Socket.IO
│   ├── youtube_downloader.py     # YouTube download service
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── Header.tsx       # App header
│   │   │   ├── Footer.tsx       # App footer
│   │   │   └── ProcessingLogs.tsx
│   │   ├── hooks/
│   │   │   ├── use-video-download.ts
│   │   │   └── use-toast.ts
│   │   ├── lib/
│   │   │   └── utils.ts         # Utility functions
│   │   ├── pages/
│   │   │   └── DownloadVideoPage.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── videos/                       # Downloaded videos storage
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd youtube-downloader-standalone
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   # or
   yarn install
   ```

### Development

The development setup uses **Vite's built-in proxy** to automatically forward API requests, Socket.IO connections, and video requests to the Flask backend. No CORS issues or manual configuration needed!

1. **Start the backend server** (Terminal 1)
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```
   Backend will run on `http://localhost:5000`

2. **Start the frontend dev server** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   # or
   yarn dev
   ```
   Frontend will run on `http://localhost:5173`
   
   The Vite proxy automatically forwards:
   - `/api/*` → Flask backend API
   - `/socket.io/*` → Socket.IO WebSocket connections
   - `/videos/*` → Downloaded video files

3. **Open your browser**
   Navigate to `http://localhost:5173` and everything will work seamlessly!

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   # or
   yarn build
   ```
   This creates a `dist` folder with optimized static files.

2. **Run the production server**
   ```bash
   cd ../backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```
   The Flask app will serve both the API and the built React app from `http://localhost:5000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
FLASK_ENV=development  # or production
PORT=5000
```

### Backend Configuration

The backend uses:
- **Port**: 5000 (default)
- **Async Mode**: eventlet (required for Socket.IO)
- **CORS**: Enabled for all origins in development
- **Video Storage**: `../videos/` directory

### Frontend Configuration

The frontend is configured with Vite proxy for seamless development:
- **Vite Dev Server**: Port 5173
- **Proxy Configuration**: Automatically forwards requests to Flask backend
  - `/api/*` → `http://localhost:5000/api/*`
  - `/socket.io/*` → `http://localhost:5000/socket.io/*` (with WebSocket support)
  - `/videos/*` → `http://localhost:5000/videos/*`
- **Build Output**: `dist/` directory
- **No CORS issues**: Proxy handles cross-origin communication in development

## 📝 API Documentation

### POST /api/download-video

Download a YouTube video with real-time progress updates.

**Request Body:**
```json
{
  "youtube_url": "https://youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video download started",
  "session_id": "uuid-here"
}
```

**Socket.IO Events:**

- `video_download_progress`: Real-time progress updates
  ```json
  {
    "session_id": "uuid",
    "progress": 50,
    "step": "Downloading",
    "status": "IN_PROGRESS",
    "message": "Processing..."
  }
  ```

- `video_download_complete`: Download completed
  ```json
  {
    "session_id": "uuid",
    "success": true,
    "download_url": "/video/filename.mp4",
    "video_info": {
      "title": "Video Title",
      "duration": "3m45s",
      "thumbnail_url": "...",
      "mp4_file_size": 12345678
    }
  }
  ```

- `video_download_error`: Download failed
  ```json
  {
    "session_id": "uuid",
    "success": false,
    "message": "Error message"
  }
  ```

### GET /video/:filename

Serve downloaded video files.

**Response:** MP4 video file

## 🛠️ Technical Details

### Socket.IO Configuration

The app uses **eventlet** as the async mode for Socket.IO. This is critical for WebSocket support:

```python
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
```

### YouTube Download Logic

The downloader implements multiple fallback mechanisms:
1. Primary: Android client with SABR workarounds
2. Fallback: Web, iOS, and mobile web clients
3. Smart retry logic with exponential backoff
4. Fragment retry for streaming issues

### Real-time Progress Updates

Progress is tracked through Socket.IO events:
- Initial connection and validation
- Video metadata extraction
- Download progress (with percentage)
- Processing completion
- Error handling and fallback activation

## 🎨 Design System

The app uses a consistent purple gradient theme:
- Primary: `#8B5CF6` to `#7C3AED`
- Accent: `#6D28D9`
- Cards: White with subtle shadows
- Animations: Smooth fade-in and slide-up effects

## 🐛 Troubleshooting

### Common Issues

**1. Socket.IO connection fails**
- Ensure eventlet is installed: `pip install eventlet`
- Check that backend is running on port 5000
- Verify CORS is enabled

**2. Video download fails**
- YouTube may have restrictions on the video
- Try a different video or quality setting
- Check yt-dlp is installed: `pip install yt-dlp`

**3. Frontend build fails**
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall dependencies: `npm install`

**4. Videos not serving**
- Check the `videos/` directory exists
- Verify file permissions
- Ensure Flask static file serving is configured

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Flask, React, and yt-dlp**
