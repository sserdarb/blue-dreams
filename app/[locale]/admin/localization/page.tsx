'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Search, Save, Loader2, Sparkles, RotateCcw, Globe, Check, Filter } from 'lucide-react'

type TranslationEntry = { value: string; isOverride: boolean; default: string }

const LOCALES = [
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
]

const SECTIONS = [
    { prefix: 'nav', label: 'Navigation' },
    { prefix: 'report', label: 'Reports' },
    { prefix: 'yield', label: 'Yield' },
    { prefix: 'ai', label: 'AI' },
    { prefix: 'widget', label: 'Widgets' },
    { prefix: 'management', label: 'Management' },
    { prefix: 'preset', label: 'Presets' },
    { prefix: 'month', label: 'Months' },
    { prefix: 'day', label: 'Days' },
    { prefix: '', label: 'All' },
]

export default function LocalizationPage() {
    const params = useParams()
    const [activeLocale, setActiveLocale] = useState('en')
    const [translations, setTranslations] = useState<Record<string, TranslationEntry>>({})
    const [editedKeys, setEditedKeys] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [aiTranslating, setAiTranslating] = useState(false)
    const [search, setSearch] = useState('')
    const [section, setSection] = useState('')
    const [showOverridesOnly, setShowOverridesOnly] = useState(false)
    const [toast, setToast] = useState('')

    const fetchTranslations = useCallback(async (locale: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/translations?locale=${locale}`)
            const data = await res.json()
            setTranslations(data.translations || {})
            setEditedKeys({})
        } catch (err) {
            console.error('Fetch error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchTranslations(activeLocale) }, [activeLocale, fetchTranslations])

    const filteredKeys = useMemo(() => {
        return Object.entries(translations).filter(([key, entry]) => {
            if (search && !key.toLowerCase().includes(search.toLowerCase()) && !entry.value.toLowerCase().includes(search.toLowerCase())) return false
            if (section && !key.startsWith(section)) return false
            if (showOverridesOnly && !entry.isOverride && !editedKeys[key]) return false
            return true
        })
    }, [translations, search, section, showOverridesOnly, editedKeys])

    const handleEdit = (key: string, value: string) => {
        setEditedKeys(prev => ({ ...prev, [key]: value }))
    }

    const handleReset = (key: string) => {
        const entry = translations[key]
        if (entry) {
            setEditedKeys(prev => ({ ...prev, [key]: '' })) // empty = reset
        }
    }

    const handleSave = async () => {
        if (Object.keys(editedKeys).length === 0) return
        setSaving(true)
        try {
            const updates: Record<string, string | null> = {}
            for (const [key, value] of Object.entries(editedKeys)) {
                if (value === '') {
                    updates[key] = null // reset to default
                } else {
                    updates[key] = value
                }
            }

            const res = await fetch('/api/admin/translations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale: activeLocale, updates })
            })

            if (res.ok) {
                setToast('✅ Saved!')
                setTimeout(() => setToast(''), 2000)
                await fetchTranslations(activeLocale)
            }
        } catch (err) {
            console.error('Save error:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleAiTranslate = async () => {
        setAiTranslating(true)
        try {
            // Get TR defaults as source
            const trRes = await fetch('/api/admin/translations?locale=tr')
            const trData = await trRes.json()
            const trTranslations = trData.translations as Record<string, TranslationEntry>

            // Build source keys — only non-overridden ones
            const sourceKeys: Record<string, string> = {}
            const targetEntries = translations
            let count = 0
            for (const [key, entry] of Object.entries(targetEntries)) {
                if (!entry.isOverride && trTranslations[key] && count < 50) {
                    sourceKeys[key] = trTranslations[key].value
                    count++
                }
            }

            if (Object.keys(sourceKeys).length === 0) {
                setToast('No keys to translate')
                setTimeout(() => setToast(''), 2000)
                return
            }

            const res = await fetch('/api/admin/translations/ai-translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceLocale: 'tr',
                    targetLocale: activeLocale,
                    keys: sourceKeys
                })
            })

            if (res.ok) {
                const data = await res.json()
                if (data.translations) {
                    setEditedKeys(prev => ({ ...prev, ...data.translations }))
                    setToast(`🤖 ${Object.keys(data.translations).length} keys translated!`)
                    setTimeout(() => setToast(''), 3000)
                }
            }
        } catch (err) {
            console.error('AI translate error:', err)
        } finally {
            setAiTranslating(false)
        }
    }

    const editCount = Object.keys(editedKeys).filter(k => editedKeys[k] !== undefined).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Globe size={28} className="text-cyan-500" />
                        Lokalizasyon
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Admin panel çevirilerini yönetin. Değişiklikler veritabanında saklanır.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {editCount > 0 && (
                        <span className="text-sm text-amber-500 font-medium animate-pulse">
                            {editCount} unsaved change{editCount > 1 ? 's' : ''}
                        </span>
                    )}
                    {activeLocale !== 'tr' && (
                        <button
                            onClick={handleAiTranslate}
                            disabled={aiTranslating}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            <Sparkles size={16} className={aiTranslating ? 'animate-pulse' : ''} />
                            {aiTranslating ? 'AI translating...' : 'AI Translate Missing'}
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || editCount === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Locale Tabs */}
            <div className="flex gap-2">
                {LOCALES.map(l => (
                    <button
                        key={l.code}
                        onClick={() => setActiveLocale(l.code)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeLocale === l.code
                            ? 'bg-cyan-600 text-white shadow-sm'
                            : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
                            }`}
                    >
                        <span className="text-lg">{l.flag}</span>
                        {l.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search keys or values..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-cyan-500/30"
                    />
                </div>
                <div className="flex gap-1 flex-wrap">
                    {SECTIONS.map(s => (
                        <button
                            key={s.prefix}
                            onClick={() => setSection(section === s.prefix ? '' : s.prefix)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${section === s.prefix
                                ? 'bg-cyan-600 text-white'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowOverridesOnly(!showOverridesOnly)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showOverridesOnly
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                        }`}
                >
                    <Filter size={12} />
                    Overrides Only
                </button>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-xl shadow-lg animate-fade-in text-sm font-medium">
                    {toast}
                </div>
            )}

            {/* Translation Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-cyan-500" />
                </div>
            ) : (
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700 dark:text-white">
                            {filteredKeys.length} keys
                        </span>
                        <span className="text-xs text-slate-500">
                            {Object.values(translations).filter(t => t.isOverride).length} overrides in DB
                        </span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[600px] overflow-y-auto">
                        {filteredKeys.map(([key, entry]) => {
                            const currentValue = editedKeys[key] !== undefined ? editedKeys[key] : entry.value
                            const isEdited = editedKeys[key] !== undefined && editedKeys[key] !== entry.value

                            return (
                                <div key={key} className={`flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${isEdited ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                                    {/* Key */}
                                    <div className="w-[280px] shrink-0">
                                        <code className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all">{key}</code>
                                        {entry.isOverride && (
                                            <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-cyan-500" title="DB override" />
                                        )}
                                    </div>

                                    {/* Value */}
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={currentValue}
                                            onChange={e => handleEdit(key, e.target.value)}
                                            className={`w-full px-3 py-1.5 text-sm rounded-lg border outline-none transition-all ${isEdited
                                                ? 'border-amber-400 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100'
                                                : 'border-slate-200 dark:border-white/10 bg-transparent text-slate-900 dark:text-white'
                                                } focus:ring-2 focus:ring-cyan-500/30`}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        {(entry.isOverride || isEdited) && (
                                            <button
                                                onClick={() => handleReset(key)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Reset to default"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                        )}
                                        {isEdited && (
                                            <Check size={14} className="text-amber-500" />
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
