'use client'

import React, { useState } from 'react'
import { X, Search } from 'lucide-react'
import { WIDGET_TYPES } from '@/components/admin/widget-editors/widget-types'

const CATEGORIES = [
    { id: 'all', label: 'all' },
    { id: 'layout', label: 'layout' },
    { id: 'content', label: 'content' },
    { id: 'media', label: 'media' },
    { id: 'interactive', label: 'interactive' },
    { id: 'data', label: 'data' },
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
}

interface WidgetPickerModalProps {
    open: boolean
    onClose: () => void
    onSelect: (type: string) => void
    t: {
        widgetPicker: string
        widgetPickerDesc: string
        catAll: string
        catLayout: string
        catContent: string
        catMedia: string
        catInteractive: string
        catData: string
    }
}

const categoryLabelMap: Record<string, string> = {
    all: 'catAll',
    layout: 'catLayout',
    content: 'catContent',
    media: 'catMedia',
    interactive: 'catInteractive',
    data: 'catData',
}

export function WidgetPickerModal({ open, onClose, onSelect, t }: WidgetPickerModalProps) {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('all')

    if (!open) return null

    const filteredWidgets = (Array.isArray(WIDGET_TYPES) ? WIDGET_TYPES : []).filter(w => {
        const matchesSearch = !search || w.label.toLowerCase().includes(search.toLowerCase()) || w.type.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = category === 'all' || (WIDGET_CATEGORIES[w.type] || 'content') === category
        return matchesSearch && matchesCategory
    })

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.widgetPicker}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t.widgetPickerDesc}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search widgets..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${category === cat.id
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {(t as any)[categoryLabelMap[cat.id]] || cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Widget Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredWidgets.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p>No widgets found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredWidgets.map(widget => (
                                <button
                                    key={widget.type}
                                    onClick={() => {
                                        onSelect(widget.type)
                                        onClose()
                                    }}
                                    className="group flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-transparent hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <span className="text-3xl group-hover:scale-110 transition-transform">{widget.icon}</span>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-center leading-tight">
                                        {widget.label}
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight line-clamp-2">
                                        {widget.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
