'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Area
} from 'recharts'
import { Activity, RefreshCw, AlertCircle, BarChart3, TrendingUp, DollarSign } from 'lucide-react'
import { usePathname } from 'next/navigation'

// Simple local translations
const chartTranslations: Record<string, Record<string, string>> = {
    tr: {
        title: 'Web Trafiği & Reklam Performansı',
        subtitle: 'GA4 + Meta/Google Ads verileri',
        error: 'Veri yüklenirken bir hata oluştu.',
        no_data: 'Bu dönem için veri bulunamadı. GA4 veya reklam hesaplarınızı kontrol edin.',
        traffic_label: 'Ziyaretçi',
        sessions_label: 'Oturum',
        pageviews_label: 'Sayfa Gör.',
        ad_spend_label: 'Reklam Harcaması',
        impressions_label: 'Gösterim',
        clicks_label: 'Tıklama',
        total_visitors: 'Toplam Ziyaretçi',
        total_sessions: 'Toplam Oturum',
        total_spend: 'Toplam Harcama',
        total_clicks: 'Toplam Tıklama',
        tab_traffic: 'Web Trafiği',
        tab_ads: 'Reklam Verileri',
    },
    en: {
        title: 'Web Traffic & Ad Performance',
        subtitle: 'GA4 + Meta/Google Ads data',
        error: 'An error occurred while loading data.',
        no_data: 'No data available for this period. Check your GA4 or ad accounts.',
        traffic_label: 'Visitors',
        sessions_label: 'Sessions',
        pageviews_label: 'Page Views',
        ad_spend_label: 'Ad Spend',
        impressions_label: 'Impressions',
        clicks_label: 'Clicks',
        total_visitors: 'Total Visitors',
        total_sessions: 'Total Sessions',
        total_spend: 'Total Spend',
        total_clicks: 'Total Clicks',
        tab_traffic: 'Web Traffic',
        tab_ads: 'Ad Data',
    },
    de: {
        title: 'Web-Traffic & Werbeleistung',
        subtitle: 'GA4 + Meta/Google Ads Daten',
        error: 'Fehler beim Laden der Daten.',
        no_data: 'Keine Daten für diesen Zeitraum verfügbar.',
        traffic_label: 'Besucher',
        sessions_label: 'Sitzungen',
        pageviews_label: 'Seitenaufrufe',
        ad_spend_label: 'Werbeausgaben',
        impressions_label: 'Impressionen',
        clicks_label: 'Klicks',
        total_visitors: 'Besucher gesamt',
        total_sessions: 'Sitzungen gesamt',
        total_spend: 'Ausgaben gesamt',
        total_clicks: 'Klicks gesamt',
        tab_traffic: 'Web-Traffic',
        tab_ads: 'Werbedaten',
    },
    ru: {
        title: 'Веб-трафик и реклама',
        subtitle: 'Данные GA4 + Meta/Google Ads',
        error: 'Ошибка загрузки данных.',
        no_data: 'Нет данных за выбранный период.',
        traffic_label: 'Посетители',
        sessions_label: 'Сессии',
        pageviews_label: 'Просмотры',
        ad_spend_label: 'Расходы',
        impressions_label: 'Показы',
        clicks_label: 'Клики',
        total_visitors: 'Всего посетителей',
        total_sessions: 'Всего сессий',
        total_spend: 'Всего расходов',
        total_clicks: 'Всего кликов',
        tab_traffic: 'Веб-трафик',
        tab_ads: 'Реклама',
    }
}

interface DashboardAnalyticsChartWidgetProps {
    from?: string
    to?: string
    currency?: 'TRY' | 'EUR' | 'USD'
}

export default function DashboardAnalyticsChartWidget({ from, to, currency = 'EUR' }: DashboardAnalyticsChartWidgetProps) {
    const pathname = usePathname()
    const locale = pathname.split('/')[1] || 'tr'
    const t = chartTranslations[locale] || chartTranslations.tr

    const [trafficData, setTrafficData] = useState<any[]>([])
    const [adsData, setAdsData] = useState<any>(null)
    const [trafficTotals, setTrafficTotals] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'traffic' | 'ads'>('traffic')
    const [trafficSource, setTrafficSource] = useState<string>('')

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            // Build query params for traffic
            const trafficParams = new URLSearchParams()
            if (from) trafficParams.set('startDate', from)
            if (to) trafficParams.set('endDate', to)
            const qs = trafficParams.toString() ? `?${trafficParams.toString()}` : ''

            // Fetch both traffic and ads data in parallel
            const [trafficRes, adsRes] = await Promise.allSettled([
                fetch(`/api/admin/analytics/traffic${qs}`),
                fetch('/api/admin/analytics/ads')
            ])

            // Process traffic data
            if (trafficRes.status === 'fulfilled' && trafficRes.value.ok) {
                const tData = await trafficRes.value.json()
                if (tData.success && tData.traffic && tData.traffic.length > 0) {
                    setTrafficData(tData.traffic)
                    setTrafficTotals(tData.totals)
                    setTrafficSource(tData.demo ? 'Demo' : 'GA4')
                } else if (tData.success && tData.data && tData.data.length > 0) {
                    setTrafficData(tData.data)
                    setTrafficTotals(tData.totals)
                    setTrafficSource(tData.demo ? 'Demo' : 'GA4')
                } else {
                    setTrafficData([])
                    setTrafficTotals(null)
                    setTrafficSource('')
                }
            } else {
                setTrafficData([])
                setTrafficTotals(null)
            }

            // Process ads data
            if (adsRes.status === 'fulfilled' && adsRes.value.ok) {
                const aData = await adsRes.value.json()
                if (aData.success) {
                    setAdsData(aData.data)
                }
            }

        } catch (err: any) {
            console.error('Analytics Chart Error:', err)
            setError(t.error)
        } finally {
            setLoading(false)
        }
    }, [from, to, t.error])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const symbol = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : '₺')

    const hasTrafficData = trafficData.length > 0
    const hasAdsData = adsData && (adsData.metaAds?.spend > 0 || adsData.googleAds?.spend > 0 || adsData.totalSpend > 0)

    return (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-indigo-500 to-blue-600 w-9 h-9 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <BarChart3 size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.title}</h3>
                        <p className="text-xs text-slate-500">{t.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {trafficSource && !loading && (
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            {trafficSource}
                        </span>
                    )}
                    <button onClick={fetchData} disabled={loading} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 text-slate-400">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('traffic')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        activeTab === 'traffic' 
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Activity size={12} className="inline mr-1" />
                    {t.tab_traffic}
                </button>
                <button
                    onClick={() => setActiveTab('ads')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        activeTab === 'ads' 
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <DollarSign size={12} className="inline mr-1" />
                    {t.tab_ads}
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <RefreshCw size={24} className="animate-spin mb-2" />
                    <p className="text-sm">Yükleniyor...</p>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle size={18} />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Traffic Tab */}
            {!loading && !error && activeTab === 'traffic' && (
                <>
                    {/* Summary Cards */}
                    {trafficTotals && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                <p className="text-[10px] text-blue-500 mb-0.5 uppercase font-medium">{t.total_visitors}</p>
                                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{(trafficTotals.users || trafficTotals.visitors || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-lg">
                                <p className="text-[10px] text-violet-500 mb-0.5 uppercase font-medium">{t.total_sessions}</p>
                                <p className="text-lg font-bold text-violet-700 dark:text-violet-300">{(trafficTotals.sessions || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
                                <p className="text-[10px] text-cyan-500 mb-0.5 uppercase font-medium">{t.pageviews_label}</p>
                                <p className="text-lg font-bold text-cyan-700 dark:text-cyan-300">{(trafficTotals.pageViews || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                                <p className="text-[10px] text-amber-500 mb-0.5 uppercase font-medium">Bounce Rate</p>
                                <p className="text-lg font-bold text-amber-700 dark:text-amber-300">%{trafficTotals.averageBounceRate || '—'}</p>
                            </div>
                        </div>
                    )}

                    {/* Traffic Chart */}
                    {hasTrafficData ? (
                        <div style={{ width: '100%', minHeight: '288px', height: '288px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(val) => {
                                            const d = new Date(val)
                                            return `${d.getDate()}/${d.getMonth() + 1}`
                                        }}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis 
                                        yAxisId="left" 
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        labelFormatter={(val) => new Date(val as string).toLocaleDateString('tr-TR')}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
                                    <Area yAxisId="left" type="monotone" dataKey="users" name={t.traffic_label} fill="#3b82f620" stroke="#3b82f6" strokeWidth={2} />
                                    <Line yAxisId="left" type="monotone" dataKey="sessions" name={t.sessions_label} stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                    <Bar yAxisId="left" dataKey="pageViews" name={t.pageviews_label} fill="#06b6d440" radius={[2, 2, 0, 0]} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Activity size={32} className="mb-2 opacity-40" />
                            <p className="text-sm text-center">{t.no_data}</p>
                        </div>
                    )}
                </>
            )}

            {/* Ads Tab */}
            {!loading && !error && activeTab === 'ads' && (
                <>
                    {hasAdsData ? (
                        <div className="space-y-4">
                            {/* Ads Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                    <p className="text-[10px] text-red-500 mb-0.5 uppercase font-medium">{t.total_spend}</p>
                                    <p className="text-lg font-bold text-red-700 dark:text-red-300">{symbol}{(adsData.totalSpend || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                                    <p className="text-[10px] text-orange-500 mb-0.5 uppercase font-medium">{t.impressions_label}</p>
                                    <p className="text-lg font-bold text-orange-700 dark:text-orange-300">{(adsData.totalImpressions || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                                    <p className="text-[10px] text-emerald-500 mb-0.5 uppercase font-medium">{t.total_clicks}</p>
                                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{(adsData.totalClicks || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                                    <p className="text-[10px] text-indigo-500 mb-0.5 uppercase font-medium">ROAS</p>
                                    <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{(adsData.metaAds?.roas || 0).toFixed(1)}x</p>
                                </div>
                            </div>

                            {/* Platform Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Meta Ads */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">M</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">Meta Ads</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                            adsData.metaAds?.status === 'Connected' 
                                                ? 'bg-emerald-100 text-emerald-600' 
                                                : 'bg-amber-100 text-amber-600'
                                        }`}>{adsData.metaAds?.status || '—'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="text-[10px] text-slate-400">{t.ad_spend_label}</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{symbol}{(adsData.metaAds?.spend || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400">{t.clicks_label}</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{(adsData.metaAds?.clicks || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400">{t.impressions_label}</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{(adsData.metaAds?.impressions || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {adsData.metaAds?.message && (
                                        <p className="text-xs text-amber-600 mt-2">{adsData.metaAds.message}</p>
                                    )}
                                </div>

                                {/* Google Ads */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">G</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">Google Ads</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                            adsData.googleAds?.status === 'Connected' 
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-amber-100 text-amber-600'
                                        }`}>{adsData.googleAds?.status || '—'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="text-[10px] text-slate-400">{t.ad_spend_label}</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{symbol}{(adsData.googleAds?.spend || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400">{t.clicks_label}</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{(adsData.googleAds?.clicks || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400">{t.impressions_label}</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{(adsData.googleAds?.impressions || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {adsData.googleAds?.message && (
                                        <p className="text-xs text-amber-600 mt-2">{adsData.googleAds.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <DollarSign size={32} className="mb-2 opacity-40" />
                            <p className="text-sm text-center">{t.no_data}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
