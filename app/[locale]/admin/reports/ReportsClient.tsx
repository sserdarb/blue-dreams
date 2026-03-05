'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { exportPdf } from '@/lib/export-pdf'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import {
    FileDown, Loader2, RefreshCw, TrendingUp, TrendingDown,
    DollarSign, Eye, MousePointer, Target, Users, AlertTriangle,
    Lightbulb, BarChart2, Zap, ChevronRight, Globe, Calendar
} from 'lucide-react'

type PlatformData = {
    platform: string
    impressions: number
    clicks: number
    spend: number
    ctr: number
    cpc: number
    reach: number
    frequency: number
    conversions: number
    followers?: number
    pageName?: string
}

type ReportSummary = {
    totalSpend: number
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    totalReach: number
    avgCtr: number
    avgCpc: number
}

type AICommentary = {
    executiveSummary?: string
    topInsights?: string[]
    recommendations?: string[]
    platformAnalysis?: Record<string, string>
    riskAlerts?: string[]
    nextPeriodForecast?: string
}

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6']

export default function ReportsClient() {
    const contentRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(true)
    const [pdfExporting, setPdfExporting] = useState(false)
    const [datePreset, setDatePreset] = useState('last_30d')

    const [summary, setSummary] = useState<ReportSummary>({
        totalSpend: 0, totalImpressions: 0, totalClicks: 0,
        totalConversions: 0, totalReach: 0, avgCtr: 0, avgCpc: 0
    })
    const [platforms, setPlatforms] = useState<PlatformData[]>([])

    // AI Report
    const [aiReport, setAiReport] = useState<AICommentary | null>(null)
    const [generatingReport, setGeneratingReport] = useState(false)

    const fetchReport = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/reports?datePreset=${datePreset}`)
            const data = await res.json()
            if (data.success) {
                setSummary(data.summary)
                setPlatforms(data.platforms || [])
            }
        } catch (e) {
            console.error('Report fetch failed', e)
        } finally {
            setLoading(false)
        }
    }, [datePreset])

    useEffect(() => { fetchReport() }, [fetchReport])

    const generateAIReport = async () => {
        setGeneratingReport(true)
        try {
            const res = await fetch('/api/admin/reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary, platforms, datePreset })
            })
            const data = await res.json()
            if (data.success) {
                setAiReport(data.report.commentary)
            }
        } catch (e) {
            console.error('AI Report failed', e)
        } finally {
            setGeneratingReport(false)
        }
    }

    const handlePdfExport = async () => {
        if (!contentRef.current) return
        setPdfExporting(true)
        try {
            await exportPdf({
                element: contentRef.current,
                filename: `rapor-${datePreset}-${new Date().toISOString().slice(0, 10)}`,
                title: 'Dijital Pazarlama Performans Raporu',
                subtitle: `${datePreset === 'last_7d' ? 'Son 7 Gün' : datePreset === 'last_90d' ? 'Son 90 Gün' : 'Son 30 Gün'} — ${new Date().toLocaleDateString('tr-TR')}`,
                orientation: 'landscape'
            })
        } catch (e) {
            console.error('PDF export failed', e)
        } finally {
            setPdfExporting(false)
        }
    }

    const f = (n: number, d = 0) => n?.toLocaleString('tr-TR', { maximumFractionDigits: d }) || '0'

    const kpiCards = [
        { label: 'Toplam Harcama', value: `€${f(summary.totalSpend, 2)}`, icon: DollarSign, color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
        { label: 'Gösterim', value: f(summary.totalImpressions), icon: Eye, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
        { label: 'Tıklama', value: f(summary.totalClicks), icon: MousePointer, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        { label: 'Dönüşüm', value: f(summary.totalConversions), icon: Target, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
        { label: 'Erişim', value: f(summary.totalReach), icon: Users, color: 'from-rose-500 to-red-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
        { label: 'Ort. CTR', value: `%${f(summary.avgCtr, 2)}`, icon: TrendingUp, color: 'from-cyan-500 to-sky-500', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
    ]

    const spendByPlatform = platforms.map(p => ({
        name: p.platform,
        value: p.spend
    }))

    const comparisonData = platforms.map(p => ({
        platform: p.platform,
        Harcama: p.spend,
        Tıklama: p.clicks,
        Dönüşüm: p.conversions,
    }))

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Header */}
            <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            <BarChart2 size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Raporlar & Analizler</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Octoboard tarzı gelişmiş dijital pazarlama raporları</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Date preset */}
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            {[
                                { key: 'last_7d', label: '7 Gün' },
                                { key: 'last_30d', label: '30 Gün' },
                                { key: 'last_90d', label: '90 Gün' },
                            ].map(d => (
                                <button key={d.key} onClick={() => setDatePreset(d.key)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${datePreset === d.key ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    {d.label}
                                </button>
                            ))}
                        </div>

                        <button onClick={fetchReport} disabled={loading}
                            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>

                        <button onClick={generateAIReport} disabled={generatingReport}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all disabled:opacity-50">
                            {generatingReport ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                            AI Rapor Oluştur
                        </button>

                        <button onClick={handlePdfExport} disabled={pdfExporting}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                            {pdfExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                            PDF İndir
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div ref={contentRef} className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">

                {/* KPI Widgets Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {kpiCards.map((kpi, i) => (
                        <Card key={i} className={`relative overflow-hidden p-4 border-0 shadow-sm hover:shadow-md transition-all ${kpi.bg}`}>
                            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${kpi.color} opacity-10 rounded-bl-full`} />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`p-1.5 bg-gradient-to-br ${kpi.color} rounded-md text-white`}>
                                        <kpi.icon size={14} />
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{kpi.label}</span>
                                </div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{loading ? '...' : kpi.value}</p>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Platform Spend Pie */}
                    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                            <Globe size={16} className="text-indigo-500" />
                            Platform Harcama Dağılımı
                        </h3>
                        {platforms.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={spendByPlatform} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                                        paddingAngle={5} dataKey="value" label={({ name, value }: any) => `${name}: €${value}`}>
                                        {spendByPlatform.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: any) => `€${v}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
                                {loading ? 'Yükleniyor...' : 'Platform verisi bulunamadı'}
                            </div>
                        )}
                    </Card>

                    {/* Platform Comparison Bar */}
                    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                            <BarChart2 size={16} className="text-purple-500" />
                            Platform Karşılaştırması
                        </h3>
                        {comparisonData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={comparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Harcama" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Tıklama" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Dönüşüm" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
                                {loading ? 'Yükleniyor...' : 'Karşılaştırma verisi yok'}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Platform Detail Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {platforms.map((p, i) => (
                        <Card key={i} className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${p.platform === 'Meta' ? 'bg-blue-500' : 'bg-red-500'}`} />
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{p.platform}</h3>
                                    {p.pageName && <span className="text-xs text-slate-400">({p.pageName})</span>}
                                </div>
                                {p.followers ? (
                                    <Badge variant="outline" className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                        {f(p.followers)} takipçi
                                    </Badge>
                                ) : null}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { l: 'Harcama', v: `€${f(p.spend, 2)}` },
                                    { l: 'Gösterim', v: f(p.impressions) },
                                    { l: 'Tıklama', v: f(p.clicks) },
                                    { l: 'CTR', v: `%${f(p.ctr, 2)}` },
                                    { l: 'CPC', v: `€${f(p.cpc, 2)}` },
                                    { l: 'Dönüşüm', v: f(p.conversions) },
                                    { l: 'Erişim', v: f(p.reach) },
                                    { l: 'Frekans', v: f(p.frequency, 2) },
                                ].map((m, j) => (
                                    <div key={j} className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">{m.l}</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{m.v}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* AI Report Section */}
                {aiReport && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg text-white">
                                <Zap size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Performans Analizi</h2>
                                <p className="text-xs text-slate-500">GPT-4o-mini ile oluşturulmuş detaylı analiz raporu</p>
                            </div>
                        </div>

                        {/* Executive Summary */}
                        {aiReport.executiveSummary && (
                            <Card className="p-6 border-l-4 border-l-indigo-500 bg-white dark:bg-slate-900 shadow-sm">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <BarChart2 size={16} className="text-indigo-500" /> Yönetici Özeti
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                                    {aiReport.executiveSummary}
                                </p>
                            </Card>
                        )}

                        {/* Insights + Recommendations Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Insights */}
                            {aiReport.topInsights && aiReport.topInsights.length > 0 && (
                                <Card className="p-6 bg-white dark:bg-slate-900 shadow-sm">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Lightbulb size={16} className="text-amber-500" /> Öne Çıkan Bulgular
                                    </h3>
                                    <ul className="space-y-2.5">
                                        {aiReport.topInsights.map((insight, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <ChevronRight size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                                <span>{insight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )}

                            {/* Recommendations */}
                            {aiReport.recommendations && aiReport.recommendations.length > 0 && (
                                <Card className="p-6 bg-white dark:bg-slate-900 shadow-sm">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <TrendingUp size={16} className="text-emerald-500" /> Öneriler
                                    </h3>
                                    <ul className="space-y-2.5">
                                        {aiReport.recommendations.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <span>{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )}
                        </div>

                        {/* Risk Alerts + Forecast */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {aiReport.riskAlerts && aiReport.riskAlerts.length > 0 && (
                                <Card className="p-6 bg-white dark:bg-slate-900 shadow-sm border-l-4 border-l-amber-500">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-amber-500" /> Risk Uyarıları
                                    </h3>
                                    <ul className="space-y-2.5">
                                        {aiReport.riskAlerts.map((alert, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                                <span>{alert}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )}

                            {aiReport.nextPeriodForecast && (
                                <Card className="p-6 bg-white dark:bg-slate-900 shadow-sm border-l-4 border-l-cyan-500">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Calendar size={16} className="text-cyan-500" /> Sonraki Dönem Tahmini
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {aiReport.nextPeriodForecast}
                                    </p>
                                </Card>
                            )}
                        </div>

                        {/* Platform Analysis */}
                        {aiReport.platformAnalysis && Object.keys(aiReport.platformAnalysis).length > 0 && (
                            <Card className="p-6 bg-white dark:bg-slate-900 shadow-sm">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Globe size={16} className="text-blue-500" /> Platform Analizleri
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(aiReport.platformAnalysis).map(([platform, analysis]) => (
                                        <div key={platform} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${platform.toLowerCase().includes('meta') ? 'bg-blue-500' : 'bg-red-500'}`} />
                                                {platform}
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{analysis}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* Generating overlay */}
                {generatingReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <Card className="p-8 flex flex-col items-center gap-4 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                <Loader2 className="animate-spin text-indigo-600" size={32} />
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">AI Rapor Oluşturuluyor</p>
                            <p className="text-sm text-slate-500 text-center max-w-xs">
                                Verileriniz GPT-4o-mini ile analiz ediliyor. Bu işlem birkaç saniye sürebilir.
                            </p>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
