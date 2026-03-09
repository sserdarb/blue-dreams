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

    // AI states
    const [aiGenerating, setAiGenerating] = useState<string | null>(null) // widget id being generated
    const [aiTopicInput, setAiTopicInput] = useState<string>('')
    const [aiTopicWidgetId, setAiTopicWidgetId] = useState<string | null>(null)
    const [aiMsg, setAiMsg] = useState('')
    const [translating, setTranslating] = useState(false)
    const [translateTarget, setTranslateTarget] = useState('')
    const [translateMsg, setTranslateMsg] = useState('')

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
        if (!aiTopicInput.trim()) return
        setAiGenerating(widget.id)
        setAiMsg('')
        try {
            const res = await fetch('/api/admin/cms-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    widgetType: widget.type,
                    topic: aiTopicInput,
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

            {/* Main layout: Left (content) + Right (sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column — Page Title, Slug, Content Builder */}
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

                    {/* Content Builder */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t.pageContentBuilder}</h3>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                {widgets.length} {t.blocksAdded}
                            </span>
                        </div>

                        {/* Widget list */}
                        <div className="p-4 space-y-3">
                            {widgets.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                    <FileText size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-400 dark:text-slate-500 text-sm">Bu sayfada henüz widget yok</p>
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
                                        className={`bg-white dark:bg-slate-900 rounded-xl border-2 overflow-hidden transition-all duration-200 ${dragIndex === index
                                            ? 'opacity-50 border-blue-400 scale-[0.98]'
                                            : overIndex === index
                                                ? 'border-blue-400 ring-2 ring-blue-400/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        {/* Widget header */}
                                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-grab active:cursor-grabbing">
                                                    <GripVertical size={16} />
                                                </button>
                                                <span className="text-xl">{getWidgetIcon(widget.type)}</span>
                                                <div>
                                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase">
                                                        {widget.type.replace(/-/g, ' ')}
                                                    </span>
                                                    {widget.name && (
                                                        <span className="block text-xs text-slate-400">{widget.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        if (aiTopicWidgetId === widget.id) {
                                                            setAiTopicWidgetId(null)
                                                        } else {
                                                            setAiTopicWidgetId(widget.id)
                                                            setAiTopicInput('')
                                                        }
                                                    }}
                                                    className="p-1.5 rounded text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition"
                                                    title={t.aiGenerateBtn}
                                                >
                                                    <Sparkles size={14} />
                                                </button>
                                                <button onClick={() => handleDuplicateWidget(widget)} className="p-1.5 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition" title={t.duplicateWidget}>
                                                    <Copy size={14} />
                                                </button>
                                                <button onClick={() => toggleCollapse(widget.id)} className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                                    {collapsedWidgets.has(widget.id) ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteWidget(widget)}
                                                    disabled={deleting === widget.id}
                                                    className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition disabled:opacity-50"
                                                    title={t.deleteWidget}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* AI Topic Input (inline) */}
                                        {aiTopicWidgetId === widget.id && (
                                            <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles size={14} className="text-amber-500 shrink-0" />
                                                    <input
                                                        type="text"
                                                        value={aiTopicInput}
                                                        onChange={e => setAiTopicInput(e.target.value)}
                                                        placeholder={t.aiTopicPlaceholder}
                                                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                        onKeyDown={e => { if (e.key === 'Enter') handleAiGenerate(widget) }}
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleAiGenerate(widget)}
                                                        disabled={aiGenerating === widget.id || !aiTopicInput.trim()}
                                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        {aiGenerating === widget.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                        {aiGenerating === widget.id ? t.aiGenerating : t.aiGenerateBtn}
                                                    </button>
                                                </div>
                                                {aiMsg && <p className={`text-xs mt-1.5 ${aiMsg.includes(t.aiGenerateSuccess) ? 'text-emerald-600' : 'text-red-500'}`}>{aiMsg}</p>}
                                            </div>
                                        )}

                                        {/* Widget editor body (collapsible) */}
                                        {!collapsedWidgets.has(widget.id) && (
                                            <div className="p-4">
                                                <WidgetEditor id={widget.id} type={widget.type} initialData={widget.data} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add widget button */}
                        <div className="p-4 pt-0">
                            <button
                                onClick={() => setPickerOpen(true)}
                                className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-blue-600 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-sm font-medium flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> {t.insertBlock}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Publishing Options */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
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
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.metaDescription}</label>
                                <textarea
                                    value={metaDesc}
                                    onChange={e => setMetaDesc(e.target.value)}
                                    placeholder={t.metaDescriptionPlaceholder}
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                                <span className="text-xs text-slate-400 mt-1 block">{metaDesc.length}/160</span>
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
