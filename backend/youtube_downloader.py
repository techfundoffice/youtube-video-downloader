"""
YouTube MP4 video downloader using yt-dlp for local storage
"""
import os
import logging
import subprocess
import json
from typing import Dict, Any, Optional
import tempfile
import shutil

logger = logging.getLogger(__name__)

class YouTubeDownloader:
    """Video downloader using yt-dlp for YouTube videos"""
    
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp(prefix="youtube_dl_")
        self.videos_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../videos')
        os.makedirs(self.videos_dir, exist_ok=True)
        
    def __del__(self):
        """Cleanup temp directory"""
        try:
            if hasattr(self, 'temp_dir') and os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir)
        except:
            pass
    
    def check_ytdlp_available(self) -> bool:
        """Check if yt-dlp is available"""
        try:
            result = subprocess.run(['yt-dlp', '--version'], 
                                  capture_output=True, text=True, timeout=10)
            return result.returncode == 0
        except:
            return False
    
    def install_ytdlp(self) -> bool:
        """Install yt-dlp if not available"""
        try:
            logger.info("Installing yt-dlp...")
            result = subprocess.run(['pip', 'install', 'yt-dlp'], 
                                  capture_output=True, text=True, timeout=60)
            if result.returncode == 0:
                logger.info("yt-dlp installed successfully")
                return True
            else:
                logger.error(f"Failed to install yt-dlp: {result.stderr}")
                return False
        except Exception as e:
            logger.error(f"Error installing yt-dlp: {str(e)}")
            return False
    
    def download_video(self, youtube_url: str, quality: str = "720p", session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Download YouTube video using yt-dlp
        
        Args:
            youtube_url: YouTube video URL
            quality: Video quality (720p, 480p, best, worst)
            session_id: Session ID for logging
            
        Returns:
            Dict containing download information
        """
        try:
            if not self.check_ytdlp_available():
                logger.info("yt-dlp not found, attempting to install...")
                if not self.install_ytdlp():
                    return {
                        'success': False,
                        'error': 'yt-dlp installation failed - cannot proceed with download'
                    }
            
            if quality == "720p":
                format_selector = "best[height<=720][protocol!*=dash]/best[height<=480][protocol!*=dash]/best[height<=360]/worst"
            elif quality == "480p":
                format_selector = "best[height<=480][protocol!*=dash]/best[height<=360]/worst"
            elif quality == "best":
                format_selector = "best[protocol!*=dash]/worst"
            else:
                format_selector = "worst[protocol!*=dash]/worst"
            
            info_cmd = [
                'yt-dlp',
                '--dump-json',
                '--no-download',
                '--extractor-args', 'youtube:player_client=android,web;skip=dash,hls',
                '--user-agent', 'Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36',
                '--no-warnings',
                '--socket-timeout', '30',
                '--retries', '2',
                youtube_url
            ]
            
            logger.info(f"Getting video info for: {youtube_url}")
            info_result = subprocess.run(info_cmd, capture_output=True, text=True, timeout=45)
            
            if info_result.returncode != 0:
                logger.warning("Android client failed, trying fallback clients...")
                fallback_clients = ['web', 'ios', 'mweb']
                
                for client in fallback_clients:
                    fallback_cmd = [
                        'yt-dlp',
                        '--dump-json',
                        '--no-download',
                        '--extractor-args', f'youtube:player_client={client}',
                        '--no-warnings',
                        youtube_url
                    ]
                    fallback_result = subprocess.run(fallback_cmd, capture_output=True, text=True, timeout=30)
                    if fallback_result.returncode == 0:
                        info_result = fallback_result
                        logger.info(f"Successfully used {client} client for metadata extraction")
                        break
                else:
                    return {
                        'success': False,
                        'error': f'Failed to get video info: {info_result.stderr}'
                    }
            
            video_info = json.loads(info_result.stdout)
            title = video_info.get('title', 'Unknown Title')[:50]
            duration = video_info.get('duration', 0)
            
            output_template = os.path.join(self.temp_dir, f"%(id)s.%(ext)s")
            download_cmd = [
                'yt-dlp',
                '-f', format_selector,
                '-o', output_template,
                '--extractor-args', 'youtube:player_client=android,web;skip=dash,hls',
                '--user-agent', 'Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36',
                '--no-warnings',
                '--socket-timeout', '45',
                '--retries', '2',
                '--fragment-retries', '2',
                '--retry-sleep', '2',
                '--no-continue',
                '--geo-bypass',
                youtube_url
            ]
            
            logger.info(f"Downloading video with quality: {quality}")
            download_result = subprocess.run(download_cmd, capture_output=True, text=True, timeout=180)
            
            if download_result.returncode != 0:
                logger.warning("Initial download failed, trying fallback clients...")
                fallback_clients = ['web', 'ios', 'mweb']
                
                for client in fallback_clients:
                    fallback_download_cmd = [
                        'yt-dlp',
                        '-f', format_selector,
                        '-o', output_template,
                        '--extractor-args', f'youtube:player_client={client}',
                        '--no-warnings',
                        '--retries', '2',
                        '--fragment-retries', '2',
                        '--retry-sleep', '1',
                        youtube_url
                    ]
                    
                    fallback_result = subprocess.run(fallback_download_cmd, capture_output=True, text=True, timeout=300)
                    if fallback_result.returncode == 0:
                        download_result = fallback_result
                        logger.info(f"Successfully downloaded using {client} client")
                        break
                else:
                    return {
                        'success': False,
                        'error': 'Download failed with all clients due to YouTube restrictions'
                    }
            
            video_id = video_info.get('id', 'unknown')
            downloaded_files = [f for f in os.listdir(self.temp_dir) if f.startswith(video_id)]
            
            if not downloaded_files:
                return {
                    'success': False,
                    'error': 'Downloaded file not found'
                }
            
            downloaded_file = os.path.join(self.temp_dir, downloaded_files[0])
            file_size = os.path.getsize(downloaded_file)
            
            permanent_path = os.path.join(self.videos_dir, downloaded_files[0])
            shutil.copy2(downloaded_file, permanent_path)
            
            logger.info(f"Download completed: {downloaded_file} ({file_size} bytes)")
            
            video_filename = os.path.basename(downloaded_file)
            http_video_url = f"/video/{video_filename}"
            
            return {
                'success': True,
                'mp4_video_url': http_video_url,
                'mp4_download_status': 'completed',
                'mp4_file_size': file_size,
                'local_path': permanent_path,
                'video_id': video_id,
                'title': video_info.get('title', ''),
                'duration': video_info.get('duration', 0),
                'thumbnail_url': video_info.get('thumbnail', ''),
                'description': video_info.get('description', ''),
                'view_count': video_info.get('view_count', 0),
                'uploader': video_info.get('uploader', ''),
                'upload_date': video_info.get('upload_date', ''),
                'filename': downloaded_files[0],
                'source': 'youtube-downloader'
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Download timeout due to YouTube restrictions'
            }
        except Exception as e:
            logger.error(f"YouTube download error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
