'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import {
    BarChart3, Save, Check, AlertCircle, ExternalLink,
    Eye, EyeOff, ToggleLeft, ToggleRight, Key, Settings,
    Activity, Users, Clock, Globe, ArrowUpRight, ArrowDownRight,
    Map, Monitor, Smartphone, Tablet
} from 'lucide-react'
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import { PlatformRadar } from '@/components/admin/analytics/PlatformRadar'
import { AIInsights } from '@/components/admin/analytics/AIInsights'
import { RecentVisitors } from '@/components/admin/analytics/RecentVisitors'

interface AnalyticsSettings {
    gaId: string
    gtmId: string
    fbPixelId: string
    gaApiSecret: string
    gaPropertyId: string
    gaServiceKey: string
    useGaApi: boolean
    googleClientId?: string
}

// Removed mock data in favor of API data

const COLORS = ['#0891b2', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

function RealtimeTab({ realtimeUsers, setRealtimeUsers }: { realtimeUsers: number; setRealtimeUsers: (n: number) => void }) {
    const [countries, setCountries] = useState<any[]>([])
    const [pages, setPages] = useState<any[]>([])
    const [devices, setDevices] = useState<any[]>([])

    const fetchRealtime = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/analytics/realtime')
            const data = await res.json()
            if (data.success) {
                setRealtimeUsers(data.activeUsers || 0)
                setCountries(data.countries || [])
                setPages(data.pages || [])
                setDevices(data.devices || [])
            }
        } catch { /* silent */ }
    }, [setRealtimeUsers])

    useEffect(() => {
        fetchRealtime()
        const interval = setInterval(fetchRealtime, 10000)
        return () => clearInterval(interval)
    }, [fetchRealtime])

    const deviceIcon = (d: string) => {
        if (d === 'mobile') return <Smartphone size={16} />
        if (d === 'tablet') return <Tablet size={16} />
        return <Monitor size={16} />
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <p className="text-blue-100 font-medium text-lg uppercase tracking-wider mb-2">Right Now</p>
                    <h2 className="text-6xl font-bold mb-4">{realtimeUsers}</h2>
                    <p className="text-blue-200">Active users on site</p>
                    <div className="mt-6 flex justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-1 h-8 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                        ))}
                    </div>
                    <p className="text-xs text-blue-300 mt-4">Her 10 saniyede güncellenir</p>
                </div>

                {/* Devices */}
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Cihaz Dağılımı</h3>
                    <div className="space-y-3">
                        {devices.map((d, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-white/5">
                                <div className="text-cyan-500">{deviceIcon(d.device)}</div>
                                <span className="text-slate-900 dark:text-white font-medium capitalize flex-1">{d.device}</span>
                                <span className="text-lg font-bold text-cyan-500">{d.users}</span>
                            </div>
                        ))}
                        {devices.length === 0 && <p className="text-slate-500 text-sm">Veri yükleniyor...</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Countries */}
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Aktif Ülkeler</h3>
                    <div className="space-y-2">
                        {countries.map((c, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                                <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-slate-500" />
                                    <span className="text-slate-900 dark:text-white">{c.country}</span>
                                </div>
                                <span className="font-bold text-cyan-500">{c.users}</span>
                            </div>
                        ))}
                        {countries.length === 0 && <p className="text-slate-500 text-sm">Veri yükleniyor...</p>}
                    </div>
                </div>

                {/* Pages */}
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Popüler Sayfalar</h3>
                    <div className="space-y-2">
                        {pages.map((p, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                                <span className="text-slate-900 dark:text-white text-sm truncate max-w-[250px]">{p.page}</span>
                                <span className="font-bold text-cyan-500">{p.users}</span>
                            </div>
                        ))}
                        {pages.length === 0 && <p className="text-slate-500 text-sm">Veri yükleniyor...</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AnalyticsPage() {
    const [settings, setSettings] = useState<AnalyticsSettings>({
        gaId: '', gtmId: '', fbPixelId: '',
        gaApiSecret: '', gaPropertyId: '', gaServiceKey: '',
        useGaApi: false,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [apiError, setApiError] = useState('')
    const [activeTab, setActiveTab] = useState<'dashboard' | 'realtime' | 'demographics' | 'settings'>('dashboard')

    const [trafficData, setTrafficData] = useState<any[]>([])
    const [channelsData, setChannelsData] = useState<any[]>([])
    const [countriesData, setCountriesData] = useState<any[]>([])
    const [totalsData, setTotalsData] = useState<any>({ users: 0, sessions: 0, bounceRate: 0, duration: '0m 0s' })
    const [hasRealData, setHasRealData] = useState(false)
    const [realtimeUsers, setRealtimeUsers] = useState<number>(0)

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/settings/analytics')
                if (res.ok) {
                    const data = await res.json()
                    // If DB is empty, use the user-provided ID as default
                    if (!data.gaId) data.gaId = 'G-KHMZFFEDPJ'
                    setSettings(data)
                }
            } catch (err) {
                console.error('Failed to load analytics settings')
            }
        }

        const loadAnalyticsData = async () => {
            try {
                const res = await fetch('/api/admin/analytics/traffic')
                const data = await res.json()
                if (data.success && data.traffic && data.traffic.length > 0) {
                    setTrafficData(data.traffic)
                    setChannelsData(data.channels || [])
                    setCountriesData(data.countries || [])
                    setTotalsData({
                        users: data.totals?.users || 0,
                        sessions: data.totals?.sessions || 0,
                        bounceRate: data.totals?.averageBounceRate || 0,
                        duration: data.totals?.avgSessionDuration || '0m 0s'
                    })
                    setHasRealData(true)
                    // Set realtime from API if available
                    if (data.realtime?.activeUsers) {
                        setRealtimeUsers(data.realtime.activeUsers)
                    }
                } else if (!data.success && data.error) {
                    setApiError(data.error)
                    setHasRealData(false)
                } else {
                    setApiError('Görüntülenecek veri bulunamadı veya GA4 bağlantısı kurulamadı.')
                    setHasRealData(false)
                }
            } catch (err) {
                console.error('Failed to load analytics data', err)
                setApiError('API isteği sırasında bir hata oluştu.')
            }
        }

        Promise.all([loadSettings(), loadAnalyticsData()]).finally(() => {
            setLoading(false)
        })
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

    // --- Components ---

    const KPICard = ({ title, value, change, icon: Icon, color }: any) => {
        const colorClasses: any = {
            cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
            green: { bg: 'bg-green-500/10', text: 'text-green-400' },
            orange: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
            purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
        }
        const colors = colorClasses[color] || colorClasses['cyan']

        return (
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
                    </div>
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <Icon className={colors.text} size={24} />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className={`flex items-center ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {Math.abs(change)}%
                    </span>
                    <span className="text-slate-500">vs last period</span>
                </div>
            </div>
        )
    }

    if (loading) return <div className="p-8 text-center text-slate-400">Yükleniyor...</div>

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <BarChart3 className="text-cyan-500 dark:text-cyan-400" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Ziyaretçi istatistikleri ve yapılandırma
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg self-start">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                        { id: 'realtime', label: 'Real-time', icon: Activity },
                        { id: 'demographics', label: 'Demographics', icon: Globe },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-cyan-600 text-white shadow-lg'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Areas */}

            {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in">
                    {/* KPI Grid */}
                    {hasRealData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KPICard title="Total Users" value={totalsData.users.toLocaleString()} change={12.5} icon={Users} color="cyan" />
                            <KPICard title="Sessions" value={totalsData.sessions.toLocaleString()} change={8.2} icon={Activity} color="green" />
                            <KPICard title="Bounce Rate" value={`${totalsData.bounceRate}%`} change={-2.1} icon={ArrowUpRight} color="orange" />
                            <KPICard title="Avg. Duration" value={totalsData.duration} change={5.4} icon={Clock} color="purple" />
                        </div>
                    ) : (
                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-6 mb-6">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="text-red-500 mt-1" size={24} />
                                <div>
                                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Analitik Verisi Alınamadı</h3>
                                    <p className="text-red-600 dark:text-red-300 mt-1">{apiError || 'Google Analytics bağlantısında bir sorun oluştu.'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Insights & Radar */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <AIInsights />
                        </div>
                        <div>
                            <PlatformRadar />
                        </div>
                    </div>

                    {/* Charts Row */}
                    {hasRealData && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Traffic Chart */}
                            <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Traffic Overview (30 Days)</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trafficData}>
                                            <defs>
                                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                                                            <p className="font-bold text-slate-900 dark:text-white">{payload[0].value} users</p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }} />
                                            <Area type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Channels Chart */}
                            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Acquisition Channels</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={channelsData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {channelsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
                                                            <p className="font-bold text-slate-900 dark:text-white">{payload[0].name}: {payload[0].value}</p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {!hasRealData && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-amber-400">Canlı Veri Bulunamadı</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                                    Google Analytics API'den veri alınamadı. Lütfen <strong>Ayarlar</strong> sekmesinden
                                    gerçek GA4 Property ID ve Service Account JSON bilgilerinin dolu olduğundan emin olun
                                    veya sunucu <code>.env</code> değişkenlerini kontrol edin.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'realtime' && (
                <RealtimeTab realtimeUsers={realtimeUsers} setRealtimeUsers={setRealtimeUsers} />
            )}

            {activeTab === 'demographics' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Top Countries</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm">
                                        <th className="py-3 font-medium">Country</th>
                                        <th className="py-3 font-medium">Users</th>
                                        <th className="py-3 font-medium text-right">% of Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {countriesData.map((country, i) => (
                                        <tr key={i} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-3 text-slate-900 dark:text-white flex items-center gap-3">
                                                <Globe size={16} className="text-slate-500" />
                                                {country.name}
                                            </td>
                                            <td className="py-3 text-slate-600 dark:text-slate-300">{country.users}</td>
                                            <td className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-slate-900 dark:text-white font-medium">{country.percentage}%</span>
                                                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cyan-500" style={{ width: `${country.percentage}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {countriesData.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-6 text-center text-slate-500">Ülke verisi bulunamadı</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="animate-fade-in max-w-4xl">
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Configuration</h3>

                        <div className="space-y-6">
                            {/* GA4 ID */}
                            <div>
                                <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">Google Analytics 4 Measurement ID</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="G-XXXXXXXXXX"
                                        value={settings.gaId}
                                        onChange={(e) => setSettings({ ...settings, gaId: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors pl-10"
                                    />
                                    <BarChart3 className="absolute left-3 top-3.5 text-slate-500" size={18} />
                                </div>
                                <p className="text-slate-500 text-xs mt-2">Required for basic tracking.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* GTM ID */}
                                <div>
                                    <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">Google Tag Manager ID</label>
                                    <input
                                        type="text"
                                        placeholder="GTM-XXXXXXX"
                                        value={settings.gtmId}
                                        onChange={(e) => setSettings({ ...settings, gtmId: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                    />
                                </div>
                                {/* FB Pixel */}
                                <div>
                                    <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">Facebook Pixel ID</label>
                                    <input
                                        type="text"
                                        placeholder="Pixel ID"
                                        value={settings.fbPixelId}
                                        onChange={(e) => setSettings({ ...settings, fbPixelId: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Google Client ID */}
                            <div>
                                <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">Google Client ID (OAuth)</label>
                                <input
                                    type="text"
                                    placeholder="817024..."
                                    value={settings.googleClientId || ''}
                                    onChange={(e) => setSettings({ ...settings, googleClientId: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-slate-900 dark:text-white font-medium">Advanced Reporting (API)</h4>
                                        <p className="text-slate-500 text-sm">Required to show real charts in this dashboard.</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, useGaApi: !settings.useGaApi })}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${settings.useGaApi ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/50 text-slate-400'
                                            }`}
                                    >
                                        {settings.useGaApi ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                        {settings.useGaApi ? 'Enabled' : 'Disabled'}
                                    </button>
                                </div>

                                {settings.useGaApi && (
                                    <div className="space-y-4 p-4 bg-black/20 rounded-lg">
                                        <div>
                                            <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">GA4 Property ID</label>
                                            <input
                                                type="text"
                                                placeholder="123456789"
                                                value={settings.gaPropertyId}
                                                onChange={(e) => setSettings({ ...settings, gaPropertyId: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                            />
                                            <p className="text-slate-500 text-xs mt-1">Numeric Property ID (Not G-ID)</p>
                                        </div>
                                        <div>
                                            <label className="block text-slate-500 dark:text-slate-400 text-sm mb-2">Service Account JSON (Base64)</label>
                                            <textarea
                                                rows={3}
                                                placeholder="ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAg..."
                                                value={settings.gaServiceKey}
                                                onChange={(e) => setSettings({ ...settings, gaServiceKey: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                        {saved ? 'Settings Saved!' : 'Save Configuration'}
                    </button>
                </div>
            )}
        </div>
    )
}
