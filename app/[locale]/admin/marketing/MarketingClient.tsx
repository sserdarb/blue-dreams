'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react'
import { exportPdf } from '@/lib/export-pdf'
import { Card } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, Target, DollarSign, FileDown, MousePointer, Eye, Zap, TrendingUp, Presentation, Megaphone, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import type { AdCampaign, AdPlatform, MarketingOverview } from '@/lib/services/marketing'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts'

export default function MarketingClient() {
    const contentRef = useRef<HTMLDivElement>(null)
    const [pdfExporting, setPdfExporting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [overview, setOverview] = useState<MarketingOverview>({ totalSpend: 0, totalRevenue: 0, totalROAS: 0, platformBreakdown: [] })
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([])
    const [metaStatus, setMetaStatus] = useState('Not Configured')
    const [googleStatus, setGoogleStatus] = useState('Not Configured')

    const fetchAds = async () => {
        try {
            setLoading(true)
            setErrorMsg(null)
            const res = await fetch('/api/admin/analytics/ads')
            if (!res.ok) {
                setErrorMsg(`API isteği başarısız: ${res.status}`)
                return
            }
            const data = await res.json()
            if (!data.success) {
                setErrorMsg(data.error || 'Veri alınamadı')
                return
            }

            const liveData = data.data
            setMetaStatus(liveData.metaAds?.status || 'Not Configured')
            setGoogleStatus(liveData.googleAds?.status || 'Not Configured')

            // Build overview
            const ov: MarketingOverview = { totalSpend: liveData.totalSpend || 0, totalRevenue: 0, totalROAS: 0, platformBreakdown: [] }
            const camps: AdCampaign[] = []

            if (liveData.metaAds) {
                const spend = liveData.metaAds.spend || 0
                const roas = liveData.metaAds.roas || 0
                ov.platformBreakdown.push({ platform: 'Meta (Facebook & Instagram)' as AdPlatform, spend, roas })
                camps.push({
                    id: 'meta_summary', platform: 'Meta (Facebook & Instagram)' as AdPlatform,
                    name: 'Meta Ads - Hesap Özeti (Son 30 Gün)',
                    status: liveData.metaAds.status === 'Connected' ? 'active' : 'paused',
                    spend, impressions: liveData.metaAds.impressions || 0, clicks: liveData.metaAds.clicks || 0,
                    ctr: liveData.metaAds.impressions ? ((liveData.metaAds.clicks || 0) / liveData.metaAds.impressions) * 100 : 0,
                    cpc: liveData.metaAds.clicks ? (spend / liveData.metaAds.clicks) : 0,
                    conversions: 0, roas
                })
            }
            if (liveData.googleAds) {
                const spend = liveData.googleAds.spend || 0
                const roas = liveData.googleAds.roas || 0
                ov.platformBreakdown.push({ platform: 'Google Ads' as AdPlatform, spend, roas })
                camps.push({
                    id: 'google_summary', platform: 'Google Ads' as AdPlatform,
                    name: 'Google Ads - Hesap Özeti (Son 30 Gün)',
                    status: liveData.googleAds.status === 'Connected' ? 'active' : 'paused',
                    spend, impressions: liveData.googleAds.impressions || 0, clicks: liveData.googleAds.clicks || 0,
                    ctr: liveData.googleAds.impressions ? ((liveData.googleAds.clicks || 0) / liveData.googleAds.impressions) * 100 : 0,
                    cpc: liveData.googleAds.clicks ? (spend / liveData.googleAds.clicks) : 0,
                    conversions: 0, roas
                })
            }

            // Calculate ROAS
            let totalRoas = 0, roasCount = 0
            if (liveData.metaAds?.roas) { totalRoas += liveData.metaAds.roas; roasCount++ }
            if (liveData.googleAds?.roas) { totalRoas += liveData.googleAds.roas; roasCount++ }
            if (roasCount > 0) ov.totalROAS = totalRoas / roasCount

            setOverview(ov)
            setCampaigns(camps)
        } catch (e: any) {
            setErrorMsg(e.message || 'Bağlantı hatası')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAds() }, [])

    const metaConnected = metaStatus === 'Connected'
    const googleConnected = googleStatus === 'Connected'

    const handlePdfExport = async () => {
        if (!contentRef.current) return
        await exportPdf({
            element: contentRef.current,
            filename: `marketing-rapor-${new Date().getFullYear()}`,
            title: 'Marketing Performans Raporu',
            subtitle: `ROAS: ${overview.totalROAS.toFixed(1)}x | Spend: €${overview.totalSpend.toLocaleString()}`,
            orientation: 'landscape',
            onStart: () => setPdfExporting(true),
            onFinish: () => setPdfExporting(false),
        })
    }

    const aiInsight = useMemo(() => {
        if (overview.totalSpend === 0) return "Reklam harcaması tespit edilmedi. Lütfen API bağlantılarını kontrol edin veya kampanyalarınızı aktif hale getirin."
        let text = `Son dönemde yapılan €${overview.totalSpend.toLocaleString()} harcama ile ortalama ${overview.totalROAS.toFixed(1)}x ROAS elde edildi. `
        const bestPlatform = [...overview.platformBreakdown].sort((a, b) => b.roas - a.roas)[0]
        if (bestPlatform) {
            text += `En verimli platform ${bestPlatform.roas.toFixed(1)}x ROAS ile ${bestPlatform.platform} oldu. `
            if (bestPlatform.roas > 4) text += `Bu platforma bütçe kaydırmak karlılığı artırabilir. `
        }
        let avgCtr = campaigns.reduce((acc, c) => acc + (c.ctr || 0), 0) / (campaigns.length || 1)
        text += avgCtr < 1
            ? `Genel Tıklama Oranı (CTR) düşük (%${avgCtr.toFixed(2)}). Reklam görsellerinin revize edilmesi tavsiye edilir.`
            : `Genel Tıklama Oranı (CTR) sağlıklı (%${avgCtr.toFixed(2)}). Hedef kitle optimizasyonu ile CPC düşürülebilir.`
        return text
    }, [overview, campaigns])

    const chartData = useMemo(() => {
        return campaigns.map(c => ({
            name: c.platform.split(' ')[0],
            harcama: c.spend,
            roas: c.roas,
            tiklama: c.clicks,
            gosterim: c.impressions
        }))
    }, [campaigns])

    const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0)
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)
    const cpa = overview.totalSpend / Math.max(campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0), 1)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="animate-spin" size={40} />
                    <p className="text-lg font-medium">Reklam verileri yükleniyor…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Marketing Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track ad performance across Google & Meta. Data is loaded directly from real APIs.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${metaConnected ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                            Meta: {metaConnected ? 'Bağlı ✓' : metaStatus}
                        </span>
                        <span className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${googleConnected ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                            Google: {googleConnected ? 'Bağlı ✓' : googleStatus}
                        </span>
                    </div>
                    <button onClick={fetchAds} className="flex items-center gap-2 text-xs text-cyan-600 hover:text-cyan-700">
                        <RefreshCw size={12} /> Yenile
                    </button>
                </div>
            </div>

            {metaStatus === 'Token Expired' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
                    <strong>Uyarı:</strong> Meta Access Token süresi dolmuş. <a href="/api/admin/settings/meta-token" target="_blank" className="underline font-semibold">Token durumunu kontrol edin</a>.
                </div>
            )}

            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-center gap-3">
                    <AlertCircle size={18} />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Content */}
            <div ref={contentRef} className="space-y-6">

                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200">
                            {campaigns.length} Aktif Kampanya
                        </Badge>
                    </div>
                    <button onClick={handlePdfExport} disabled={pdfExporting} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                        <FileDown size={16} className={pdfExporting ? 'animate-pulse' : ''} />
                        {pdfExporting ? 'Rapor Oluşturuluyor...' : 'Raporu İndir (PDF)'}
                    </button>
                </div>

                {/* AI Insights Card */}
                <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-900/30 border-blue-100 dark:border-blue-800/50 p-4">
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                            <Zap className="text-blue-600 dark:text-blue-400" size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                AI Pazarlama İçgörüsü
                                <span className="text-[10px] bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">BETA</span>
                            </h3>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                                {aiInsight}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Core KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Toplam Reklam Harcaması</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">€{overview.totalSpend.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                                <DollarSign className="h-5 w-5 text-red-500 dark:text-red-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                            Ortalama EBM (CPA): <strong className="text-slate-700 dark:text-slate-300">€{cpa.toFixed(2)}</strong>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Reklam Geliri (Tahmini)</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">€{overview.totalRevenue.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                                <Target className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                            {totalImpressions.toLocaleString()} gösterimden elde edildi
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">ROAS (Ortalama)</p>
                                <h3 className={`text-2xl font-bold mt-1 ${overview.totalROAS >= 4 ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>
                                    {overview.totalROAS.toFixed(1)}x
                                </h3>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (overview.totalROAS / 10) * 100)}%` }}></div>
                            </div>
                            <span className="shrink-0 whitespace-nowrap">Hedef: 10x</span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Toplam Etkileşim</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{totalClicks.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                <MousePointer className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                            Genel CTR: <strong className="text-slate-700 dark:text-slate-300">{((totalClicks / Math.max(totalImpressions, 1)) * 100).toFixed(2)}%</strong>
                        </div>
                    </Card>
                </div>

                {/* Charts & Funnel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="p-5 lg:col-span-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Platform Bazlı Harcama ve Getiri (ROAS)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val}`} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}x`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    <Bar yAxisId="left" dataKey="harcama" name="Harcama (€)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    <Bar yAxisId="right" dataKey="roas" name="ROAS" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="p-5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Dönüşüm Hunisi (Funnel)</h3>
                        <div className="h-64 flex flex-col justify-between">
                            <div className="flex flex-col items-center">
                                <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-t-xl p-3 text-center border-b-2 border-white dark:border-slate-800">
                                    <div className="text-xs text-slate-500 font-medium">Gösterim (İzlenme)</div>
                                    <div className="text-lg font-bold text-slate-700 dark:text-slate-200">{totalImpressions.toLocaleString()}</div>
                                </div>
                                <div className="w-[85%] bg-blue-50 dark:bg-blue-900/20 p-3 text-center border-b-2 border-white dark:border-slate-800">
                                    <div className="text-xs text-slate-500 font-medium">Tıklama (Ziyaret)</div>
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalClicks.toLocaleString()}</div>
                                </div>
                                <div className="w-[70%] bg-emerald-50 dark:bg-emerald-900/20 rounded-b-xl p-3 text-center">
                                    <div className="text-xs text-slate-500 font-medium">Dönüşüm (Rezervasyon / Lead)</div>
                                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="text-center mt-2">
                                <div className="inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 font-medium">
                                    Dönüşüm Oranı: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{((campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0) / Math.max(totalClicks, 1)) * 100).toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Platform Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overview.platformBreakdown.map(p => (
                        <Card key={p.platform} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${p.platform.includes('Meta') ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'}`}>
                                    <Megaphone size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{p.platform}</h4>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Harcama: €{p.spend.toLocaleString()} (Varlık: {((p.spend / overview.totalSpend) * 100).toFixed(1)}%)
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant="outline" className={`font-mono text-sm ${p.roas >= 4 ? 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'}`}>
                                    {p.roas.toFixed(1)}x ROAS
                                </Badge>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Campaigns Table */}
                <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Presentation size={18} className="text-slate-400" />
                            Aktif ve Pasif Kampanyalar
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-transparent">
                                    <TableHead className="text-slate-500 dark:text-slate-400 w-[300px]">Kampanya Adı</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400">Platform</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400">Durum</TableHead>
                                    <TableHead className="text-right text-slate-500 dark:text-slate-400">Harcama</TableHead>
                                    <TableHead className="text-right text-slate-500 dark:text-slate-400">Tıklama/Gösterim</TableHead>
                                    <TableHead className="text-right text-slate-500 dark:text-slate-400">CPC</TableHead>
                                    <TableHead className="text-right text-slate-500 dark:text-slate-400 font-bold">ROAS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.map((c) => (
                                    <TableRow key={c.id} className="border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <TableCell className="text-slate-700 dark:text-slate-300 font-medium">
                                            {c.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                                <span className={`w-2 h-2 rounded-full ${c.platform.includes('Meta') ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                                                {c.platform}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`uppercase text-[10px] tracking-wide ${c.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200' :
                                                'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                                }`} variant="outline">
                                                {c.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-slate-700 dark:text-slate-300 font-mono text-sm">
                                            €{c.spend.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-slate-500 dark:text-slate-400 text-xs">
                                            <div className="font-medium text-slate-700 dark:text-slate-300">{c.clicks?.toLocaleString() || 0}</div>
                                            <div className="text-[10px] opacity-70">{c.impressions?.toLocaleString() || 0} göst.</div>
                                        </TableCell>
                                        <TableCell className="text-right text-slate-600 dark:text-slate-400 text-sm">
                                            €{(c.cpc || 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="secondary" className={`font-mono text-sm border ${c.roas >= 5 ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : c.roas >= 2 ? 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : 'border-red-200 text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'}`}>
                                                {c.roas.toFixed(1)}x
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </div>
    )
}
