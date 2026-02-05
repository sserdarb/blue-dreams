'use client'

import React, { useState } from 'react'
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
  Code,
  ExternalLink,
  ChevronDown
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
]

const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentLang, setCurrentLang] = useState('tr')
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

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
                href={`/admin${item.href}`}
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
                href={`/admin${item.href}`}
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
                href={`/admin${item.href}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
              >
                <Icon size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Language Selector Dropdown */}
        <div className="p-4 border-t border-white/10">
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-cyan-400" />
                <span className="text-xs text-slate-400">İçerik Dili:</span>
                <span className="text-xs font-bold text-white">
                  {languages.find(l => l.code === currentLang)?.flag} {currentLang.toUpperCase()}
                </span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {langDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#1e293b] border border-white/10 rounded-lg overflow-hidden shadow-xl">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code)
                      setLangDropdownOpen(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-all ${currentLang === lang.code
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-300 hover:bg-white/5'
                      }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* View Site */}
        <div className="p-4 border-t border-white/10">
          <Link
            href={`/${currentLang}`}
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
