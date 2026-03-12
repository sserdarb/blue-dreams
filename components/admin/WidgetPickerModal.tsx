'use client'

import React, { useState, useEffect } from 'react'
import { X, Search, Star, Blocks, MessageSquare, Image as ImageIcon, MousePointerClick, Database } from 'lucide-react'
import { WIDGET_TYPES } from '@/components/admin/widget-editors/widget-types'
import type { WidgetTypeInfo } from '@/components/admin/widget-editors/widget-types'

const CATEGORIES = [
    { id: 'all', label: 'Tümü', icon: Blocks },
    { id: 'popular', label: 'Sık Kullanılanlar', icon: Star },
    { id: 'layout', label: 'Düzen', icon: Blocks },
    { id: 'content', label: 'İçerik', icon: MessageSquare },
    { id: 'media', label: 'Medya', icon: ImageIcon },
    { id: 'interactive', label: 'Etkileşimli', icon: MousePointerClick },
    { id: 'data', label: 'Veri', icon: Database },
]

const WIDGET_CATEGORIES: Record<string, string> = {
    'hero': 'layout',
    'page-header': 'layout',
    'divider': 'layout',
    'text': 'content',
    'text-block': 'content',
    'text-image': 'content',
    'features': 'content',
    'stats': 'content',
    'icon-grid': 'content',
    'cta': 'content',
    'gallery': 'media',
    'image-grid': 'media',
    'youtube': 'media',
    'contact': 'interactive',
    'map': 'interactive',
    'reviews': 'interactive',
    'weather': 'interactive',
    'experience': 'interactive',
    'room-list': 'data',
    'table': 'data',
    'factsheet': 'content',
}

const POPULAR_WIDGETS = ['hero', 'text', 'text-image', 'gallery', 'cta', 'features', 'image-grid']

interface WidgetPickerModalProps {
    open: boolean
    onClose: () => void
    onSelect: (type: string) => void
    t: any
}

export function WidgetPickerModal({ open, onClose, onSelect, t }: WidgetPickerModalProps) {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('all')
    const [isVisible, setIsVisible] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (open) {
            setIsVisible(true)
            requestAnimationFrame(() => setIsAnimating(true))
        } else {
            setIsAnimating(false)
            const timeout = setTimeout(() => setIsVisible(false), 300)
            return () => clearTimeout(timeout)
        }
    }, [open])

    if (!isVisible && !open) return null

    const safeWidgetTypes: WidgetTypeInfo[] = Array.isArray(WIDGET_TYPES) ? WIDGET_TYPES : []
    const allWidgets = [...safeWidgetTypes].sort((a, b) => a.label.localeCompare(b.label))

    // Sık kullanılanları öne çıkar (eğer all kategorisiyse) veya filtrele
    const filteredWidgets = allWidgets.filter(w => {
        const matchesSearch = !search || w.label.toLowerCase().includes(search.toLowerCase()) || w.type.toLowerCase().includes(search.toLowerCase())
        if (!matchesSearch) return false

        if (category === 'all') return true
        if (category === 'popular') return POPULAR_WIDGETS.includes(w.type)
        return (WIDGET_CATEGORIES[w.type] || 'content') === category
    })

    // Sık kullanılanları ve diğerlerini ayır (Sadece 'all' kategorisinde ve arama yoksa)
    const showSections = category === 'all' && !search
    const popularWidgets: WidgetTypeInfo[] = showSections ? filteredWidgets.filter(w => POPULAR_WIDGETS.includes(w.type)) : []
    const otherWidgets: WidgetTypeInfo[] = showSections ? filteredWidgets.filter(w => !POPULAR_WIDGETS.includes(w.type)) : filteredWidgets

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose()
    }

    const renderWidgetGrid = (widgets: any[]) => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {widgets.map((widget: any) => (
                <button
                    key={widget.type}
                    onClick={() => {
                        onSelect(widget.type)
                        onClose()
                    }}
                    className="group relative flex flex-col items-center text-left gap-3 p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700/50 hover:border-blue-500 hover:bg-gradient-to-b hover:from-blue-50 hover:to-transparent dark:hover:bg-gradient-to-b dark:hover:from-blue-900/20 dark:hover:to-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 group-hover:text-blue-500 group-hover:shadow-blue-100 dark:group-hover:shadow-blue-900/20 transition-all duration-300">
                        {widget.icon}
                    </div>
                    <div className="w-full relative z-10 flex flex-col items-center">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors text-center w-full truncate">
                            {widget.label}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center line-clamp-2 w-full">
                            {widget.description || `${widget.label} bloğu ekle`}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    )

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={handleBackdropClick}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 transition-all duration-300 ${isAnimating ? 'bg-slate-900/40 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0'}`}
            />

            {/* Modal */}
            <div
                className={`relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col overflow-hidden transition-all duration-300 transform ${isAnimating ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Blocks size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Yeni Blok Ekle</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sayfanızı zenginleştirmek için bir içerik widget'ı seçin.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 p-2.5 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Widget ara... (Örn: kahraman, galeri, metin)"
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar hide-scrollbar-on-mobile">
                        {CATEGORIES.map(cat => {
                            const Icon = cat.icon
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${category === cat.id
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    <Icon size={16} className={category === cat.id ? "text-blue-200" : "text-slate-400 group-hover:text-slate-500"} />
                                    {cat.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Widget Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900/30 custom-scrollbar">
                    {filteredWidgets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-1">Sonuç bulunamadı</p>
                            <p className="text-sm">Arama kriterlerinize uygun widget bulunmuyor.</p>
                            <button onClick={() => { setSearch(''); setCategory('all') }} className="mt-4 text-blue-500 hover:underline font-medium text-sm">Aramayı Temizle</button>
                        </div>
                    ) : showSections ? (
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Star size={16} className="text-amber-500 fill-amber-500" />
                                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sık Kullanılanlar</h4>
                                </div>
                                {renderWidgetGrid(popularWidgets)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Blocks size={16} className="text-slate-400" />
                                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tüm Bloklar</h4>
                                </div>
                                {renderWidgetGrid(otherWidgets)}
                            </div>
                        </div>
                    ) : (
                        renderWidgetGrid(filteredWidgets)
                    )}
                </div>
            </div>
        </div>
    )
}
