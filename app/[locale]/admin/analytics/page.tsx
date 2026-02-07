'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Save, Check, AlertCircle, ExternalLink, Eye, EyeOff, ToggleLeft, ToggleRight, Key, Settings } from 'lucide-react'

interface AnalyticsSettings {
    gaId: string
    gtmId: string
    fbPixelId: string
    gaApiSecret: string
    gaPropertyId: string
    gaServiceKey: string
    useGaApi: boolean
}

export default function AnalyticsPage() {
    const [settings, setSettings] = useState<AnalyticsSettings>({
        gaId: '', gtmId: '', fbPixelId: '',
        gaApiSecret: '', gaPropertyId: '', gaServiceKey: '',
        useGaApi: false,
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [showServiceKey, setShowServiceKey] = useState(false)
    const [activeTab, setActiveTab] = useState<'tracking' | 'api'>('tracking')

    useEffect(() => {
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
                    <BarChart3 className="text-cyan-400" />
                    Analytics Ayarları
                </h1>
                <p className="text-slate-400 mt-1">
                    Dahili analytics veya Google Analytics 4 entegrasyonunu yapılandırın.
                </p>
            </div>

            {/* Data Source Indicator */}
            <div className={`border rounded-lg p-4 mb-8 ${settings.useGaApi
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-cyan-500/10 border-cyan-500/30'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${settings.useGaApi ? 'bg-green-500' : 'bg-cyan-500'
                            }`}></div>
                        <div>
                            <p className={`font-medium ${settings.useGaApi ? 'text-green-400' : 'text-cyan-400'
                                }`}>
                                {settings.useGaApi ? 'Google Analytics 4 API Modu' : 'Dahili Analytics Modu'}
                            </p>
                            <p className="text-slate-400 text-sm mt-0.5">
                                {settings.useGaApi
                                    ? 'Raporlar Google Analytics 4 API\'den çekilecek.'
                                    : 'Sayfa görüntülenmeleri otomatik olarak veritabanına kaydedilir.'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, useGaApi: !settings.useGaApi })}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium text-white"
                    >
                        {settings.useGaApi
                            ? <><ToggleRight className="text-green-400" size={20} /> GA4 Aktif</>
                            : <><ToggleLeft className="text-slate-400" size={20} /> Dahili</>
                        }
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('tracking')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tracking'
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    <Settings size={16} />
                    Tracking Kodları
                </button>
                <button
                    onClick={() => setActiveTab('api')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'api'
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    <Key size={16} />
                    GA4 API Anahtarları
                </button>
            </div>

            {/* Tracking Codes Tab */}
            {activeTab === 'tracking' && (
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
                            <a href="https://analytics.google.com/" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
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
                            <p className="text-slate-500 text-xs mt-2">Analytics → Admin → Data Streams → Web → Measurement ID</p>
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
                            <a href="https://tagmanager.google.com/" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
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
                        </div>
                    </div>
                </div>
            )}

            {/* GA4 API Keys Tab */}
            {activeTab === 'api' && (
                <div className="space-y-6">
                    {/* Info */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-amber-400 font-medium">GA4 Data API Entegrasyonu</p>
                                <p className="text-slate-400 text-sm mt-1">
                                    Bu anahtarlar girildiğinde ve "GA4 API Modu" aktif edildiğinde, raporlardaki veriler
                                    dahili takip yerine doğrudan Google Analytics 4 API'den çekilir.
                                    Service Account JSON dosyasını base64 olarak encode edip yapıştırın.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* GA4 Property ID */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <BarChart3 className="text-green-400" size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">GA4 Property ID</h3>
                                <p className="text-slate-500 text-sm">Analytics → Admin → Property → Property Details</p>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="123456789"
                            value={settings.gaPropertyId}
                            onChange={(e) => setSettings({ ...settings, gaPropertyId: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <p className="text-slate-500 text-xs mt-2">Sayısal Property ID (Measurement ID değil)</p>
                    </div>

                    {/* API Secret */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <Key className="text-purple-400" size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">API Secret</h3>
                                <p className="text-slate-500 text-sm">Admin → Data Streams → Measurement Protocol → API Secret</p>
                            </div>
                        </div>
                        <input
                            type="password"
                            placeholder="API Secret"
                            value={settings.gaApiSecret}
                            onChange={(e) => setSettings({ ...settings, gaApiSecret: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    {/* Service Account Key */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                    <Key className="text-red-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">Service Account Key (Base64)</h3>
                                    <p className="text-slate-500 text-sm">Google Cloud Console → IAM → Service Accounts → Keys</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowServiceKey(!showServiceKey)}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                {showServiceKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <textarea
                            rows={4}
                            placeholder="Base64 encoded JSON service account key..."
                            value={settings.gaServiceKey}
                            onChange={(e) => setSettings({ ...settings, gaServiceKey: e.target.value })}
                            className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none font-mono text-sm`}
                        />
                        <p className="text-slate-500 text-xs mt-2">
                            JSON key dosyanızı base64'e çevirmek için: <code className="text-cyan-400">base64 service-account.json</code>
                        </p>
                    </div>
                </div>
            )}

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
