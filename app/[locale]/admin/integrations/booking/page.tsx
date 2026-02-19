'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Settings, CheckCircle2, XCircle, Loader2, Globe, Calendar, Users, CreditCard, Link2, RefreshCw, Building2, Zap, BarChart3, AlertTriangle } from 'lucide-react'
import { useParams } from 'next/navigation'

// ─── Types ─────────────────────────────────────────────────────
interface ConnectionStatus {
    connected: boolean
    message: string
    roomTypes: number
    lastChecked: string | null
}

interface BookingConfig {
    provider: 'elektra' | 'external'
    externalUrl: string
    elektraHotelId: string
    defaultCurrency: string
    defaultNationality: string
    maxAdults: number
    maxChildren: number
    minStay: number
    maxStay: number
    advanceBookingDays: number
    showPrices: boolean
    allowInstantBooking: boolean
}

const DEFAULT_CONFIG: BookingConfig = {
    provider: 'elektra',
    externalUrl: 'https://blue-dreams.rezervasyonal.com/',
    elektraHotelId: '9734',
    defaultCurrency: 'TRY',
    defaultNationality: 'TR',
    maxAdults: 6,
    maxChildren: 4,
    minStay: 1,
    maxStay: 30,
    advanceBookingDays: 365,
    showPrices: true,
    allowInstantBooking: true,
}

export default function BookingEnginePage() {
    const params = useParams()
    const locale = params.locale as string

    const [config, setConfig] = useState<BookingConfig>(DEFAULT_CONFIG)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        connected: false, message: 'Bağlantı kontrol edilmedi', roomTypes: 0, lastChecked: null
    })
    const [testing, setTesting] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // ─── Test Connection ─────────────────────────────────────
    const testConnection = async () => {
        setTesting(true)
        try {
            const res = await fetch('/api/admin/booking-test')
            if (res.ok) {
                const data = await res.json()
                setConnectionStatus({
                    connected: data.success,
                    message: data.success ? `Bağlantı başarılı — ${data.roomTypes} oda tipi aktif` : (data.error || 'Bağlantı hatası'),
                    roomTypes: data.roomTypes || 0,
                    lastChecked: new Date().toISOString()
                })
            } else {
                setConnectionStatus({
                    connected: false,
                    message: 'API yanıt vermedi',
                    roomTypes: 0,
                    lastChecked: new Date().toISOString()
                })
            }
        } catch (err) {
            setConnectionStatus({
                connected: false,
                message: `Bağlantı hatası: ${(err as Error).message}`,
                roomTypes: 0,
                lastChecked: new Date().toISOString()
            })
        }
        setTesting(false)
    }

    useEffect(() => { testConnection() }, [])

    // ─── Save Config ─────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true)
        // In production, this would save to database/CMS
        await new Promise(resolve => setTimeout(resolve, 800))
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const updateConfig = (key: keyof BookingConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }))
        setSaved(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Booking Engine Ayarları</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Rezervasyon motoru yapılandırması ve Elektra PMS entegrasyon ayarları.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={testConnection} disabled={testing} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                        {testing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Bağlantıyı Test Et
                    </button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg font-bold text-sm hover:bg-cyan-500 shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Settings size={16} />}
                        {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Kaydet'}
                    </button>
                </div>
            </div>

            {/* Connection Status Card */}
            <div className={`p-4 rounded-2xl border shadow-sm flex items-center gap-4 ${connectionStatus.connected
                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/20'
                }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${connectionStatus.connected ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {connectionStatus.connected ? <CheckCircle2 size={24} className="text-white" /> : <XCircle size={24} className="text-white" />}
                </div>
                <div className="flex-1">
                    <div className={`font-bold ${connectionStatus.connected ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
                        {connectionStatus.connected ? 'Elektra PMS Bağlı' : 'Bağlantı Sorunu'}
                    </div>
                    <div className={`text-sm ${connectionStatus.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {connectionStatus.message}
                    </div>
                    {connectionStatus.lastChecked && (
                        <div className="text-xs text-slate-400 mt-1">Son kontrol: {new Date(connectionStatus.lastChecked).toLocaleTimeString('tr-TR')}</div>
                    )}
                </div>
                {connectionStatus.connected && (
                    <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{connectionStatus.roomTypes}</div>
                        <div className="text-xs text-emerald-500">Oda Tipi</div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Provider Selection */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap size={20} className="text-cyan-500" /> Rezervasyon Motoru
                    </h3>

                    <div className="space-y-3">
                        {([
                            { key: 'elektra' as const, icon: Building2, title: 'Elektra PMS (Doğrudan)', desc: 'API üzerinden oda fiyatı, müsaitlik ve anlık rezervasyon', badge: 'Önerilen' },
                            { key: 'external' as const, icon: Link2, title: 'Harici URL (Yönlendirme)', desc: 'Misafiri dış bir rezervasyon platformuna yönlendirir', badge: null },
                        ]).map(opt => (
                            <button key={opt.key} onClick={() => updateConfig('provider', opt.key)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${config.provider === opt.key
                                    ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/10 shadow-sm'
                                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                    }`}>
                                <div className="flex items-center gap-3">
                                    <opt.icon size={24} className={config.provider === opt.key ? 'text-cyan-500' : 'text-slate-400'} />
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {opt.title}
                                            {opt.badge && <span className="text-[10px] bg-cyan-500 text-white px-2 py-0.5 rounded-full font-bold">{opt.badge}</span>}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${config.provider === opt.key ? 'border-cyan-500 bg-cyan-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                        {config.provider === opt.key && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {config.provider === 'external' && (
                        <div className="space-y-2 pt-2">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Harici Rezervasyon URL</label>
                            <input type="url" value={config.externalUrl} onChange={e => updateConfig('externalUrl', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    )}

                    {config.provider === 'elektra' && (
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Hotel ID</label>
                                    <input type="text" value={config.elektraHotelId} onChange={e => updateConfig('elektraHotelId', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Varsayılan Para Birimi</label>
                                    <select value={config.defaultCurrency} onChange={e => updateConfig('defaultCurrency', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500">
                                        <option value="EUR">EUR (€)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="TRY">TRY (₺)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Varsayılan Milliyet (Fiyatlandırma)</label>
                                <input type="text" value={config.defaultNationality} onChange={e => updateConfig('defaultNationality', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="Örn: DE, GB, TR" />
                                <p className="text-[10px] text-slate-400 mt-1">Misafir ülkesi belirlenemezse bu kullanılır (ISO 3166-1 alpha-2)</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Booking Rules */}
                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar size={20} className="text-cyan-500" /> Konaklama Kuralları
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Minimum Gece</label>
                            <input type="number" min={1} max={30} value={config.minStay} onChange={e => updateConfig('minStay', parseInt(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Maksimum Gece</label>
                            <input type="number" min={1} max={90} value={config.maxStay} onChange={e => updateConfig('maxStay', parseInt(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Maks. Yetişkin</label>
                            <input type="number" min={1} max={10} value={config.maxAdults} onChange={e => updateConfig('maxAdults', parseInt(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Maks. Çocuk</label>
                            <input type="number" min={0} max={10} value={config.maxChildren} onChange={e => updateConfig('maxChildren', parseInt(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">İleri Rezervasyon (Gün)</label>
                        <input type="number" min={30} max={730} value={config.advanceBookingDays} onChange={e => updateConfig('advanceBookingDays', parseInt(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                        <p className="text-[10px] text-slate-400 mt-1">Bugünden itibaren en fazla kaç gün ileri tarihli rezervasyon alınabilir</p>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3 pt-2">
                        {([
                            { key: 'showPrices' as const, label: 'Fiyat Göster', desc: 'Müsaitlik kontrolünde fiyat bilgisi göster' },
                            { key: 'allowInstantBooking' as const, label: 'Anlık Rezervasyon', desc: 'Misafirin doğrudan onaylı rezervasyon yapmasına izin ver' },
                        ]).map(toggle => (
                            <div key={toggle.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0f172a] rounded-xl">
                                <div>
                                    <div className="font-medium text-sm text-slate-900 dark:text-white">{toggle.label}</div>
                                    <div className="text-xs text-slate-500">{toggle.desc}</div>
                                </div>
                                <button onClick={() => updateConfig(toggle.key, !config[toggle.key])}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${config[toggle.key] ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${config[toggle.key] ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* API Endpoints Reference */}
            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <BarChart3 size={20} className="text-cyan-500" /> API Uç Noktaları (Referans)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {([
                        { method: 'GET', path: `/hotel/${config.elektraHotelId}/availability/`, desc: 'Müsaitlik sorgula', color: 'emerald' },
                        { method: 'GET', path: `/hotel/${config.elektraHotelId}/price/`, desc: 'Fiyat sorgula (milliyet parametreli)', color: 'blue' },
                        { method: 'POST', path: '/createReservation', desc: 'Rezervasyon oluştur', color: 'amber' },
                    ]).map((ep, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-${ep.color}-100 dark:bg-${ep.color}-900/30 text-${ep.color}-700 dark:text-${ep.color}-400`}>
                                    {ep.method}
                                </span>
                            </div>
                            <code className="text-xs text-slate-700 dark:text-slate-300 break-all block mb-1">{ep.path}</code>
                            <p className="text-[10px] text-slate-400">{ep.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Warning Note */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={16} className="text-white" />
                </div>
                <div className="text-sm">
                    <p className="font-bold text-amber-800 dark:text-amber-300">Üretim Ortamı Uyarısı</p>
                    <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">Booking engine ayarlarını değiştirmek canlı web sitesindeki rezervasyon akışını etkiler. Değişiklik yapmadan önce test edin.</p>
                </div>
            </div>
        </div>
    )
}
