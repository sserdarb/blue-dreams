'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, Edit, Eye, Trash2, FileText, Home, Info, Settings, Mail, Grid3X3, Layers, Languages, Globe, Loader2 } from 'lucide-react'
import type { CmsTranslations } from '@/lib/cms-translations'

const LOCALES = ['tr', 'en', 'de', 'ru'] as const
const LOCALE_LABELS: Record<string, string> = { tr: '🇹🇷 Türkçe', en: '🇬🇧 English', de: '🇩🇪 Deutsch', ru: '🇷🇺 Русский' }

interface PageItem {
    id: string
    slug: string
    locale: string
    title: string
    status: string
    updatedAt: string
    _count?: { widgets: number }
}

const PAGE_ICONS: Record<string, React.ReactNode> = {
    'home': <Home size={18} className="text-blue-500" />,
    'hakkimizda': <Info size={18} className="text-emerald-500" />,
    'about': <Info size={18} className="text-emerald-500" />,
    'iletisim': <Mail size={18} className="text-purple-500" />,
    'contact': <Mail size={18} className="text-purple-500" />,
    'odalar': <Grid3X3 size={18} className="text-amber-500" />,
    'rooms': <Grid3X3 size={18} className="text-amber-500" />,
    'spa': <Layers size={18} className="text-pink-500" />,
}

const ITEMS_PER_PAGE = 10

export function PageListClient({
    pages,
    locale,
    t,
}: {
    pages: PageItem[]
    locale: string
    t: CmsTranslations
}) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState<'date' | 'title'>('date')
    const [currentPage, setCurrentPage] = useState(1)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [selectedLocale, setSelectedLocale] = useState(locale)
    const [translating, setTranslating] = useState<string | null>(null)
    const [translateTarget, setTranslateTarget] = useState<string>('')

    const filtered = useMemo(() => {
        let result = pages.filter(p => {
            const matchesLocale = p.locale === selectedLocale
            const matchesSearch = !search ||
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.slug.toLowerCase().includes(search.toLowerCase())
            const matchesStatus = statusFilter === 'all' || p.status === statusFilter
            return matchesLocale && matchesSearch && matchesStatus
        })
        if (sortBy === 'title') {
            result = [...result].sort((a, b) => a.title.localeCompare(b.title))
        } else {
            result = [...result].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        }
        return result
    }, [pages, search, statusFilter, sortBy, selectedLocale])

    // Count pages per locale for badge
    const localeCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        LOCALES.forEach(l => { counts[l] = pages.filter(p => p.locale === l).length })
        return counts
    }, [pages])

    const handleTranslate = async (pageId: string, targetLocale: string) => {
        setTranslating(pageId)
        try {
            const res = await fetch('/api/admin/cms-translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageId, targetLocale })
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Translation failed')
            router.refresh()
            setSelectedLocale(targetLocale)
        } catch (err: any) {
            alert('Çeviri hatası: ' + (err.message || ''))
        }
        setTranslating(null)
    }

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const handleDelete = async (page: PageItem) => {
        if (!confirm(t.confirmDelete)) return
        setDeleting(page.id)
        try {
            const { deletePage } = await import('@/app/actions/admin')
            await deletePage(page.id)
            router.refresh()
        } catch (err) {
            console.error('Failed to delete page:', err)
        }
        setDeleting(null)
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : locale === 'ru' ? 'ru-RU' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        })
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t.pageManagement}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.pageManagementDesc}</p>
                </div>
                <Link
                    href={`/${locale}/admin/pages/new`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                >
                    <FileText size={16} /> {t.addNewPage}
                </Link>
            </div>

            {/* Language Tabs */}
            <div className="flex items-center gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                {LOCALES.map(l => (
                    <button
                        key={l}
                        onClick={() => { setSelectedLocale(l); setCurrentPage(1) }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedLocale === l
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {LOCALE_LABELS[l]}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            selectedLocale === l
                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>{localeCounts[l] || 0}</span>
                    </button>
                ))}
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                        placeholder={t.searchPlaceholder}
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                            className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 pr-8 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="all">{t.allStatus}</option>
                            <option value="published">{t.published}</option>
                            <option value="draft">{t.draft}</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as 'date' | 'title')}
                            className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 pr-8 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="date">{t.sortByDate}</option>
                            <option value="title">{t.sortByTitle}</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {paginated.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{t.noPages}</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{t.createFirstPage}</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.pageTitle}</th>
                                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.slug}</th>
                                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.status}</th>
                                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.lastModified}</th>
                                        <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {paginated.map(page => (
                                        <tr key={page.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                        {PAGE_ICONS[page.slug] || <FileText size={18} className="text-slate-400" />}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-slate-900 dark:text-white text-sm">{page.title}</span>
                                                        <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                            {page.locale.toUpperCase()} • {page._count?.widgets ?? 0} widgets
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600 dark:text-slate-300 font-mono">/{page.slug}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${page.status === 'published'
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${page.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                                                        }`} />
                                                    {page.status === 'published' ? t.published : t.draft}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(page.updatedAt)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/${locale}/admin/pages/${page.id}/editor`}
                                                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition"
                                                        title={t.edit}
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
                                                    <Link
                                                        href={`/${page.locale}/${page.slug}`}
                                                        target="_blank"
                                                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                                                        title={t.preview}
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    {/* Translate dropdown */}
                                                    <div className="relative group/translate">
                                                        <button
                                                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                                            title="Otomatik Çevir"
                                                            disabled={translating === page.id}
                                                        >
                                                            {translating === page.id ? <Loader2 size={16} className="animate-spin" /> : <Languages size={16} />}
                                                        </button>
                                                        <div className="hidden group-hover/translate:block absolute right-0 top-full z-20 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 min-w-[140px]">
                                                            {LOCALES.filter(l => l !== page.locale).map(targetL => {
                                                                const exists = pages.some(p => p.slug === page.slug && p.locale === targetL)
                                                                return (
                                                                    <button
                                                                        key={targetL}
                                                                        onClick={() => handleTranslate(page.id, targetL)}
                                                                        disabled={translating === page.id}
                                                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between gap-2"
                                                                    >
                                                                        <span>{LOCALE_LABELS[targetL]}</span>
                                                                        {exists && <span className="text-[10px] text-emerald-500">✓</span>}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(page)}
                                                        disabled={deleting === page.id}
                                                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition disabled:opacity-50"
                                                        title={t.deleteAction}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {t.showing} {((currentPage - 1) * ITEMS_PER_PAGE) + 1} — {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} {t.of} {filtered.length} {t.pagesLabel}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {t.previous}
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {t.next}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
