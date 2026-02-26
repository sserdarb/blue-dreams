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
import Link from 'next/link'

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
    const trans = getAdminTranslations((locale || 'tr') as AdminLocale)
    // yieldPage doesn't exist in translations yet — use trans directly + inline defaults
    const t = {
        seasonHigh: trans.seasonHigh, seasonShoulder: trans.seasonShoulder,
        seasonLow: trans.seasonLow, seasonOff: trans.seasonOff,
        title: 'Yield Management', subtitle: 'Revenue & Price Optimization',
        overview: locale === 'tr' ? 'Genel Bakış' : 'Overview',
        channels: locale === 'tr' ? 'Kanallar' : 'Channels',
        agencies: locale === 'tr' ? 'Acentalar' : 'Agencies',
        pricing: locale === 'tr' ? 'Fiyatlama' : 'Pricing',
        ai: 'AI Analiz',
        lastUpdate: locale === 'tr' ? 'Son güncelleme' : 'Last update',
        cacheEmpty: locale === 'tr' ? 'Veri yok' : 'No data',
        stale: locale === 'tr' ? 'Eski veri' : 'Stale',
        refreshing: locale === 'tr' ? 'Yenileniyor...' : 'Refreshing...',
        refresh: locale === 'tr' ? 'Yenile' : 'Refresh',
        thisMonth: locale === 'tr' ? 'Bu Ay' : 'This Month',
        thisSeason: locale === 'tr' ? 'Bu Sezon' : 'Season',
        thisYear: locale === 'tr' ? 'Bu Yıl' : 'This Year',
        custom: locale === 'tr' ? 'Özel' : 'Custom',
        kpiRevenue: locale === 'tr' ? 'Toplam Gelir' : 'Total Revenue',
        kpiRevpar: 'RevPAR', kpiAdr: 'ADR',
        kpiOcc: locale === 'tr' ? 'Doluluk' : 'Occupancy',
        kpiRn: 'Room Night', kpiAlos: 'ALOS',
        kpiRes: locale === 'tr' ? 'Rez. Sayısı' : 'Reservations',
        kpiAbv: locale === 'tr' ? 'Ort. Rez. Değeri' : 'Avg Booking Value',
        kpiAbvSub: locale === 'tr' ? 'Rez başına' : 'Per booking',
        kpiAdb: 'ADB', kpiAdbSub: locale === 'tr' ? 'Gece başına' : 'Per night',
        monthlyAdrRoomNight: locale === 'tr' ? 'Aylık ADR & Room Night' : 'Monthly ADR & Room Nights',
        channelDist: locale === 'tr' ? 'Kanal Dağılımı' : 'Channel Distribution',
        channelRevenue: locale === 'tr' ? 'Kanala Göre Gelir' : 'Revenue by Channel',
        channel: locale === 'tr' ? 'Kanal' : 'Channel',
        count: locale === 'tr' ? 'Adet' : 'Count',
        agency: locale === 'tr' ? 'Acenta' : 'Agency',
        country: locale === 'tr' ? 'Ülke' : 'Country',
        avgPrice: locale === 'tr' ? 'Ort. Fiyat' : 'Avg Price',
        agencyAnalysis: locale === 'tr' ? 'Acenta Analizi' : 'Agency Analysis',
        totalRevLabel: locale === 'tr' ? 'Toplam Gelir' : 'Total Revenue',
        avgStayNights: locale === 'tr' ? 'Ort. Konaklama' : 'Avg Stay',
        revenueShare: locale === 'tr' ? 'Gelir Payı' : 'Revenue Share',
        roomNightShare: locale === 'tr' ? 'RN Payı' : 'RN Share',
        priceVolumeMatrix: locale === 'tr' ? 'Fiyat-Hacim Matrisi' : 'Price-Volume Matrix',
        matrixDesc: locale === 'tr' ? 'Her nokta bir rezervasyon' : 'Each dot represents a reservation',
        highPriceAlert: locale === 'tr' ? 'ADR ortalamanın üzerinde!' : 'ADR above average!',
        lowPriceAlert: locale === 'tr' ? 'ADR ortalamanın altında!' : 'ADR below average!',
        thisMonthLabel: locale === 'tr' ? 'Bu ay' : 'This month',
        avgAdrLabel: locale === 'tr' ? 'Genel ort.' : 'Overall avg',
        allChannels: locale === 'tr' ? 'Tüm Kanallar' : 'All Channels',
        allAgencies: locale === 'tr' ? 'Tüm Acentalar' : 'All Agencies',
        excludeDates: locale === 'tr' ? 'Tarih Hariç Tut' : 'Exclude Dates',
        aiAnalysisTitle: locale === 'tr' ? 'AI Yield Analizi' : 'AI Yield Analysis',
        aiAnalysisDesc: locale === 'tr' ? 'Yapay zeka ile fiyat ve doluluk optimizasyon önerileri' : 'AI-powered pricing and occupancy optimization',
        startAnalysis: locale === 'tr' ? 'Analizi Başlat' : 'Start Analysis',
        analyzing: locale === 'tr' ? 'Analiz ediliyor...' : 'Analyzing...',
    }
    const SEASON_LABELS_I18N: Record<SeasonType, string> = { HIGH: t.seasonHigh, SHOULDER: t.seasonShoulder, LOW: t.seasonLow, OFF: t.seasonOff }

    const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'agencies' | 'pricing' | 'ai'>('overview')
    const [currency, setCurrency] = useState<'EUR' | 'TRY'>('EUR')
    const [refreshing, setRefreshing] = useState(false)
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [expandedAgency, setExpandedAgency] = useState<string | null>(null)
    const [pdfExporting, setPdfExporting] = useState(false)
    const [pricingChannelFilter, setPricingChannelFilter] = useState<string>('ALL')
    const [pricingAgencyFilter, setPricingAgencyFilter] = useState<string>('ALL')
    const [excludeStart, setExcludeStart] = useState('')
    const [excludeEnd, setExcludeEnd] = useState('')
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

        // Advanced Yield Metrics
        const assumedTotalRooms = 300 // Varsayılan oda kapasitesi
        const start = new Date(dateRange.start)
        const end = new Date(dateRange.end)
        const daysInPeriod = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)))
        const totalAvailableRoomNights = assumedTotalRooms * daysInPeriod

        const adr = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0
        const revpar = totalAvailableRoomNights > 0 ? totalRevenue / totalAvailableRoomNights : 0
        const occupancy = totalAvailableRoomNights > 0 ? (totalRoomNights / totalAvailableRoomNights) * 100 : 0
        const alos = resCount > 0 ? totalRoomNights / resCount : 0
        const avgBookingValue = resCount > 0 ? totalRevenue / resCount : 0

        // ADB: average daily board — revenue per reservation per night
        const totalNightsOnly = res.reduce((s, r) => s + r.nights, 0)
        const adb = totalNightsOnly > 0 ? totalRevenue / totalNightsOnly : 0

        // Previous year (same date range window)
        const prevRevenue = filteredPrevReservations.reduce((s, r) => s + convert(r.totalPrice, r.currency), 0)
        const prevRN = filteredPrevReservations.reduce((s, r) => s + r.nights * r.roomCount, 0)
        const prevAdr = prevRN > 0 ? prevRevenue / prevRN : 0
        const prevRevpar = totalAvailableRoomNights > 0 ? prevRevenue / totalAvailableRoomNights : 0
        const prevOccupancy = totalAvailableRoomNights > 0 ? (prevRN / totalAvailableRoomNights) * 100 : 0
        const prevAlos = filteredPrevReservations.length > 0 ? prevRN / filteredPrevReservations.length : 0

        return {
            totalRoomNights, totalRevenue, resCount, adr, avgBookingValue, adb,
            revpar, occupancy, alos,
            prevRevenue, prevRN, prevAdr, prevRevpar, prevOccupancy, prevAlos
        }
    }, [filteredReservations, filteredPrevReservations, currency, dateRange]) // eslint-disable-line react-hooks/exhaustive-deps

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

        // Previous year agency data for comparison
        const prevMap = new Map<string, { revenue: number; roomNights: number; count: number }>()
        for (const r of filteredPrevReservations) {
            if (!prevMap.has(r.agency)) prevMap.set(r.agency, { revenue: 0, roomNights: 0, count: 0 })
            const e = prevMap.get(r.agency)!
            e.revenue += convert(r.totalPrice, r.currency)
            e.roomNights += r.nights * r.roomCount
            e.count += 1
        }

        return Array.from(map.values())
            .map(d => ({
                ...d,
                avgPrice: d.prices.length > 0 ? d.prices.reduce((s, p) => s + p, 0) / d.prices.length : 0,
                adr: d.roomNights > 0 ? d.revenue / d.roomNights : 0,
                prevRevenue: prevMap.get(d.agency)?.revenue || 0,
                prevRoomNights: prevMap.get(d.agency)?.roomNights || 0,
                prevCount: prevMap.get(d.agency)?.count || 0,
                prevAdr: (prevMap.get(d.agency)?.roomNights || 0) > 0 ? (prevMap.get(d.agency)!.revenue / prevMap.get(d.agency)!.roomNights) : 0,
            }))
            .sort((a, b) => b.revenue - a.revenue)
    }, [filteredReservations, filteredPrevReservations, currency]) // eslint-disable-line react-hooks/exhaustive-deps

    // Monthly price trend
    const monthlyData = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => ({
            month: i,
            label: trans.monthNames[i],
            roomNights: 0, revenue: 0, count: 0, season: getSeason(i),
            prevRoomNights: 0, prevRevenue: 0, prevCount: 0,
        }))

        for (const r of filteredReservations) {
            const m = parseInt(r.checkIn.slice(5, 7)) - 1
            if (m >= 0 && m < 12) {
                months[m].roomNights += r.nights * r.roomCount
                months[m].revenue += convert(r.totalPrice, r.currency)
                months[m].count += 1
            }
        }

        // Previous year data
        for (const r of prevYearReservations) {
            const m = parseInt(r.checkIn.slice(5, 7)) - 1
            if (m >= 0 && m < 12) {
                months[m].prevRoomNights += r.nights * r.roomCount
                months[m].prevRevenue += convert(r.totalPrice, r.currency)
                months[m].prevCount += 1
            }
        }

        return months.map(m => ({
            ...m,
            adr: m.roomNights > 0 ? Math.round(m.revenue / m.roomNights) : 0,
            prevAdr: m.prevRoomNights > 0 ? Math.round(m.prevRevenue / m.prevRoomNights) : 0,
            avgBooking: m.count > 0 ? Math.round(m.revenue / m.count) : 0,
            seasonLabel: SEASON_LABELS_I18N[m.season],
            seasonColor: SEASON_COLORS[m.season],
        }))
    }, [filteredReservations, prevYearReservations, currency, t]) // eslint-disable-line react-hooks/exhaustive-deps

    // Price-volume scatter data (per channel)
    const scatterData = useMemo(() => {
        let data = filteredReservations
        if (pricingChannelFilter !== 'ALL') data = data.filter(r => r.channel === pricingChannelFilter)
        if (pricingAgencyFilter !== 'ALL') data = data.filter(r => r.agency === pricingAgencyFilter)
        // Date exclusion
        if (excludeStart && excludeEnd) {
            data = data.filter(r => !(r.checkIn >= excludeStart && r.checkIn <= excludeEnd))
        }
        return data.map(r => ({
            x: convert(r.dailyAverage, r.currency), // price (ADR per reservation)
            y: r.nights * r.roomCount, // room nights
            z: convert(r.totalPrice, r.currency), // total revenue (bubble size)
            channel: r.channel,
            agency: r.agency,
            color: CHANNEL_COLORS[r.channel] || '#64748b',
        }))
    }, [filteredReservations, pricingChannelFilter, pricingAgencyFilter, excludeStart, excludeEnd, currency]) // eslint-disable-line react-hooks/exhaustive-deps

    // Unique channels and agencies for filters
    const uniqueChannels = useMemo(() => Array.from(new Set(filteredReservations.map(r => r.channel))).sort(), [filteredReservations])
    const uniqueAgencies = useMemo(() => Array.from(new Set(filteredReservations.map(r => r.agency))).sort(), [filteredReservations])

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
            setAiAnalysis(data.analysis || trans.noData || 'Analiz alınamadı.')
        } catch {
            setAiAnalysis(trans.loadingError || 'AI analizi şu anda kullanılamıyor.')
        }
        setAiLoading(false)
    }

    // ─── PDF Export ──────────────────────────────────────────

    const handlePdfExport = async () => {
        if (!contentRef.current) return
        await exportPdf({
            element: contentRef.current,
            filename: `yield-management-${currentYear}`,
            title: `${(t as any).title} — ${currentYear}`,
            subtitle: `${dateRange.start} → ${dateRange.end} | ${currency}`,
            orientation: 'landscape',
            onStart: () => setPdfExporting(true),
            onFinish: () => setPdfExporting(false),
        })
    }

    // ─── UI ───────────────────────────────────────────────────

    const tabs = [
        { key: 'overview', label: (t as any).overview, icon: BarChart3 },
        { key: 'channels', label: (t as any).channels, icon: PieIcon },
        { key: 'agencies', label: (t as any).agencies, icon: Globe2 },
        { key: 'pricing', label: (t as any).pricing, icon: DollarSign },
        { key: 'ai', label: (t as any).ai, icon: Sparkles },
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
                        {(t as any).title}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{(t as any).subtitle} — {currentYear}</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Cache Status */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        <Database size={14} />
                        <span>
                            {cacheStatus.lastUpdated
                                ? `${(t as any).lastUpdate}: ${new Date(cacheStatus.lastUpdated).toLocaleTimeString(locale || 'tr-TR')}`
                                : (t as any).cacheEmpty}
                        </span>
                        {cacheStatus.isStale && (
                            <span className="text-amber-500 flex items-center gap-1">
                                <AlertTriangle size={12} /> {(t as any).stale}
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
                        {refreshing ? (t as any).refreshing : (t as any).refresh}
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
                                {p === 'month' ? (t as any).thisMonth : p === 'season' ? (t as any).thisSeason : (t as any).thisYear}
                            </button>
                        ))}
                        <button
                            onClick={() => setDatePreset('custom')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${datePreset === 'custom' ? 'bg-emerald-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            {(t as any).custom}
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
                        key={(t as any).key}
                        onClick={() => setActiveTab((t as any).key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === (t as any).key ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'}`}
                    >
                        {(() => {
                            const Icon = (t as any).icon;
                            return <Icon size={16} />;
                        })()}
                        <span className="hidden md:inline">{(t as any).label}</span>
                    </button>
                ))}
            </div>

            {/* ─── Overview Tab ─────────────────────────────────────── */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { label: (t as any).kpiRevenue, value: fmtC(stats.totalRevenue), sub: diffPct(stats.totalRevenue, stats.prevRevenue), icon: DollarSign },
                            { label: (t as any).kpiRevpar, value: fmtC(stats.revpar), sub: diffPct(stats.revpar, stats.prevRevpar), icon: TrendingUp },
                            { label: (t as any).kpiAdr, value: fmtC(stats.adr), sub: diffPct(stats.adr, stats.prevAdr), icon: TrendingUp },
                            { label: (t as any).kpiOcc, value: `${stats.occupancy.toFixed(1)}%`, sub: diffPct(stats.occupancy, stats.prevOccupancy), icon: BarChart3 },
                            { label: (t as any).kpiRn, value: fmt(stats.totalRoomNights), sub: diffPct(stats.totalRoomNights, stats.prevRN), icon: BedDouble },
                            { label: (t as any).kpiAlos, value: stats.alos.toFixed(1), sub: diffPct(stats.alos, stats.prevAlos), icon: Calendar },
                            { label: (t as any).kpiRes, value: fmt(stats.resCount), sub: `${currentYear}`, icon: Calendar },
                            { label: (t as any).kpiAbv, value: fmtC(stats.avgBookingValue), sub: (t as any).kpiAbvSub, icon: DollarSign },
                            { label: (t as any).kpiAdb, value: fmtC(stats.adb), sub: (t as any).kpiAdbSub, icon: BedDouble },
                        ].map((kpi, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <kpi.icon size={16} className="text-emerald-600" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate" title={kpi.label}>{kpi.label}</span>
                                </div>
                                <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white truncate">{kpi.value}</p>
                                <p className={`text-[10px] md:text-xs mt-1 truncate ${kpi.sub?.startsWith('+') ? 'text-emerald-600' : kpi.sub?.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
                                    {kpi.sub}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* High/Low Price Alerts */}
                    {(() => {
                        const now = new Date()
                        const currentMonth = now.getMonth()
                        const currentMonthData = monthlyData.find(m => m.month === currentMonth)
                        if (!currentMonthData || currentMonthData.roomNights === 0) return null
                        // Compare current month ADR against average of all months with data
                        const activeMonths = monthlyData.filter(m => m.roomNights > 0 && m.adr > 0)
                        const avgAdr = activeMonths.length > 0 ? activeMonths.reduce((s, m) => s + m.adr, 0) / activeMonths.length : 0
                        if (avgAdr === 0) return null
                        const pctDiff = ((currentMonthData.adr - avgAdr) / avgAdr) * 100
                        const isHigh = pctDiff > 15
                        const isLow = pctDiff < -15
                        if (!isHigh && !isLow) return null
                        return (
                            <div className={`flex items-center gap-3 p-4 rounded-xl border ${isHigh
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/30'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30'
                                }`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isHigh ? 'bg-emerald-500' : 'bg-red-500'
                                    }`}>
                                    <TrendingUp size={20} className="text-white" style={isLow ? { transform: 'rotate(180deg)' } : {}} />
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${isHigh ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                                        {isHigh ? '{(t as any).highPriceAlert}' : '{(t as any).lowPriceAlert}'}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {(t as any).thisMonthLabel} ({monthlyData[currentMonth]?.label}) ADR: {fmtC(currentMonthData.adr)} — {(t as any).avgAdrLabel} {fmtC(avgAdr)} ({pctDiff > 0 ? '+' : ''}{pctDiff.toFixed(1)}%)
                                    </p>
                                </div>
                            </div>
                        )
                    })()}

                    {/* Monthly ADR + Room Nights Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{(t as any).monthlyAdrRoomNight}</h3>
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
                                                <p>ADR {currentYear}: {fmtC(d?.adr || 0)}</p>
                                                {d?.prevAdr > 0 && <p className="text-orange-500">ADR {currentYear - 1}: {fmtC(d?.prevAdr || 0)}</p>}
                                                <p>Room Night: {fmt(d?.roomNights || 0)}</p>
                                                <p>Rez: {fmt(d?.count || 0)}</p>
                                            </div>
                                        )
                                    }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="roomNights" name="Room Night" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="adr" name={`ADR ${currentYear} (${currency})`} stroke="#ef4444" strokeWidth={3} dot={{ r: 5, fill: '#ef4444' }} />
                                <Line yAxisId="right" type="monotone" dataKey="prevAdr" name={`ADR ${currentYear - 1} (${currency})`} stroke="#f97316" strokeWidth={2} strokeDasharray="8 4" dot={{ r: 3, fill: '#f97316' }} />
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{(t as any).channelDist}</h3>
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{(t as any).channelRevenue}</h3>
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
                                    <th className="text-left p-4 font-bold text-gray-600 dark:text-gray-300">{(t as any).channel}</th>
                                    <th className="text-right p-4 font-bold text-gray-600 dark:text-gray-300">{(t as any).count}</th>
                                    <th className="text-right p-4 font-bold text-gray-600 dark:text-gray-300">%</th>
                                    <th className="text-right p-4 font-bold text-gray-600 dark:text-gray-300">{(t as any).kpiRn}</th>
                                    <th className="text-right p-4 font-bold text-gray-600 dark:text-gray-300">{(t as any).kpiRevenue}</th>
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{(t as any).agencyAnalysis}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{agencyData.length} acenta • sıralama: gelire göre</p>
                        </div>

                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left p-3 font-bold text-gray-600 dark:text-gray-300">{(t as any).agency}</th>
                                    <th className="text-left p-3 font-bold text-gray-600 dark:text-gray-300">{(t as any).channel}</th>
                                    <th className="text-left p-3 font-bold text-gray-600 dark:text-gray-300">{(t as any).country}</th>
                                    <th className="text-right p-3 font-bold text-gray-600 dark:text-gray-300">{(t as any).count}</th>
                                    <th className="text-right p-3 font-bold text-gray-600 dark:text-gray-300">R.Night</th>
                                    <th className="text-right p-3 font-bold text-gray-600 dark:text-gray-300">{(t as any).kpiRevenue}</th>
                                    <th className="text-right p-3 font-bold text-gray-600 dark:text-gray-300">{(t as any).avgPrice}</th>
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
                                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs">
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">{(t as any).totalRevLabel}</span>
                                                            <p className="text-lg font-black text-emerald-600">{fmtC(a.revenue)}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">{(t as any).avgStayNights}</span>
                                                            <p className="text-lg font-black text-gray-900 dark:text-white">{a.count > 0 ? (a.roomNights / a.count).toFixed(1) : 0} gece</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">{(t as any).revenueShare}</span>
                                                            <p className="text-lg font-black text-blue-600">%{stats.totalRevenue > 0 ? ((a.revenue / stats.totalRevenue) * 100).toFixed(1) : 0}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">{(t as any).roomNightShare}</span>
                                                            <p className="text-lg font-black text-purple-600">%{stats.totalRoomNights > 0 ? ((a.roomNights / stats.totalRoomNights) * 100).toFixed(1) : 0}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Gelir {currentYear - 1}</span>
                                                            <p className="text-lg font-black text-orange-500">{a.prevRevenue > 0 ? fmtC(a.prevRevenue) : '—'}</p>
                                                            {a.prevRevenue > 0 && (
                                                                <span className={`text-[10px] font-bold ${a.revenue >= a.prevRevenue ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                    {diffPct(a.revenue, a.prevRevenue)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">ADR {currentYear - 1}</span>
                                                            <p className="text-lg font-black text-orange-500">{a.prevAdr > 0 ? fmtC(a.prevAdr) : '—'}</p>
                                                            {a.prevAdr > 0 && (
                                                                <span className={`text-[10px] font-bold ${a.adr >= a.prevAdr ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                    {diffPct(a.adr, a.prevAdr)}
                                                                </span>
                                                            )}
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
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{(t as any).priceVolumeMatrix}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{(t as any).matrixDesc}</p>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={pricingChannelFilter}
                                    onChange={e => setPricingChannelFilter(e.target.value)}
                                    className="px-2 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold outline-none cursor-pointer"
                                >
                                    <option value="ALL">{(t as any).allChannels}</option>
                                    {uniqueChannels.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select
                                    value={pricingAgencyFilter}
                                    onChange={e => setPricingAgencyFilter(e.target.value)}
                                    className="px-2 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold outline-none cursor-pointer max-w-[160px]"
                                >
                                    <option value="ALL">{(t as any).allAgencies}</option>
                                    {uniqueAgencies.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <p className="text-[10px] text-gray-400">{scatterData.length} {(t as any).showingRes}</p>
                            <div className="flex-1" />
                            <span className="text-[10px] text-gray-500 font-medium">{(t as any).exclude}</span>
                            <input type="date" value={excludeStart} onChange={e => setExcludeStart(e.target.value)}
                                className="text-[10px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-1 text-gray-700 dark:text-gray-300" />
                            <span className="text-gray-400 text-[10px]">–</span>
                            <input type="date" value={excludeEnd} onChange={e => setExcludeEnd(e.target.value)}
                                className="text-[10px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-1 text-gray-700 dark:text-gray-300" />
                            {(excludeStart || excludeEnd) && (
                                <button onClick={() => { setExcludeStart(''); setExcludeEnd('') }}
                                    className="text-[10px] text-red-500 hover:text-red-400 font-bold">{(t as any).clear}</button>
                            )}
                        </div>
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
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{(t as any).periodAdrComparison}</h3>
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
                                    {SEASON_LABELS_I18N[s]}
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
                                    <Sparkles className="text-purple-600" size={20} /> {(t as any).aiPriceEval}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{(t as any).aiPriceDesc}</p>
                            </div>
                            <button
                                onClick={handleAiAnalysis}
                                disabled={aiLoading}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm px-6 py-3 rounded-lg transition-all disabled:opacity-50 shadow-lg"
                            >
                                <Sparkles size={16} className={aiLoading ? 'animate-pulse' : ''} />
                                {aiLoading ? (t as any).analyzing : (t as any).startAnalysis}
                            </button>
                        </div>

                        {/* Summary Cards for AI context */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{(t as any).totalRevLabel}</span>
                                <p className="text-lg font-black text-emerald-600">{fmtC(stats.totalRevenue)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{(t as any).avgAdr}</span>
                                <p className="text-lg font-black text-blue-600">{fmtC(stats.adr)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{(t as any).roomNightLabel}</span>
                                <p className="text-lg font-black text-purple-600">{fmt(stats.totalRoomNights)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{(t as any).channelCount}</span>
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

            {/* Cross-Module Navigation */}
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-3">İlgili Modüller</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { href: `/${locale}/admin/reports`, label: trans.reportsPage.managementReports, desc: 'S26, Pace, milliyet', icon: BarChart3 },
                        { href: `/${locale}/admin/reservations`, label: 'Rezervasyonlar', desc: 'Detaylı liste ve filtre', icon: Calendar },
                        { href: `/${locale}/admin/extras`, label: 'Ekstra Satışlar', desc: 'SPA, minibar, restoran', icon: DollarSign },
                        { href: `/${locale}/admin/purchasing`, label: 'Satın Alma', desc: 'Stok, tedarik, trendler', icon: Database },
                    ].map((m, i) => (
                        <Link key={i} href={m.href} className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors group">
                            <m.icon size={18} className="text-gray-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-white truncate">{m.label}</p>
                                <p className="text-[10px] text-gray-400 truncate">{m.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
