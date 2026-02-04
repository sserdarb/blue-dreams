import React from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  MessageSquare,
  Settings,
  Menu as MenuIcon,
  Globe,
  Image as ImageIcon
} from 'lucide-react'

const navItems = [
  { href: '', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pages', label: 'Pages', icon: FileText },
  { href: '/menu', label: 'Menu', icon: MenuIcon },
  { href: '/files', label: 'Media Library', icon: ImageIcon },
  { href: '/settings', label: 'Site Settings', icon: Settings },
  { href: '/chat', label: 'Blue Concierge', icon: MessageSquare },
]

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-wider">BLUE DREAMS</h1>
          <p className="text-xs text-slate-400 mt-1">Content Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={`/${locale}/admin${item.href}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors group"
              >
                <Icon size={18} className="text-slate-400 group-hover:text-blue-400" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Language Indicator */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg">
            <Globe size={16} className="text-blue-400" />
            <span className="text-sm">Editing: <strong>{locale.toUpperCase()}</strong></span>
          </div>
          <div className="mt-3 flex gap-1">
            {['en', 'tr', 'de', 'ru'].map((lang) => (
              <Link
                key={lang}
                href={`/${lang}/admin`}
                className={`flex-1 text-center py-1.5 rounded text-xs font-medium transition ${locale === lang
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
              >
                {lang.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        {/* View Site Link */}
        <div className="p-4 border-t border-slate-700">
          <Link
            href={`/${locale}`}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
          >
            View Site →
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
