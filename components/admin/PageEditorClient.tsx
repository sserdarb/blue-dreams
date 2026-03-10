'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Eye, ArrowLeft, Image, Rocket, FileText, ChevronDown, GripVertical, Trash2, Copy, ChevronUp, Plus, Sparkles, Globe, Loader2, Undo2, Redo2, Clock, Maximize2, Minimize2, PanelLeft, PanelRight, Monitor, Smartphone, Layout, CheckCircle2, AlertCircle, Search } from 'lucide-react'
import { WidgetEditor } from '@/components/admin/widget-editors'
import { getWidgetIcon } from '@/components/admin/widget-editors/widget-types'
import { reorderWidgets, deleteWidget as deleteWidgetAction, addWidget, updatePage, updatePageStatus, duplicateWidget as duplicateWidgetAction } from '@/app/actions/admin'
import { WidgetPickerModal } from '@/components/admin/WidgetPickerModal'
import type { CmsTranslations } from '@/lib/cms-translations'

// ── History entry for undo/redo ──────────────────────────────────
interface HistoryEntry {
    title: string
    slug: string
    metaDesc: string
    status: string
    visibility: string
    template: string
    parentId: string
    featuredImage: string
    widgets: Widget[]
}

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

    // ── UX Enhancement States ──────────────────────────────────
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [leftPanelOpen, setLeftPanelOpen] = useState(true)
    const [rightPanelOpen, setRightPanelOpen] = useState(true)
    const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'split'>('edit')
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

    // ── Undo/Redo History ───────────────────────────────────────
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const canUndo = historyIndex > 0
    const canRedo = historyIndex < history.length - 1

    const pushHistory = useCallback(() => {
        const entry: HistoryEntry = { title, slug, metaDesc, status, visibility, template, parentId, featuredImage, widgets }
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1)
            newHistory.push(entry)
            if (newHistory.length > 30) newHistory.shift() // cap at 30
            return newHistory
        })
        setHistoryIndex(prev => Math.min(prev + 1, 29))
        setHasUnsavedChanges(true)
    }, [title, slug, metaDesc, status, visibility, template, parentId, featuredImage, widgets, historyIndex])

    const handleUndo = useCallback(() => {
        if (!canUndo) return
        const entry = history[historyIndex - 1]
        setTitle(entry.title); setSlug(entry.slug); setMetaDesc(entry.metaDesc)
        setStatus(entry.status); setVisibility(entry.visibility); setTemplate(entry.template)
        setParentId(entry.parentId); setFeaturedImage(entry.featuredImage)
        setWidgets(entry.widgets)
        setHistoryIndex(prev => prev - 1)
    }, [canUndo, history, historyIndex])

    const handleRedo = useCallback(() => {
        if (!canRedo) return
        const entry = history[historyIndex + 1]
        setTitle(entry.title); setSlug(entry.slug); setMetaDesc(entry.metaDesc)
        setStatus(entry.status); setVisibility(entry.visibility); setTemplate(entry.template)
        setParentId(entry.parentId); setFeaturedImage(entry.featuredImage)
        setWidgets(entry.widgets)
        setHistoryIndex(prev => prev + 1)
    }, [canRedo, history, historyIndex])

    // ── Keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y) ─────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                handleSave()
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault()
                handleUndo()
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault()
                handleRedo()
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [handleUndo, handleRedo])

    // ── Push initial history on mount ───────────────────────────
    useEffect(() => {
        const entry: HistoryEntry = { title: page.title, slug: page.slug, metaDesc: page.metaDescription || '', status: page.status, visibility: page.visibility, template: page.template, parentId: page.parentId || '', featuredImage: page.featuredImage || '', widgets: initialWidgets }
        setHistory([entry])
        setHistoryIndex(0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Track unsaved changes for autosave indicator ─────────────
    useEffect(() => {
        if (historyIndex > 0) setHasUnsavedChanges(true)
    }, [title, slug, metaDesc, visibility, template, parentId, featuredImage, historyIndex])

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
            setLastSavedAt(new Date())
            setHasUnsavedChanges(false)
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

    // Helper: time ago string
    const getTimeSince = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
        if (seconds < 60) return `${seconds}sn önce`
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}dk önce`
        return `${Math.floor(minutes / 60)}sa önce`
    }

    // Dynamic grid cols based on panel state
    const gridCols = leftPanelOpen && rightPanelOpen
        ? 'lg:grid-cols-4'
        : leftPanelOpen || rightPanelOpen
            ? 'lg:grid-cols-3'
            : 'lg:grid-cols-1'
    const centerSpan = leftPanelOpen && rightPanelOpen
        ? 'lg:col-span-2'
        : !leftPanelOpen && !rightPanelOpen
            ? 'lg:col-span-1'
            : 'lg:col-span-2'

    return (
        <div className="min-h-screen">
            {/* ━━━ Enhanced Top Toolbar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 -mx-6 px-6 py-3 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    {/* Left: Navigation + Undo/Redo */}
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/${locale}/admin/pages`}
                            className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1 mr-2"
                        >
                            <ArrowLeft size={14} /> {t.backToPages}
                        </Link>
                        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                            <button onClick={handleUndo} disabled={!canUndo} className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed" title="Geri Al (Ctrl+Z)">
                                <Undo2 size={14} />
                            </button>
                            <button onClick={handleRedo} disabled={!canRedo} className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed" title="İleri Al (Ctrl+Y)">
                                <Redo2 size={14} />
                            </button>
                        </div>
                        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
                        {/* Panel Toggles */}
                        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                            <button onClick={() => setLeftPanelOpen(p => !p)} className={`p-1.5 rounded-md transition ${leftPanelOpen ? 'text-blue-600 bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`} title="Widget Panel">
                                <PanelLeft size={14} />
                            </button>
                            <button onClick={() => setRightPanelOpen(p => !p)} className={`p-1.5 rounded-md transition ${rightPanelOpen ? 'text-blue-600 bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`} title="Ayarlar Panel">
                                <PanelRight size={14} />
                            </button>
                        </div>
                    </div>
                    {/* Center: Save Status Indicator */}
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                        {hasUnsavedChanges ? (
                            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Kaydedilmemiş değişiklikler
                            </span>
                        ) : lastSavedAt ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full font-medium">
                                <CheckCircle2 size={12} />
                                {getTimeSince(lastSavedAt)} kaydedildi
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-slate-400 px-2.5 py-1">
                                <Clock size={12} /> Henüz kaydedilmedi
                            </span>
                        )}
                        <span className="text-slate-300 dark:text-slate-600 font-mono text-[10px]">Ctrl+S</span>
                    </div>
                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/${locale}/${page.slug}`}
                            target="_blank"
                            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
                        >
                            <Eye size={14} /> {t.previewBtn}
                        </Link>
                        <button
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50 shadow-sm"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {t.saveDraft}
                        </button>
                        <button
                            onClick={() => handleSave('published')}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            <Rocket size={14} /> {t.publish}
                        </button>
                        {savedMsg && (
                            <span className={`text-xs font-medium ml-1 px-2 py-1 rounded-full ${savedMsg === t.saved ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'}`}>
                                {savedMsg}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ━━━ Main layout: Dynamic Columns ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className={`grid grid-cols-1 ${gridCols} gap-6`}>

                {/* 1. Left Sidebar: Widget Navigation List */}
                {/* Mobile Backdrop */}
                {leftPanelOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setLeftPanelOpen(false)} />
                )}
                {leftPanelOpen && (
                    <div className="fixed inset-y-0 left-0 z-40 w-[85vw] max-w-[320px] bg-slate-100 dark:bg-slate-950 p-4 shadow-2xl lg:static lg:w-auto lg:p-0 lg:shadow-none lg:z-auto lg:col-span-1 space-y-4 overflow-y-auto lg:overflow-visible h-full lg:h-auto border-r border-slate-200 dark:border-slate-800 lg:border-none">
                        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-24 shadow-sm">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Layout size={14} className="text-blue-500" />
                                    {t.pageContentBuilder || 'YAPI (BLOKLAR)'}
                                </h3>
                                <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
                                    {widgets.length}
                                </span>
                            </div>
                            <div className="p-3 space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto edit-scrollbar">
                                {widgets.length === 0 ? (
                                    <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Plus size={20} className="text-slate-400" />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Sayfa Boş</h4>
                                        <p className="text-xs text-slate-500">İçerik oluşturmaya başlamak için yeni bir blok ekleyin.</p>
                                    </div>
                                ) : (
                                    widgets.map((widget, index) => {
                                        let snippet = ''
                                        try {
                                            const data = typeof widget.data === 'string' ? JSON.parse(widget.data) : widget.data
                                            snippet = data.title || data.heading || data.text || ''
                                            // strip html tags
                                            snippet = snippet.replace(/<[^>]*>?/gm, '').substring(0, 30)
                                            if (snippet.length === 30) snippet += '...'
                                        } catch (e) { }

                                        return (
                                            <div
                                                key={widget.id}
                                                draggable
                                                onDragStart={(e) => {
                                                    handleDragStart(index)
                                                    // add a visual drag image class wait for next tick
                                                    setTimeout(() => {
                                                        const target = e.target as HTMLElement
                                                        target.style.opacity = '0.4'
                                                    }, 0)
                                                }}
                                                onDragOver={e => handleDragOver(e, index)}
                                                onDrop={e => handleDrop(e, index)}
                                                onDragEnd={(e) => {
                                                    handleDragEnd()
                                                    const target = e.target as HTMLElement
                                                    target.style.opacity = '1'
                                                }}
                                                className={`group flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${overIndex === index
                                                    ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 scale-105 shadow-md -translate-y-1'
                                                    : activeWidgetId === widget.id
                                                        ? 'border-blue-500 bg-white dark:bg-slate-800 shadow-sm'
                                                        : 'border-slate-100 dark:border-slate-700/50 bg-slate-50 hover:bg-white hover:border-slate-300 dark:bg-slate-900/40 dark:hover:bg-slate-800/80'
                                                    }`}
                                                onClick={() => setActiveWidgetId(widget.id)}
                                                onDoubleClick={() => setActiveWidgetId(widget.id)}
                                            >
                                                <div className="flex items-center gap-3 truncate w-full">
                                                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-grab active:cursor-grabbing hover:bg-slate-200 dark:hover:bg-slate-700 p-1.5 rounded-md transition-colors shrink-0" onClick={(e) => e.stopPropagation()} title="Sürükle bırak ile sırasını değiştir">
                                                        <GripVertical size={14} />
                                                    </button>
                                                    <div className={`p-2 rounded-lg shrink-0 transition-colors ${activeWidgetId === widget.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-blue-500'}`}>
                                                        {getWidgetIcon(widget.type)}
                                                    </div>
                                                    <div className="truncate flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-xs font-bold uppercase block truncate ${activeWidgetId === widget.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                                {widget.type.replace(/-/g, ' ')}
                                                            </span>
                                                            <span className="text-[9px] text-slate-400 font-mono">#{index + 1}</span>
                                                        </div>
                                                        {snippet && (
                                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">{snippet}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <button
                                    onClick={() => setPickerOpen(true)}
                                    className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-blue-600 dark:text-blue-400 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-sm group"
                                >
                                    <div className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded-md text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                        <Plus size={12} />
                                    </div>
                                    YENİ BLOK EKLE
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Center Column: Page Info & Active Editor */}
                <div className={`${centerSpan} space-y-6 transition-all duration-300`}>
                    {/* Title + Slug */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t.pageTitle}</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder={t.pageTitlePlaceholder}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t.slug} (URL)</label>
                                <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
                                    <span className="px-3 py-2.5 text-sm text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                        {t.slugPrefix}
                                    </span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={e => setSlug(e.target.value)}
                                        placeholder={t.slugPlaceholder}
                                        className="flex-1 px-3 py-2.5 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Widget Editor */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col" style={{ minHeight: '600px' }}>
                        {activeWidgetId && widgets.find(w => w.id === activeWidgetId) ? (
                            (() => {
                                const widget = widgets.find(w => w.id === activeWidgetId)!
                                return (
                                    <div className="flex-1 flex flex-col">
                                        {/* Editor Header */}
                                        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shrink-0">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                                    {getWidgetIcon(widget.type)}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                        {widget.type.replace(/-/g, ' ')}
                                                        <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">ID: {widget.id.substring(0, 4)}</span>
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* View Mode Toggle */}
                                                <div className="hidden sm:flex items-center bg-slate-200/50 dark:bg-slate-800 rounded-lg p-0.5 mr-2">
                                                    <button onClick={() => setPreviewMode('edit')} className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${previewMode === 'edit' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                                                        Editör
                                                    </button>
                                                    <button onClick={() => setPreviewMode('split')} className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${previewMode === 'split' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                                                        Bölünmüş
                                                    </button>
                                                    <button onClick={() => setPreviewMode('preview')} className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${previewMode === 'preview' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                                                        Önizleme
                                                    </button>
                                                </div>

                                                <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />

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
                                                    className={`p-2 rounded-lg transition-all border flex items-center gap-1.5 text-xs font-bold ${aiTopicWidgetId === widget.id ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 shadow-inner' : 'bg-white dark:bg-slate-800 text-amber-500 border-slate-200 dark:border-slate-700 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:shadow-sm'}`}
                                                    title="Yapay Zeka ile İçerik Üret"
                                                >
                                                    <Sparkles size={14} className={aiTopicWidgetId === widget.id ? 'animate-pulse' : ''} /> <span className="hidden sm:inline">AI YAZAR</span>
                                                </button>
                                                <button onClick={() => { handleDuplicateWidget(widget); pushHistory() }} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all shadow-sm" title={t.duplicateWidget}>
                                                    <Copy size={14} />
                                                </button>
                                                <button
                                                    onClick={() => { handleDeleteWidget(widget); pushHistory() }}
                                                    disabled={deleting === widget.id}
                                                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm disabled:opacity-50"
                                                    title={t.deleteWidget}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* AI Generate Toolbar */}
                                        {aiTopicWidgetId === widget.id && (
                                            <div className="px-6 py-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border-b border-amber-200 dark:border-amber-800/40 shrink-0">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Sparkles size={16} className="text-amber-500" />
                                                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">Yapay Zeka İçerik Asistanı</h4>
                                                </div>
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
                                                            <span className="text-[9px] bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Scraper</span>
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
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-amber-200/50 dark:border-amber-800/30">
                                                    <span className={`text-xs font-medium ${aiMsg.includes('Hata') || aiMsg.includes('failed') ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded'}`}>
                                                        {aiMsg}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setAiTopicWidgetId(null)}
                                                            className="px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-200/50 dark:hover:bg-amber-800/50 rounded-lg transition-colors"
                                                        >
                                                            İptal
                                                        </button>
                                                        <button
                                                            onClick={() => { handleAiGenerate(widget); pushHistory() }}
                                                            disabled={aiGenerating === widget.id || (!aiTopicInput.trim() && !aiSourceUrl.trim())}
                                                            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
                                                        >
                                                            {aiGenerating === widget.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                            {aiGenerating === widget.id ? 'Üretiliyor...' : 'Oluştur'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Editor Content Area (Split View Support) */}
                                        <div className={`flex-1 flex flex-col lg:flex-row ${previewMode === 'split' ? 'divide-x divide-slate-200 dark:divide-slate-700' : ''} overflow-hidden bg-slate-50/50 dark:bg-slate-900/20`}>

                                            {/* Edit Panel */}
                                            {(previewMode === 'edit' || previewMode === 'split') && (
                                                <div className={`p-4 sm:p-6 overflow-y-auto edit-scrollbar ${previewMode === 'split' ? 'w-full lg:w-1/2' : 'w-full'}`}>
                                                    <div className="max-w-3xl mx-auto">
                                                        <WidgetEditor
                                                            key={widget.id}
                                                            id={widget.id}
                                                            type={widget.type}
                                                            initialData={widget.data}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Preview Panel (Iframe to main site) */}
                                            {(previewMode === 'preview' || previewMode === 'split') && (
                                                <div className={`bg-slate-100 dark:bg-slate-950 flex flex-col relative ${previewMode === 'split' ? 'w-full lg:w-1/2 hidden lg:flex' : 'w-full'}`}>
                                                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                                        <Monitor size={14} className="text-slate-500" />
                                                        <Smartphone size={14} className="text-slate-400" />
                                                    </div>
                                                    <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
                                                        <div className="bg-white dark:bg-slate-900 w-full h-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex items-center justify-center">
                                                            {/* Actual live preview requires saving draft and reloading iframe, so we show a placeholder helper for now indicating it's a structural representation */}
                                                            <div className="text-center p-6">
                                                                <Eye size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{widget.type.replace(/-/g, ' ')} Önizlemesi</h4>
                                                                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">Gerçek sayfa önizlemesi için taslak olarak kaydedin.</p>
                                                                <button onClick={() => handleSave()} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors">
                                                                    Taslak Kaydet ve Güncelle
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })()
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/20">
                                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <Layout size={32} className="text-blue-500/50" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Blok Seçilmedi</h3>
                                <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">Bu sayfayı yapılandırmak ve düzenlemek için soldaki yapı panelinden bir blok seçin veya yeni bir içerik bloğu ekleyin.</p>
                                <button
                                    onClick={() => setPickerOpen(true)}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
                                >
                                    <Plus className="group-hover:rotate-90 transition-transform" /> İçerik Bloğu Ekle
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Right Sidebar: Settings */}
                {/* Mobile Backdrop */}
                {rightPanelOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setRightPanelOpen(false)} />
                )}
                {rightPanelOpen && (
                    <div className="fixed inset-y-0 right-0 z-40 w-[85vw] max-w-[320px] bg-slate-100 dark:bg-slate-950 p-4 shadow-2xl lg:static lg:w-auto lg:p-0 lg:shadow-none lg:z-auto lg:col-span-1 space-y-6 overflow-y-auto lg:overflow-visible h-full lg:h-auto border-l border-slate-200 dark:border-slate-800 lg:border-none pb-24 lg:pb-0">

                        {/* Parent Page & Layout */}
                        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <span className="text-purple-500">💎</span>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t.pageAttributes || 'Sayfa Nitelikleri'}</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.parentPage}</label>
                                    <select
                                        value={parentId || ''}
                                        onChange={e => setParentId(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    >
                                        <option value="">{(t as any).noParentPage || 'Ana Sayfa (Üst yok)'}</option>
                                        {/* Assuming parentOptions are available or empty */}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.template}</label>
                                    <select
                                        value={template}
                                        onChange={e => setTemplate(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    >
                                        <option value="default">{(t as any).defaultTemplate || 'Varsayılan Şablon'}</option>
                                        <option value="landing">{(t as any).landingTemplate || 'Açılış Sayfası (Landing)'}</option>
                                        <option value="full-width">{(t as any).fullWidthTemplate || 'Tam Genişlik'}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <Search size={16} className="text-amber-500" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{(t as any).seoSettings || 'SEO Ayarları'}</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.metaDescription}</label>
                                        <button
                                            type="button"
                                            onClick={handleGenerateSeo}
                                            disabled={generatingSeo || widgets.length === 0}
                                            className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/50 px-2 py-1 rounded font-bold flex items-center gap-1 transition-colors uppercase tracking-wider shadow-sm"
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
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow"
                                    />
                                    <div className="flex justify-between mt-1">
                                        <span className={`text-[10px] ${metaDesc.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                            İdeal sınır: 160 karakter
                                        </span>
                                        <span className={`text-[11px] font-mono ${metaDesc.length > 160 ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                                            {metaDesc.length}/160
                                        </span>
                                    </div>
                                </div>

                                {/* Language badge */}
                                <div className="flex items-center justify-between pt-2">
                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.language}:</label>
                                    <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800/50">
                                        {page.locale}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* AI Translation Panel */}
                        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <Globe size={16} className="text-cyan-500" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t.aiTranslate}</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.aiTranslateDesc}</p>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.targetLanguage}</label>
                                    <select
                                        value={translateTarget}
                                        onChange={e => setTranslateTarget(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
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
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {translating ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                                    {translating ? t.aiTranslating : t.aiTranslateBtn}
                                </button>
                                {translateMsg && (
                                    <p className={`text-[11px] p-2 rounded-lg font-medium text-center ${translateMsg.includes(t.aiTranslateSuccess) ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'}`}>
                                        {translateMsg}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Widget Picker Modal */}
            <WidgetPickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handleAddWidget}
                t={t}
            />
        </div >
    )
}
