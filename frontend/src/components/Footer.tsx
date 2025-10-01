import { Download, Twitter, Facebook, Instagram, Linkedin, Github } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
  ]

  return (
    <footer className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <Download className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold">YouTube Downloader</span>
            </div>
            <p className="text-sm text-purple-100 mb-4">
              Download YouTube videos in high-quality MP4 format. Fast, reliable, and completely free.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-purple-500/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-purple-100">
              © {currentYear} YouTube Downloader. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-purple-100">
              <button className="hover:text-white transition-colors">
                Privacy
              </button>
              <button className="hover:text-white transition-colors">
                Terms
              </button>
              <button className="hover:text-white transition-colors">
                Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
