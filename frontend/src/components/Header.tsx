import { Download } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 transition-transform group-hover:scale-105">
              <Download className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              YouTube Downloader
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
