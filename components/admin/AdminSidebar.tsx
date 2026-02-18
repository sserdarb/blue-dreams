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
    Megaphone,
    Sun,
    Moon,
    ClipboardList,
    Share2,
    TrendingUp,
    CreditCard,
    ShoppingCart,
    Database,
    Calculator
} from 'lucide-react'
import { AdminTranslations } from '@/lib/admin-translations'
import { useTheme } from '@/components/admin/ThemeProvider'
import { useModules } from '@/lib/modules/module-context'

interface AdminSidebarProps {
    locale: string
    t: AdminTranslations
}

export default function AdminSidebar({ locale, t }: AdminSidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { theme, toggleTheme } = useTheme()
    const { config } = useModules()
    const { enabledModules } = config

    if (!t) return null

    const navSections = [
        {
            id: 'section-raporlar',
            label: 'Raporlar & Analiz',
            items: [
                { id: 'nav-dashboard', href: '', label: t.dashboard, icon: LayoutDashboard },
                { id: 'nav-reports', href: '/statistics', label: t.reports, icon: BarChart3 },
                { id: 'nav-management', href: '/reports', label: t.management, icon: ClipboardList },
                { id: 'nav-bigdata', href: '/bigdata', label: 'Big Data', icon: Database },
            ]
        },
        {
            id: 'section-satis',
            label: 'Satış & Pazarlama',
            items: [
                { id: 'nav-reservations', href: '/reservations', label: t.reservations, icon: Calendar },
                { id: 'nav-yield', href: '/yield', label: 'Yield Management', icon: TrendingUp },
                { id: 'nav-extras', href: '/extras', label: t.extras, icon: ShoppingBag },
                { id: 'nav-crm', href: '/crm', label: t.crm, icon: PieChart },
                { id: 'nav-marketing', href: '/marketing', label: t.marketing, icon: Megaphone },
                { id: 'nav-social', href: '/social', label: 'Sosyal Medya', icon: Share2 },
                { id: 'nav-content-gen', href: '/social/content', label: 'İçerik Üretici', icon: Sparkles },
            ]
        },
        {
            id: 'section-finans',
            label: 'Finans & Tedarik',
            items: [
                { id: 'nav-accounting', href: '/accounting', label: 'Muhasebe', icon: Calculator },
                { id: 'nav-purchasing', href: '/purchasing', label: 'Satın Alma', icon: ShoppingCart },
            ]
        },
        {
            id: 'section-icerik',
            label: t.navContent,
            items: [
                { id: 'nav-rooms', href: '/rooms', label: t.roomPrices, icon: BedDouble },
                { id: 'nav-pages', href: '/pages', label: t.pages, icon: FileText },
                { id: 'nav-menu', href: '/menu', label: t.menu, icon: MenuIcon },
                { id: 'nav-media', href: '/files', label: t.media, icon: ImageIcon },
                { id: 'nav-settings', href: '/settings', label: t.settings, icon: Settings },
            ]
        },
        {
            id: 'section-operasyon',
            label: 'Otel Operasyon',
            items: [
                { id: 'nav-hotel-rooms', href: '/content/rooms', label: t.rooms, icon: BedDouble },
                { id: 'nav-dining', href: '/content/dining', label: t.dining, icon: UtensilsCrossed },
                { id: 'nav-meeting', href: '/content/meeting', label: t.meeting, icon: Users },
                { id: 'nav-activities', href: '/activities', label: t.activities, icon: PartyPopper },
                { id: 'nav-ai-training', href: '/ai-training', label: t.aiTraining, icon: Sparkles },
                { id: 'nav-users', href: '/users', label: t.users, icon: UserCog },
            ]
        },
        {
            id: 'section-entegrasyon',
            label: t.navIntegrations,
            items: [
                { id: 'nav-analytics', href: '/analytics', label: t.analytics, icon: BarChart3 },
                { id: 'nav-concierge', href: '/chat', label: t.blueConcierge, icon: MessageSquare },
                { id: 'nav-booking', href: '/integrations/booking', label: 'Booking Engine', icon: CreditCard },
            ]
        }
    ]

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10 flex items-center px-4 z-40 justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <img src="https://bluedreamsresort.com/wp-content/uploads/2023/03/bdrlogonewwhites.png" alt="Blue Dreams Logo" className="w-full h-auto dark:block hidden" />
                            <img src="/bdr-logo-dark.png" alt="Blue Dreams Logo" className="w-full h-auto block dark:hidden" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-wider text-slate-900 dark:text-white">BLUE DREAMS</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
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
                fixed inset-y-0 left-0 z-50
                w-64 bg-white dark:bg-gradient-to-b dark:from-[#0f172a] dark:to-[#1e293b] 
                text-slate-900 dark:text-white flex flex-col border-r border-slate-200 dark:border-white/10
                transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo Desktop */}
                <div className="hidden md:block p-6 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <img src="https://bluedreamsresort.com/wp-content/uploads/2023/03/bdrlogonewwhites.png" alt="Blue Dreams Logo" className="w-full h-auto dark:block hidden" />
                            <img src="/bdr-logo-dark.png" alt="Blue Dreams Logo" className="w-full h-auto block dark:hidden" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-wider text-slate-900 dark:text-white">BLUE DREAMS</h1>
                            <p className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Ultra All Inclusive</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Logo (Inside Sidebar) */}
                <div className="md:hidden p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src="https://bluedreamsresort.com/wp-content/uploads/2023/03/bdrlogonewwhites.png" alt="Blue Dreams Logo" className="w-full h-auto dark:block hidden" />
                            <img src="https://bluedreamsresort.com/wp-content/uploads/2023/03/bdrlogonew.png" alt="Blue Dreams Logo" className="w-full h-auto block dark:hidden" />
                        </div>
                        <span className="font-bold tracking-wider text-slate-900 dark:text-white">MENU</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navSections.map((section, sectionIdx) => {
                        // Filter items by module state
                        const visibleItems = section.items.filter(item => {
                            // Settings always visible
                            if (item.id === 'nav-settings') return true
                            return enabledModules.includes(item.id)
                        })
                        // Hide empty sections
                        if (visibleItems.length === 0) return null
                        return (
                            <React.Fragment key={section.id}>
                                <p data-nav-id={section.id} className={`text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest px-4 mb-2 ${sectionIdx > 0 ? 'mt-6' : ''}`}>
                                    {section.label}
                                </p>
                                {visibleItems.map((item) => {
                                    const Icon = item.icon || PieChart
                                    return (
                                        <Link
                                            key={item.id}
                                            data-nav-id={item.id}
                                            href={`/${locale}/admin${item.href}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all group"
                                        >
                                            <Icon size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </React.Fragment>
                        )
                    })}
                </nav>

                {/* Theme Toggle & Language */}
                <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-between w-full px-3 py-2 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            {theme === 'dark' ? <Moon size={14} className="text-purple-400" /> : <Sun size={14} className="text-orange-500" />}
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-purple-900' : 'bg-slate-300'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`} style={{ left: theme === 'dark' ? '18px' : '2px' }} />
                        </div>
                    </button>

                    {/* Language Selector */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-1">
                            <Globe size={14} className="text-cyan-600 dark:text-cyan-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{t.editingLang}</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{locale.toUpperCase()}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                            {['tr', 'en', 'de', 'ru'].map((lang) => (
                                <Link
                                    key={lang}
                                    href={`/${lang}/admin`}
                                    className={`text-center py-2 rounded text-xs font-medium transition-all ${locale === lang
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {lang.toUpperCase()}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* View Site */}
                <div className="p-4 border-t border-slate-200 dark:border-white/10">
                    <Link
                        href={`/${locale}`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 rounded-lg text-sm font-bold transition-all shadow-lg shadow-cyan-600/20 text-white"
                    >
                        <ExternalLink size={16} />
                        {t.viewSite}
                    </Link>
                </div>
            </aside>
        </>
    )
}
