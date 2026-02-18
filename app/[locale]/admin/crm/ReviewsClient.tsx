'use client'

import React, { useState, useMemo, useRef } from 'react'
import { exportPdf } from '@/lib/export-pdf'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
    MessageSquare,
    Star,
    Clock,
    ThumbsUp,
    ThumbsDown,
    Filter,
    Bot,
    ChevronDown,
    ChevronUp,
    TrendingDown,
    FileDown
} from 'lucide-react'
import type { GuestReview } from '@/lib/services/elektra'
import dynamic from 'next/dynamic'
import ModuleOffline from '@/components/admin/ModuleOffline'

// ─── CRM Visualization Charts (lazy-loaded) ───
const CommentCountChart = dynamic(() => import('@/components/admin/charts/CRMCharts').then(m => ({ default: m.CommentCountChart })), { ssr: false, loading: () => <ChartSkeleton /> })
const SentimentTrendChart = dynamic(() => import('@/components/admin/charts/CRMCharts').then(m => ({ default: m.SentimentTrendChart })), { ssr: false, loading: () => <ChartSkeleton /> })
const MecraDistributionChart = dynamic(() => import('@/components/admin/charts/CRMCharts').then(m => ({ default: m.MecraDistributionChart })), { ssr: false, loading: () => <ChartSkeleton /> })
const TopTopicsChart = dynamic(() => import('@/components/admin/charts/CRMCharts').then(m => ({ default: m.TopTopicsChart })), { ssr: false, loading: () => <ChartSkeleton /> })
const ComplaintTopicsChart = dynamic(() => import('@/components/admin/charts/CRMCharts').then(m => ({ default: m.ComplaintTopicsChart })), { ssr: false, loading: () => <ChartSkeleton /> })
const SentimentDonutChart = dynamic(() => import('@/components/admin/charts/CRMCharts').then(m => ({ default: m.SentimentDonutChart })), { ssr: false, loading: () => <ChartSkeleton /> })

function ChartSkeleton() {
    return <div className="h-[280px] w-full animate-pulse bg-slate-800 rounded-lg" />
}

interface ReviewsClientProps {
    initialReviews: GuestReview[]
    comparisonReviews?: GuestReview[]
    metrics: {
        total: number
        replied: number
        pending: number
        responseRate: number
        avgResponseTimeHours: number
    }
    error?: string
}

export default function ReviewsClient({ initialReviews, comparisonReviews = [], metrics: initialMetrics, error }: ReviewsClientProps) {
    if (error) {
        return <ModuleOffline moduleName="CRM & Misafir İlişkileri" dataSource="elektra" offlineReason={error} />
    }

    const [reviews] = useState<GuestReview[]>(initialReviews)
    const contentRef = useRef<HTMLDivElement>(null)
    const [pdfExporting, setPdfExporting] = useState(false)
    const [filterSource, setFilterSource] = useState<string>('All')
    const [filterStatus, setFilterStatus] = useState<string>('All')
    const [filterScore, setFilterScore] = useState<string>('All')

    // Date State (Defaults to data range or last 30 days)
    const [startDate, setStartDate] = useState(() => {
        const d = new Date()
        d.setDate(d.getDate() - 30)
        return d.toISOString().split('T')[0]
    })
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

    const [analyzing, setAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<string | null>(null)
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            if (filterSource !== 'All' && r.source !== filterSource) return false
            if (filterStatus !== 'All' && r.status !== filterStatus) return false
            if (filterScore !== 'All') {
                const min = parseInt(filterScore)
                // Range logic: "9+" "7-8" "0-6"
                if (filterScore === '9' && r.rating < 9) return false
                if (filterScore === '7' && (r.rating < 7 || r.rating >= 9)) return false
                if (filterScore === '6' && r.rating >= 7) return false
            }
            if (startDate && r.date < startDate) return false
            if (endDate && r.date > endDate) return false
            return true
        })
    }, [reviews, filterSource, filterStatus, filterScore, startDate, endDate])

    // Comparison Metrics (YoY)
    const compMetrics = useMemo(() => {
        if (!comparisonReviews.length) return null

        // Filter comp reviews based on SAME logic but date shifted
        // Date shift logic:
        let targetStart = '', targetEnd = ''
        if (startDate) { const d = new Date(startDate); d.setFullYear(d.getFullYear() - 1); targetStart = d.toISOString().split('T')[0] }
        if (endDate) { const d = new Date(endDate); d.setFullYear(d.getFullYear() - 1); targetEnd = d.toISOString().split('T')[0] }

        const filteredComp = comparisonReviews.filter(r => {
            if (filterSource !== 'All' && r.source !== filterSource) return false
            if (filterStatus !== 'All' && r.status !== filterStatus) return false
            // Score comparison? Yes.
            if (filterScore !== 'All') {
                if (filterScore === '9' && r.rating < 9) return false
                if (filterScore === '7' && (r.rating < 7 || r.rating >= 9)) return false
                if (filterScore === '6' && r.rating >= 7) return false
            }
            if (targetStart && r.date < targetStart) return false
            if (targetEnd && r.date > targetEnd) return false
            return true
        })

        const total = filteredComp.length
        const replied = filteredComp.filter(r => r.status === 'replied').length
        const responseRate = total > 0 ? Math.round((replied / total) * 100) : 0
        const avgScore = total > 0 ? filteredComp.reduce((a, b) => a + b.rating, 0) / total : 0

        return { total, responseRate, avgScore }
    }, [comparisonReviews, filterSource, filterStatus, filterScore, startDate, endDate])


    // Dynamic Metrics Calculation
    const metrics = useMemo(() => {
        const total = filteredReviews.length
        const replied = filteredReviews.filter(r => r.status === 'replied').length
        const pending = total - replied
        const responseRate = total > 0 ? Math.round((replied / total) * 100) : 0
        const avgScore = total > 0 ? filteredReviews.reduce((a, b) => a + b.rating, 0) / total : 0

        // Avg Response Time
        let totalTime = 0
        let replyCount = 0
        filteredReviews.forEach(r => {
            if (r.replyDate && r.date) {
                const start = new Date(r.date).getTime()
                const end = new Date(r.replyDate).getTime()
                const diff = end - start
                if (diff > 0) {
                    totalTime += diff
                    replyCount++
                }
            }
        })
        const avgResponseTimeHours = replyCount > 0 ? Math.round((totalTime / replyCount) / 3600000) : 0

        return { total, replied, pending, responseRate, avgResponseTimeHours, avgScore }
    }, [filteredReviews])

    const handleAIAnalysis = async () => {
        setAnalyzing(true)
        try {
            const res = await fetch('/api/admin/ai-interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    widgetId: 'guest-reviews',
                    data: filteredReviews.slice(0, 50),
                    locale: 'tr'
                })
            })
            const data = await res.json()
            setAnalysisResult(data.analysis)
        } catch (error) {
            console.error('AI Analysis failed:', error)
        } finally {
            setAnalyzing(false)
        }
    }

    const handlePdfExport = async () => {
        if (!contentRef.current) return
        await exportPdf({
            element: contentRef.current,
            filename: `crm-yorumlar-${startDate}-${endDate}`,
            title: 'CRM — Misafir Yorumları',
            subtitle: `${startDate} → ${endDate} | ${filteredReviews.length} yorum`,
            orientation: 'landscape',
            onStart: () => setPdfExporting(true),
            onFinish: () => setPdfExporting(false),
        })
    }

    // Trend Helper
    const Trend = ({ current, prev, isPercent = false, inverse = false }: { current: number, prev?: number, isPercent?: boolean, inverse?: boolean }) => {
        if (prev === undefined || prev === 0) return null
        const diff = isPercent ? current - prev : ((current - prev) / prev) * 100
        const isPos = diff >= 0
        // For response time, lower is better (inverse)
        // For score/count/rate, higher is better
        const isGood = inverse ? !isPos : isPos
        return (
            <span className={`text-xs ml-2 font-medium flex items-center ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPos ? <ChevronUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(diff).toFixed(1)}%
            </span>
        )
    }



    return (
        <div ref={contentRef} className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Yorum</p>
                            <div className="flex items-center">
                                <h3 className="text-2xl font-bold">{metrics.total}</h3>
                                {compMetrics && <Trend current={metrics.total} prev={compMetrics.total} />}
                            </div>
                        </div>
                        <MessageSquare className="h-5 w-5 text-blue-400" />
                    </div>
                </Card>
                <Card className="p-4 bg-slate-800 border-slate-700 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Yanıt Oranı</p>
                            <div className="flex items-center">
                                <h3 className="text-2xl font-bold">{metrics.responseRate}%</h3>
                                {compMetrics && <Trend current={metrics.responseRate} prev={compMetrics.responseRate} isPercent={true} />}
                            </div>
                        </div>
                        <div className={`h-2 w-full mt-2 bg-slate-600 rounded-full overflow-hidden`}>
                            <div
                                className={`h-full ${metrics.responseRate > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                style={{ width: `${metrics.responseRate}%` }}
                            />
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-slate-800 border-slate-700 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Ort. Yanıt Süresi</p>
                            <h3 className="text-2xl font-bold">{metrics.avgResponseTimeHours}h</h3>
                        </div>
                        <Clock className="h-5 w-5 text-orange-400" />
                    </div>
                </Card>
                <Card className="p-4 bg-slate-800 border-slate-700 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Ort. Puan</p>
                            <div className="flex items-center gap-1">
                                <h3 className="text-2xl font-bold">
                                    {metrics.avgScore.toFixed(1)}
                                </h3>
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                {compMetrics && <Trend current={metrics.avgScore} prev={compMetrics.avgScore} />}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ─── CRM Visualization Charts ─── */}
            <div className="space-y-4">
                {/* Row 1: Comment Count + Sentiment Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="p-5 bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <MessageSquare size={16} className="text-cyan-400" /> Yorum Sayısı Trendi
                        </h3>
                        <CommentCountChart reviews={filteredReviews} />
                    </Card>
                    <Card className="p-5 bg-slate-800/60 border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <Star size={16} className="text-yellow-400" /> Puan Trendi
                        </h3>
                        <SentimentTrendChart reviews={filteredReviews} />
                    </Card>
                </div>

                {/* Row 2: Mecra Distribution + Sentiment Donut */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="p-5 bg-slate-800/60 border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">📊 Mecra Dağılımı</h3>
                        <MecraDistributionChart reviews={filteredReviews} />
                    </Card>
                    <Card className="p-5 bg-slate-800/60 border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">🎯 Duygu Analizi</h3>
                        <SentimentDonutChart reviews={filteredReviews} />
                    </Card>
                </div>

                {/* Row 3: Top Topics + Complaint Topics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="p-5 bg-slate-800/60 border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <ThumbsUp size={16} className="text-emerald-400" /> En Beğenilen Konular
                        </h3>
                        <TopTopicsChart reviews={filteredReviews} />
                    </Card>
                    <Card className="p-5 bg-slate-800/60 border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <ThumbsDown size={16} className="text-red-400" /> Şikayet Edilen Konular
                        </h3>
                        <ComplaintTopicsChart reviews={filteredReviews} />
                    </Card>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap gap-2 items-center">
                    <Filter className="h-4 w-4 text-slate-400" />

                    {/* Date Pickers */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 border border-slate-200 dark:border-slate-700">
                        <input
                            type="date"
                            className="bg-transparent text-white text-sm outline-none w-32 min-h-[44px] [color-scheme:dark]"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-slate-500">-</span>
                        <input
                            type="date"
                            className="bg-transparent text-white text-sm outline-none w-32 min-h-[44px] [color-scheme:dark]"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <select
                        className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded px-2 py-1 text-sm"
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                    >
                        <option value="All">Tüm Mecralar</option>
                        <option value="Google">Google</option>
                        <option value="Booking.com">Booking.com</option>
                        <option value="TripAdvisor">TripAdvisor</option>
                        <option value="Survey">Anket</option>
                        <option value="Direct">Direkt</option>
                    </select>
                    <select
                        className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded px-2 py-1 text-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">Tüm Durumlar</option>
                        <option value="replied">Yanıtlandı</option>
                        <option value="pending">Beklemede</option>
                    </select>

                    <select
                        className="bg-slate-800 border-slate-700 text-white rounded px-2 py-1 text-sm"
                        value={filterScore}
                        onChange={(e) => setFilterScore(e.target.value)}
                    >
                        <option value="All">Tüm Puanlar</option>
                        <option value="9">Mükemmel (9-10)</option>
                        <option value="7">İyi (7-8)</option>
                        <option value="6">Geliştirilmeli (0-6)</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleAIAnalysis}
                        disabled={analyzing}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <Bot className="mr-2 h-4 w-4" />
                        {analyzing ? 'Analiz ediliyor...' : 'AI SWOT Analizi'}
                    </Button>
                    <button onClick={handlePdfExport} disabled={pdfExporting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                        <FileDown size={16} className={pdfExporting ? 'animate-pulse' : ''} />
                        {pdfExporting ? 'PDF...' : 'PDF'}
                    </button>
                </div>
            </div>

            {/* AI Result */}
            {analysisResult && (
                <Card className="p-6 bg-purple-50 dark:bg-slate-800/50 border-purple-200 dark:border-purple-500/30 text-slate-800 dark:text-slate-200">
                    <h4 className="text-lg font-semibold text-purple-400 mb-2 flex items-center gap-2">
                        <Bot className="h-5 w-5" /> AI Analizi
                    </h4>
                    <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-line">{analysisResult}</p>
                    </div>
                </Card>
            )}

            {/* Reviews Table */}
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-600 dark:text-slate-400">Tarih</TableHead>
                            <TableHead className="text-slate-600 dark:text-slate-400">Misafir / Oda</TableHead>
                            <TableHead className="text-slate-600 dark:text-slate-400">Puan</TableHead>
                            <TableHead className="text-slate-600 dark:text-slate-400">Yorum</TableHead>
                            <TableHead className="text-slate-600 dark:text-slate-400">Kaynak</TableHead>
                            <TableHead className="text-slate-600 dark:text-slate-400">Durum</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReviews.map((review) => {
                            const isExpanded = expandedIds.has(review.id)
                            return (
                                <TableRow
                                    key={review.id}
                                    className={`border-slate-800 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-800/70' : 'hover:bg-slate-800/50'}`}
                                    onClick={() => toggleExpand(review.id)}
                                >
                                    <TableCell className="text-slate-300 font-medium">
                                        {review.date}
                                    </TableCell>
                                    <TableCell className="text-slate-300">
                                        <div className="font-semibold">{review.guestName}</div>
                                        <div className="text-xs text-slate-500">Oda {review.roomNumber}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`${review.rating >= 9 ? 'border-green-500 text-green-500' :
                                            review.rating >= 7 ? 'border-yellow-500 text-yellow-500' :
                                                'border-red-500 text-red-500'
                                            }`}>
                                            {review.rating}/10
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-300 max-w-md">
                                        {isExpanded ? (
                                            <div className="space-y-2 py-1">
                                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{review.comment}</p>
                                                {review.reply && (
                                                    <div className="bg-blue-900/20 border-l-2 border-blue-500 pl-3 py-2 rounded-r">
                                                        <p className="text-xs text-blue-300 font-medium mb-1">↩ Yanıt:</p>
                                                        <p className="text-xs text-blue-200 whitespace-pre-wrap">{review.reply}</p>
                                                        {review.replyDate && <p className="text-[10px] text-blue-400/60 mt-1">{review.replyDate}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <p className="truncate text-sm" title={review.comment}>{review.comment}</p>
                                                {review.reply && (
                                                    <p className="text-xs text-blue-400 mt-1 truncate">↩ {review.reply}</p>
                                                )}
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                                            {review.source}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`${review.status === 'replied' ? 'bg-green-900/50 text-green-400 hover:bg-green-900/70' :
                                                'bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900/70'
                                                }`}>
                                                {review.status === 'replied' ? 'Yanıtlandı' : 'Beklemede'}
                                            </Badge>
                                            {isExpanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
