'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Eye, Users, MousePointer, Activity, TrendingUp, TrendingDown, RefreshCw, Calendar, Monitor, Smartphone } from 'lucide-react'

interface DashboardWebAnalyticsWidgetProps {
    from?: string // YYYY-MM-DD
    to?: string   // YYYY-MM-DD
}

export default function DashboardWebAnalyticsWidget({ from, to }: DashboardWebAnalyticsWidgetProps) {
    const [traffic, setTraffic] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [source, setSource] = useState<'ga4' | 'internal' | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const trafficParams = new URLSearchParams()
            if (from) trafficParams.set('startDate', from)
            if (to) trafficParams.set('endDate', to)
            const trafficQs = trafficParams.toString() ? `?${trafficParams.toString()}` : ''

            let trafficData = null

            // Try GA4 First
            try {
                const gaRes = await fetch(`/api/admin/analytics/traffic${trafficQs}`)
                if (gaRes.ok) {
                    const gData = await gaRes.json()
                    if (gData.success && gData.totals) {
                        trafficData = {
                            totals: gData.totals,
                            previousTotals: gData.previousTotals,
                            devices: gData.devices || []
                        }
                        setSource('ga4')
                    }
                }
            } catch { /* GA4 not configured */ }

            // Fallback to internal PageView data
            if (!trafficData) {
                try {
                    let period = '1'
                    if (from && to) {
                        const diffMs = new Date(to).getTime() - new Date(from).getTime()
                        period = String(Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24))))
                    }
                    const intRes = await fetch(`/api/admin/analytics/internal?period=${period}`)
                    if (intRes.ok) {
                        const iData = await intRes.json()
                        if (iData.success) {
                            trafficData = {
                                totals: iData.totals,
                                // No previous totals for internal right now
                            }
                            setSource('internal')
                        }
                    }
                } catch { /* Internal also failed */ }
            }

            if (trafficData) {
                setTraffic(trafficData)
            }
        } catch (error) {
            console.error('Error fetching web analytics', error)
        } finally {
            setLoading(false)
        }
    }, [from, to])

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [fetchData])

    const dateRangeLabel = from && to
        ? from === to
            ? new Date(from).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
            : `${new Date(from).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} – ${new Date(to).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : 'Bugün'

    // Helper to render trend
    const renderTrend = (current: number, previous: number) => {
        if (!previous || previous === 0) return null
        const change = ((current - previous) / previous) * 100
        const isPositive = change > 0
        const isNeutral = change === 0
        
        if (isNeutral) return <span className="text-slate-500 text-[10px] ml-2">%0</span>

        return (
            <span className={`text-[10px] ml-2 flex items-center gap-0.5 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(change).toFixed(1)}%
            </span>
        )
    }

    const t = traffic?.totals || {}
    const p = traffic?.previousTotals || {}
    const getDevice = (name: string) => traffic?.devices?.find((d: any) => d.name === name)

    return (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm relative overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Activity className="text-blue-500" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Web Analitiği</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar size={10} /> {dateRangeLabel} vs Önceki
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {loading ? <RefreshCw size={14} className="animate-spin text-slate-400" /> : (
                        traffic ? (
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                {source === 'ga4' ? 'GA4 Aktif' : 'Dahili'}
                            </span>
                        ) : (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">Kurulum Bekliyor</span>
                        )
                    )}
                    <button onClick={fetchData} disabled={loading} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                        <RefreshCw size={14} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow">
                {/* 1. Ziyaretçiler */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <Users size={12} className="text-blue-500" /> Ziyaretçiler
                        </p>
                    </div>
                    <div className="flex items-end mb-1">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {loading ? '...' : (t?.visitors?.toLocaleString() || t?.users?.toLocaleString() || '0')}
                        </p>
                        {!loading && renderTrend(t?.users || 0, p?.users || 0)}
                    </div>
                </div>

                {/* 2. Oturumlar */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <Activity size={12} className="text-purple-500" /> Oturumlar
                        </p>
                    </div>
                    <div className="flex items-end mb-1">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {loading ? '...' : (t?.sessions?.toLocaleString() || '0')}
                        </p>
                        {!loading && renderTrend(t?.sessions || 0, p?.sessions || 0)}
                    </div>
                </div>

                {/* 3. Sayfa Görüntüleme */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <Eye size={12} className="text-emerald-500" /> Sayfa Görüntüleme
                        </p>
                    </div>
                    <div className="flex items-end mb-1">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {loading ? '...' : (t?.pageViews?.toLocaleString() || '0')}
                        </p>
                        {!loading && renderTrend(t?.pageViews || 0, p?.pageViews || 0)}
                    </div>
                </div>

                {/* 4. Bounce Rate */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <RefreshCw size={12} className="text-amber-500" /> Hemen Çıkma Oranı
                        </p>
                    </div>
                    <div className="flex items-end mb-1">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {loading ? '...' : `%${t?.averageBounceRate || '0'}`}
                        </p>
                        {/* Note: for bounce rate, lower is better, so we negate the trend colors if we cared, but standard trend is fine */}
                        {!loading && renderTrend(parseFloat(t.averageBounceRate || 0), parseFloat(p.averageBounceRate || 0))}
                    </div>
                </div>

                {/* 5. Mobil Kullanıcı */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <Smartphone size={12} className="text-sky-500" /> Mobil Kullanıcı
                        </p>
                    </div>
                    <div className="flex items-end mb-1">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {loading ? '...' : getDevice('Mobile')?.users?.toLocaleString() || '0'}
                        </p>
                        {!loading && traffic?.devices && <span className="text-slate-500 text-[10px] ml-2">%{(getDevice('Mobile')?.percentage || 0)}</span>}
                    </div>
                </div>

                {/* 6. Masaüstü Kullanıcı */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <Monitor size={12} className="text-indigo-500" /> Masaüstü Kullanıcı
                        </p>
                    </div>
                    <div className="flex items-end mb-1">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {loading ? '...' : getDevice('Desktop')?.users?.toLocaleString() || '0'}
                        </p>
                        {!loading && traffic?.devices && <span className="text-slate-500 text-[10px] ml-2">%{(getDevice('Desktop')?.percentage || 0)}</span>}
                    </div>
                </div>
            </div>
        </div>
    )
}
