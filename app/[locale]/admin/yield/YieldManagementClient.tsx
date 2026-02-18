'use client'

import React, { useState, useMemo, useRef } from 'react'
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts'
import {
    TrendingUp, RefreshCw, BarChart3, PieChart as PieIcon,
    Globe2, DollarSign, BedDouble, Calendar, Sparkles, ChevronDown, ChevronUp,
    AlertTriangle, Clock, Database, CalendarRange, FileDown
} from 'lucide-react'
import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'
import { exportPdf } from '@/lib/export-pdf'

// ─── Types ────────────────────────────────────────────────────

interface ReservationSlim {
    id: number
    checkIn: string
    checkOut: string
    nights: number
    roomCount: number
    totalPrice: number
    currency: string
    channel: string
    agency: string
    nationality: string
    dailyAverage: number
    roomType: string
    status: string
    lastUpdate: string
}

interface CacheStatus {
    lastUpdated: string | null
    isStale: boolean
    nextRefresh: string | null
    reservationCount: number
    ttlMinutes: number
}

interface Props {
    locale?: string
    data: {
        currentYear: number
        currentYearReservations: ReservationSlim[]
        prevYearReservations: ReservationSlim[]
        allReservations: ReservationSlim[]
        exchangeRates: { EUR_TO_TRY: number; USD_TO_TRY: number }
        cacheStatus: CacheStatus
    }
    error?: string
}

// ─── Helpers ──────────────────────────────────────────────────

function toEUR(amount: number, currency: string, rates: { EUR_TO_TRY: number; USD_TO_TRY: number }): number {
    if (currency === 'EUR') return amount
    if (currency === 'TRY') return rates.EUR_TO_TRY > 0 ? amount / rates.EUR_TO_TRY : 0
    if (currency === 'USD') return rates.USD_TO_TRY > 0 ? (amount / rates.USD_TO_TRY) * (rates.USD_TO_TRY / rates.EUR_TO_TRY) : 0
    return rates.EUR_TO_TRY > 0 ? amount / rates.EUR_TO_TRY : 0
}

function toTRY(amount: number, currency: string, rates: { EUR_TO_TRY: number; USD_TO_TRY: number }): number {
    if (currency === 'TRY') return amount
    if (currency === 'EUR') return amount * rates.EUR_TO_TRY
    if (currency === 'USD') return amount * rates.USD_TO_TRY
    return amount * rates.EUR_TO_TRY
}

function fmt(n: number, d = 0): string { return n.toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d }) }
function fmtEur(n: number): string { return `€${fmt(Math.round(n))}` }
function fmtTry(n: number): string { return `₺${fmt(Math.round(n))}` }

type SeasonType = 'HIGH' | 'SHOULDER' | 'LOW' | 'OFF'
function getSeason(month: number): SeasonType {
    if ([6, 7].includes(month)) return 'HIGH'
    if ([5, 8].includes(month)) return 'SHOULDER'
    if ([3, 4, 9, 10].includes(month)) return 'LOW'
    return 'OFF'
}
const SEASON_COLORS: Record<SeasonType, string> = { HIGH: '#ef4444', SHOULDER: '#f59e0b', LOW: '#3b82f6', OFF: '#94a3b8' }
const SEASON_LABELS: Record<SeasonType, string> = { HIGH: 'Yüksek', SHOULDER: 'Omuz', LOW: 'Düşük', OFF: 'Kapalı' }
const CHANNEL_COLORS: Record<string, string> = {
    'OTA': '#f59e0b', 'Call Center': '#0ea5e9', 'Tur Operatörü': '#8b5cf6',
    'Direkt': '#10b981', 'Website': '#ec4899',
}

import ModuleOffline from '@/components/admin/ModuleOffline'

// ─── Component ────────────────────────────────────────────────

export default function YieldManagementClient({ locale, data, error }: Props) {
    const hasData = data && data.allReservations && data.allReservations.length > 0;

    if (error || !hasData) {
        return <ModuleOffline moduleName="Yield Management" dataSource="elektra" offlineReason={error || "Elektra PMS verisi alınamadı veya veritabanı boş."} />
    }

    const { currentYear, currentYearReservations, prevYearReservations, allReservations, exchangeRates, cacheStatus } = data
    const t = getAdminTranslations((locale || 'tr') as AdminLocale)
    const SEASON_LABELS_I18N: Record<SeasonType, string> = { HIGH: t.seasonHigh, SHOULDER: t.seasonShoulder, LOW: t.seasonLow, OFF: t.seasonOff }

    const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'agencies' | 'pricing' | 'ai'>('overview')
    const [currency, setCurrency] = useState<'EUR' | 'TRY'>('EUR')
    const [refreshing, setRefreshing] = useState(false)
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [expandedAgency, setExpandedAgency] = useState<string | null>(null)
    const [pdfExporting, setPdfExporting] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    // ─── Date Range State ─────────────────────────────────────
    const now = new Date()
    const [datePreset, setDatePreset] = useState<'month' | 'season' | 'year' | 'custom'>('year')
    const [customStart, setCustomStart] = useState(`${currentYear}-01-01`)
    const [customEnd, setCustomEnd] = useState(`${currentYear}-12-31`)

    const dateRange = useMemo(() => {
        if (datePreset === 'custom') return { start: customStart, end: customEnd }
        const y = currentYear
        if (datePreset === 'month') {
            const m = now.getMonth()
            const start = `${y}-${String(m + 1).padStart(2, '0')}-01`
            const lastDay = new Date(y, m + 1, 0).getDate()
            const end = `${y}-${String(m + 1).padStart(2, '0')}-${lastDay}`
            return { start, end }
        }
        if (datePreset === 'season') {
            return { start: `${y}-04-01`, end: `${y}-10-31` }
        }
        return { start: `${y}-01-01`, end: `${y}-12-31` }
    }, [datePreset, customStart, customEnd, currentYear]) // eslint-disable-line react-hooks/exhaustive-deps

    // Filter reservations by selected date range
    const filteredReservations = useMemo(() => {
        return currentYearReservations.filter(r => {
            const ci = r.checkIn?.slice(0, 10)
            return ci >= dateRange.start && ci <= dateRange.end
        })
    }, [currentYearReservations, dateRange])

    // Filter prev year for comparison
    const filteredPrevReservations = useMemo(() => {
        const prevStart = dateRange.start.replace(String(currentYear), String(currentYear - 1))
        const prevEnd = dateRange.end.replace(String(currentYear), String(currentYear - 1))
        return prevYearReservations.filter(r => {
            const ci = r.checkIn?.slice(0, 10)
            return ci >= prevStart && ci <= prevEnd
        })
    }, [prevYearReservations, dateRange, currentYear])

    const convert = (amount: number, cur: string) =>
        currency === 'EUR' ? toEUR(amount, cur, exchangeRates) : toTRY(amount, cur, exchangeRates)
    const fmtC = (n: number) => currency === 'EUR' ? fmtEur(n) : fmtTry(n)

    // ─── Aggregations ─────────────────────────────────────────

    const stats = useMemo(() => {
        const res = filteredReservations
        const totalRoomNights = res.reduce((s, r) => s + r.nights * r.roomCount, 0)
        const totalRevenue = res.reduce((s, r) => s + convert(r.totalPrice, r.currency), 0)
        const resCount = res.length
        const adr = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0
        const avgBookingValue = resCount > 0 ? totalRevenue / resCount : 0
        // ADB: average daily board — revenue per reservation per night
        const totalNightsOnly = res.reduce((s, r) => s + r.nights, 0)
        const adb = totalNightsOnly > 0 ? totalRevenue / totalNightsOnly : 0

        // Previous year (same date range window)
        const prevRevenue = filteredPrevReservations.reduce((s, r) => s + convert(r.totalPrice, r.currency), 0)
        const prevRN = filteredPrevReservations.reduce((s, r) => s + r.nights * r.roomCount, 0)
        const prevAdr = prevRN > 0 ? prevRevenue / prevRN : 0

        return { totalRoomNights, totalRevenue, resCount, adr, avgBookingValue, adb, prevRevenue, prevRN, prevAdr }
    }, [filteredReservations, filteredPrevReservations, currency]) // eslint-disable-line react-hooks/exhaustive-deps

    // Channel breakdown
    const channelData = useMemo(() => {
        const map = new Map<string, { count: number; revenue: number; roomNights: number }>()
        for (const r of filteredReservations) {
            if (!map.has(r.channel)) map.set(r.channel, { count: 0, revenue: 0, roomNights: 0 })
            const e = map.get(r.channel)!
            e.count += 1
            e.revenue += convert(r.totalPrice, r.currency)
            e.roomNights += r.nights * r.roomCount
        }
        const total = filteredReservations.length || 1
        return Array.from(map.entries())
            .map(([name, d]) => ({
                name,
                count: d.count,
                pct: Math.round((d.count / total) * 100),
                revenue: d.revenue,
                roomNights: d.roomNights,
                adr: d.roomNights > 0 ? d.revenue / d.roomNights : 0,
                color: CHANNEL_COLORS[name] || '#64748b',
            }))
            .sort((a, b) => b.revenue - a.revenue)
    }, [filteredReservations, currency]) // eslint-disable-line react-hooks/exhaustive-deps

    // Agency deep-dive (country-based)
    const agencyData = useMemo(() => {
        const map = new Map<string, {
            agency: string
            country: string
            count: number
            revenue: number
            roomNights: number
            prices: number[]
            channel: string
        }>()
        for (const r of filteredReservations) {
            const key = r.agency
            if (!map.has(key)) {
                map.set(key, {
                    agency: r.agency,
                    country: r.nationality || 'Unknown',
                    count: 0, revenue: 0, roomNights: 0, prices: [],
                    channel: r.channel
                })
            }
            const e = map.get(key)!
            e.count += 1
            e.revenue += convert(r.totalPrice, r.currency)
            e.roomNights += r.nights * r.roomCount
            e.prices.push(convert(r.dailyAverage, r.currency))
        }
        return Array.from(map.values())
            .map(d => ({
                ...d,
                avgPrice: d.prices.length > 0 ? d.prices.reduce((s, p) => s + p, 0) / d.prices.length : 0,
                adr: d.roomNights > 0 ? d.revenue / d.roomNights : 0,
            }))
            .sort((a, b) => b.revenue - a.revenue)
    }, [filteredReservations, currency]) // eslint-disable-line react-hooks/exhaustive-deps

    // Monthly price trend
    const monthlyData = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => ({
            month: i,
            label: t.monthNames[i],
            roomNights: 0, revenue: 0, count: 0, season: getSeason(i),
        }))

        for (const r of filteredReservations) {
            const m = parseInt(r.checkIn.slice(5, 7)) - 1
            if (m >= 0 && m < 12) {
                months[m].roomNights += r.nights * r.roomCount
                months[m].revenue += convert(r.totalPrice, r.currency)
                months[m].count += 1
            }
        }

        return months.map(m => ({
            ...m,
            adr: m.roomNights > 0 ? Math.round(m.revenue / m.roomNights) : 0,
            avgBooking: m.count > 0 ? Math.round(m.revenue / m.count) : 0,
            seasonLabel: SEASON_LABELS_I18N[m.season],
            seasonColor: SEASON_COLORS[m.season],
        }))
    }, [filteredReservations, currency, t]) // eslint-disable-line react-hooks/exhaustive-deps

    // Price-volume scatter data (per channel)
    const scatterData = useMemo(() => {
        return filteredReservations.map(r => ({
            x: convert(r.dailyAverage, r.currency), // price (ADR per reservation)
            y: r.nights * r.roomCount, // room nights
            z: convert(r.totalPrice, r.currency), // total revenue (bubble size)
            channel: r.channel,
            agency: r.agency,
            color: CHANNEL_COLORS[r.channel] || '#64748b',
        }))
    }, [filteredReservations, currency]) // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Manual Refresh ───────────────────────────────────────

    const handleRefresh = async () => {
        setRefreshing(true)
        try {
            await fetch('/api/admin/elektra-cache', { method: 'POST' })
            window.location.reload()
        } catch {
            alert('Cache yenileme başarısız')
        }
        setRefreshing(false)
    }

    // ─── AI Analysis ──────────────────────────────────────────

    const handleAiAnalysis = async () => {
        setAiLoading(true)
        try {
            const payload = {
                year: currentYear,
                channelBreakdown: channelData.map(c => ({ name: c.name, pct: c.pct, revenue: Math.round(c.revenue), adr: Math.round(c.adr), roomNights: c.roomNights })),
                monthlyAdr: monthlyData.filter(m => m.adr > 0).map(m => ({ month: m.label, adr: m.adr, roomNights: m.roomNights, season: m.seasonLabel })),
                topAgencies: agencyData.slice(0, 15).map(a => ({ agency: a.agency, country: a.country, revenue: Math.round(a.revenue), adr: Math.round(a.adr), roomNights: a.roomNights })),
                totals: { roomNights: stats.totalRoomNights, revenue: Math.round(stats.totalRevenue), adr: Math.round(stats.adr), resCount: stats.resCount },
                currency,
            }
            const res = await fetch('/api/admin/yield-analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            const data = await res.json()
            setAiAnalysis(data.analysis || 'Analiz alınamadı.')
        } catch {
            setAiAnalysis('AI analizi şu anda kullanılamıyor.')
        }
        setAiLoading(false)
    }

    // ─── PDF Export ──────────────────────────────────────────

    const handlePdfExport = async () => {
        if (!contentRef.current) return
        await exportPdf({
            element: contentRef.current,
            filename: `yield-management-${currentYear}`,
            title: `${t.yieldTitle} — ${currentYear}`,
            subtitle: `${dateRange.start} → ${dateRange.end} | ${currency}`,
            orientation: 'landscape',
            onStart: () => setPdfExporting(true),
            onFinish: () => setPdfExporting(false),
        })
    }

    // ─── UI ───────────────────────────────────────────────────

    const tabs = [
        { key: 'overview', label: t.tabOverview, icon: BarChart3 },
        { key: 'channels', label: t.tabChannels, icon: PieIcon },
        { key: 'agencies', label: t.tabAgencies, icon: Globe2 },
        { key: 'pricing', label: t.tabPricing, icon: DollarSign },
        { key: 'ai', label: t.tabAi, icon: Sparkles },
    ] as const

    const diffPct = (curr: number, prev: number) => {
        if (prev === 0) return '-'
        const diff = ((curr - prev) / prev) * 100
        const sign = diff > 0 ? '+' : ''
        return `${sign}${diff.toFixed(1)}%`
    }

    return (
        <div ref={contentRef} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <TrendingUp className="text-emerald-600" size={32} />
                        {t.yieldTitle}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t.yieldSubtitle} — {currentYear}</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Cache Status */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        <Database size={14} />
                        <span>
                            {cacheStatus.lastUpdated
                                ? `${t.lastUpdate}: ${new Date(cacheStatus.lastUpdated).toLocaleTimeString(locale || 'tr-TR')}`
                                : t.cacheEmpty}
                        </span>
                        {cacheStatus.isStale && (
                            <span className="text-amber-500 flex items-center gap-1">
                                <AlertTriangle size={12} /> {t.stale}
                            </span>
                        )}
                    </div>

                    {/* Manual Refresh */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? t.refreshing : t.refresh}
                    </button>

                    {/* PDF Export */}
                    <button
                        onClick={handlePdfExport}
                        disabled={pdfExporting}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <FileDown size={16} className={pdfExporting ? 'animate-pulse' : ''} />
                        {pdfExporting ? 'PDF...' : 'PDF'}
                    </button>

                    {/* Date Range Picker */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <CalendarRange size={14} className="text-gray-500 dark:text-gray-400 ml-2" />
                        {(['month', 'season', 'year'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setDatePreset(p)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${datePreset === p ? 'bg-emerald-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                {p === 'month' ? t.thisMonth : p === 'season' ? t.thisSeason : t.thisYear}
                            </button>
                        ))}
                        <button
                            onClick={() => setDatePreset('custom')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${datePreset === 'custom' ? 'bg-emerald-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            {t.custom}
                        </button>
                    </div>
                    {datePreset === 'custom' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={customStart}
                                onChange={e => setCustomStart(e.target.value)}
                                className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300"
                            />
                            <span className="text-gray-400 text-xs">–</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={e => setCustomEnd(e.target.value)}
                                className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300"
                            />
                        </div>
                    )}

                    {/* Currency Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        {(['EUR', 'TRY'] as const).map(c => (
                            <button
                                key={c}
                                onClick={() => setCurrency(c)}
                                className={`px-3 py-2 text-sm font-bold transition-colors ${currency === c ? 'bg-emerald-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                {c === 'EUR' ? '€ EUR' : '₺ TRY'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'}`}
                    >
                        <t.icon size={16} />
                        <span className="hidden md:inline">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* ─── Overview Tab ─────────────────────────────────────── */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { label: 'Rezervasyon', value: fmt(stats.resCount), sub: `${currentYear}`, icon: Calendar },
                            { label: 'Room Night', value: fmt(stats.totalRoomNights), sub: `Toplam`, icon: BedDouble },
                            { label: 'Gelir', value: fmtC(stats.totalRevenue), sub: diffPct(stats.totalRevenue, stats.prevRevenue), icon: DollarSign },
                            { label: 'ADR', value: fmtC(stats.adr), sub: diffPct(stats.adr, stats.prevAdr), icon: TrendingUp },
                            { label: 'ADB', value: fmtC(stats.adb), sub: 'Gece Başına', icon: BedDouble },
                            { label: 'Ort. Rez.', value: fmtC(stats.avgBookingValue), sub: 'Rez. Başına', icon: BarChart3 },
                        ].map((kpi, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <kpi.icon size={16} className="text-emerald-600" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{kpi.label}</span>
                                </div>
                                <p className="text-xl font-black text-gray-900 dark:text-white">{kpi.value}</p>
                                <p className={`text-xs mt-1 ${kpi.sub?.startsWith('+') ? 'text-green-600' : kpi.sub?.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
                                    {kpi.sub}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Monthly ADR + Room Nights Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.monthlyAdrRoomNight}</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="label" fontSize={12} />
                                <YAxis yAxisId="left" fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                                <Tooltip
                                    content={({ payload, label }) => {
                                        if (!payload?.length) return null
                                        const d = payload[0]?.payload
                                        return (
                                            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border text-sm">
                                                <p className="font-bold">{label} <span className="text-xs ml-1" style={{ color: d?.seasonColor }}>({d?.seasonLabel})</span></p>
                                                <p>ADR: {fmtC(d?.adr || 0)}</p>
                                                <p>Room Night: {fmt(d?.roomNights || 0)}</p>
                                                <p>Rez: {fmt(d?.count || 0)}</p>
                                            </div>
                                        )
                                    }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="roomNights" name="Room Night" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="adr" name={`ADR (${currency})`} stroke="#ef4444" strokeWidth={3} dot={{ r: 5, fill: '#ef4444' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ─── Channels Tab ────────────────────────────────────── */}
            {activeTab === 'channels' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.channelDist}</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={channelData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(props: any) => `${props.name} ${props.pct}%`} labelLine={false}>
                                        {channelData.map((c, i) => <Cell key={i} fill={c.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: any, name: any) => [fmt(Number(value)), name]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Revenue Bar */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.channelRevenue}</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={channelData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" fontSize={12} />
                                    <YAxis type="category" dataKey="name" width={100} fontSize={12} />
                                    <Tooltip formatter={(value: any) => fmtC(Number(value))} />
                                    <Bar dataKey="revenue" name="Gelir" radius={[0, 4, 4, 0]}>
                                        {channelData.map((c, i) => <Cell key={i} fill={c.color} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Channel Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left p-4 font-bold text-gray-600 dark:text-gray-300">Kanal</th>
                                    <th className="text-right p-4 font-bold text-gray-600 dark:text-gray-300">Rez.</th>
                                    <th className="text-right p-4 font-bold text-gray-600 dark:text-gray-300">%</th>
                                    <th className="text-right p-4 font-bold text-gray-600 dark:text-gray-300">Room Night</th>
                                    <th className="text-right p-4 font-bold text-gray-600 dark:text-gray-300">Gelir</th>
                                    <th className="text-right p-4 font-bold text-gray-600 dark:text-gray-300">ADR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {channelData.map((c, i) => (
                                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></span>
                                            {c.name}
                                        </td>
                                        <td className="text-right p-4 text-gray-700 dark:text-gray-300">{fmt(c.count)}</td>
                                        <td className="text-right p-4 text-gray-500 dark:text-gray-400">%{c.pct}</td>
                                        <td className="text-right p-4 text-gray-700 dark:text-gray-300">{fmt(c.roomNights)}</td>
                                        <td className="text-right p-4 font-bold text-emerald-600">{fmtC(c.revenue)}</td>
                                        <td className="text-right p-4 font-semibold text-gray-900 dark:text-white">{fmtC(c.adr)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── Agencies Tab ────────────────────────────────────── */}
            {activeTab === 'agencies' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.agencyAnalysis}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{agencyData.length} acenta • sıralama: gelire göre</p>
                        </div>

                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left p-3 font-bold text-gray-600 dark:text-gray-300">Acenta</th>
                                    <th className="text-left p-3 font-bold text-gray-600 dark:text-gray-300">Kanal</th>
                                    <th className="text-left p-3 font-bold text-gray-600 dark:text-gray-300">Ülke</th>
                                    <th className="text-right p-3 font-bold text-gray-600 dark:text-gray-300">Rez.</th>
                                    <th className="text-right p-3 font-bold text-gray-600 dark:text-gray-300">R.Night</th>
                                    <th className="text-right p-3 font-bold text-gray-600 dark:text-gray-300">Gelir</th>
                                    <th className="text-right p-3 font-bold text-gray-600 dark:text-gray-300">Ort. Fiyat</th>
                                    <th className="text-right p-3 font-bold text-gray-600 dark:text-gray-300">ADR</th>
                                    <th className="text-center p-3 font-bold text-gray-600 dark:text-gray-300"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {agencyData.slice(0, 30).map((a, i) => (
                                    <React.Fragment key={i}>
                                        <tr
                                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
                                            onClick={() => setExpandedAgency(expandedAgency === a.agency ? null : a.agency)}
                                        >
                                            <td className="p-3 font-medium text-gray-900 dark:text-white text-xs">{a.agency}</td>
                                            <td className="p-3">
                                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${CHANNEL_COLORS[a.channel] || '#64748b'}20`, color: CHANNEL_COLORS[a.channel] || '#64748b' }}>
                                                    {a.channel}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-600 dark:text-gray-400 text-xs">{a.country}</td>
                                            <td className="text-right p-3 text-gray-700 dark:text-gray-300">{fmt(a.count)}</td>
                                            <td className="text-right p-3 text-gray-700 dark:text-gray-300">{fmt(a.roomNights)}</td>
                                            <td className="text-right p-3 font-bold text-emerald-600">{fmtC(a.revenue)}</td>
                                            <td className="text-right p-3 text-gray-700 dark:text-gray-300">{fmtC(a.avgPrice)}</td>
                                            <td className="text-right p-3 font-semibold text-gray-900 dark:text-white">{fmtC(a.adr)}</td>
                                            <td className="text-center p-3">
                                                {expandedAgency === a.agency ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </td>
                                        </tr>
                                        {expandedAgency === a.agency && (
                                            <tr>
                                                <td colSpan={9} className="bg-gray-50 dark:bg-gray-900/50 p-4">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">{t.totalRevLabel}</span>
                                                            <p className="text-lg font-black text-emerald-600">{fmtC(a.revenue)}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">{t.avgStayNights}</span>
                                                            <p className="text-lg font-black text-gray-900 dark:text-white">{a.count > 0 ? (a.roomNights / a.count).toFixed(1) : 0} gece</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">{t.revenueShare}</span>
                                                            <p className="text-lg font-black text-blue-600">%{stats.totalRevenue > 0 ? ((a.revenue / stats.totalRevenue) * 100).toFixed(1) : 0}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">{t.roomNightShare}</span>
                                                            <p className="text-lg font-black text-purple-600">%{stats.totalRoomNights > 0 ? ((a.roomNights / stats.totalRoomNights) * 100).toFixed(1) : 0}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── Pricing Tab ─────────────────────────────────────── */}
            {activeTab === 'pricing' && (
                <div className="space-y-6">
                    {/* Price-Volume Scatter */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.priceVolumeMatrix}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Her nokta bir rezervasyon: X = gecelik ortalama fiyat, Y = room nights</p>
                        <ResponsiveContainer width="100%" height={400}>
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" dataKey="x" name={`Fiyat (${currency})`} fontSize={12} />
                                <YAxis type="number" dataKey="y" name="Room Night" fontSize={12} />
                                <ZAxis type="number" dataKey="z" range={[20, 400]} />
                                <Tooltip
                                    content={({ payload }) => {
                                        if (!payload?.length) return null
                                        const d = payload[0]?.payload as any
                                        return (
                                            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border text-sm">
                                                <p className="font-bold">{d.agency}</p>
                                                <p>Kanal: {d.channel}</p>
                                                <p>Fiyat: {fmtC(d.x)}/gece</p>
                                                <p>Room Night: {d.y}</p>
                                                <p>Toplam: {fmtC(d.z)}</p>
                                            </div>
                                        )
                                    }}
                                />
                                {Object.entries(CHANNEL_COLORS).map(([ch, color]) => (
                                    <Scatter
                                        key={ch}
                                        name={ch}
                                        data={scatterData.filter(d => d.channel === ch)}
                                        fill={color}
                                        opacity={0.7}
                                    />
                                ))}
                                <Legend />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly ADR by Season */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.periodAdrComparison}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="label" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip formatter={(value: any) => fmtC(Number(value))} />
                                <Bar dataKey="adr" name={`ADR (${currency})`} radius={[4, 4, 0, 0]}>
                                    {monthlyData.map((d, i) => <Cell key={i} fill={d.seasonColor} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex gap-4 justify-center mt-3">
                            {(['HIGH', 'SHOULDER', 'LOW', 'OFF'] as SeasonType[]).map(s => (
                                <span key={s} className="flex items-center gap-1 text-xs">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SEASON_COLORS[s] }}></span>
                                    {SEASON_LABELS[s]}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── AI Tab ──────────────────────────────────────────── */}
            {activeTab === 'ai' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="text-purple-600" size={20} /> {t.aiPriceEval}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.aiPriceDesc}</p>
                            </div>
                            <button
                                onClick={handleAiAnalysis}
                                disabled={aiLoading}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm px-6 py-3 rounded-lg transition-all disabled:opacity-50 shadow-lg"
                            >
                                <Sparkles size={16} className={aiLoading ? 'animate-pulse' : ''} />
                                {aiLoading ? t.analyzing : t.startAnalysis}
                            </button>
                        </div>

                        {/* Summary Cards for AI context */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{t.totalRevLabel}</span>
                                <p className="text-lg font-black text-emerald-600">{fmtC(stats.totalRevenue)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{t.avgAdr}</span>
                                <p className="text-lg font-black text-blue-600">{fmtC(stats.adr)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{t.roomNightLabel}</span>
                                <p className="text-lg font-black text-purple-600">{fmt(stats.totalRoomNights)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{t.channelCount}</span>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{channelData.length}</p>
                            </div>
                        </div>

                        {/* AI Response */}
                        {aiAnalysis && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                    {aiAnalysis}
                                </div>
                            </div>
                        )}

                        {!aiAnalysis && !aiLoading && (
                            <div className="text-center py-12 text-gray-400">
                                <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
                                <p>AI analizi için yukarıdaki butona tıklayın</p>
                                <p className="text-xs mt-1">Mevcut verileriniz Gemini modeli ile değerlendirilecektir</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
