import React from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  Menu as MenuIcon,
  Settings,
  MessageSquare,
  Image as ImageIcon,
  Globe,
  BarChart3,
  Calendar,
  ExternalLink,
  BedDouble,
  UtensilsCrossed,
  Users,
  Sparkles
} from 'lucide-react'


const navItems = [
  { href: '', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/statistics', label: 'İstatistikler', icon: BarChart3 },
  { href: '/reservations', label: 'Rezervasyonlar', icon: Calendar },
  { href: '/pages', label: 'Sayfalar', icon: FileText },
  { href: '/menu', label: 'Menü', icon: MenuIcon },
  { href: '/files', label: 'Medya', icon: ImageIcon },
  { href: '/settings', label: 'Ayarlar', icon: Settings },
  { href: '/analytics', label: 'Analytics', icon: Code },
  { href: '/chat', label: 'Blue Concierge', icon: MessageSquare },
  { href: '/content/rooms', label: 'Odalar', icon: BedDouble },
  { href: '/content/dining', label: 'Restoranlar', icon: UtensilsCrossed },
  { href: '/content/meeting', label: 'Toplantı', icon: Users },
  { href: '/ai', label: 'AI Ayarları', icon: Sparkles },
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
    <div className="flex h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white flex flex-col border-r border-white/10">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold">BD</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider text-white">BLUE DREAMS</h1>
              <p className="text-[10px] text-cyan-400 uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest px-4 mb-2">Ana Menü</p>
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={`/${locale}/admin${item.href}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
              >
                <Icon size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}

          <p className="text-[10px] text-slate-500 uppercase tracking-widest px-4 mb-2 mt-6">İçerik</p>
          {navItems.slice(3, 7).map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={`/${locale}/admin${item.href}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
              >
                <Icon size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}

          <p className="text-[10px] text-slate-500 uppercase tracking-widest px-4 mb-2 mt-6">Entegrasyonlar</p>
          {navItems.slice(7).map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={`/${locale}/admin${item.href}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
              >
                <Icon size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Language Selector */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg mb-3">
            <Globe size={14} className="text-cyan-400" />
            <span className="text-xs text-slate-400">Düzenleme:</span>
            <span className="text-xs font-bold text-white">{locale.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {['tr', 'en', 'de', 'ru'].map((lang) => (
              <Link
                key={lang}
                href={`/${lang}/admin`}
                className={`text-center py-2 rounded text-xs font-medium transition-all ${locale === lang
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {lang.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        {/* View Site */}
        <div className="p-4 border-t border-white/10">
          <Link
            href={`/${locale}`}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 rounded-lg text-sm font-bold transition-all shadow-lg shadow-cyan-600/20"
          >
            <ExternalLink size={16} />
            Siteyi Görüntüle
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#0f172a]">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
