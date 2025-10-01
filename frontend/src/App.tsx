import { Toaster } from '@/components/ui/toaster'
import DownloadVideoPage from '@/pages/DownloadVideoPage'

function App() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <DownloadVideoPage />
      <Toaster />
    </div>
  )
}

export default App
