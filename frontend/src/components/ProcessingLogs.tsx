import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Terminal, 
  AlertTriangle,
  Shield
} from 'lucide-react'

interface LogEntry {
  timestamp: string
  step: string
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | 'WARNING' | 'RUNNING' | 'ACTIVATED'
  message: string
  level?: 'ERROR' | 'WARNING' | 'INFO'
  details?: string
}

interface ProcessingLogsProps {
  logs: LogEntry[]
  sessionId?: string
  enableRealTime?: boolean
  className?: string
}

export default function ProcessingLogs({ 
  logs: initialLogs, 
  className = '' 
}: ProcessingLogsProps) {
  const logContainerRef = useRef<HTMLDivElement>(null)

  const getStatusBadge = (status: string, level?: string) => {
    if (level === 'ERROR' || status === 'FAILED') {
      return <Badge variant="destructive">FAILED</Badge>
    }
    if (level === 'WARNING' || status === 'WARNING') {
      return <Badge variant="default" className="bg-yellow-500 text-white">WARNING</Badge>
    }
    if (status === 'ACTIVATED') {
      return <Badge variant="default" className="bg-orange-500 text-white">FALLBACK</Badge>
    }
    
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="default" className="bg-green-500 text-white">SUCCESS</Badge>
      case 'IN_PROGRESS':
      case 'RUNNING':
        return <Badge variant="default" className="bg-blue-500 text-white">RUNNING</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const getLogLevel = (log: LogEntry) => {
    if (log.level === 'ERROR' || log.status === 'FAILED') return 'text-red-500'
    if (log.level === 'WARNING' || log.status === 'WARNING') return 'text-yellow-500'
    if (log.status === 'SUCCESS') return 'text-green-500'
    if (log.status === 'RUNNING' || log.status === 'IN_PROGRESS') return 'text-blue-500'
    if (log.status === 'ACTIVATED') return 'text-orange-500'
    return 'text-gray-500'
  }

  if (initialLogs.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <span>Processing Output Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            <div className="text-gray-400 mb-3">
              <Terminal className="inline h-4 w-4 mr-2" />
              Real-time processing logs:
            </div>
            <div className="text-center text-gray-500 py-8">
              <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Waiting for processing logs...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Terminal className="h-5 w-5" />
          <span>Processing Output Logs</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={logContainerRef}
          className="bg-gray-900 text-gray-100 p-4 font-mono text-sm max-h-96 overflow-y-auto"
        >
          <div className="text-gray-400 mb-3">
            <Terminal className="inline h-4 w-4 mr-2" />
            Real-time processing logs:
          </div>
          
          <div className="space-y-2">
            {initialLogs.map((log, index) => {
              const timestamp = new Date(log.timestamp).toLocaleTimeString()
              const [mainMessage] = log.details ? log.details.split('|') : [log.message || '', '']
              
              return (
                <div 
                  key={index} 
                  className={`log-entry p-2 border-l-4 ${getLogLevel(log)} border-l-current`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center space-x-2">
                      <strong className="text-white">{log.step}</strong>
                      {getStatusBadge(log.status, log.level)}
                      {(log.level === 'ERROR' || log.status === 'FAILED') && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      {log.status === 'ACTIVATED' && (
                        <Shield className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{timestamp}</span>
                  </div>
                  <div className="text-gray-300">{mainMessage.trim()}</div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
