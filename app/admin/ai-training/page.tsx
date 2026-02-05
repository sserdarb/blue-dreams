'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Save, Upload, Trash2, FileText, Globe, Volume2, Plus, RefreshCw } from 'lucide-react'

interface AiSettings {
    id: string
    systemPrompt: string
    language: string
    tone: string
    isActive: boolean
}

interface TrainingDocument {
    id: string
    title: string
    content: string
    type: string
    filename?: string
    createdAt: string
}

export default function AiTrainingPage() {
    const [settings, setSettings] = useState<AiSettings | null>(null)
    const [documents, setDocuments] = useState<TrainingDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showAddDoc, setShowAddDoc] = useState(false)
    const [newDoc, setNewDoc] = useState({ title: '', content: '' })

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
            const res = await fetch('/api/ai/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })

            if (res.ok) {
                const data = await res.json()
                setSettings(data)
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">AI Eğitim Merkezi</h1>
                        <p className="text-sm text-gray-500">Blue Concierge yapay zeka ayarları ve eğitimi</p>
                    </div>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language & Tone */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        Dil ve Ton Ayarları
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Varsayılan Dil
                            </label>
                            <select
                                value={settings?.language || 'tr'}
                                onChange={(e) => setSettings(s => s ? { ...s, language: e.target.value } : s)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="tr">🇹🇷 Türkçe</option>
                                <option value="en">🇬🇧 English</option>
                                <option value="de">🇩🇪 Deutsch</option>
                                <option value="ru">🇷🇺 Русский</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                İletişim Tonu
                            </label>
                            <select
                                value={settings?.tone || 'friendly'}
                                onChange={(e) => setSettings(s => s ? { ...s, tone: e.target.value } : s)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="isActive" className="text-sm text-gray-700">
                                AI Asistan Aktif
                            </label>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 text-white">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Volume2 className="w-5 h-5" />
                        Durum
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="opacity-80">Eğitim Dökümanları</span>
                            <span className="font-bold text-xl">{documents.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="opacity-80">AI Durumu</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${settings?.isActive ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'}`}>
                                {settings?.isActive ? 'AKTİF' : 'PASİF'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="opacity-80">Prompt Uzunluğu</span>
                            <span className="font-medium">{settings?.systemPrompt?.length || 0} karakter</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Prompt */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    System Prompt (AI Talimatları)
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    AI'ın nasıl davranacağını, hangi bilgileri kullanacağını ve nasıl yanıt vereceğini belirleyen ana talimat metni.
                </p>
                <textarea
                    value={settings?.systemPrompt || ''}
                    onChange={(e) => setSettings(s => s ? { ...s, systemPrompt: e.target.value } : s)}
                    rows={12}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="AI için talimatları buraya yazın..."
                />
            </div>

            {/* Training Documents */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-600" />
                        Eğitim Dökümanları
                    </h3>
                    <button
                        onClick={() => setShowAddDoc(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Döküman Ekle
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                    AI'ın öğrenmesi için ek bilgi dökümanları. Otel kuralları, özel teklifler, menüler vb.
                </p>

                {/* Add Document Form */}
                {showAddDoc && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">Yeni Döküman</h4>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={newDoc.title}
                                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                                placeholder="Döküman başlığı"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                            <textarea
                                value={newDoc.content}
                                onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                                placeholder="Döküman içeriği..."
                                rows={6}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={addDocument}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Ekle
                                </button>
                                <button
                                    onClick={() => setShowAddDoc(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
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
                        <p className="text-center text-gray-400 py-8">Henüz döküman eklenmemiş.</p>
                    ) : (
                        documents.map((doc) => (
                            <div key={doc.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg group">
                                <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900">{doc.title}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{doc.content}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteDocument(doc.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
