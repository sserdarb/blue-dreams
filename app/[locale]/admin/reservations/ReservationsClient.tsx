'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { exportPdf } from '@/lib/export-pdf'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Calendar, Search, ChevronLeft, ChevronRight, Eye, Check, X, Clock, Download, RefreshCw, ArrowRightLeft, TrendingUp, BarChart3, Filter, FileDown, Activity, Info, Users, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
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
    country: string
    dailyAverage: number
    paxCount: number
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
import { SalesChart } from '@/components/admin/charts/SalesChart'

export default function ReservationsClient({ initialData, comparisonData, comparisonMode, error, rates, initialBookingStart, initialBookingEnd, initialCompareYear }: Props) {
    if (error) {
        return <ModuleOffline moduleName="Rezervasyon Yönetimi" dataSource="elektra" offlineReason={error} />
    }

    const router = useRouter()
    const pathname = usePathname()
    const contentRef = useRef<HTMLDivElement>(null)
    const [pdfExporting, setPdfExporting] = useState(false)
    const [isApplying, setIsApplying] = useState(false)

    // Booking Date Filter (Server)
    const [bookingDateRange, setBookingDateRange] = useState({ start: initialBookingStart, end: initialBookingEnd })
    const [compareYear, setCompareYear] = useState(initialCompareYear)

    const [channel, setChannel] = useState('all')
    const [chartBasis, setChartBasis] = useState<'booking' | 'checkin'>('booking')
    const [status, setStatus] = useState('all')
    const [currency, setCurrency] = useState<'TRY' | 'EUR'>('TRY')
    const [search, setSearch] = useState('')

    // Stay Date Filter (Client)
    const [stayDateRange, setStayDateRange] = useState({ start: '', end: '' })
    const [tempStayStart, setTempStayStart] = useState('')
    const [tempStayEnd, setTempStayEnd] = useState('')

    const [priceRange, setPriceRange] = useState({ min: '', max: '' })
    const [page, setPage] = useState(1)
    const [selectedRes, setSelectedRes] = useState<ReservationRow | null>(null)
    const [sortBy, setSortBy] = useState<keyof ReservationRow | ''>('')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
    const limit = 50

    const toggleSort = useCallback((col: keyof ReservationRow) => {
        if (sortBy === col) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(col)
            setSortDir('asc')
        }
        setPage(1)
    }, [sortBy])

    // Apply Booking Date Filter (Server Reload)
    const applyBookingFilter = () => {
        setIsApplying(true)
        const params = new URLSearchParams()
        if (bookingDateRange.start) params.set('bookingStart', bookingDateRange.start)
        if (bookingDateRange.end) params.set('bookingEnd', bookingDateRange.end)
        if (compareYear) params.set('compareYear', compareYear)
        router.push(`${pathname}?${params.toString()}`)
        setTimeout(() => setIsApplying(false), 2000)
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

    const setBookingPreset = (days: number | 'yesterday' | 'all_time') => {
        const today = new Date()
        const end = today.toISOString().split('T')[0]
        let start = ''

        if (days === 'all_time') {
            setBookingDateRange({ start: '1970-01-01', end: '2099-12-31' })
            return
        }

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

        // Filter by STAY DATE (Check-in within range)
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

    // Performance Calculations (Market & Agency Averages)
    const performances = useMemo(() => {
        const byMarket: Record<string, { sum: number, count: number }> = {} // channel_checkIn => metrics
        const byAgency: Record<string, { sum: number, count: number }> = {}

        filtered.forEach(r => {
            const amount = getAmount(r.dailyAverage, r.currency)
            if (amount <= 0) return

            const mKey = `${r.channel}_${r.checkIn}`
            if (!byMarket[mKey]) byMarket[mKey] = { sum: 0, count: 0 }
            byMarket[mKey].sum += amount
            byMarket[mKey].count++

            const aKey = r.agency
            if (!byAgency[aKey]) byAgency[aKey] = { sum: 0, count: 0 }
            byAgency[aKey].sum += amount
            byAgency[aKey].count++
        })

        return { byMarket, byAgency }
    }, [filtered, currency, rates])

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
    const salesChartData = useMemo(() => {
        const map = new Map<string, any>()
        const sorted = [...filtered].sort((a, b) => a[chartBasis === 'booking' ? 'saleDate' : 'checkIn'].localeCompare(b[chartBasis === 'booking' ? 'saleDate' : 'checkIn']))

        sorted.forEach(res => {
            const date = res[chartBasis === 'booking' ? 'saleDate' : 'checkIn']
            if (!date) return
            const dStr = date.split('-').slice(1).join('/') // MM/DD

            if (!map.has(dStr)) {
                map.set(dStr, {
                    date: dStr, web: 0, callCenter: 0, ota: 0, tourOperator: 0, direct: 0,
                    totalRevenue: 0, totalReservations: 0, totalRoomNights: 0,
                    otaRes: 0, otaRN: 0, callCenterRes: 0, callCenterRN: 0,
                    webRes: 0, webRN: 0, directRes: 0, directRN: 0,
                    tourOpRes: 0, tourOpRN: 0
                })
            }
            const entry = map.get(dStr)!
            const amount = getAmount(res.totalPrice, res.currency)
            const roomNights = res.roomCount * res.nights
            const isCancelled = res.status === 'Cancelled' || res.status === 'İptal'

            if (!isCancelled) {
                entry.totalRevenue += amount
                entry.totalReservations += 1
                entry.totalRoomNights += roomNights

                switch (res.channel) {
                    case 'Website':
                        entry.web += amount; entry.webRes += 1; entry.webRN += roomNights; break;
                    case 'Call Center':
                        entry.callCenter += amount; entry.callCenterRes += 1; entry.callCenterRN += roomNights; break;
                    case 'OTA':
                        entry.ota += amount; entry.otaRes += 1; entry.otaRN += roomNights; break;
                    case 'Direkt':
                        entry.direct += amount; entry.directRes += 1; entry.directRN += roomNights; break;
                    default:
                        entry.tourOperator += amount; entry.tourOpRes += 1; entry.tourOpRN += roomNights; break;
                }
            }
        })
        return Array.from(map.values())
    }, [filtered, chartBasis, currency, rates])

    const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

    // Pagination (after sort)
    const sorted = useMemo(() => {
        if (!sortBy) return filtered
        return [...filtered].sort((a, b) => {
            const av = a[sortBy]
            const bv = b[sortBy]
            if (av == null && bv == null) return 0
            if (av == null) return 1
            if (bv == null) return -1
            let cmp = 0
            if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
            else cmp = String(av).localeCompare(String(bv), 'tr')
            return sortDir === 'asc' ? cmp : -cmp
        })
    }, [filtered, sortBy, sortDir])

    const totalPages = Math.ceil(sorted.length / limit)
    const paginated = sorted.slice((page - 1) * limit, page * limit)

    // ... CSV Export ...
    const exportCSV = () => {
        if (!filtered.length) return
        const headers = ['Voucher No', 'Misafir', 'Uyruk', 'Acente', 'Kanal', 'Oda Tipi', 'Pansiyon', 'Giriş', 'Çıkış', 'Gece', 'Tutar', 'Günlük Ort.', 'Döviz', 'Durum', 'Rezervasyon Tarihi']
        const rows = filtered.map(r => [
            r.voucherNo, r.guestName, r.country, r.agency, r.channel, r.roomType, r.boardType,
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
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mr-2">
                            {(['TRY', 'EUR'] as const).map(c => (
                                <button key={c} onClick={() => setCurrency(c)}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${currency === c ? 'bg-cyan-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center text-[10px]">{c === 'EUR' ? '€' : '₺'}</span>
                                    {c}
                                </button>
                            ))}
                        </div>
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
                            <button onClick={() => setBookingPreset('all_time')} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded transition-colors whitespace-nowrap">Tüm Zamanlar</button>
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
                        disabled={isApplying}
                        className={`px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 w-full md:w-auto justify-center ${isApplying ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        <RefreshCw size={16} className={isApplying ? "animate-spin" : ""} />
                        {isApplying ? "Uygulanıyor..." : "Uygula"}
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
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-6 relative group">
                    <Activity size={20} className="text-cyan-500" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Genel Rezervasyon Trendi</h2>
                    <div className="ml-auto cursor-help text-slate-400 hover:text-cyan-500 transition-colors">
                        <Info size={16} />
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute right-0 top-8 w-64 bg-slate-800 dark:bg-slate-700 text-white p-3 rounded-xl shadow-xl border border-slate-700 dark:border-slate-600 z-50 hidden group-hover:block transition-all text-xs space-y-2 pointer-events-none">
                        <p className="font-semibold border-b border-slate-600 pb-1 mb-2">Grafik Bilgisi</p>
                        <div className="text-slate-300">Seçilen tarih bazına (Rezervasyon / Konaklama) göre kanallardan gelen rezervasyonların (ciro) ve adetlerinin dağılımını gösterir.</div>
                    </div>
                </div>
                <SalesChart data={salesChartData} currency={currency as 'TRY' | 'EUR' | 'USD'} />
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

            {/* Channel Chart */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <ArrowRightLeft size={16} className="text-purple-500 dark:text-purple-400" /> Kanal Dağılımı
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={Object.entries(channelSummary).map(([name, v], i) => ({
                                        name, value: v.count,
                                        revenue: v.revenue,
                                        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6'][i % 7]
                                    }))}
                                    cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" nameKey="name" paddingAngle={2}
                                    label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {Object.entries(channelSummary).map(([,], i) => (
                                        <Cell key={i} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6'][i % 7]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                                                    <p className="font-bold text-slate-900 dark:text-white mb-1">{data.name}</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300">Rezervasyon: <span className="font-medium text-slate-900 dark:text-white">{data.value} adet</span></p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300">Toplam Ciro: <span className="font-medium text-emerald-600 font-bold">{fmt(data.revenue)}</span></p>
                                                </div>
                                            )
                                        }
                                        return null;
                                    }}
                                />
                                <Legend verticalAlign="bottom" height={36} formatter={(value: any) => <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
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
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-1 pl-3 w-full md:w-auto overflow-x-auto whitespace-nowrap scrollbar-none">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mr-1 shrink-0">Konaklama:</span>
                        <input
                            type="date"
                            className="bg-transparent text-slate-900 dark:text-white text-sm outline-none px-2 py-1 w-[120px] shrink-0"
                            value={tempStayStart}
                            onChange={e => setTempStayStart(e.target.value)}
                        />
                        <span className="text-slate-500 shrink-0">-</span>
                        <input
                            type="date"
                            className="bg-transparent text-slate-900 dark:text-white text-sm outline-none px-2 py-1 w-[120px] shrink-0"
                            value={tempStayEnd}
                            onChange={e => setTempStayEnd(e.target.value)}
                        />
                        {(tempStayStart !== stayDateRange.start || tempStayEnd !== stayDateRange.end) && (
                            <button onClick={() => setStayDateRange({ start: tempStayStart, end: tempStayEnd })} className="bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded transition-colors shrink-0">
                                Uygula
                            </button>
                        )}
                        <button onClick={() => { setStayDateRange({ start: '', end: '' }); setTempStayStart(''); setTempStayEnd(''); }} className="px-2 text-[10px] text-slate-500 hover:text-cyan-500 transition-colors shrink-0">
                            Temizle
                        </button>
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
                                    <th onClick={() => toggleSort('guestName')} className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest cursor-pointer hover:text-cyan-600 select-none">
                                        Misafir / Uyruk {sortBy === 'guestName' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th onClick={() => toggleSort('agency')} className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest cursor-pointer hover:text-cyan-600 select-none">
                                        Acente / Kanal {sortBy === 'agency' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th onClick={() => toggleSort('roomType')} className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest cursor-pointer hover:text-cyan-600 select-none">
                                        Oda {sortBy === 'roomType' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th onClick={() => toggleSort('checkIn')} className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest cursor-pointer hover:text-cyan-600 select-none">
                                        Giriş {sortBy === 'checkIn' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th onClick={() => toggleSort('checkOut')} className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest cursor-pointer hover:text-cyan-600 select-none">
                                        Çıkış {sortBy === 'checkOut' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th onClick={() => toggleSort('totalPrice')} className="text-right py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest cursor-pointer hover:text-cyan-600 select-none">
                                        Tutar {sortBy === 'totalPrice' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th onClick={() => toggleSort('saleDate')} className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest cursor-pointer hover:text-cyan-600 select-none">
                                        Rezervasyon {sortBy === 'saleDate' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
                                    <th onClick={() => toggleSort('status')} className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest cursor-pointer hover:text-cyan-600 select-none">
                                        Durum {sortBy === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                                    </th>
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
                                            <p className="text-slate-500 text-xs">{res.country} · {res.roomCount} oda · {res.nights} gece</p>
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
                        {sorted.length.toLocaleString('tr-TR')} kayıttan {((page - 1) * limit) + 1}–{Math.min(page * limit, sorted.length)} gösteriliyor
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
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">{selectedRes.country}</p>
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
                                    <p className="text-slate-500 text-xs uppercase mb-1">Misafir (Pax)</p>
                                    <p className="text-slate-900 dark:text-white flex items-center gap-1.5"><Users size={14} className="text-slate-400" /> {selectedRes.paxCount} Kişi / {selectedRes.roomCount} Oda</p>
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

                            {/* Performance Data */}
                            {(() => {
                                const mKey = `${selectedRes.channel}_${selectedRes.checkIn}`
                                const mData = performances.byMarket[mKey]
                                const mAvg = mData && mData.count > 0 ? mData.sum / mData.count : 0

                                const aData = performances.byAgency[selectedRes.agency]
                                const aAvg = aData && aData.count > 0 ? aData.sum / aData.count : 0

                                const resAds = getAmount(selectedRes.dailyAverage, selectedRes.currency)
                                const isAboveAvg = resAds >= mAvg
                                const pctDiff = mAvg > 0 ? Math.abs(((resAds - mAvg) / mAvg) * 100) : 0

                                return (
                                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-4 mt-2">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1"><TrendingUp size={14} /> Performans Analizi</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">Pazar Ortalamasına Göre</p>
                                                {mAvg > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isAboveAvg ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                                            {isAboveAvg ? '↑' : '↓'} %{pctDiff.toFixed(1)} {isAboveAvg ? 'Üstünde' : 'Altında'}
                                                        </span>
                                                    </div>
                                                ) : <span className="text-slate-500 text-sm">Veri Yok</span>}
                                            </div>
                                            <div>
                                                <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">Ortalama Günlük Gelir (ADR)</p>
                                                <p className="text-slate-900 dark:text-white text-sm font-semibold">{fmt(resAds)}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">Acente Geneli ADR</p>
                                                <p className="text-slate-900 dark:text-white text-sm font-semibold">{aAvg > 0 ? fmt(aAvg) : 'Veri Yok'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">Pazar Geneli ADR ({selectedRes.channel})</p>
                                                <p className="text-slate-900 dark:text-white text-sm font-semibold">{mAvg > 0 ? fmt(mAvg) : 'Veri Yok'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })()}

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

            {/* Cross-Module Navigation */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-3">İlgili Modüller</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { href: pathname.replace('/reservations', '/yield'), label: 'Yield Management', desc: 'ADR analizi, fiyat matrisi', icon: TrendingUp },
                        { href: pathname.replace('/reservations', '/reports'), label: 'Yönetim Raporları', desc: 'S26, Pace, milliyet', icon: BarChart3 },
                        { href: pathname.replace('/reservations', '/extras'), label: 'Ekstra Satışlar', desc: 'SPA, minibar, restoran', icon: ArrowRightLeft },
                        { href: pathname.replace('/reservations', '/statistics'), label: 'İstatistikler', desc: 'Kanal & performans', icon: BarChart3 },
                    ].map((m, i) => (
                        <a key={i} href={m.href} className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors group">
                            <m.icon size={18} className="text-slate-400 group-hover:text-cyan-500 transition-colors flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-white truncate">{m.label}</p>
                                <p className="text-[10px] text-slate-400 truncate">{m.desc}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}
