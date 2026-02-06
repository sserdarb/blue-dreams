'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Phone, Sparkles } from 'lucide-react'
import { WeatherWidget } from './WeatherWidget'

interface MenuItem {
    id: string
    label: string
    url: string
    target: string
}

interface Language {
    code: string
    name: string
    nativeName?: string
    flag?: string
}

interface SiteSettings {
    siteName?: string
    logo?: string
    headerStyle?: string
}

interface HeaderProps {
    settings: SiteSettings
    menuItems: MenuItem[]
    languages: Language[]
    locale: string
}

export function Header({ settings, menuItems, languages, locale }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const headerStyles = {
        default: 'bg-white/95 text-gray-800',
        transparent: 'bg-transparent text-white',
        dark: 'bg-slate-900 text-white'
    }

    const style = headerStyles[settings.headerStyle as keyof typeof headerStyles] || headerStyles.default

    return (
        <header className={`fixed top-0 w-full z-40 backdrop-blur-md transition-all ${style}`}>
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href={`/${locale}`} className="flex items-center gap-3">
                    {settings.logo ? (
                        <Image
                            src={settings.logo}
                            alt={settings.siteName || 'Logo'}
                            width={40}
                            height={40}
                            className="h-10 w-auto"
                            unoptimized
                        />
                    ) : (
                        <span className="text-2xl font-bold tracking-wider">
                            {settings.siteName || 'BLUE DREAMS'}
                        </span>
                    )}
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {menuItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.url.startsWith('/') ? `/${locale}${item.url}` : item.url}
                            target={item.target}
                            className="text-sm font-semibold uppercase tracking-wide hover:text-blue-500 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Side Actions - Desktop */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Weather Widget */}
                    <WeatherWidget />

                    {/* Blue Concierge Button */}
                    <button
                        onClick={() => {
                            // Trigger BlueConciergeFull via global event
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('openBlueConcierge'))
                            }
                        }}
                        className="bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    >
                        <Sparkles size={16} />
                        BLUE CONCIERGE
                    </button>

                    {/* WhatsApp */}
                    <a
                        href="https://wa.me/902523371111"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full bg-white/10 hover:bg-green-500/20 text-current hover:text-green-500 transition-all"
                        title="WhatsApp"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </a>

                    {/* Phone */}
                    <a
                        href="tel:+902523371111"
                        className="p-2.5 rounded-full bg-white/10 hover:bg-blue-500/20 text-current hover:text-blue-500 transition-all"
                        title="Ara"
                    >
                        <Phone size={20} />
                    </a>

                    {/* Rezervasyon Button */}
                    <a
                        href="https://bluedreamsresort.com/rezervasyon"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 border-2 border-current rounded-full text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-gray-900 transition-all"
                    >
                        REZERVASYON
                    </a>

                    {/* Language Switcher */}
                    <div className="flex items-center gap-1 ml-2">
                        {languages.map((lang) => (
                            <Link
                                key={lang.code}
                                href={`/${lang.code}`}
                                className={`text-xs font-bold px-2 py-1 rounded transition-colors ${locale === lang.code
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-gray-200/50'
                                    }`}
                                title={lang.nativeName || lang.name}
                            >
                                {lang.flag || lang.code.toUpperCase()}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t shadow-xl">
                    <nav className="flex flex-col p-4 space-y-3">
                        {/* Blue Concierge - Mobile */}
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false)
                                if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('openBlueConcierge'))
                                }
                            }}
                            className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Sparkles size={18} />
                            BLUE CONCIERGE
                        </button>

                        {menuItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.url.startsWith('/') ? `/${locale}${item.url}` : item.url}
                                target={item.target}
                                className="text-gray-800 font-medium py-2 border-b border-gray-100"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* Action Buttons - Mobile */}
                        <div className="grid grid-cols-3 gap-2 pt-4">
                            <a
                                href="https://wa.me/902523371111"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-3 bg-green-50 text-green-600 rounded-xl"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span className="text-xs mt-1 font-medium">WhatsApp</span>
                            </a>
                            <a
                                href="tel:+902523371111"
                                className="flex flex-col items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-xl"
                            >
                                <Phone size={24} />
                                <span className="text-xs mt-1 font-medium">Ara</span>
                            </a>
                            <a
                                href="https://bluedreamsresort.com/rezervasyon"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-3 bg-amber-50 text-amber-600 rounded-xl"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span className="text-xs mt-1 font-medium">Rezervasyon</span>
                            </a>
                        </div>

                        {/* Language Switcher - Mobile */}
                        <div className="flex gap-2 pt-2">
                            {languages.map((lang) => (
                                <Link
                                    key={lang.code}
                                    href={`/${lang.code}`}
                                    className={`text-sm font-bold px-3 py-2 rounded ${locale === lang.code
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {lang.flag || lang.code.toUpperCase()}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
