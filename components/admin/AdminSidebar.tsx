'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
    Calculator,
    Compass,
    Languages,
    CheckSquare,
    GitBranch,
    Mail
} from 'lucide-react'
import { AdminTranslations } from '@/lib/admin-translations'
import { useTheme } from '@/components/admin/ThemeProvider'
import { useModules } from '@/lib/modules/module-context'
import PmaGravityLogo from '@/components/admin/PmaGravityLogo'
import NotificationBell from '@/components/admin/NotificationBell'

interface AdminSidebarProps {
    locale: string
    t: AdminTranslations
    userRole?: string
    userName?: string
    userAvatar?: string
}

export default function AdminSidebar({ locale, t, userRole: propRole = 'admin', userName: propName = '', userAvatar: propAvatar = '' }: AdminSidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [clickedId, setClickedId] = useState<string | null>(null)
    const { theme, toggleTheme } = useTheme()
    const { config } = useModules()
    const { enabledModules } = config
    const pathname = usePathname()

    // Use props from server-side layout (httpOnly cookie can't be read client-side)
    const userRole = propRole
    const userName = propName
    const userAvatar = propAvatar

    const handleClick = useCallback((id: string) => {
        setClickedId(id)
        setIsOpen(false)
        setTimeout(() => setClickedId(null), 300)
    }, [])

    if (!t) return null

    // Viewer role can only see task management + dashboard
    const viewerAllowedSections = ['section-gorevler']

    const navSections = [
        {
            id: 'section-raporlar',
            label: t.navReports,
            items: [
                { id: 'nav-dashboard', href: '', label: t.dashboard, icon: LayoutDashboard },
                { id: 'nav-reports', href: '/statistics', label: t.reports, icon: BarChart3 },
                { id: 'nav-management', href: '/reports', label: t.management, icon: ClipboardList },
                { id: 'nav-bigdata', href: '/bigdata', label: t.bigData, icon: Database },
            ]
        },
        {
            id: 'section-satis',
            label: t.navSales,
            items: [
                { id: 'nav-reservations', href: '/reservations', label: t.reservations, icon: Calendar },
                { id: 'nav-yield', href: '/yield', label: t.yieldManagement, icon: TrendingUp },
                { id: 'nav-extras', href: '/extras', label: t.extras, icon: ShoppingBag },
                { id: 'nav-crm', href: '/crm', label: t.crm, icon: PieChart },
                { id: 'nav-marketing', href: '/marketing', label: t.marketing, icon: Megaphone },
                { id: 'nav-analytics', href: '/analytics', label: t.analytics, icon: BarChart3 },
                { id: 'nav-social', href: '/social', label: t.socialMedia, icon: Share2 },
                { id: 'nav-content-gen', href: '/social/content', label: t.contentCreator, icon: Sparkles },
            ]
        },
        {
            id: 'section-finans',
            label: t.navFinance,
            items: [
                { id: 'nav-accounting', href: '/accounting', label: t.accounting, icon: Calculator },
                { id: 'nav-purchasing', href: '/purchasing', label: t.purchasing, icon: ShoppingCart },
            ]
        },
        {
            id: 'section-gorevler',
            label: t.taskManagement,
            items: [
                { id: 'nav-tasks', href: '/tasks', label: t.tasks, icon: CheckSquare },
                { id: 'nav-workflows', href: '/tasks/workflows', label: t.workflows, icon: GitBranch },
                { id: 'nav-mail-tasks', href: '/tasks/mail', label: t.mailIntegration, icon: Mail },
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
                { id: 'nav-localization', href: '/localization', label: t.localization, icon: Languages },
                { id: 'nav-settings', href: '/settings', label: t.settings, icon: Settings },
            ]
        },
        {
            id: 'section-operasyon',
            label: t.navOperations,
            items: [
                { id: 'nav-hotel-rooms', href: '/content/rooms', label: t.rooms, icon: BedDouble },
                { id: 'nav-dining', href: '/content/dining', label: t.dining, icon: UtensilsCrossed },
                { id: 'nav-spa', href: '/content/spa', label: t.spaWellness, icon: Sparkles },
                { id: 'nav-sports', href: '/content/sports', label: t.sportsAndActivities || 'Spor & Aktiviteler', icon: PartyPopper },
                { id: 'nav-meeting', href: '/content/meeting', label: t.meeting, icon: Users },
                { id: 'nav-activities', href: '/activities', label: t.activities, icon: PartyPopper },
                { id: 'nav-local-guide', href: '/local-guide', label: t.localGuide, icon: Compass },
                { id: 'nav-ai-training', href: '/ai-training', label: t.aiTraining, icon: Sparkles },
                { id: 'nav-users', href: '/users', label: t.users, icon: UserCog },
            ]
        },
        {
            id: 'section-entegrasyon',
            label: t.navIntegrations,
            items: [
                { id: 'nav-concierge', href: '/chat', label: t.blueConcierge, icon: MessageSquare },
                { id: 'nav-booking', href: '/integrations/booking', label: t.bookingEngine, icon: CreditCard },
            ]
        }
    ]

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10 flex items-center px-4 z-40 justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1.5 -ml-1 text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isOpen ? <X size={24} /> : <HamburgerIcon size={24} />}
                    </button>
                    <PmaGravityLogo size={28} textSize="sm" />
                </div>
                <div className="flex items-center">
                    <NotificationBell />
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
                    <PmaGravityLogo size={44} textSize="md" />
                </div>

                {/* Mobile Logo (Inside Sidebar) */}
                <div className="md:hidden p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                    <PmaGravityLogo size={32} textSize="sm" />
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {/* Viewer role banner */}
                    {userRole === 'viewer' && (
                        <div className="mb-4 mx-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs">
                            <p className="font-semibold mb-1">Sınırlı Erişim</p>
                            <p className="text-amber-500/80">Görev yönetimi erişiminiz var. Daha fazla yetki için talep oluşturun.</p>
                            <a href={`/${locale}/admin/tasks`} className="mt-2 inline-block text-amber-400 hover:text-amber-300 font-bold text-[10px] uppercase tracking-wider">
                                Yetki Talep Et →
                            </a>
                        </div>
                    )}
                    {navSections
                        .filter(section => userRole !== 'viewer' || viewerAllowedSections.includes(section.id))
                        .map((section, sectionIdx) => {
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
                                        const itemPath = `/${locale}/admin${item.href}`
                                        const isActive = item.href === ''
                                            ? pathname === `/${locale}/admin` || pathname === `/${locale}/admin/`
                                            : pathname?.startsWith(itemPath)
                                        const isClicked = clickedId === item.id
                                        return (
                                            <Link
                                                key={item.id}
                                                data-nav-id={item.id}
                                                href={itemPath}
                                                onClick={() => handleClick(item.id)}
                                                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group overflow-hidden
                                                ${isActive
                                                        ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-l-3 border-cyan-500 shadow-sm'
                                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                                    }
                                                ${isClicked ? 'scale-[0.97] opacity-80' : 'scale-100'}
                                            `}
                                                style={{ transition: 'transform 150ms ease, opacity 150ms ease, background-color 200ms ease' }}
                                            >
                                                {isClicked && (
                                                    <span className="absolute inset-0 bg-cyan-400/20 dark:bg-cyan-400/10 animate-ping rounded-lg" style={{ animationDuration: '300ms', animationIterationCount: 1 }} />
                                                )}
                                                <Icon size={18} className={`transition-all duration-200 ${isActive
                                                    ? 'text-cyan-600 dark:text-cyan-400 scale-110'
                                                    : 'text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:scale-110'
                                                    }`} />
                                                <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                                                {isActive && (
                                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                                )}
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

                {/* Profile */}
                <div className="px-4 pb-2 pt-1 border-t border-slate-200 dark:border-white/10">
                    <Link
                        href={`/${locale}/admin/profile`}
                        onClick={() => handleClick('nav-profile')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname?.includes('/profile')
                            ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                    >
                        <UserCog size={16} className={pathname?.includes('/profile') ? 'text-cyan-600' : 'text-slate-400'} />
                        Profil Yönetimi
                    </Link>
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
