'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Eye, Clock, MousePointerClick, Globe, Smartphone, Monitor, Tablet, TrendingUp, ArrowUpRight, RefreshCw, Calendar } from 'lucide-react'

interface AnalyticsData {
    source: string
    period: string
    summary: {
        totalPageViews: number
        uniqueVisitors: number
        bounceRate: string
        avgDuration: string
    }
    dailyViews: { date: string; views: number }[]
    topPages: { path: string; views: number }[]
    devices: { device: string; count: number }[]
    browsers: { browser: string; count: number }[]
    locales: { locale: string; count: number }[]
    referrers: { referrer: string; count: number }[]
}

function StatCard({ title, value, subtitle, icon, color = 'cyan' }: {
    title: string; value: string | number; subtitle: string; icon: React.ReactNode; color?: string
}) {
    const colorMap: Record<string, string> = {
        cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
        green: 'from-green-500/20 to-green-600/20 border-green-500/30',
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
        orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    }
    const textColor: Record<string, string> = {
        cyan: 'text-cyan-400', green: 'text-green-400', purple: 'text-purple-400', orange: 'text-orange-400',
    }

    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-6 hover:scale-[1.02] transition-transform`}>
            <div className="flex items-center justify-between mb-4">
                <span className={`${textColor[color]}`}>{icon}</span>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-white/80 font-medium mt-1">{title}</p>
            <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
    )
}

const deviceIcons: Record<string, React.ReactNode> = {
    mobile: <Smartphone size={16} />,
    desktop: <Monitor size={16} />,
    tablet: <Tablet size={16} />,
}

const deviceColors: Record<string, string> = {
    mobile: 'bg-purple-500',
    desktop: 'bg-cyan-500',
    tablet: 'bg-orange-500',
}

export default function StatisticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [days, setDays] = useState(30)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/analytics/data?days=${days}`)
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (err) {
            console.error('Failed to fetch analytics data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [days])

    if (loading || !data) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">İstatistikler</h1>
                        <p className="text-slate-400 mt-1">Veriler yükleniyor...</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
                            <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-white/10 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const maxDailyViews = Math.max(...(data.dailyViews.map(d => d.views) || [1]), 1)
    const totalDevices = data.devices.reduce((sum, d) => sum + d.count, 0) || 1
    const totalBrowsers = data.browsers.reduce((sum, b) => sum + b.count, 0) || 1

    const browserColors: Record<string, string> = {
        Chrome: 'bg-green-500',
        Firefox: 'bg-orange-500',
        Safari: 'bg-blue-500',
        Edge: 'bg-cyan-500',
        Opera: 'bg-red-500',
        Other: 'bg-slate-500',
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="text-cyan-400" />
                        İstatistikler
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {data.source === 'google_analytics'
                            ? 'Google Analytics 4 verileri'
                            : 'Dahili analytics verileri'
                        }
                        {' • '}{data.period}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Period Selector */}
                    <div className="flex bg-white/5 rounded-lg p-1">
                        {[
                            { label: '7 Gün', value: 7 },
                            { label: '30 Gün', value: 30 },
                            { label: '90 Gün', value: 90 },
                        ].map(p => (
                            <button
                                key={p.value}
                                onClick={() => setDays(p.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${days === p.value
                                        ? 'bg-cyan-600 text-white'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Source Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${data.source === 'google_analytics'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${data.source === 'google_analytics' ? 'bg-green-500' : 'bg-cyan-500'
                    }`}></div>
                {data.source === 'google_analytics' ? 'Google Analytics' : 'Dahili Takip'}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Toplam Görüntülenme"
                    value={data.summary.totalPageViews.toLocaleString('tr-TR')}
                    subtitle={data.period}
                    icon={<Eye size={24} />}
                    color="cyan"
                />
                <StatCard
                    title="Tekil Ziyaretçi"
                    value={data.summary.uniqueVisitors.toLocaleString('tr-TR')}
                    subtitle={data.period}
                    icon={<TrendingUp size={24} />}
                    color="green"
                />
                <StatCard
                    title="Hemen Çıkma Oranı"
                    value={data.summary.bounceRate}
                    subtitle="Tek sayfa oturumları"
                    icon={<MousePointerClick size={24} />}
                    color="orange"
                />
                <StatCard
                    title="Ort. Oturum Süresi"
                    value={data.summary.avgDuration}
                    subtitle="Sayfa başına"
                    icon={<Clock size={24} />}
                    color="purple"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Views Chart */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Calendar size={20} className="text-cyan-400" />
                        Günlük Görüntülenmeler
                    </h2>

                    {data.dailyViews.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-slate-500">
                            Henüz veri yok. İlk ziyaretçiyi bekliyoruz...
                        </div>
                    ) : (
                        <div className="flex items-end justify-between h-48 gap-1">
                            {data.dailyViews.slice(-30).map((day, i) => {
                                const height = (day.views / maxDailyViews) * 100
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                        <div className="absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {day.date}: {day.views}
                                        </div>
                                        <div
                                            className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t hover:from-cyan-500 hover:to-cyan-300 transition-all cursor-pointer"
                                            style={{ height: `${Math.max(height, 2)}%` }}
                                        ></div>
                                        {i % Math.ceil(data.dailyViews.length / 7) === 0 && (
                                            <span className="text-slate-500 text-[10px]">
                                                {day.date.slice(5)}
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Device Breakdown */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Smartphone size={20} className="text-purple-400" />
                        Cihaz Dağılımı
                    </h2>

                    {data.devices.length === 0 ? (
                        <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
                            Henüz veri yok
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.devices.map(d => {
                                const pct = Math.round((d.count / totalDevices) * 100)
                                return (
                                    <div key={d.device}>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-slate-300 flex items-center gap-2">
                                                {deviceIcons[d.device] || <Globe size={16} />}
                                                {d.device.charAt(0).toUpperCase() + d.device.slice(1)}
                                            </span>
                                            <span className="text-slate-500">{d.count} ({pct}%)</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${deviceColors[d.device] || 'bg-slate-500'}`}
                                                style={{ width: `${pct}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-cyan-400" />
                        En Çok Ziyaret Edilen Sayfalar
                    </h2>

                    {data.topPages.length === 0 ? (
                        <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
                            Henüz veri yok
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.topPages.map((page, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 flex items-center justify-center bg-cyan-500/20 text-cyan-400 rounded text-xs font-bold">
                                            {i + 1}
                                        </span>
                                        <span className="text-slate-300 text-sm font-mono">{page.path}</span>
                                    </div>
                                    <span className="text-slate-400 text-sm font-medium">{page.views}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Browsers + Referrers */}
                <div className="space-y-6">
                    {/* Browsers */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Tarayıcılar</h2>
                        {data.browsers.length === 0 ? (
                            <p className="text-slate-500 text-sm">Henüz veri yok</p>
                        ) : (
                            <div className="flex gap-2 flex-wrap">
                                {data.browsers.map(b => {
                                    const pct = Math.round((b.count / totalBrowsers) * 100)
                                    return (
                                        <span
                                            key={b.browser}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-sm"
                                        >
                                            <span className={`w-2 h-2 rounded-full ${browserColors[b.browser] || 'bg-slate-500'}`}></span>
                                            <span className="text-slate-300">{b.browser}</span>
                                            <span className="text-slate-500">{pct}%</span>
                                        </span>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Referrers */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Yönlendiren Siteler</h2>
                        {data.referrers.length === 0 ? (
                            <p className="text-slate-500 text-sm">Henüz veri yok</p>
                        ) : (
                            <div className="space-y-2">
                                {data.referrers.slice(0, 5).map((r, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-300 truncate max-w-[200px]">{r.referrer}</span>
                                        <span className="text-slate-500">{r.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Locale Breakdown */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Dil Dağılımı</h2>
                        {data.locales.length === 0 ? (
                            <p className="text-slate-500 text-sm">Henüz veri yok</p>
                        ) : (
                            <div className="flex gap-3">
                                {data.locales.map(l => {
                                    const flags: Record<string, string> = { tr: '🇹🇷', en: '🇬🇧', de: '🇩🇪', ru: '🇷🇺' }
                                    return (
                                        <div key={l.locale} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                                            <span className="text-lg">{flags[l.locale] || '🌐'}</span>
                                            <div>
                                                <p className="text-white font-bold text-sm">{l.count}</p>
                                                <p className="text-slate-500 text-xs uppercase">{l.locale}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
