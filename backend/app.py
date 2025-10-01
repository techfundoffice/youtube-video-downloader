import os
import logging
import asyncio
import uuid
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_socketio import SocketIO
from flask_cors import CORS
from youtube_downloader import YouTubeDownloader

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='../frontend/dist')
app.secret_key = os.environ.get("SECRET_KEY", "your-secret-key-here")

CORS(app, origins=["*"])

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

VIDEOS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../videos')
os.makedirs(VIDEOS_DIR, exist_ok=True)

youtube_downloader = YouTubeDownloader()

def validate_youtube_url(url: str) -> bool:
    """Validate YouTube URL format"""
    import re
    youtube_regex = r'^(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+'
    return bool(re.match(youtube_regex, url))

@app.route('/api/download-video', methods=['POST'])
def api_download_video():
    """REST API endpoint for video downloads with real-time Socket.io updates"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        youtube_url = data.get('youtube_url', '').strip()
        if not youtube_url:
            return jsonify({
                'success': False,
                'error': 'Please provide a YouTube URL'
            }), 400
        
        if not validate_youtube_url(youtube_url):
            return jsonify({
                'success': False,
                'error': 'Invalid YouTube URL format'
            }), 400
        
        session_id = str(uuid.uuid4())
        
        def process_in_background():
            with app.app_context():
                try:
                    socketio.emit('video_download_progress', {
                        'session_id': session_id,
                        'progress': 0,
                        'step': 'Initializing',
                        'status': 'IN_PROGRESS',
                        'message': 'Starting video download...',
                        'level': 'INFO'
                    })
                    
                    async def download_with_updates():
                        return await download_video_with_socketio(youtube_url, session_id)
                    
                    result = asyncio.run(asyncio.wait_for(download_with_updates(), timeout=180))
                    
                    if result.get('success'):
                        socketio.emit('video_download_complete', {
                            'session_id': session_id,
                            'success': True,
                            'download_url': result.get('download_url'),
                            'video_info': result.get('video_info'),
                            'progress': 100,
                            'step': 'Download Complete',
                            'message': 'Video download completed successfully!'
                        })
                    else:
                        socketio.emit('video_download_error', {
                            'session_id': session_id,
                            'success': False,
                            'message': result.get('error', 'Video download failed')
                        })
                        
                except asyncio.TimeoutError:
                    logger.error(f"Video download timeout for {youtube_url}")
                    socketio.emit('video_download_error', {
                        'session_id': session_id,
                        'success': False,
                        'message': 'Download timeout - please try with a shorter video'
                    })
                except Exception as e:
                    logger.error(f"Background video download error: {e}")
                    socketio.emit('video_download_error', {
                        'session_id': session_id,
                        'success': False,
                        'message': f'Download error: {str(e)}'
                    })
        
        socketio.start_background_task(process_in_background)
        
        return jsonify({
            'success': True,
            'message': 'Video download started',
            'session_id': session_id
        })
        
    except Exception as e:
        logger.error(f"API download video error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred. Please try again.'
        }), 500

async def download_video_with_socketio(youtube_url: str, session_id: str):
    """Download video with Socket.io progress updates"""
    try:
        socketio.emit('video_download_progress', {
            'session_id': session_id,
            'progress': 10,
            'step': 'Video Metadata',
            'status': 'EXTRACTING',
            'message': 'Getting video information...',
            'level': 'INFO'
        })
        
        download_result = youtube_downloader.download_video(youtube_url, quality="720p", session_id=session_id)
        
        if not download_result or not download_result.get('success'):
            return {
                'success': False,
                'error': download_result.get('error', 'Video download failed')
            }
        
        socketio.emit('video_download_progress', {
            'session_id': session_id,
            'progress': 80,
            'step': 'Processing Complete',
            'status': 'SUCCESS',
            'message': 'Video download completed, preparing file...',
            'level': 'INFO'
        })
        
        mp4_video_url = download_result.get('mp4_video_url')
        if not mp4_video_url:
            return {
                'success': False,
                'error': 'Video was downloaded but no download URL available'
            }
        
        return {
            'success': True,
            'download_url': mp4_video_url,
            'video_info': {
                'title': download_result.get('title'),
                'duration': f"{download_result.get('duration', 0)//60}m{download_result.get('duration', 0)%60}s",
                'thumbnail_url': download_result.get('thumbnail_url'),
                'mp4_video_url': mp4_video_url,
                'mp4_file_size': download_result.get('mp4_file_size')
            }
        }
        
    except Exception as e:
        logger.error(f"Video download error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/video/<filename>')
def serve_video(filename):
    """Serve video files"""
    try:
        if not filename.endswith('.mp4') or '..' in filename or '/' in filename:
            return "Invalid filename", 400
        
        video_path = os.path.join(VIDEOS_DIR, filename)
        if os.path.exists(video_path):
            return send_file(video_path, mimetype='video/mp4')
        
        return "Video not found", 404
    except Exception as e:
        logger.error(f"Error serving video: {str(e)}")
        return "Error serving video", 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """Serve React frontend"""
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
