'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

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

                {/* Language Switcher */}
                <div className="hidden md:flex items-center gap-2">
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
                <div className="md:hidden bg-white border-t">
                    <nav className="flex flex-col p-4 space-y-3">
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
                        <div className="flex gap-2 pt-4">
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
