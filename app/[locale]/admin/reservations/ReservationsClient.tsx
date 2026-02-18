'use client'

import { useState, useMemo, useRef } from 'react'
import { exportPdf } from '@/lib/export-pdf'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Calendar, Search, ChevronLeft, ChevronRight, Eye, Check, X, Clock, Download, RefreshCw, ArrowRightLeft, TrendingUp, BarChart3, Filter, FileDown } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ExchangeRates } from '@/lib/services/elektra'

interface ReservationRow {
    id: number
    voucherNo: string
    guestName: string
    contactEmail: string | null
    contactPhone: string | null
    agency: string
    channel: string
    roomType: string
    boardType: string
    rateType: string
    checkIn: string
    checkOut: string
    nights: number
    totalPrice: number
    paidPrice: number
    currency: string
    roomCount: number
    status: string
    saleDate: string
    lastUpdate: string
    nationality: string
    dailyAverage: number
}

const CHANNELS = ['all', 'OTA', 'Call Center', 'Tur Operatörü', 'Website', 'Direkt']
const STATUSES = ['all', 'Reservation', 'InHouse', 'CheckOut', 'Waiting']

const CHANNEL_COLORS: Record<string, string> = {
    'OTA': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Call Center': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Tur Operatörü': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    'Website': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Direkt': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
}

function formatCurrency(amount: number, currency: string = 'TRY'): string {
    const sym = currency === 'EUR' ? '€' : '₺'
    return `${sym}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

interface Props {
    initialData: ReservationRow[]
    comparisonData: { saleDate: string, checkIn: string, totalPrice: number, currency: string, channel: string }[]
    comparisonMode: 'pace' | 'aggregate'
    error: string | null
    rates: ExchangeRates
    initialBookingStart: string
    initialBookingEnd: string
    initialCompareYear: string
}

import ModuleOffline from '@/components/admin/ModuleOffline'

export default function ReservationsClient({ initialData, comparisonData, comparisonMode, error, rates, initialBookingStart, initialBookingEnd, initialCompareYear }: Props) {
    if (error) {
        return <ModuleOffline moduleName="Rezervasyon Yönetimi" dataSource="elektra" offlineReason={error} />
    }

    const router = useRouter()
    const pathname = usePathname()
    const contentRef = useRef<HTMLDivElement>(null)
    const [pdfExporting, setPdfExporting] = useState(false)

    // Booking Date Filter (Server)
    const [bookingDateRange, setBookingDateRange] = useState({ start: initialBookingStart, end: initialBookingEnd })
    const [compareYear, setCompareYear] = useState(initialCompareYear)

    const [channel, setChannel] = useState('all')
    const [chartBasis, setChartBasis] = useState<'booking' | 'checkin'>('checkin')
    const [status, setStatus] = useState('all')
    const [currency, setCurrency] = useState<'TRY' | 'EUR'>('TRY')
    const [search, setSearch] = useState('')

    // Stay Date Filter (Client)
    const [stayDateRange, setStayDateRange] = useState({ start: '', end: '' })

    const [priceRange, setPriceRange] = useState({ min: '', max: '' })
    const [page, setPage] = useState(1)
    const [selectedRes, setSelectedRes] = useState<ReservationRow | null>(null)
    const limit = 50

    // Apply Booking Date Filter (Server Reload)
    const applyBookingFilter = () => {
        const params = new URLSearchParams()
        if (bookingDateRange.start) params.set('bookingStart', bookingDateRange.start)
        if (bookingDateRange.end) params.set('bookingEnd', bookingDateRange.end)
        if (compareYear) params.set('compareYear', compareYear)
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleCompareChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setCompareYear(val)
        // Auto apply or wait for button? Wait for button to be consistent with date range usually,
        // but for a dropdown, immediate feel is nice. 
        // However, we have a "Uygula" button for the date range panel.
        // Let's keep it manual apply via the button to avoid accidental reloads, 
        // OR add a specific apply for this if it's separate.
        // Let's put it IN the filter panel.
    }

    const setBookingPreset = (days: number | 'yesterday') => {
        const today = new Date()
        const end = today.toISOString().split('T')[0]
        let start = ''

        if (days === 'yesterday') {
            const y = new Date()
            y.setDate(y.getDate() - 1)
            start = y.toISOString().split('T')[0]
            const endDate = start // For yesterday, start and end are same
            setBookingDateRange({ start, end: endDate })
            return
        }

        if (days === 0) {
            start = end
        } else {
            const d = new Date()
            d.setDate(d.getDate() - days)
            start = d.toISOString().split('T')[0]
        }
        setBookingDateRange({ start, end })
    }

    // Client-side filtering
    const filtered = useMemo(() => {
        let data = initialData

        if (channel !== 'all') {
            data = data.filter(r => r.channel === channel)
        }

        if (status !== 'all') {
            data = data.filter(r => r.status === status)
        }

        // Filter by STAY DATE (Check-in)
        if (stayDateRange.start) data = data.filter(r => r.checkIn >= stayDateRange.start)
        if (stayDateRange.end) data = data.filter(r => r.checkIn <= stayDateRange.end)

        if (priceRange.min && !isNaN(parseFloat(priceRange.min))) {
            data = data.filter(r => r.totalPrice >= parseFloat(priceRange.min))
        }
        if (priceRange.max && !isNaN(parseFloat(priceRange.max))) {
            data = data.filter(r => r.totalPrice <= parseFloat(priceRange.max))
        }

        if (search.trim()) {
            const q = search.toLowerCase()
            data = data.filter(r =>
                r.guestName.toLowerCase().includes(q) ||
                r.voucherNo.toLowerCase().includes(q) ||
                r.agency.toLowerCase().includes(q)
            )
        }

        return data
    }, [initialData, channel, status, search, stayDateRange, priceRange])

    // Currency Helper
    const convert = (amount: number, fromCurrency: string) => {
        if (fromCurrency === currency) return amount
        if (currency === 'TRY') return amount * rates.EUR_TO_TRY
        // If target is EUR:
        if (fromCurrency === 'TRY') return amount / rates.EUR_TO_TRY
        return amount
    }

    // Correct conversion logic:
    const getAmount = (amount: number, rowCurrency: string) => {
        if (rowCurrency === currency) return amount
        if (currency === 'TRY') return amount * rates.EUR_TO_TRY // EUR -> TRY
        return amount / rates.EUR_TO_TRY // TRY -> EUR
    }

    // Stats
    const totalRevenue = useMemo(() =>
        filtered.reduce((sum, r) => sum + getAmount(r.totalPrice, r.currency), 0),
        [filtered, currency]
    )

    const channelSummary = useMemo(() => {
        const summary: Record<string, { count: number; revenue: number }> = {}
        for (const r of filtered) {
            if (!summary[r.channel]) summary[r.channel] = { count: 0, revenue: 0 }
            summary[r.channel].count++
            summary[r.channel].revenue += getAmount(r.totalPrice, r.currency)
        }
        return summary
    }, [filtered, currency])

    // Auto-detect stay period from main data's check-in range
    const autoStayPeriod = useMemo(() => {
        if (filtered.length === 0) return { start: '', end: '' }
        const checkIns = filtered.map(r => r.checkIn).sort()
        return { start: checkIns[0], end: checkIns[checkIns.length - 1] }
    }, [filtered])

    // Filter comparison data
    // Pace mode: data is already scoped by server (364-day shifted booking period) — just pass through
    // Aggregate mode: filter by shifted stay dates
    const filteredComparison = useMemo(() => {
        let data = comparisonData
        // Apply channel filter to comparison data too
        if (channel !== 'all') {
            data = data.filter(r => r.channel === channel)
        }
        if (comparisonMode === 'pace') return data
        // Aggregate: filter by stay date range
        const compYear = compareYear ? parseInt(compareYear) : 0
        if (compYear <= 0) return data
        const effectiveStart = stayDateRange.start || autoStayPeriod.start
        const effectiveEnd = stayDateRange.end || autoStayPeriod.end
        if (effectiveStart) {
            const shiftedStart = compYear + effectiveStart.slice(4)
            data = data.filter(r => r.checkIn >= shiftedStart)
        }
        if (effectiveEnd) {
            const shiftedEnd = compYear + effectiveEnd.slice(4)
            data = data.filter(r => r.checkIn <= shiftedEnd)
        }
        return data
    }, [comparisonData, comparisonMode, stayDateRange, autoStayPeriod, compareYear, channel])

    // Comparison aggregate metrics (for summary cards)
    const comparisonMetrics = useMemo(() => {
        const compRevenue = filteredComparison.reduce((sum, r) => sum + getAmount(r.totalPrice, r.currency), 0)
        const compCount = filteredComparison.length
        const revenuePctChange = compRevenue > 0 ? ((totalRevenue - compRevenue) / compRevenue) * 100 : 0
        const countPctChange = compCount > 0 ? ((filtered.length - compCount) / compCount) * 100 : 0
        return { compRevenue, compCount, revenuePctChange, countPctChange }
    }, [filteredComparison, totalRevenue, filtered.length, currency])

    // ─── Charts Data — User-selectable date basis ───
    const chartData = useMemo(() => {
        const map = new Map<string, { date: string, count: number, revenue: number, compCount: number, compRevenue: number }>()

        if (chartBasis === 'booking') {
            // ─── X-axis = booking dates (saleDate / rezervasyon tarihi) ───
            const sorted = [...filtered].sort((a, b) => a.saleDate.localeCompare(b.saleDate))
            sorted.forEach(r => {
                const date = r.saleDate.split('-').slice(1).join('/') // MM/DD
                if (!map.has(date)) map.set(date, { date, count: 0, revenue: 0, compCount: 0, compRevenue: 0 })
                const entry = map.get(date)!
                entry.count++
                entry.revenue += getAmount(r.totalPrice, r.currency)
            })
            // Comparison: +364 day shift on saleDate (same weekday alignment)
            filteredComparison.forEach(r => {
                const shifted = new Date(r.saleDate)
                shifted.setDate(shifted.getDate() + 364)
                const mm = String(shifted.getMonth() + 1).padStart(2, '0')
                const dd = String(shifted.getDate()).padStart(2, '0')
                const key = `${mm}/${dd}`
                if (!map.has(key)) map.set(key, { date: key, count: 0, revenue: 0, compCount: 0, compRevenue: 0 })
                const entry = map.get(key)!
                entry.compCount++
                entry.compRevenue += getAmount(r.totalPrice, r.currency)
            })
        } else {
            // ─── X-axis = check-in dates (konaklama tarihi) — gün bazlı ───
            const sorted = [...filtered].sort((a, b) => a.checkIn.localeCompare(b.checkIn))
            sorted.forEach(r => {
                const date = r.checkIn.split('-').slice(1).join('/') // MM/DD from checkIn
                if (!map.has(date)) map.set(date, { date, count: 0, revenue: 0, compCount: 0, compRevenue: 0 })
                const entry = map.get(date)!
                entry.count++
                entry.revenue += getAmount(r.totalPrice, r.currency)
            })
            // Comparison: +364 day shift on checkIn (weekday alignment)
            filteredComparison.forEach(r => {
                const shifted = new Date(r.checkIn)
                shifted.setDate(shifted.getDate() + 364)
                const mm = String(shifted.getMonth() + 1).padStart(2, '0')
                const dd = String(shifted.getDate()).padStart(2, '0')
                const key = `${mm}/${dd}`
                if (!map.has(key)) map.set(key, { date: key, count: 0, revenue: 0, compCount: 0, compRevenue: 0 })
                const entry = map.get(key)!
                entry.compCount++
                entry.compRevenue += getAmount(r.totalPrice, r.currency)
            })
        }

        return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
    }, [filtered, filteredComparison, chartBasis, currency])

    const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

    // Pagination
    const totalPages = Math.ceil(filtered.length / limit)
    const paginated = filtered.slice((page - 1) * limit, page * limit)

    // ... CSV Export ...
    const exportCSV = () => {
        if (!filtered.length) return
        const headers = ['Voucher No', 'Misafir', 'Uyruk', 'Acente', 'Kanal', 'Oda Tipi', 'Pansiyon', 'Giriş', 'Çıkış', 'Gece', 'Tutar', 'Günlük Ort.', 'Döviz', 'Durum', 'Rezervasyon Tarihi']
        const rows = filtered.map(r => [
            r.voucherNo, r.guestName, r.nationality, r.agency, r.channel, r.roomType, r.boardType,
            r.checkIn, r.checkOut, r.nights, r.totalPrice, r.dailyAverage, r.currency, r.status, r.saleDate
        ])
        const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rezervasyonlar_son30gun.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handlePdfExport = async () => {
        if (!contentRef.current) return
        await exportPdf({
            element: contentRef.current,
            filename: `rezervasyonlar-${bookingDateRange.start}-${bookingDateRange.end}`,
            title: 'Rezervasyon Verileri',
            subtitle: `${bookingDateRange.start} → ${bookingDateRange.end} | ${currency}`,
            orientation: 'landscape',
            onStart: () => setPdfExporting(true),
            onFinish: () => setPdfExporting(false),
        })
    }

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'Reservation':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded"><Check size={12} /> Onaylı</span>
            case 'Waiting':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded"><Clock size={12} /> Beklemede</span>
            case 'InHouse':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded"><Check size={12} /> Konaklamada</span>
            case 'CheckOut':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-500/20 text-slate-400 text-xs font-medium rounded"><Check size={12} /> Çıkış Yaptı</span>
            case 'Cancelled':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded"><X size={12} /> İptal</span>
            default:
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-500/20 text-slate-400 text-xs font-medium rounded">{s}</span>
        }
    }

    if (error) {
        return (
            <div className="p-12 text-center">
                <p className="text-red-400 text-lg">{error}</p>
                <p className="text-slate-500 mt-2">Lütfen sayfayı yenileyin</p>
            </div>
        )
    }

    return (
        <div ref={contentRef} className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            Rezervasyon Verileri
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs rounded-full font-medium">Canlı</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Elektra PMS Entegrasyonu</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrency(prev => prev === 'EUR' ? 'TRY' : 'EUR')}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-2"
                        >
                            <ArrowRightLeft size={16} />
                            <span className="font-bold">{currency}</span>
                        </button>
                        <button onClick={exportCSV} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-slate-200 dark:border-white/10">
                            <Download size={16} /> CSV İndir
                        </button>
                        <button onClick={handlePdfExport} disabled={pdfExporting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                            <FileDown size={16} className={pdfExporting ? 'animate-pulse' : ''} />
                            {pdfExporting ? 'PDF...' : 'PDF'}
                        </button>
                    </div>
                </div>

                {/* Booking Date Filter Panel (Marked Area) */}
                <div className="bg-white dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-wrap items-center gap-6 shadow-sm dark:shadow-lg">
                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-semibold border-r border-slate-200 dark:border-slate-700 pr-6 mr-2">
                        <Filter size={20} />
                        <span>Rezervasyon Tarihi</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="flex bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1 w-full md:w-auto overflow-x-auto">
                            <button onClick={() => setBookingPreset(0)} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded transition-colors whitespace-nowrap">Bugün</button>
                            <button onClick={() => setBookingPreset('yesterday')} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded transition-colors whitespace-nowrap">Dün</button>
                            <button onClick={() => setBookingPreset(7)} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded transition-colors whitespace-nowrap">7 Gün</button>
                            <button onClick={() => setBookingPreset(30)} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded transition-colors whitespace-nowrap">30 Gün</button>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-600/50 w-full md:w-auto">
                            <Calendar size={14} className="text-slate-500 dark:text-slate-400" />
                            <input
                                type="date"
                                className="bg-transparent text-slate-900 dark:text-white text-sm outline-none flex-1 md:w-32 py-1"
                                value={bookingDateRange.start}
                                onChange={e => setBookingDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="date"
                                className="bg-transparent text-slate-900 dark:text-white text-sm outline-none flex-1 md:w-32 py-1"
                                value={bookingDateRange.end}
                                onChange={e => setBookingDateRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-600/50 w-full md:w-auto">
                            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Karşılaştır:</span>
                            <select
                                value={compareYear}
                                onChange={handleCompareChange}
                                className="bg-transparent text-slate-900 dark:text-white text-sm outline-none cursor-pointer w-full"
                            >
                                <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Yok</option>
                                {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 - i).map(y => (
                                    <option key={y} value={y} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={applyBookingFilter}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                        <RefreshCw size={16} />
                        Uygula
                    </button>
                </div>
            </div>

            {/* Chart Date Basis Toggle + Charts Row */}
            <div className="flex items-center justify-end gap-1 mb-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">Grafik bazı:</span>
                <button
                    onClick={() => setChartBasis('checkin')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border transition-colors ${chartBasis === 'checkin'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                >
                    Konaklama Tarihi
                </button>
                <button
                    onClick={() => setChartBasis('booking')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border border-l-0 transition-colors ${chartBasis === 'booking'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                >
                    Rezervasyon Tarihi
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-emerald-500 dark:text-emerald-400" /> Günlük Rezervasyon Geliri
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.2} />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--tooltip-bg, #1f2937)', borderColor: 'var(--tooltip-border, #374151)', color: 'var(--tooltip-text, #f3f4f6)' }}
                                    formatter={(value: any, name: any) => [fmt(value || 0), name === 'revenue' ? `Gelir (2026)` : `Gelir (${compareYear})`]}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" name="revenue" />
                                {compareYear && <Area type="monotone" dataKey="compRevenue" stroke="#94a3b8" strokeDasharray="5 5" fill="none" name="compRevenue" />}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <BarChart3 size={16} className="text-blue-500 dark:text-blue-400" /> Günlük Rezervasyon Sayısı
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.2} />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--tooltip-bg, #1f2937)', borderColor: 'var(--tooltip-border, #374151)', color: 'var(--tooltip-text, #f3f4f6)' }}
                                    formatter={(value: any, name: any) => [typeof value === 'number' ? Math.round(value) : value, name === 'count' ? `Adet (2026)` : `Adet (${compareYear})`]}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="count" />
                                {compareYear && <Bar dataKey="compCount" fill="#94a3b8" radius={[4, 4, 0, 0]} name="compCount" />}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
                    <p className="text-slate-500 text-xs uppercase mb-1">Toplam Rezervasyon</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{filtered.length.toLocaleString('tr-TR')}</p>
                    {compareYear && comparisonMetrics.compCount > 0 && (
                        <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-slate-400 text-xs">{compareYear}: {comparisonMetrics.compCount.toLocaleString('tr-TR')}</span>
                            <span className={`text-xs font-semibold ${comparisonMetrics.countPctChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {comparisonMetrics.countPctChange >= 0 ? '↑' : '↓'}{Math.abs(comparisonMetrics.countPctChange).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
                    <p className="text-slate-500 text-xs uppercase mb-1">Toplam Gelir ({currency})</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(Math.round(totalRevenue))}</p>
                    {compareYear && comparisonMetrics.compRevenue > 0 && (
                        <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-slate-400 text-xs">{compareYear}: {fmt(Math.round(comparisonMetrics.compRevenue))}</span>
                            <span className={`text-xs font-semibold ${comparisonMetrics.revenuePctChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {comparisonMetrics.revenuePctChange >= 0 ? '↑' : '↓'}{Math.abs(comparisonMetrics.revenuePctChange).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
                {Object.entries(channelSummary).sort(([, a], [, b]) => b.count - a.count).slice(0, 2).map(([ch, v]) => (
                    <div key={ch} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
                        <p className="text-slate-500 text-xs uppercase mb-1">{ch}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{v.count} <span className="text-sm text-slate-400">rez</span></p>
                        <p className="text-slate-500 text-xs">{fmt(Math.round(v.revenue))}</p>
                    </div>
                ))}
            </div>
            {/* Comparison Mode Indicator */}
            {compareYear && comparisonMetrics.compCount > 0 && (
                <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <span>{comparisonMode === 'pace' ? '📊' : '📈'}</span>
                    <span>{comparisonMode === 'pace' ? `Booking Pace karşılaştırma (364 gün / aynı haftaiçi günü)` : `Konaklama bazlı günü gününe karşılaştırma (check-in tarihi)`}</span>
                </div>
            )}

            {/* Filters (Client Side - Stay Date) */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={channel}
                        onChange={e => { setChannel(e.target.value); setPage(1) }}
                        className="px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 w-full md:w-auto"
                    >
                        {CHANNELS.map(ch => (
                            <option key={ch} value={ch} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{ch === 'all' ? 'Tüm Kanallar' : ch}</option>
                        ))}
                    </select>

                    <select
                        value={status}
                        onChange={e => { setStatus(e.target.value); setPage(1) }}
                        className="px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 w-full md:w-auto"
                    >
                        {STATUSES.map(s => (
                            <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                {s === 'all' ? 'Tüm Durumlar' : s === 'Reservation' ? 'Onaylı' : s === 'InHouse' ? 'Konaklamada' : s === 'CheckOut' ? 'Çıkış' : 'Beklemede'}
                            </option>
                        ))}
                    </select>

                    {/* Stay Date Range (Konaklama Tarihi) - Client Side */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-1 pl-3 w-full md:w-auto">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mr-1 whitespace-nowrap">Konaklama:</span>
                        <input
                            type="date"
                            className="bg-transparent text-slate-900 dark:text-white text-sm outline-none px-2 py-1 flex-1 md:w-auto"
                            value={stayDateRange.start}
                            onChange={e => setStayDateRange(prev => ({ ...prev, start: e.target.value }))}
                        />
                        <span className="text-slate-500">-</span>
                        <input
                            type="date"
                            className="bg-transparent text-slate-900 dark:text-white text-sm outline-none px-2 py-1 flex-1 md:w-auto"
                            value={stayDateRange.end}
                            onChange={e => setStayDateRange(prev => ({ ...prev, end: e.target.value }))}
                        />
                    </div>

                    {/* Price Range */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-1 w-full md:w-auto">
                        <input
                            type="number"
                            placeholder="Min TL"
                            className="bg-transparent text-slate-900 dark:text-white text-sm outline-none px-2 py-1 w-20"
                            value={priceRange.min}
                            onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        />
                        <span className="text-slate-500">-</span>
                        <input
                            type="number"
                            placeholder="Max TL"
                            className="bg-transparent text-slate-900 dark:text-white text-sm outline-none px-2 py-1 w-20"
                            value={priceRange.max}
                            onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        />
                    </div>

                    <div className="flex-1 min-w-[200px] relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Misafir, voucher, acente..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                </div>
            </div>

            {/* Channel Summary Pills */}
            {Object.keys(channelSummary).length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(channelSummary)
                        .sort(([, a], [, b]) => b.count - a.count)
                        .map(([ch, v]) => (
                            <button
                                key={ch}
                                onClick={() => { setChannel(channel === ch ? 'all' : ch); setPage(1) }}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${channel === ch
                                    ? 'bg-cyan-600/30 text-cyan-700 dark:text-cyan-300 border-cyan-500/50'
                                    : CHANNEL_COLORS[ch] || 'bg-slate-200 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-500/30'
                                    }`}
                            >
                                {ch}
                                <span className="opacity-70">{v.count}</span>
                            </button>
                        ))
                    }
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                {paginated.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-500">Bu filtrelere uygun rezervasyon bulunamadı</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-indigo-950/20">
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Voucher</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Misafir / Uyruk</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Acente / Kanal</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Oda</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Giriş</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Çıkış</th>
                                    <th className="text-right py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Tutar</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Rezervasyon</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Durum</th>
                                    <th className="text-right py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((res, i) => (
                                    <tr
                                        key={`${res.id}-${i}`}
                                        className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <p className="text-slate-900 dark:text-white font-mono text-sm">{res.voucherNo || `#${res.id}`}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-slate-900 dark:text-white text-sm">{res.guestName}</p>
                                            <p className="text-slate-500 text-xs">{res.nationality} · {res.roomCount} oda · {res.nights} gece</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-slate-900 dark:text-white text-sm">{res.agency}</p>
                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${CHANNEL_COLORS[res.channel] || 'bg-slate-200 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400'}`}>
                                                {res.channel}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-slate-900 dark:text-white text-sm">{res.roomType}</p>
                                            <p className="text-slate-500 text-xs">{res.boardType}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-slate-900 dark:text-white text-sm">{res.checkIn}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-slate-900 dark:text-white text-sm">{res.checkOut}</p>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <p className="text-slate-900 dark:text-white font-medium text-sm">{fmt(getAmount(res.totalPrice, res.currency))}</p>
                                            {res.paidPrice > 0 && res.paidPrice < res.totalPrice && (
                                                <p className="text-emerald-500 dark:text-emerald-400 text-xs">{fmt(getAmount(res.paidPrice, res.currency))} ödendi</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">{res.saleDate}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            {getStatusBadge(res.status)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => setSelectedRes(res)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-cyan-600 dark:hover:text-white"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-sm">
                        {filtered.length.toLocaleString('tr-TR')} kayıttan {((page - 1) * limit) + 1}–{Math.min(page * limit, filtered.length)} gösteriliyor
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors disabled:opacity-30"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                            const p = start + i
                            if (p > totalPages) return null
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                                >
                                    {p}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors disabled:opacity-30"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedRes && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedRes(null)}>
                    <div
                        className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedRes.voucherNo || `#${selectedRes.id}`}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{selectedRes.agency} · {selectedRes.channel}</p>
                            </div>
                            <button onClick={() => setSelectedRes(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Misafir</p>
                                    <p className="text-slate-900 dark:text-white">{selectedRes.guestName}</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">{selectedRes.nationality}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Durum</p>
                                    {getStatusBadge(selectedRes.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">E-posta</p>
                                    <p className="text-slate-900 dark:text-white text-sm">{selectedRes.contactEmail || 'Belirtilmemiş'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Telefon</p>
                                    <p className="text-slate-900 dark:text-white text-sm">{selectedRes.contactPhone || 'Belirtilmemiş'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Giriş</p>
                                    <p className="text-slate-900 dark:text-white">{selectedRes.checkIn}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Çıkış</p>
                                    <p className="text-slate-900 dark:text-white">{selectedRes.checkOut}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Gece</p>
                                    <p className="text-slate-900 dark:text-white">{selectedRes.nights} gece</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Oda Tipi</p>
                                    <p className="text-slate-900 dark:text-white">{selectedRes.roomType}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Pansiyon</p>
                                    <p className="text-slate-900 dark:text-white">{selectedRes.boardType}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Oda Sayısı</p>
                                    <p className="text-slate-900 dark:text-white">{selectedRes.roomCount}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Rezervasyon Tarihi</p>
                                    <p className="text-slate-900 dark:text-white">{selectedRes.saleDate}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Rate Tipi</p>
                                    <p className="text-slate-900 dark:text-white">{selectedRes.rateType}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-sm">Toplam Tutar</p>
                                        {selectedRes.paidPrice > 0 && (
                                            <p className="text-emerald-500 dark:text-emerald-400 text-xs mt-1">{formatCurrency(selectedRes.paidPrice, selectedRes.currency)} ödendi</p>
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-white">{formatCurrency(selectedRes.totalPrice, selectedRes.currency)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
