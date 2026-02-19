'use client'
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import {
    Sparkles, Copy, Check, Instagram, Facebook, Linkedin, Twitter,
    Languages, Image as ImageIcon, Calendar, Clock, Save, Send,
    Loader2, Hash, Palette, Globe, FileText, Trash2, Eye, Film
} from 'lucide-react'

// Lazy-load heavy editor components
const DesignTool = dynamic(() => import('./DesignTool'), { ssr: false, loading: () => <div className="flex items-center justify-center h-96"><Loader2 size={32} className="animate-spin text-cyan-500" /></div> })
const VideoEditor = dynamic(() => import('./VideoEditor'), { ssr: false, loading: () => <div className="flex items-center justify-center h-96"><Loader2 size={32} className="animate-spin text-purple-500" /></div> })

// ─── Types ─────────────────────────────────────────────────────
interface GeneratedContent {
    title: string
    body: string
    hashtags: string[]
}

interface SavedPost {
    id: string
    topic: string
    platform: string
    content: Record<string, GeneratedContent>
    scheduledDate?: string
    scheduledTime?: string
    status: 'draft' | 'scheduled'
    createdAt: string
    imageUrl?: string
}

// ─── Constants ─────────────────────────────────────────────────
const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-700' },
    { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'from-gray-800 to-gray-900' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-800' },
]

const TONES = [
    { id: 'luxury', label: 'Lüks & Zarif', emoji: '✨' },
    { id: 'casual', label: 'Samimi & Sıcak', emoji: '🌊' },
    { id: 'professional', label: 'Profesyonel', emoji: '💼' },
    { id: 'promotional', label: 'Promosyon', emoji: '🔥' },
]

const LANGUAGES = [
    { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { id: 'ru', label: 'Русский', flag: '🇷🇺' },
]

const TOPIC_SUGGESTIONS = [
    'Yaz döneminde havuz keyfi ve sunbed alanları',
    'Naya Spa wellness deneyimi ve masaj hizmetleri',
    'Açık büfe kahvaltı ve restoran lezzetleri',
    'Torba Koyu gün batımı manzarası',
    'Aile tatili ve çocuk aktiviteleri',
    'Toplantı ve etkinlik imkânları (MICE)',
    'Club oda tanıtımı ve deniz manzarası',
    'Erken rezervasyon kampanyası',
]

// ─── Main Component ────────────────────────────────────────────
export default function SocialContentPage() {
    const [topic, setTopic] = useState('')
    const [platform, setPlatform] = useState('instagram')
    const [tone, setTone] = useState('luxury')
    const [selectedLangs, setSelectedLangs] = useState<string[]>(['tr', 'en'])
    const [includeHashtags, setIncludeHashtags] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedContent, setGeneratedContent] = useState<Record<string, GeneratedContent> | null>(null)
    const [activeTab, setActiveTab] = useState('tr')
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [savedPosts, setSavedPosts] = useState<SavedPost[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('bdr-social-posts')
            return saved ? JSON.parse(saved) : []
        }
        return []
    })
    const [imageUrl, setImageUrl] = useState('')
    const [scheduleDate, setScheduleDate] = useState('')
    const [scheduleTime, setScheduleTime] = useState('')
    const [showHistory, setShowHistory] = useState(false)
    const [mainTab, setMainTab] = useState<'content' | 'design' | 'video'>('content')

    // Toggle language selection
    const toggleLang = (lang: string) => {
        setSelectedLangs(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        )
    }

    // Copy to clipboard
    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    // Generate content via AI
    const handleGenerate = async () => {
        if (!topic.trim() || selectedLangs.length === 0) return
        setIsGenerating(true)
        setGeneratedContent(null)

        try {
            const res = await fetch('/api/admin/social-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, platform, tone, languages: selectedLangs, includeHashtags })
            })

            if (!res.ok) throw new Error('API error')
            const data = await res.json()
            setGeneratedContent(data.results)
            setActiveTab(selectedLangs[0])
        } catch (err) {
            console.error('Generation error:', err)
        } finally {
            setIsGenerating(false)
        }
    }

    // Save post
    const handleSave = (status: 'draft' | 'scheduled') => {
        if (!generatedContent) return
        const post: SavedPost = {
            id: Date.now().toString(),
            topic,
            platform,
            content: generatedContent,
            status,
            createdAt: new Date().toISOString(),
            imageUrl: imageUrl || undefined,
            scheduledDate: status === 'scheduled' ? scheduleDate : undefined,
            scheduledTime: status === 'scheduled' ? scheduleTime : undefined,
        }
        const updated = [post, ...savedPosts]
        setSavedPosts(updated)
        localStorage.setItem('bdr-social-posts', JSON.stringify(updated))
    }

    // Delete post
    const deletePost = (id: string) => {
        const updated = savedPosts.filter(p => p.id !== id)
        setSavedPosts(updated)
        localStorage.setItem('bdr-social-posts', JSON.stringify(updated))
    }

    const selectedPlatform = PLATFORMS.find(p => p.id === platform)

    return (
        <div className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-slate-900 transition-colors">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${mainTab === 'content' ? 'bg-gradient-to-tr from-pink-500 to-purple-600' : mainTab === 'design' ? 'bg-gradient-to-tr from-cyan-500 to-blue-600' : 'bg-gradient-to-tr from-purple-500 to-indigo-600'}`}>
                            {mainTab === 'content' ? <Sparkles size={24} className="text-white" /> : mainTab === 'design' ? <Palette size={24} className="text-white" /> : <Film size={24} className="text-white" />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {mainTab === 'content' ? 'AI İçerik Üretici' : mainTab === 'design' ? 'Tasarım Aracı' : 'Video Düzenleyici'}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {mainTab === 'content' ? 'Sosyal medya içeriklerinizi yapay zeka ile oluşturun' : mainTab === 'design' ? 'Profesyonel görseller tasarlayın' : 'Videolarınızı düzenleyin ve paylaşın'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {mainTab === 'content' && (
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${showHistory
                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    } border border-slate-200 dark:border-slate-700`}
                            >
                                <FileText size={16} /> Geçmiş ({savedPosts.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Tool Tabs */}
                <div className="flex gap-1 mt-4 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    {[
                        { id: 'content' as const, label: 'İçerik Üretici', icon: Sparkles, color: 'purple' },
                        { id: 'design' as const, label: 'Tasarım Aracı', icon: Palette, color: 'cyan' },
                        { id: 'video' as const, label: 'Video Düzenleyici', icon: Film, color: 'indigo' },
                    ].map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setMainTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${mainTab === tab.id
                                    ? `bg-gradient-to-r ${tab.color === 'purple' ? 'from-purple-600 to-pink-600' : tab.color === 'cyan' ? 'from-cyan-600 to-blue-600' : 'from-purple-600 to-indigo-600'} text-white shadow-lg`
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <Icon size={16} /> {tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Design Tool Tab */}
            {mainTab === 'design' && (
                <div className="max-w-7xl mx-auto">
                    <DesignTool />
                </div>
            )}

            {/* Video Editor Tab */}
            {mainTab === 'video' && (
                <div className="max-w-7xl mx-auto">
                    <VideoEditor />
                </div>
            )}

            {/* Content Generator Tab (original) */}
            {mainTab === 'content' && (

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Panel - Composer */}
                    <div className={`${showHistory ? 'lg:col-span-4' : 'lg:col-span-5'} space-y-6`}>
                        {/* Topic */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                                📝 Konu / İçerik Açıklaması
                            </label>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Hangi konuda içerik üretmek istiyorsunuz? Örn: Yaz kampanyası, spa tanıtımı..."
                                rows={3}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {TOPIC_SUGGESTIONS.slice(0, 4).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setTopic(s)}
                                        className="text-xs px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors border border-purple-200 dark:border-purple-800"
                                    >
                                        {s.length > 35 ? s.slice(0, 35) + '...' : s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Platform */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                                📱 Platform
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {PLATFORMS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setPlatform(p.id)}
                                        className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all border ${platform === p.id
                                            ? `bg-gradient-to-r ${p.color} text-white border-transparent shadow-lg`
                                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                                            }`}
                                    >
                                        <p.icon size={16} /> {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tone */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                                <Palette size={14} className="inline mr-1" /> Ton & Stil
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {TONES.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTone(t.id)}
                                        className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all border ${tone === t.id
                                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                                            }`}
                                    >
                                        <span>{t.emoji}</span> {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                                <Globe size={14} className="inline mr-1" /> Diller
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {LANGUAGES.map(l => (
                                    <button
                                        key={l.id}
                                        onClick={() => toggleLang(l.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${selectedLangs.includes(l.id)
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                            : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                                            }`}
                                    >
                                        <span>{l.flag}</span> {l.label}
                                    </button>
                                ))}
                            </div>
                            <label className="flex items-center gap-2 mt-4 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeHashtags}
                                    onChange={() => setIncludeHashtags(!includeHashtags)}
                                    className="rounded"
                                />
                                <Hash size={14} /> Detaylı hashtag listesi ekle
                            </label>
                        </div>

                        {/* Image URL */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                                <ImageIcon size={14} className="inline mr-1" /> Görsel (isteğe bağlı)
                            </label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://... görsel URL'si"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-purple-500"
                            />
                            {imageUrl && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
                                    <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic.trim() || selectedLangs.length === 0}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all text-base"
                        >
                            {isGenerating ? (
                                <><Loader2 size={20} className="animate-spin" /> İçerik üretiliyor...</>
                            ) : (
                                <><Sparkles size={20} /> AI ile İçerik Üret</>
                            )}
                        </button>
                    </div>

                    {/* Right Panel - Results */}
                    <div className={`${showHistory ? 'lg:col-span-5' : 'lg:col-span-7'} space-y-6`}>
                        {generatedContent ? (
                            <>
                                {/* Language Tabs */}
                                <div className="flex gap-2">
                                    {selectedLangs.map(lang => {
                                        const langInfo = LANGUAGES.find(l => l.id === lang)
                                        return (
                                            <button
                                                key={lang}
                                                onClick={() => setActiveTab(lang)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === lang
                                                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-md border border-purple-200 dark:border-purple-700'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                    }`}
                                            >
                                                <span>{langInfo?.flag}</span> {langInfo?.label}
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Content Preview */}
                                {generatedContent[activeTab] && (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                        {/* Platform Header */}
                                        <div className={`bg-gradient-to-r ${selectedPlatform?.color} p-4 flex items-center gap-3 text-white`}>
                                            {selectedPlatform && <selectedPlatform.icon size={20} />}
                                            <span className="font-bold text-sm">{selectedPlatform?.name} İçeriği</span>
                                            <span className="ml-auto text-xs opacity-80 uppercase">{LANGUAGES.find(l => l.id === activeTab)?.label}</span>
                                        </div>

                                        <div className="p-6 space-y-5">
                                            {/* Title */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Başlık / Hook</span>
                                                    <button
                                                        onClick={() => copyToClipboard(generatedContent[activeTab].title, `title-${activeTab}`)}
                                                        className="text-xs text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
                                                    >
                                                        {copiedField === `title-${activeTab}` ? <Check size={12} /> : <Copy size={12} />}
                                                        {copiedField === `title-${activeTab}` ? 'Kopyalandı' : 'Kopyala'}
                                                    </button>
                                                </div>
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">{generatedContent[activeTab].title}</p>
                                            </div>

                                            {/* Body */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">İçerik</span>
                                                    <button
                                                        onClick={() => copyToClipboard(generatedContent[activeTab].body, `body-${activeTab}`)}
                                                        className="text-xs text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
                                                    >
                                                        {copiedField === `body-${activeTab}` ? <Check size={12} /> : <Copy size={12} />}
                                                        {copiedField === `body-${activeTab}` ? 'Kopyalandı' : 'Kopyala'}
                                                    </button>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-200 dark:border-slate-700">
                                                    {generatedContent[activeTab].body}
                                                </div>
                                            </div>

                                            {/* Hashtags */}
                                            {generatedContent[activeTab].hashtags.length > 0 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Hashtags</span>
                                                        <button
                                                            onClick={() => copyToClipboard(generatedContent[activeTab].hashtags.join(' '), `hash-${activeTab}`)}
                                                            className="text-xs text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
                                                        >
                                                            {copiedField === `hash-${activeTab}` ? <Check size={12} /> : <Copy size={12} />}
                                                            {copiedField === `hash-${activeTab}` ? 'Kopyalandı' : 'Tümünü Kopyala'}
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {generatedContent[activeTab].hashtags.map((tag, i) => (
                                                            <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Copy All */}
                                            <button
                                                onClick={() => {
                                                    const c = generatedContent[activeTab]
                                                    const full = `${c.title}\n\n${c.body}\n\n${c.hashtags.join(' ')}`
                                                    copyToClipboard(full, `all-${activeTab}`)
                                                }}
                                                className="w-full py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors border border-purple-200 dark:border-purple-700"
                                            >
                                                {copiedField === `all-${activeTab}` ? <><Check size={16} /> Tüm içerik kopyalandı!</> : <><Copy size={16} /> Tüm İçeriği Kopyala</>}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Schedule & Save */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <Calendar size={14} /> Zamanlama & Kaydet
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tarih</label>
                                            <input
                                                type="date"
                                                value={scheduleDate}
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Saat</label>
                                            <input
                                                type="time"
                                                value={scheduleTime}
                                                onChange={(e) => setScheduleTime(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleSave('draft')}
                                            className="py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <Save size={16} /> Taslak Kaydet
                                        </button>
                                        <button
                                            onClick={() => handleSave('scheduled')}
                                            disabled={!scheduleDate || !scheduleTime}
                                            className="py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                                        >
                                            <Clock size={16} /> Zamanla
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Empty State */
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
                                <div className="w-20 h-20 bg-gradient-to-tr from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Sparkles size={32} className="text-purple-500 dark:text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">AI İçerik Üretici</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                                    Konunuzu girin, platformu ve tonu seçin, dillerinizi belirleyin.
                                    AI, Blue Dreams markasına uygun içerik üretecek.
                                </p>
                                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <Languages size={14} className="text-purple-500" /> 4 dil desteği
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <Hash size={14} className="text-purple-500" /> Otomatik hashtag
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <Palette size={14} className="text-purple-500" /> 4 farklı ton
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <Calendar size={14} className="text-purple-500" /> Zamanlama
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* History Panel */}
                    {showHistory && (
                        <div className="lg:col-span-3 space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Kaydedilen İçerikler</h3>
                            {savedPosts.length === 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
                                    <p className="text-sm text-slate-400 dark:text-slate-500">Henüz kayıtlı içerik yok</p>
                                </div>
                            ) : (
                                savedPosts.map(post => (
                                    <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{post.topic}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'scheduled'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                                        }`}>
                                                        {post.status === 'scheduled' ? '⏰ Zamanlandı' : '📝 Taslak'}
                                                    </span>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">{post.platform}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deletePost(post.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        {post.scheduledDate && (
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                📅 {post.scheduledDate} {post.scheduledTime}
                                            </p>
                                        )}
                                        <button
                                            onClick={() => {
                                                setGeneratedContent(post.content)
                                                setTopic(post.topic)
                                                setPlatform(post.platform)
                                                setActiveTab(Object.keys(post.content)[0])
                                                setShowHistory(false)
                                            }}
                                            className="mt-3 w-full text-xs py-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-600"
                                        >
                                            <Eye size={12} /> Görüntüle
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
