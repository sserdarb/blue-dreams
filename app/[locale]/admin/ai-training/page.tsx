'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Sparkles, Save, Upload, Trash2, FileText, Globe, Plus, RefreshCw, Key, Eye, EyeOff, Sheet, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react'

interface AiSettings {
    id: string
    systemPrompt: string
    language: string
    tone: string
    isActive: boolean
    apiKey?: string
    apiKeyMasked?: string
    googleSheetId?: string
}

interface TrainingDocument {
    id: string
    title: string
    content: string
    type: string
    filename?: string
    createdAt: string
}

interface SheetPreview {
    success: boolean
    sheetNames?: string[]
    rowCount?: number
    preview?: string
    error?: string
}

export default function AiTrainingPage() {
    const params = useParams()
    const locale = (params.locale as string) || 'tr'

    const [settings, setSettings] = useState<AiSettings | null>(null)
    const [documents, setDocuments] = useState<TrainingDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showAddDoc, setShowAddDoc] = useState(false)
    const [showApiKey, setShowApiKey] = useState(false)
    const [newApiKey, setNewApiKey] = useState('')
    const [newDoc, setNewDoc] = useState({ title: '', content: '' })

    // Google Sheets state
    const [sheetPreview, setSheetPreview] = useState<SheetPreview | null>(null)
    const [testingSheet, setTestingSheet] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [settingsRes, docsRes] = await Promise.all([
                fetch('/api/ai/settings'),
                fetch('/api/ai/training')
            ])

            if (settingsRes.ok) {
                const data = await settingsRes.json()
                setSettings(data)
            }

            if (docsRes.ok) {
                const data = await docsRes.json()
                setDocuments(data)
            }
        } catch (error) {
            console.error('Load data error:', error)
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async () => {
        if (!settings) return
        setSaving(true)
        try {
            const payload: any = { ...settings }
            if (newApiKey.trim()) {
                payload.apiKey = newApiKey.trim()
            } else {
                delete payload.apiKey
                delete payload.apiKeyMasked
            }
            const res = await fetch('/api/ai/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                const data = await res.json()
                setSettings(data)
                setNewApiKey('')
                setShowApiKey(false)
                alert('Ayarlar kaydedildi!')
            }
        } catch (error) {
            console.error('Save settings error:', error)
            alert('Kaydetme hatası!')
        } finally {
            setSaving(false)
        }
    }

    const addDocument = async () => {
        if (!newDoc.title || !newDoc.content) {
            alert('Başlık ve içerik gerekli!')
            return
        }

        try {
            const res = await fetch('/api/ai/training', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newDoc, type: 'txt' })
            })

            if (res.ok) {
                const doc = await res.json()
                setDocuments([doc, ...documents])
                setNewDoc({ title: '', content: '' })
                setShowAddDoc(false)
            }
        } catch (error) {
            console.error('Add document error:', error)
        }
    }

    const deleteDocument = async (id: string) => {
        if (!confirm('Bu dökümanı silmek istediğinize emin misiniz?')) return

        try {
            const res = await fetch(`/api/ai/training?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                setDocuments(documents.filter(d => d.id !== id))
            }
        } catch (error) {
            console.error('Delete document error:', error)
        }
    }

    // Google Sheets test function
    const testSheetConnection = async () => {
        const sheetId = settings?.googleSheetId
        if (!sheetId) {
            setSheetPreview({ success: false, error: 'Lütfen bir Google Sheet ID veya URL girin' })
            return
        }

        setTestingSheet(true)
        setSheetPreview(null)
        try {
            const res = await fetch(`/api/ai/sheets?sheetId=${encodeURIComponent(sheetId)}`)
            const data = await res.json()
            setSheetPreview(data)
        } catch (error: any) {
            setSheetPreview({ success: false, error: error.message || 'Bağlantı hatası' })
        } finally {
            setTestingSheet(false)
        }
    }

    const clearSheetCache = async () => {
        try {
            await fetch('/api/ai/sheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sheetId: settings?.googleSheetId })
            })
            setSheetPreview(null)
            alert('Cache temizlendi!')
        } catch { }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between bg-[#1e293b] p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl">
                        <Sparkles className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">AI Eğitim Merkezi</h1>
                        <p className="text-sm text-slate-400">Blue Concierge yapay zeka ayarları ve eğitimi</p>
                    </div>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 font-bold shadow-lg shadow-cyan-600/20 transition-all"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language & Tone */}
                <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        Dil ve Ton Ayarları
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Varsayılan Dil
                            </label>
                            <select
                                value={settings?.language || 'tr'}
                                onChange={(e) => setSettings(s => s ? { ...s, language: e.target.value } : s)}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-slate-300 focus:border-cyan-500 outline-none"
                            >
                                <option value="tr">🇹🇷 Türkçe</option>
                                <option value="en">🇬🇧 English</option>
                                <option value="de">🇩🇪 Deutsch</option>
                                <option value="ru">🇷🇺 Русский</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                İletişim Tonu
                            </label>
                            <select
                                value={settings?.tone || 'friendly'}
                                onChange={(e) => setSettings(s => s ? { ...s, tone: e.target.value } : s)}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-slate-300 focus:border-cyan-500 outline-none"
                            >
                                <option value="formal">Resmi</option>
                                <option value="friendly">Samimi</option>
                                <option value="casual">Günlük</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={settings?.isActive ?? true}
                                onChange={(e) => setSettings(s => s ? { ...s, isActive: e.target.checked } : s)}
                                className="w-4 h-4 text-cyan-600 border-white/20 rounded focus:ring-cyan-500 bg-[#0f172a]"
                            />
                            <label htmlFor="isActive" className="text-sm text-slate-300">
                                AI Asistan Aktif
                            </label>
                        </div>
                    </div>
                </div>

                {/* API Key Card */}
                <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5 text-amber-400" />
                        Gemini API Anahtarı
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                        Google AI Studio'dan alınan API anahtarı. Güvenlik için maskelenmiş gösterilir.
                    </p>

                    {/* Current key status */}
                    <div className="mb-3 p-3 bg-[#0f172a] rounded-xl border border-white/5">
                        <span className="text-xs font-medium text-slate-500 block mb-1">Mevcut Anahtar:</span>
                        <span className="font-mono text-sm text-slate-300">
                            {settings?.apiKeyMasked || '⚠️ Ayarlanmamış'}
                        </span>
                    </div>

                    {/* New key input */}
                    <div className="relative">
                        <input
                            type={showApiKey ? 'text' : 'password'}
                            value={newApiKey}
                            onChange={(e) => setNewApiKey(e.target.value)}
                            placeholder="Yeni API anahtarı girin..."
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 pr-10 text-sm font-mono text-slate-300 focus:border-amber-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
                        >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                            Google AI Studio
                        </a>'dan yeni anahtar oluşturabilirsiniz.
                    </p>
                </div>
            </div>

            {/* Google Sheets Integration */}
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-6">
                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Sheet className="w-5 h-5 text-green-400" />
                    Google Sheets Bilgi Kaynağı
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                    Google Sheets tablosundaki veriler AI'ın bilgi bankası olarak kullanılır. Otel bilgileri, fiyatlar, etkinlikler vb. burada tutulabilir.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sheet ID input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            Google Sheet URL veya ID
                        </label>
                        <input
                            type="text"
                            value={settings?.googleSheetId || ''}
                            onChange={(e) => setSettings(s => s ? { ...s, googleSheetId: e.target.value } : s)}
                            placeholder="https://docs.google.com/spreadsheets/d/... veya Sheet ID"
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:border-green-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Sheet'in <strong className="text-slate-400">"Bağlantıya sahip olan herkes görüntüleyebilir"</strong> olarak paylaşılmış olması gerekir.
                        </p>
                    </div>

                    {/* Test & Actions */}
                    <div className="flex flex-col justify-end gap-2">
                        <div className="flex gap-2">
                            <button
                                onClick={testSheetConnection}
                                disabled={testingSheet || !settings?.googleSheetId}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-500 disabled:opacity-50 text-sm font-medium transition-all"
                            >
                                {testingSheet ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Test Ediliyor...</>
                                ) : (
                                    <><CheckCircle className="w-4 h-4" /> Bağlantıyı Test Et</>
                                )}
                            </button>
                            <button
                                onClick={clearSheetCache}
                                disabled={!settings?.googleSheetId}
                                className="px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-sm"
                                title="Cache Temizle"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                        {settings?.googleSheetId && (
                            <a
                                href={settings.googleSheetId.startsWith('http') ? settings.googleSheetId : `https://docs.google.com/spreadsheets/d/${settings.googleSheetId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                            >
                                <ExternalLink className="w-3 h-3" /> Google Sheets'te Aç
                            </a>
                        )}
                    </div>
                </div>

                {/* Preview Results */}
                {sheetPreview && (
                    <div className={`mt-4 p-4 rounded-xl border ${sheetPreview.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        {sheetPreview.success ? (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="font-medium text-green-300">Bağlantı Başarılı</span>
                                </div>
                                <div className="flex gap-4 text-sm text-green-400 mb-3">
                                    <span><strong>{sheetPreview.rowCount}</strong> satır</span>
                                    <span><strong>{sheetPreview.sheetNames?.length}</strong> sayfa: {sheetPreview.sheetNames?.join(', ')}</span>
                                </div>
                                <details className="text-sm">
                                    <summary className="cursor-pointer text-green-400 font-medium hover:text-green-300">
                                        Önizleme (ilk veriler)
                                    </summary>
                                    <pre className="mt-2 p-3 bg-[#0f172a] rounded-xl border border-white/5 text-xs text-slate-400 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                                        {sheetPreview.preview}
                                    </pre>
                                </details>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-400" />
                                <span className="text-red-300">{sheetPreview.error}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="bg-gradient-to-r from-purple-600/30 to-cyan-600/30 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="opacity-80 text-sm text-slate-400">Dökümanlar:</span>
                        <span className="font-bold text-white">{documents.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="opacity-80 text-sm text-slate-400">AI:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${settings?.isActive ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'}`}>
                            {settings?.isActive ? 'AKTİF' : 'PASİF'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="opacity-80 text-sm text-slate-400">API Key:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${settings?.apiKeyMasked ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'}`}>
                            {settings?.apiKeyMasked ? '✓ Ayarlı' : '✗ Eksik'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="opacity-80 text-sm text-slate-400">Sheets:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${settings?.googleSheetId ? 'bg-green-400/20 text-green-300' : 'bg-yellow-400/20 text-yellow-300'}`}>
                            {settings?.googleSheetId ? '✓ Bağlı' : '○ Opsiyonel'}
                        </span>
                    </div>
                </div>
                <span className="text-sm text-slate-500">Prompt: {settings?.systemPrompt?.length || 0} karakter</span>
            </div>

            {/* System Prompt */}
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    System Prompt (AI Talimatları)
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                    AI'ın nasıl davranacağını, hangi bilgileri kullanacağını ve nasıl yanıt vereceğini belirleyen ana talimat metni.
                </p>
                <textarea
                    value={settings?.systemPrompt || ''}
                    onChange={(e) => setSettings(s => s ? { ...s, systemPrompt: e.target.value } : s)}
                    rows={12}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:border-cyan-500 outline-none font-mono text-sm leading-relaxed"
                    placeholder="AI için talimatları buraya yazın..."
                />
            </div>

            {/* Training Documents */}
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-cyan-400" />
                        Eğitim Dökümanları
                    </h3>
                    <button
                        onClick={() => setShowAddDoc(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500/20 text-sm font-medium transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Döküman Ekle
                    </button>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                    AI'ın öğrenmesi için ek bilgi dökümanları. Otel kuralları, özel teklifler, menüler vb.
                </p>

                {/* Add Document Form */}
                {showAddDoc && (
                    <div className="mb-6 p-4 bg-[#0f172a] rounded-xl border border-white/10">
                        <h4 className="font-medium text-white mb-3">Yeni Döküman</h4>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={newDoc.title}
                                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                                placeholder="Döküman başlığı"
                                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500"
                            />
                            <textarea
                                value={newDoc.content}
                                onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                                placeholder="Döküman içeriği..."
                                rows={6}
                                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={addDocument}
                                    className="px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 text-sm font-medium transition-all"
                                >
                                    Ekle
                                </button>
                                <button
                                    onClick={() => setShowAddDoc(false)}
                                    className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 text-sm transition-all"
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Documents List */}
                <div className="space-y-3">
                    {documents.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Henüz döküman eklenmemiş.</p>
                    ) : (
                        documents.map((doc) => (
                            <div key={doc.id} className="flex items-start gap-3 p-4 bg-[#0f172a] rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                                <FileText className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white">{doc.title}</h4>
                                    <p className="text-sm text-slate-400 line-clamp-2 mt-1">{doc.content}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteDocument(doc.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
