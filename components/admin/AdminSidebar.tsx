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
    ExternalLink,
    BedDouble,
    UtensilsCrossed,
    Users,
    Sparkles,
    PartyPopper,
    UserCog,
    Menu as HamburgerIcon,
    X,
    ShoppingBag,
    PieChart,
    Megaphone
} from 'lucide-react'
import { AdminTranslations } from '@/lib/admin-translations'

interface AdminSidebarProps {
    locale: string
    t: AdminTranslations
}

export default function AdminSidebar({ locale, t }: AdminSidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    if (!t) return null

    const navSections = [
        {
            label: t.navReports,
            items: [
                { href: '', label: t.dashboard, icon: LayoutDashboard },
                { href: '/statistics', label: t.reports, icon: BarChart3 },
                { href: '/reservations', label: t.reservations, icon: Calendar },
                { href: '/extras', label: t.extras, icon: ShoppingBag },
                { href: '/crm', label: t.crm, icon: PieChart },
                { href: '/marketing', label: t.marketing, icon: Megaphone },
            ]
        },
        {
            label: t.navContent,
            items: [
                { href: '/rooms', label: t.roomPrices, icon: BedDouble },
                { href: '/pages', label: t.pages, icon: FileText },
                { href: '/menu', label: t.menu, icon: MenuIcon },
                { href: '/files', label: t.media, icon: ImageIcon },
                { href: '/settings', label: t.settings, icon: Settings },
            ]
        },
        {
            label: t.navIntegrations,
            items: [
                { href: '/analytics', label: t.analytics, icon: BarChart3 },
                { href: '/chat', label: t.blueConcierge, icon: MessageSquare },
                { href: '/content/rooms', label: t.rooms, icon: BedDouble },
                { href: '/content/dining', label: t.dining, icon: UtensilsCrossed },
                { href: '/content/meeting', label: t.meeting, icon: Users },
                { href: '/activities', label: t.activities, icon: PartyPopper },
                { href: '/ai-training', label: t.aiTraining, icon: Sparkles },
                { href: '/users', label: t.users, icon: UserCog },
            ]
        }
    ]

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f172a] border-b border-white/10 flex items-center px-4 z-40 justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <img src="https://bluedreamsresort.com/wp-content/uploads/2023/03/bdrlogonewwhites.png" alt="Blue Dreams Logo" className="w-full h-auto" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-wider text-white">BLUE DREAMS</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isOpen ? <X size={24} /> : <HamburgerIcon size={24} />}
                    </button>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-64 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white flex flex-col border-r border-white/10
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo Desktop */}
                <div className="hidden md:block p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center">
                            {/* <img src="https://bluedreamsresort.com/wp-content/uploads/2023/03/bdrlogonewwhites.png" alt="Blue Dreams" className="w-full h-full object-contain" /> */}
                            {/* Fallback if image fails or for now just use the text as requested but with logo if possible. User said "otelin web de kullandığımız logosunu kullan". I'll try to use an img tag. */}
                            <img src="https://bluedreamsresort.com/wp-content/uploads/2023/03/bdrlogonewwhites.png" alt="Blue Dreams Logo" className="w-full h-auto" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-wider text-white">BLUE DREAMS</h1>
                            <p className="text-[10px] text-cyan-400 uppercase tracking-widest">Ultra All Inclusive</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Logo (Inside Sidebar) */}
                <div className="md:hidden p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src="https://bluedreamsresort.com/wp-content/uploads/2023/03/bdrlogonewwhites.png" alt="Blue Dreams Logo" className="w-full h-auto" />
                        </div>
                        <span className="font-bold tracking-wider text-white">MENU</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navSections.map((section, sectionIdx) => (
                        <React.Fragment key={sectionIdx}>
                            <p className={`text-[10px] text-slate-500 uppercase tracking-widest px-4 mb-2 ${sectionIdx > 0 ? 'mt-6' : ''}`}>
                                {section.label}
                            </p>
                            {section.items.map((item) => {
                                const Icon = item.icon || PieChart
                                return (
                                    <Link
                                        key={item.href}
                                        href={`/${locale}/admin${item.href}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
                                    >
                                        <Icon size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </React.Fragment>
                    ))}
                </nav>

                {/* Language Selector */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg mb-3">
                        <Globe size={14} className="text-cyan-400" />
                        <span className="text-xs text-slate-400">{t.editingLang}</span>
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
                        {t.viewSite}
                    </Link>
                </div>
            </aside>
        </>
    )
}
