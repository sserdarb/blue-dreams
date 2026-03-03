'use client'

import { useState } from 'react'
import { updateSiteSettings } from '@/app/actions/settings'
import { Save, Share2, BarChart2, Hash, Video, AlertCircle, CheckCircle2 } from 'lucide-react'

interface MarketingSettingsFormProps {
    locale: string
    initialSettings: {
        marketingEnabled?: boolean
        googleAnalyticsId?: string
        metaPixelId?: string
        metaAccessToken?: string
        googleAdsTag?: string
        googleAdsToken?: string
        tiktokPixelId?: string
    }
}

export function MarketingSettingsForm({ locale, initialSettings }: MarketingSettingsFormProps) {
    const [settings, setSettings] = useState(initialSettings)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleChange = (field: string, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }))
        setSaved(false)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateSiteSettings(locale, {
                ...settings
            })
            setSaved(true)
        } catch (e) {
            alert('Ayarlar kaydedilemedi')
        }
        setSaving(false)
    }

    return (
        <div className="space-y-8">
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <Share2 size={20} className="text-pink-500" />
                        Pazarlama & İzleme Kodları
                    </h2>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            İzleme Kodları
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.marketingEnabled || false}
                                onChange={(e) => handleChange('marketingEnabled', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-pink-500"></div>
                        </label>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${settings.marketingEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {settings.marketingEnabled ? 'Aktif' : 'Pasif'}
                        </span>
                    </div>
                </div>

                {!settings.marketingEnabled && (
                    <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex gap-3 text-amber-800 dark:text-amber-300">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <div className="text-sm">
                            <p className="font-semibold mb-1">Pazarlama Kodları Devre Dışı</p>
                            <p>Global izleme butonunu açana kadar yapılandırdığınız hiçbir kod canlı sitede çalışmayacaktır. Geliştirici ortamında test yaparken kapalı tutmanız önerilir.</p>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-100 dark:border-white/5 space-y-3 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-slate-200 dark:text-white/5 opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                            <BarChart2 size={100} />
                        </div>
                        <div className="relative">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                <BarChart2 size={16} className="text-amber-500" />
                                Google Analytics (GA4) ID
                            </label>
                            <input
                                type="text"
                                value={settings.googleAnalyticsId || ''}
                                onChange={e => handleChange('googleAnalyticsId', e.target.value)}
                                placeholder="G-XXXXXXXXXX"
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-mono"
                            />
                            <p className="text-xs text-slate-500 mt-2">Sitenin ziyaretçi trafiğini ölçmek için kullanılır.</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-100 dark:border-white/5 space-y-3 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-slate-200 dark:text-white/5 opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                            <Hash size={100} />
                        </div>
                        <div className="relative">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                <Hash size={16} className="text-blue-600" />
                                Meta (Facebook) Pixel ID
                            </label>
                            <input
                                type="text"
                                value={settings.metaPixelId || ''}
                                onChange={e => handleChange('metaPixelId', e.target.value)}
                                placeholder="123456789012345"
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-mono"
                            />

                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 mt-4">
                                <Hash size={16} className="text-blue-600" />
                                Meta API Access Token
                            </label>
                            <input
                                type="password"
                                value={settings.metaAccessToken || ''}
                                onChange={e => handleChange('metaAccessToken', e.target.value)}
                                placeholder="EA......"
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-mono"
                            />
                            <p className="text-xs text-slate-500 mt-2">Facebook ve Instagram reklam verilerini (ROAS vb.) çekmek için kullanılır.</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-100 dark:border-white/5 space-y-3 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-slate-200 dark:text-white/5 opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                            <Share2 size={100} />
                        </div>
                        <div className="relative">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                <Share2 size={16} className="text-emerald-600" />
                                Google Ads Dönüşüm Etiketi
                            </label>
                            <input
                                type="text"
                                value={settings.googleAdsTag || ''}
                                onChange={e => handleChange('googleAdsTag', e.target.value)}
                                placeholder="AW-XXXXXXXXXX"
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-mono"
                            />

                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 mt-4">
                                <Share2 size={16} className="text-emerald-600" />
                                Google Ads Developer Token
                            </label>
                            <input
                                type="text"
                                value={settings.googleAdsToken || ''}
                                onChange={e => handleChange('googleAdsToken', e.target.value)}
                                placeholder="Google Ads API Developer Token"
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-mono"
                            />
                            <p className="text-xs text-slate-500 mt-2">Arama ağı performansını API üzerinden izlemek için kullanılır.</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-100 dark:border-white/5 space-y-3 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-slate-200 dark:text-white/5 opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                            <Video size={100} />
                        </div>
                        <div className="relative">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                <Video size={16} className="text-slate-900 dark:text-slate-400" />
                                TikTok Pixel ID
                            </label>
                            <input
                                type="text"
                                value={settings.tiktokPixelId || ''}
                                onChange={e => handleChange('tiktokPixelId', e.target.value)}
                                placeholder="XXXXXXXXXXXXXX"
                                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-mono"
                            />
                            <p className="text-xs text-slate-500 mt-2">TikTok kampanyalarınızın performans takibi için.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-white/10 pt-6">
                    {saved && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg animate-in fade-in slide-in-from-right-4">
                            <CheckCircle2 size={18} />
                            <span className="text-sm font-medium">Ayarlar kaydedildi!</span>
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} className={saving ? 'animate-pulse' : ''} />
                        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </section>
        </div>
    )
}
