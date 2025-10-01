import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { io } from 'socket.io-client'

interface LogEntry {
  timestamp: string
  step: string
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | 'WARNING' | 'RUNNING' | 'ACTIVATED'
  message: string
  level?: 'ERROR' | 'WARNING' | 'INFO'
  details?: string
}

interface VideoDownloadResult {
  success: boolean
  session_id?: string
  download_url?: string
  video_info?: {
    title: string
    duration: string
    thumbnail_url?: string
    mp4_video_url?: string
    mp4_file_size?: number
  }
  error?: string
}

export const useVideoDownload = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [videoInfo, setVideoInfo] = useState<VideoDownloadResult['video_info'] | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const { toast } = useToast()

  const downloadVideo = useCallback(async (youtubeUrl: string): Promise<VideoDownloadResult | null> => {
    setIsLoading(true)
    setProgress(0)
    setCurrentStep('Initializing...')
    setLogs([])
    setError(null)
    setDownloadUrl(null)
    setVideoInfo(null)
    setSessionId(null)

    try {
      const socket = io()

      socket.on('video_download_progress', (data) => {
        setProgress(data.progress || 0)
        setCurrentStep(data.step || 'Processing...')
        
        const logEntry: LogEntry = {
          timestamp: new Date().toISOString(),
          step: data.step || 'Processing',
          status: data.status || 'IN_PROGRESS',
          message: data.message || 'Processing...',
          level: data.level || 'INFO'
        }
        
        setLogs(prev => [...prev, logEntry])
      })

      socket.on('video_download_complete', (data) => {
        setProgress(100)
        setCurrentStep('Download Complete')
        setDownloadUrl(data.download_url)
        setVideoInfo(data.video_info)
        
        toast({
          title: "Success!",
          description: "Video downloaded successfully",
        })
        
        socket.disconnect()
      })

      socket.on('video_download_error', (data) => {
        const errorMsg = data.message || 'Video download failed'
        setError(errorMsg)
        setCurrentStep('Error')
        
        toast({
          title: "Download Failed",
          description: errorMsg,
          variant: "destructive"
        })
        
        socket.disconnect()
      })

      const response = await fetch('/api/download-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtube_url: youtubeUrl,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start video download')
      }

      if (result.success) {
        setSessionId(result.session_id)
        return result
      } else {
        throw new Error(result.error || 'Video download failed')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setCurrentStep('Error')
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const clearDownload = useCallback(() => {
    setIsLoading(false)
    setProgress(0)
    setCurrentStep('')
    setLogs([])
    setError(null)
    setDownloadUrl(null)
    setVideoInfo(null)
    setSessionId(null)
  }, [])

  return {
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
  }
}
