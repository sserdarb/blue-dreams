'use client'

import { useState, useEffect } from 'react'
import { Code, Save, Check, AlertCircle, ExternalLink } from 'lucide-react'

interface AnalyticsSettings {
    gaId: string
    gtmId: string
    fbPixelId: string
}

export default function AnalyticsPage() {
    const [settings, setSettings] = useState<AnalyticsSettings>({
        gaId: '',
        gtmId: '',
        fbPixelId: '',
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        // Load existing settings
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/settings/analytics')
                if (res.ok) {
                    const data = await res.json()
                    setSettings(data)
                }
            } catch (err) {
                console.error('Failed to load analytics settings')
            }
        }
        loadSettings()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        setError('')
        try {
            const res = await fetch('/api/settings/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })

            if (res.ok) {
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
            } else {
                setError('Ayarlar kaydedilemedi')
            }
        } catch (err) {
            setError('Bir hata oluştu')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Code className="text-cyan-400" />
                    Analytics Ayarları
                </h1>
                <p className="text-slate-400 mt-1">
                    Google Analytics, Tag Manager ve Facebook Pixel entegrasyonlarını yapılandırın.
                </p>
            </div>

            {/* Info Alert */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-8">
                <div className="flex items-start gap-3">
                    <AlertCircle className="text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-cyan-400 font-medium">Nasıl Çalışır?</p>
                        <p className="text-slate-400 text-sm mt-1">
                            Aşağıdaki ID'leri girdikten sonra, tracking kodları otomatik olarak sitenin head bölümüne eklenir.
                            Değişiklikler bir sonraki sayfa yüklenmesinde aktif olur.
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings Form */}
            <div className="space-y-6">
                {/* Google Analytics */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-orange-400">
                                    <path d="M21.67 3.2c-.55-.33-1.26-.33-1.81 0l-8.05 4.92-8.05-4.92c-.55-.33-1.26-.33-1.81 0-.55.33-.89.93-.89 1.58v10.44c0 .65.34 1.25.89 1.58l8.05 4.92c.27.17.58.25.89.25.31 0 .62-.08.89-.25l8.05-4.92c.55-.33.89-.93.89-1.58V4.78c.01-.65-.33-1.25-.89-1.58z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Google Analytics 4</h3>
                                <p className="text-slate-500 text-sm">Web trafiğini analiz edin</p>
                            </div>
                        </div>
                        <a
                            href="https://analytics.google.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Measurement ID</label>
                        <input
                            type="text"
                            placeholder="G-XXXXXXXXXX"
                            value={settings.gaId}
                            onChange={(e) => setSettings({ ...settings, gaId: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <p className="text-slate-500 text-xs mt-2">
                            Analytics → Admin → Data Streams → Web → Measurement ID
                        </p>
                    </div>
                </div>

                {/* Google Tag Manager */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-blue-400">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Google Tag Manager</h3>
                                <p className="text-slate-500 text-sm">Tüm tracking kodlarını tek yerden yönetin</p>
                            </div>
                        </div>
                        <a
                            href="https://tagmanager.google.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Container ID</label>
                        <input
                            type="text"
                            placeholder="GTM-XXXXXXX"
                            value={settings.gtmId}
                            onChange={(e) => setSettings({ ...settings, gtmId: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <p className="text-slate-500 text-xs mt-2">
                            Tag Manager → Container → Admin → Container ID
                        </p>
                    </div>
                </div>

                {/* Facebook Pixel */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-indigo-400">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Facebook Pixel</h3>
                                <p className="text-slate-500 text-sm">Facebook reklam dönüşümlerini takip edin</p>
                            </div>
                        </div>
                        <a
                            href="https://business.facebook.com/events_manager"
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Pixel ID</label>
                        <input
                            type="text"
                            placeholder="XXXXXXXXXXXXXXXX"
                            value={settings.fbPixelId}
                            onChange={(e) => setSettings({ ...settings, fbPixelId: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <p className="text-slate-500 text-xs mt-2">
                            Events Manager → Data Sources → Your Pixel → Pixel ID
                        </p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex items-center gap-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saved ? (
                        <Check size={20} />
                    ) : (
                        <Save size={20} />
                    )}
                    {saved ? 'Kaydedildi!' : 'Ayarları Kaydet'}
                </button>

                {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                )}
            </div>
        </div>
    )
}
