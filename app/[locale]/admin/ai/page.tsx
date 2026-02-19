'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Save, Sparkles, RefreshCw } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function AiSettingsPage() {
    const params = useParams()
    const locale = params.locale as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [settings, setSettings] = useState({
        systemPrompt: '',
        tone: 'friendly',
        apiKey: ''
    })

    // Default Prompt Template (Reference)
    const defaultPrompt = `Sen Blue Dreams Resort'un dijital konsiyerjisin.
KİMLİK VE TON:
- Sofistike, çok bilgili, misafirperver ve çözüm odaklısın.
- "Satış yap" modundan önce "Bilgi Ver ve Etkile" modundasın.

KURALLAR:
- Cevapların detaylı ve betimleyici olsun.
- Kullanıcı bir oda, restoran veya hizmet hakkında bilgi isterse, ilgili UI Widget'ını render et ('render_ui' fonksiyonunu kullan).
- Fiyat sorulursa 'check_room_availability' kullan.`

    useEffect(() => {
        fetchSettings()
    }, [locale])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/ai/settings?locale=${locale}`)
            if (res.ok) {
                const data = await res.json()
                setSettings({
                    systemPrompt: data.systemPrompt || defaultPrompt,
                    tone: data.tone || 'friendly',
                    apiKey: data.apiKey || ''
                })
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch('/api/ai/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...settings,
                    language: locale
                })
            })

            if (res.ok) {
                alert('Ayarlar kaydedildi.')
            }
        } catch (error) {
            alert('Kaydetme başarısız.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center bg-[#1e293b] p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">AI Asistan Ayarları</h1>
                        <p className="text-slate-400 text-sm">Yapay zeka asistanının kimliğini ve talimatlarını özelleştirin.</p>
                    </div>
                </div>
            </div>

            <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-6">
                <form onSubmit={handleSave} className="space-y-6">

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Sistem Talimatı (Prompt)</label>
                        <p className="text-xs text-slate-500 mb-2">Asistanın nasıl davranacağını, kurallarını ve bilgi sınırlarını belirleyin. Dinamik veriler (Odalar, Restoranlar vb.) bu prompt'un sonuna otomatik olarak eklenecektir.</p>
                        <textarea
                            rows={20}
                            value={settings.systemPrompt}
                            onChange={e => setSettings({ ...settings, systemPrompt: e.target.value })}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-4 text-slate-300 font-mono text-sm focus:border-indigo-500 outline-none leading-relaxed"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Gemini API Key</label>
                        <p className="text-xs text-slate-500 mb-2">Google AI Studio'dan aldığınız API anahtarını buraya girin. Bu anahtar veritabanında saklanır.</p>
                        <input
                            type="password"
                            value={settings.apiKey || ''}
                            onChange={e => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                            placeholder="AIzaSy..."
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-4 text-slate-300 font-mono text-sm focus:border-indigo-500 outline-none"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => setSettings(s => ({ ...s, systemPrompt: defaultPrompt }))}
                            className="text-xs text-slate-500 hover:text-white flex items-center gap-2 transition-colors"
                        >
                            <RefreshCw size={14} /> Varsayılan Prompt'u Yükle
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                        >
                            <Save size={18} />
                            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
