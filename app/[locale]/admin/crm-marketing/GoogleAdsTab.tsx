'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    BarChart3, TrendingUp, MousePointerClick, DollarSign, Activity,
    Loader2, RefreshCw, AlertCircle, Filter, Play, Pause, Archive
} from 'lucide-react'

interface AdCampaign {
    id: string
    name: string
    status: string
    channelType?: string
    impressions: number
    clicks: number
    cost: number
    conversions: number
    conversionValue?: number
}

const STATUS_BADGES: Record<string, { label: string; color: string; icon: any }> = {
    enabled: { label: 'Aktif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: Play },
    paused: { label: 'Duraklatıldı', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Pause },
    removed: { label: 'Arşiv', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', icon: Archive },
}

export default function GoogleAdsTab() {
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState('ALL')

    const fetchAds = async (status?: string) => {
        setLoading(true)
        setError(null)
        try {
            const activeStatus = status || statusFilter
            const res = await fetch(`/api/admin/ads?action=campaigns&status=${activeStatus}`)
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || `Server error: ${res.status}`)
            }
            const data = await res.json()
            setCampaigns(data.campaigns || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAds() }, [])

    const handleFilterChange = (status: string) => {
        setStatusFilter(status)
        fetchAds(status)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="animate-spin text-blue-500" size={28} />
                <span className="ml-3 text-muted-foreground">Google Ads verileri yükleniyor…</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-red-500">
                    <AlertCircle size={20} />
                    <span className="font-medium">Google Ads Bağlantı Hatası</span>
                </div>
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                    onClick={() => fetchAds()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                    <RefreshCw size={14} /> Tekrar Dene
                </button>
            </div>
        )
    }

    const totalCost = campaigns.reduce((acc, c) => acc + c.cost, 0)
    const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0)
    const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0)
    const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0)
    const avgCpc = totalClicks > 0 ? (totalCost / totalClicks).toFixed(2) : '0.00'
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00'

    const activeCount = campaigns.filter(c => c.status === 'enabled').length
    const pausedCount = campaigns.filter(c => c.status === 'paused').length

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 size={20} /> Reklam Performansı (Son 30 Gün)
                </h2>
                <div className="flex items-center gap-2">
                    {/* Filter */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                        <Filter size={14} className="text-slate-400 ml-1" />
                        {[
                            { value: 'ALL', label: 'Tümü' },
                            { value: 'ENABLED', label: `Aktif (${activeCount})` },
                            { value: 'PAUSED', label: `Pasif (${pausedCount})` },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleFilterChange(opt.value)}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${statusFilter === opt.value
                                        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => fetchAds()} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-slate-900 border-none">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign size={14} /> Toplam Harcama</p>
                    <p className="text-2xl font-bold mt-1">€{totalCost.toFixed(2)}</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-slate-900 border-none">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><MousePointerClick size={14} /> Toplam Tıklama</p>
                    <p className="text-2xl font-bold mt-1">{totalClicks.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">CPC: €{avgCpc}</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-slate-900 border-none">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><TrendingUp size={14} /> Dönüşümler</p>
                    <p className="text-2xl font-bold mt-1">{totalConversions}</p>
                    <p className="text-xs text-muted-foreground mt-1">% {conversionRate} Dönüşüm</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-slate-900 border-none">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Activity size={14} /> Görüntülenme</p>
                    <p className="text-2xl font-bold mt-1">{totalImpressions.toLocaleString()}</p>
                </Card>
            </div>

            {/* Campaigns Table */}
            <Card className="overflow-hidden mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800/50">
                            <tr>
                                <th className="p-3">Kampanya Adı</th>
                                <th className="p-3">Durum</th>
                                <th className="p-3 text-right">Görüntülenme</th>
                                <th className="p-3 text-right">Tıklama</th>
                                <th className="p-3 text-right">Harcama</th>
                                <th className="p-3 text-right">Dönüşüm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Kampanya bulunamadı.</td></tr>
                            ) : (
                                campaigns.map(c => {
                                    const badge = STATUS_BADGES[c.status] || STATUS_BADGES.enabled
                                    const BadgeIcon = badge.icon
                                    return (
                                        <tr key={c.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                            <td className="p-3 font-medium">{c.name}</td>
                                            <td className="p-3">
                                                <Badge className={`${badge.color} border-none text-[10px] uppercase tracking-wide`} variant="outline">
                                                    <BadgeIcon size={10} className="mr-1" />
                                                    {badge.label}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-right">{c.impressions.toLocaleString()}</td>
                                            <td className="p-3 text-right">{c.clicks.toLocaleString()}</td>
                                            <td className="p-3 text-right">€{c.cost.toFixed(2)}</td>
                                            <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{c.conversions}</td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
