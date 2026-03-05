'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    BarChart3, Activity, Users, Clock, Globe, ArrowUpRight, ArrowDownRight,
    Map, Monitor, Smartphone, Tablet, Target, Megaphone, CheckCircle2, AlertCircle
} from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import { useParams } from 'next/navigation'
import { getAdminTranslations, AdminLocale } from '@/lib/admin-translations'

interface UnifiedAdsProps { }

const COLORS = ['#0891b2', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981']

export function UnifiedAdsTab({ }: UnifiedAdsProps) {
    const params = useParams()
    const locale = (params.locale as AdminLocale) || 'tr'
    const t = getAdminTranslations(locale).analyticsDashboard

    const [loading, setLoading] = useState(true)
    const [metaAds, setMetaAds] = useState<any>(null)
    const [googleAds, setGoogleAds] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [datePreset, setDatePreset] = useState('last_30d')

    const fetchAdsData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [metaRes, googleRes] = await Promise.all([
                fetch(`/api/admin/ads/meta?datePreset=${datePreset}`).then(r => r.json().catch(() => null)),
                fetch(`/api/admin/ads?action=stats`).then(r => r.json().catch(() => null))
            ])

            if (metaRes?.success) setMetaAds(metaRes)
            if (googleRes?.campaigns) setGoogleAds(googleRes.campaigns)
        } catch (err: any) {
            setError(err.message || t.adsFetchError)
        } finally {
            setLoading(false)
        }
    }, [datePreset])

    useEffect(() => {
        fetchAdsData()
    }, [fetchAdsData])

    // Calculate totals
    const metaSpend = metaAds?.totals?.totalSpend || 0
    const metaClicks = metaAds?.totals?.totalClicks || 0
    const metaImpressions = metaAds?.totals?.totalImpressions || 0

    const googleSpend = googleAds?.reduce((sum: number, c: any) => sum + (c.cost || 0), 0) || 0
    const googleClicks = googleAds?.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0) || 0
    const googleImpressions = googleAds?.reduce((sum: number, c: any) => sum + (c.impressions || 0), 0) || 0

    const totalSpend = metaSpend + googleSpend
    const totalClicks = metaClicks + googleClicks
    const totalImpressions = metaImpressions + googleImpressions
    const avgCpc = totalClicks > 0 ? (totalSpend / totalClicks) : 0
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse bg-white dark:bg-white/5 h-32 rounded-xl border border-slate-200 dark:border-white/10" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="animate-pulse bg-white dark:bg-white/5 h-96 rounded-xl border border-slate-200 dark:border-white/10" />
                    <div className="animate-pulse bg-white dark:bg-white/5 h-96 rounded-xl border border-slate-200 dark:border-white/10" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl flex items-center gap-3">
                <AlertCircle size={24} />
                <p>{error}</p>
            </div>
        )
    }

    const platformChartData = [
        { name: 'Meta Ads', value: metaSpend, clicks: metaClicks },
        { name: 'Google Ads', value: googleSpend, clicks: googleClicks },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Unified KPI Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Target className="text-blue-500" />
                        {t.unifiedAdsTitle}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">{t.unifiedAdsSubtitle}</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={datePreset}
                        onChange={(e) => setDatePreset(e.target.value)}
                        className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                        <option value="today">{t.today}</option>
                        <option value="last_7d">{t.last7d}</option>
                        <option value="last_30d">{t.last30d}</option>
                        <option value="this_year">{t.thisYear}</option>
                    </select>
                </div>
            </div>

            {/* Total Metric KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10">
                    <p className="text-sm font-medium text-slate-500 mb-1">{t.totalSpend}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalSpend)}
                    </h3>
                </div>
                <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10">
                    <p className="text-sm font-medium text-slate-500 mb-1">{t.totalClicks}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat('tr-TR').format(totalClicks)}
                    </h3>
                </div>
                <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10">
                    <p className="text-sm font-medium text-slate-500 mb-1">{t.avgCpc}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(avgCpc)}
                    </h3>
                </div>
                <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10">
                    <p className="text-sm font-medium text-slate-500 mb-1">{t.avgCtr}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        %{avgCtr.toFixed(2)}
                    </h3>
                </div>
            </div>

            {/* Platform Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t.platformSpendDist}</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={platformChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {platformChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(value))}
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t.platformClickComp}</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={platformChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t.clicks} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Campaign Tables */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Meta Campaigns */}
                <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#0891b2]"></span>
                        {t.metaAdsCampaigns}
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-white/5">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">{t.campaign}</th>
                                    <th className="px-4 py-3">{t.spend}</th>
                                    <th className="px-4 py-3">{t.clicks}</th>
                                    <th className="px-4 py-3 rounded-tr-lg">{t.status}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metaAds?.campaigns?.map((c: any) => (
                                    <tr key={c.id} className="border-b border-slate-100 dark:border-white/5">
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-[200px] truncate" title={c.name}>{c.name}</td>
                                        <td className="px-4 py-3">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(c.spend || 0)}</td>
                                        <td className="px-4 py-3">{c.clicks}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!metaAds?.campaigns || metaAds.campaigns.length === 0) && (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">{t.dataNotFound}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Google Campaigns */}
                <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
                        {t.googleAdsCampaigns}
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-white/5">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">{t.campaign}</th>
                                    <th className="px-4 py-3">{t.spend}</th>
                                    <th className="px-4 py-3">{t.clicks}</th>
                                    <th className="px-4 py-3 rounded-tr-lg">{t.conversions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {googleAds?.map((c: any) => (
                                    <tr key={c.id} className="border-b border-slate-100 dark:border-white/5">
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-[200px] truncate" title={c.name}>{c.name}</td>
                                        <td className="px-4 py-3">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(c.cost || 0)}</td>
                                        <td className="px-4 py-3">{c.clicks}</td>
                                        <td className="px-4 py-3">{c.conversions}</td>
                                    </tr>
                                ))}
                                {(!googleAds || googleAds.length === 0) && (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">{t.dataNotFound}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
