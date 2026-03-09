'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Eye, ArrowLeft, Image, Rocket, FileText, ChevronDown, GripVertical, Trash2, Copy, ChevronUp, Plus, Sparkles, Globe, Loader2 } from 'lucide-react'
import { WidgetEditor } from '@/components/admin/widget-editors'
import { getWidgetIcon } from '@/components/admin/widget-editors/widget-types'
import { reorderWidgets, deleteWidget as deleteWidgetAction, addWidget, updatePage, updatePageStatus, duplicateWidget as duplicateWidgetAction } from '@/app/actions/admin'
import { WidgetPickerModal } from '@/components/admin/WidgetPickerModal'
import type { CmsTranslations } from '@/lib/cms-translations'

interface Widget {
    id: string
    type: string
    name: string | null
    data: string
    order: number
}

interface PageData {
    id: string
    slug: string
    locale: string
    title: string
    metaDescription: string | null
    status: string
    visibility: string
    template: string
    featuredImage: string | null
    parentId: string | null
    publishedAt: string | null
}

interface ParentOption {
    id: string
    title: string
    slug: string
}

export function PageEditorClient({
    page,
    widgets: initialWidgets,
    locale,
    t,
    parentOptions,
}: {
    page: PageData
    widgets: Widget[]
    locale: string
    t: CmsTranslations
    parentOptions: ParentOption[]
}) {
    const router = useRouter()
    const [widgets, setWidgets] = useState(initialWidgets)
    const [title, setTitle] = useState(page.title)
    const [slug, setSlug] = useState(page.slug)
    const [metaDesc, setMetaDesc] = useState(page.metaDescription || '')
    const [status, setStatus] = useState(page.status)
    const [visibility, setVisibility] = useState(page.visibility)
    const [template, setTemplate] = useState(page.template)
    const [parentId, setParentId] = useState(page.parentId || '')
    const [featuredImage, setFeaturedImage] = useState(page.featuredImage || '')

    const [saving, setSaving] = useState(false)
    const [savedMsg, setSavedMsg] = useState('')
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [overIndex, setOverIndex] = useState<number | null>(null)
    const [collapsedWidgets, setCollapsedWidgets] = useState<Set<string>>(new Set())
    const [pickerOpen, setPickerOpen] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [activeWidgetId, setActiveWidgetId] = useState<string | null>(initialWidgets.length > 0 ? initialWidgets[0].id : null)

    // AI states
    const [aiGenerating, setAiGenerating] = useState<string | null>(null) // widget id being generated
    const [aiTopicInput, setAiTopicInput] = useState<string>('')
    const [aiSourceUrl, setAiSourceUrl] = useState<string>('')
    const [aiTopicWidgetId, setAiTopicWidgetId] = useState<string | null>(null)
    const [aiMsg, setAiMsg] = useState('')
    const [translating, setTranslating] = useState(false)
    const [translateTarget, setTranslateTarget] = useState('')
    const [translateMsg, setTranslateMsg] = useState('')
    const [generatingSeo, setGeneratingSeo] = useState(false)

    // Save page metadata
    const handleSave = async (newStatus?: string) => {
        setSaving(true)
        try {
            await updatePage(page.id, {
                title,
                slug,
                metaDescription: metaDesc || null,
                status: newStatus || status,
                visibility,
                template,
                parentId: parentId || null,
            })
            if (newStatus) setStatus(newStatus)
            setSavedMsg(t.saved)
            setTimeout(() => setSavedMsg(''), 2000)
            router.refresh()
        } catch (err) {
            console.error('Save failed:', err)
            setSavedMsg(t.error)
        }
        setSaving(false)
    }

    // Drag & drop
    const handleDragStart = (index: number) => setDragIndex(index)
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (dragIndex !== null && dragIndex !== index) setOverIndex(index)
    }
    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        if (dragIndex === null || dragIndex === dropIndex) { setDragIndex(null); setOverIndex(null); return }
        const newWidgets = [...widgets]
        const [moved] = newWidgets.splice(dragIndex, 1)
        newWidgets.splice(dropIndex, 0, moved)
        setWidgets(newWidgets)
        setDragIndex(null)
        setOverIndex(null)
        try { await reorderWidgets(newWidgets.map(w => w.id)) } catch { setWidgets(initialWidgets) }
    }
    const handleDragEnd = () => { setDragIndex(null); setOverIndex(null) }

    // Widget actions
    const handleDeleteWidget = async (widget: Widget) => {
        if (!confirm(`"${widget.type}" widget'ını silmek istediğinize emin misiniz?`)) return
        setDeleting(widget.id)
        try {
            await deleteWidgetAction(widget.id)
            setWidgets(prev => prev.filter(w => w.id !== widget.id))
            router.refresh()
        } catch (err) { console.error(err) }
        setDeleting(null)
    }

    const handleDuplicateWidget = async (widget: Widget) => {
        try {
            await duplicateWidgetAction(widget.id)
            router.refresh()
        } catch (err) { console.error(err) }
    }

    const handleAddWidget = async (type: string) => {
        try {
            await addWidget(page.id, type)
            router.refresh()
            // Assume the new widget will appear at the end, so its ID isn't known here instantly 
            // without reading the result. In a real scenario we could return the id from `addWidget`.
        } catch (err) { console.error(err) }
    }

    const toggleCollapse = (id: string) => {
        setCollapsedWidgets(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    // AI Content Generation
    const handleAiGenerate = async (widget: Widget) => {
        if (!aiTopicInput.trim() && !aiSourceUrl.trim()) return
        setAiGenerating(widget.id)
        setAiMsg('')
        try {
            const res = await fetch('/api/admin/cms-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    widgetType: widget.type,
                    topic: aiTopicInput,
                    sourceUrl: aiSourceUrl,
                    locale: page.locale,
                })
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'AI generation failed')

            // Update widget data via server action
            const { updateWidget } = await import('@/app/actions/admin')
            await updateWidget(widget.id, result.data)
            setAiMsg(t.aiGenerateSuccess)
            setAiTopicWidgetId(null)
            setAiTopicInput('')
            router.refresh()
        } catch (err: any) {
            console.error('AI generate error:', err)
            setAiMsg(t.aiError + ': ' + (err.message || ''))
        }
        setAiGenerating(null)
        setTimeout(() => setAiMsg(''), 3000)
    }

    // AI Page Translation
    const handleAiTranslate = async () => {
        if (!translateTarget) return
        setTranslating(true)
        setTranslateMsg('')
        try {
            const res = await fetch('/api/admin/cms-translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageId: page.id, targetLocale: translateTarget })
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Translation failed')
            setTranslateMsg(t.aiTranslateSuccess)
            // Navigate to the new translated page after a short delay
            setTimeout(() => {
                router.push(`/${locale}/admin/pages/${result.pageId}/editor`)
            }, 1500)
        } catch (err: any) {
            console.error('AI translate error:', err)
            setTranslateMsg(t.aiTranslateFailed + ': ' + (err.message || ''))
        }
        setTranslating(false)
    }

    // Auto SEO Generation
    const handleGenerateSeo = async () => {
        setGeneratingSeo(true)
        try {
            const res = await fetch('/api/admin/cms-generate-seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    locale: page.locale,
                    widgets: widgets.map(w => w.data) // send widget contents as context
                })
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error)
            setMetaDesc(result.description)
        } catch (err) {
            console.error(err)
            alert('SEO Otomatik üretim başarısız oldu. Lütfen tekrar deneyin.')
        }
        setGeneratingSeo(false)
    }

    return (
        <div>
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${locale}/admin/pages`}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1"
                    >
                        <ArrowLeft size={14} /> {t.backToPages}
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/${locale}/${page.slug}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                        <Eye size={14} /> {t.previewBtn}
                    </Link>
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
                    >
                        <Save size={14} /> {t.saveDraft}
                    </button>
                    <button
                        onClick={() => handleSave('published')}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
                    >
                        <Rocket size={14} /> {t.publish}
                    </button>
                    {savedMsg && (
                        <span className={`text-xs font-medium ml-2 ${savedMsg === t.saved ? 'text-emerald-500' : 'text-red-500'}`}>
                            {savedMsg}
                        </span>
                    )}
                </div>
            </div>

            {/* Main layout: 3 Columns -> Navigation (1), Content (2), Settings (1) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* 1. Left Sidebar: Widget Navigation List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-6">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t.pageContentBuilder || 'YAPI (BLOKLAR)'}</h3>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                {widgets.length}
                            </span>
                        </div>
                        <div className="p-2 space-y-1.5 max-h-[600px] overflow-y-auto edit-scrollbar">
                            {widgets.length === 0 ? (
                                <div className="text-center py-6">
                                    <span className="text-xs text-slate-400">Blok Yok</span>
                                </div>
                            ) : (
                                widgets.map((widget, index) => (
                                    <div
                                        key={widget.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={e => handleDragOver(e, index)}
                                        onDrop={e => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`flex items-center justify-between p-2.5 rounded-lg border-2 cursor-pointer transition-all ${activeWidgetId === widget.id
                                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                                                : overIndex === index
                                                    ? 'border-blue-300 ring-2 ring-blue-300/20'
                                                    : 'border-transparent bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-800'
                                            }`}
                                        onClick={() => setActiveWidgetId(widget.id)}
                                    >
                                        <div className="flex items-center gap-3 truncate w-full">
                                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-grab active:cursor-grabbing hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded transition-colors shrink-0" onClick={(e) => e.stopPropagation()}>
                                                <GripVertical size={14} />
                                            </button>
                                            <span className="text-xl opacity-70 shrink-0">{getWidgetIcon(widget.type)}</span>
                                            <div className="truncate flex-1">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase block truncate">
                                                    {widget.type.replace(/-/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <button
                                onClick={() => setPickerOpen(true)}
                                className="w-full py-2.5 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-blue-600 dark:text-blue-400 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-xs font-bold flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> YENİ BLOK EKLE
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Center Column: Page Info & Active Editor */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title + Slug */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t.pageTitle}</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder={t.pageTitlePlaceholder}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t.slug} (URL)</label>
                            <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <span className="px-3 py-3 text-sm text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                    {t.slugPrefix}
                                </span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                    placeholder={t.slugPlaceholder}
                                    className="flex-1 px-3 py-3 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Active Widget Editor */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        {activeWidgetId && widgets.find(w => w.id === activeWidgetId) ? (
                            (() => {
                                const widget = widgets.find(w => w.id === activeWidgetId)!
                                return (
                                    <div className="h-full flex flex-col">
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shrink-0">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getWidgetIcon(widget.type)}</span>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                        {widget.type.replace(/-/g, ' ')}
                                                    </h3>
                                                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">Aktif Blok</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        if (aiTopicWidgetId === widget.id) {
                                                            setAiTopicWidgetId(null)
                                                        } else {
                                                            setAiTopicWidgetId(widget.id)
                                                            setAiTopicInput('')
                                                            setAiSourceUrl('')
                                                        }
                                                    }}
                                                    className={`p-2 rounded-lg transition border flex items-center gap-2 text-xs font-bold ${aiTopicWidgetId === widget.id ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400' : 'bg-white dark:bg-slate-800 text-amber-500 border-slate-200 dark:border-slate-700 hover:border-amber-300'}`}
                                                >
                                                    <Sparkles size={14} /> AI YAZAR
                                                </button>
                                                <button onClick={() => handleDuplicateWidget(widget)} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:border-blue-300 transition" title={t.duplicateWidget}>
                                                    <Copy size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteWidget(widget)}
                                                    disabled={deleting === widget.id}
                                                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-300 transition disabled:opacity-50"
                                                    title={t.deleteWidget}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* AI Generate Toolbar */}
                                        {aiTopicWidgetId === widget.id && (
                                            <div className="px-6 py-5 bg-amber-50/80 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/40 space-y-4 shrink-0">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-amber-800/70 dark:text-amber-500/70 uppercase tracking-wider mb-1.5">Ne hakkında yazılacak?</label>
                                                        <input
                                                            type="text"
                                                            value={aiTopicInput}
                                                            onChange={e => setAiTopicInput(e.target.value)}
                                                            placeholder="Örn: Bodrum'un en iyi koyları"
                                                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <label className="text-[11px] font-bold text-amber-800/70 dark:text-amber-500/70 uppercase tracking-wider">Kaynak URL (Opsiyonel)</label>
                                                            <span className="text-[9px] bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 rounded uppercase font-bold">Scraper</span>
                                                        </div>
                                                        <input
                                                            type="url"
                                                            value={aiSourceUrl}
                                                            onChange={e => setAiSourceUrl(e.target.value)}
                                                            placeholder="https://tripadvisor.com/..."
                                                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-amber-200/50 dark:border-amber-800/30">
                                                    <span className={`text-xs font-medium ${aiMsg.includes('Hata') || aiMsg.includes('failed') ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                        {aiMsg}
                                                    </span>
                                                    <button
                                                        onClick={() => handleAiGenerate(widget)}
                                                        disabled={aiGenerating === widget.id || (!aiTopicInput.trim() && !aiSourceUrl.trim())}
                                                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                                    >
                                                        {aiGenerating === widget.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                        {aiGenerating === widget.id ? 'Yapay Zeka Üretiyor...' : 'İçeriği Otomatik Oluştur'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-6">
                                            <WidgetEditor key={widget.id} id={widget.id} type={widget.type} initialData={widget.data} />
                                        </div>
                                    </div>
                                )
                            })()
                        ) : (
                            <div className="py-24 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                                    <FileText size={32} className="opacity-50" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Blok Seçilmedi</h3>
                                <p className="text-sm max-w-xs mx-auto">Bu sayfayı yapılandırmak ve düzenlemek için soldaki panelden bir blok seçin veya yeni bir blok ekleyin.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Right Sidebar: Settings */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Publishing Options */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-6">
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <Rocket size={16} className="text-blue-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.publishingOptions}</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" /> {t.status}:
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">{status === 'published' ? t.published : t.draft}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Eye size={12} /> {t.visibility}:
                                </span>
                                <select
                                    value={visibility}
                                    onChange={e => setVisibility(e.target.value)}
                                    className="bg-transparent text-blue-600 dark:text-blue-400 font-semibold text-sm cursor-pointer focus:outline-none"
                                >
                                    <option value="public">{t.visibilityPublic}</option>
                                    <option value="private">{t.visibilityPrivate}</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    📅 {t.schedule}:
                                </span>
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">{t.immediately}</span>
                            </div>

                            <div className="pt-2 space-y-2">
                                <button
                                    onClick={() => handleSave()}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition disabled:opacity-50"
                                >
                                    <Save size={14} /> {saving ? t.saving : t.updateDraft}
                                </button>
                                <button
                                    onClick={() => handleSave('published')}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
                                >
                                    <Rocket size={14} /> {t.publishNow}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
                            <Image size={16} className="text-emerald-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.featuredImage}</h3>
                        </div>
                        <div className="p-5">
                            {featuredImage ? (
                                <div className="relative group">
                                    <img src={featuredImage} alt="Featured" className="w-full h-40 object-cover rounded-lg" />
                                    <button
                                        onClick={() => setFeaturedImage('')}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl py-8 flex flex-col items-center gap-2">
                                    <Image size={24} className="text-slate-300 dark:text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Görsel URL giriniz..."
                                        className="text-xs text-center bg-transparent text-slate-400 dark:text-slate-500 focus:outline-none w-full px-4"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                setFeaturedImage((e.target as HTMLInputElement).value)
                                            }
                                        }}
                                    />
                                    <span className="text-xs text-slate-400 dark:text-slate-500">{t.clickToUpload}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Page Attributes */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-purple-500">💎</span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.pageAttributes}</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Parent Page */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.parentPage}</label>
                                <select
                                    value={parentId}
                                    onChange={e => setParentId(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">{t.noParent}</option>
                                    {parentOptions.map(p => (
                                        <option key={p.id} value={p.id}>{p.title} (/{p.slug})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Template */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.template}</label>
                                <select
                                    value={template}
                                    onChange={e => setTemplate(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="default">{t.templateDefault}</option>
                                    <option value="full-width">{t.templateFullWidth}</option>
                                    <option value="sidebar">{t.templateSidebar}</option>
                                </select>
                            </div>

                            {/* Meta Description */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.metaDescription}</label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateSeo}
                                        disabled={generatingSeo || widgets.length === 0}
                                        className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 px-2 py-1 rounded font-bold flex items-center gap-1 transition"
                                        title="Yapay Zeka ile içeriğe bakarak meta açıklaması yaz (max 160 kr)"
                                    >
                                        {generatingSeo ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                        {generatingSeo ? 'YAZILIYOR...' : 'AI SEO'}
                                    </button>
                                </div>
                                <textarea
                                    value={metaDesc}
                                    onChange={e => setMetaDesc(e.target.value)}
                                    placeholder={t.metaDescriptionPlaceholder}
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                                <div className="flex justify-between mt-1">
                                    <span className={`text-[10px] ${metaDesc.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                        İdeal sınır: 160 karakter
                                    </span>
                                    <span className={`text-xs ${metaDesc.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                        {metaDesc.length}/160
                                    </span>
                                </div>
                            </div>

                            {/* Language badge */}
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.language}:</label>
                                <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold">
                                    {page.locale.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* AI Translation Panel */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
                            <Globe size={16} className="text-cyan-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.aiTranslate}</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t.aiTranslateDesc}</p>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.targetLanguage}</label>
                                <select
                                    value={translateTarget}
                                    onChange={e => setTranslateTarget(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value="">{t.selectLanguage}</option>
                                    {['tr', 'en', 'de', 'ru'].filter(l => l !== page.locale).map(l => (
                                        <option key={l} value={l}>
                                            {l === 'tr' ? '🇹🇷 Türkçe' : l === 'en' ? '🇬🇧 English' : l === 'de' ? '🇩🇪 Deutsch' : '🇷🇺 Русский'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleAiTranslate}
                                disabled={translating || !translateTarget}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
                            >
                                {translating ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                                {translating ? t.aiTranslating : t.aiTranslateBtn}
                            </button>
                            {translateMsg && (
                                <p className={`text-xs font-medium text-center ${translateMsg.includes(t.aiTranslateSuccess) ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {translateMsg}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Widget Picker Modal */}
            <WidgetPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handleAddWidget}
                t={t}
            />
        </div>
    )
}
