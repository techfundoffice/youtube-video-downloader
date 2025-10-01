import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import ProcessingLogs from '@/components/ProcessingLogs'
import { useVideoDownload } from '@/hooks/use-video-download'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { 
  Download, 
  Zap,
  Video,
  Cloud,
  DollarSign,
  CheckCircle2,
  Play,
  XCircle
} from 'lucide-react'

export default function DownloadVideoPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const { toast } = useToast()
  
  const {
    downloadVideo,
    clearDownload,
    isLoading,
    progress,
    currentStep,
    logs,
    error,
    downloadUrl,
    videoInfo,
    sessionId
  } = useVideoDownload()

  const validateUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!youtubeUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube video URL to download.",
        variant: "destructive"
      })
      return
    }

    if (!validateUrl(youtubeUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=...)",
        variant: "destructive"
      })
      return
    }

    try {
      await downloadVideo(youtubeUrl)
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Unable to download video. Please try again or contact support.",
        variant: "destructive"
      })
    }
  }

  const handleDownloadFile = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
  }

  const handleClear = () => {
    clearDownload()
    setYoutubeUrl('')
  }

  const handleWatchVideo = () => {
    if (youtubeUrl) {
      window.open(youtubeUrl, '_blank')
    }
  }

  const features = [
    {
      icon: Zap,
      title: 'Fast Download',
      description: 'Download YouTube videos quickly with our optimized processing system'
    },
    {
      icon: Video,
      title: 'High Quality MP4',
      description: 'Get videos in high-quality MP4 format, up to 720p resolution'
    },
    {
      icon: Cloud,
      title: 'Local Storage',
      description: 'Videos are securely stored locally on the server'
    },
    {
      icon: DollarSign,
      title: 'Free Download',
      description: 'Completely free service with no hidden fees or subscriptions'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Download YouTube Videos
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Download any YouTube video in high-quality MP4 format. Fast, reliable, and completely free to use.
            </p>
            
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="card p-8 shadow-2xl">
                <div className="space-y-4">
                  <Input
                    type="url"
                    placeholder="Paste YouTube URL here (e.g., https://youtube.com/watch?v=...)"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="h-14 text-lg input-field hero-input"
                    disabled={isLoading}
                    required
                  />
                  
                  {youtubeUrl && !validateUrl(youtubeUrl) && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      Invalid URL format. Please enter a valid YouTube URL.
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="flex-1 h-14 text-lg btn-primary btn-large"
                      disabled={isLoading || !youtubeUrl}
                    >
                      {isLoading ? (
                        <>
                          <Download className="mr-2 h-5 w-5 animate-pulse" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5" />
                          Download Video
                        </>
                      )}
                    </Button>
                    
                    {youtubeUrl && !isLoading && (
                      <Button 
                        type="button" 
                        variant="outline"
                        size="lg" 
                        className="h-14 px-6"
                        onClick={handleWatchVideo}
                      >
                        <Play className="h-5 w-5" />
                      </Button>
                    )}
                    
                    {(downloadUrl || error || logs.length > 0) && !isLoading && (
                      <Button 
                        type="button" 
                        variant="outline"
                        size="lg" 
                        className="h-14 px-6"
                        onClick={handleClear}
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </form>

              {isLoading && (
                <div className="mt-6 card p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {currentStep || 'Processing...'}
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full gradient-primary transition-all duration-500 ease-out" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Processing your video download request...
                  </p>
                </div>
              )}

              {videoInfo && !isLoading && (
                <div className="mt-6 card p-6 animate-fade-in">
                  <div className="flex items-start gap-4">
                    {videoInfo.thumbnail_url && (
                      <img 
                        src={videoInfo.thumbnail_url} 
                        alt={videoInfo.title}
                        className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {videoInfo.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          <span>Duration: {videoInfo.duration}</span>
                        </div>
                        {videoInfo.mp4_file_size && (
                          <div className="flex items-center gap-1">
                            <Cloud className="w-4 h-4" />
                            <span>Size: {Math.round(videoInfo.mp4_file_size / (1024 * 1024))} MB</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {downloadUrl && !isLoading && (
                <div className="mt-6 card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Video Ready for Download
                        </h3>
                        <p className="text-sm text-gray-600">
                          Your video has been processed successfully
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleDownloadFile}
                      className="btn-primary"
                      size="lg"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download MP4
                    </Button>
                  </div>
                </div>
              )}

              {error && !isLoading && (
                <div className="mt-6 card p-6 bg-red-50 border-red-200 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-900">
                        Download Failed
                      </h3>
                      <p className="text-sm text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section-container">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Use Our Video Downloader?</h2>
            <p className="section-subtitle">
              Fast, reliable, and feature-rich video downloading experience
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-card-icon">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Three simple steps to download any YouTube video
            </p>
          </div>
          
          <div className="steps-grid">
            <div className="text-center">
              <div className="step-indicator">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Paste Video URL</h3>
              <p className="text-gray-600 leading-relaxed">
                Copy the YouTube video URL and paste it into the input field above
              </p>
            </div>
            <div className="text-center">
              <div className="step-indicator">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Process & Extract</h3>
              <p className="text-gray-600 leading-relaxed">
                Our system processes the video and extracts the MP4 file for you
              </p>
            </div>
            <div className="text-center">
              <div className="step-indicator">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Download Video</h3>
              <p className="text-gray-600 leading-relaxed">
                Click the download button and save the video to your device
              </p>
            </div>
          </div>
        </div>
      </section>

      {(isLoading || logs.length > 0) && (
        <section className="section-container">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="section-title">Processing Status</h2>
              <p className="section-subtitle">
                Real-time updates from the video download system
              </p>
            </div>
            <div className="card p-6">
              <ProcessingLogs 
                logs={logs} 
                sessionId={sessionId || undefined}
                enableRealTime={isLoading} 
                className="max-h-96"
              />
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
