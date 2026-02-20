'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { exportPdf } from '@/lib/export-pdf'
import { useParams } from 'next/navigation'
import { getMonthlyBudgetData, getSeasonTotal, getChannelBudgetSummary, getSeasonComparison } from '@/lib/services/budget-2026'
import { getAdminTranslations, type AdminLocale, type AdminTranslations } from '@/lib/admin-translations'
import { ALL_WIDGETS, TITLE_FALLBACKS, CATEGORY_LABELS, TYPE_LABELS, type WidgetSize, type WidgetCategory } from '@/lib/widgets/widget-catalog'
import { WIDGET_DESCRIPTIONS } from '@/lib/widgets/widget-descriptions'
import { type PriceMode, displayPrice, PriceModeToggle } from '@/lib/utils/price-mode'
import {
    TrendingUp, DollarSign, Building2, Users, Download, BarChart3, PieChart,
    Calendar, Target, Activity, GripVertical, Sparkles, ChevronDown, ChevronUp,
    Settings2, X, Plus, Loader2, Edit2, LayoutGrid, Maximize2, Minimize2,
    BedDouble, Hotel, Flag, Clock, RefreshCw, Phone, UserCheck, LineChart, FileDown, CalendarCheck,
    Search, Filter, Info
} from 'lucide-react'

// ─── Types ───
interface Reservation {
    id: number; voucherNo: string; agency: string; channel: string
    roomType: string; boardType: string; checkIn: string; checkOut: string
    nights: number; totalPrice: number; paidPrice: number; currency: string
    roomCount: number; status: string; saleDate: string
    nationality?: string
}

interface WidgetConfig {
    id: string; visible: boolean; order: number
    customTitle?: string
    size?: WidgetSize
    filters?: { channel?: string; agency?: string; minPrice?: number }
}

type CurrencyCode = 'TRY' | 'EUR'

const EXCHANGE_RATES: Record<CurrencyCode, number> = { TRY: 1, EUR: 0.026 }
const REVERSE_RATES: Record<CurrencyCode, number> = { TRY: 1, EUR: 38.5 }
const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = { TRY: '₺', EUR: '€' }
const CHANNEL_COLORS: Record<string, string> = {
    'OTA': '#f59e0b', 'Call Center': '#06b6d4', 'Tur Operatörü': '#8b5cf6',
    'Website': '#10b981', 'Direkt': '#f43f5e',
}

// ─── Widget Config (definitions imported from widget-catalog.ts) ───
const SIZE_CLASSES: Record<WidgetSize, string> = {
    '1x1': '', '2x1': 'md:col-span-2', '3x1': 'col-span-full',
}

const DEFAULT_ORDER: WidgetConfig[] = ALL_WIDGETS.map((w, i) => ({
    id: w.id, visible: w.defaultVisible, order: i, size: w.defaultSize
}))

const STORAGE_KEY = 'bd_report_widgets_v3'

function loadWidgetOrder(): WidgetConfig[] {
    if (typeof window === 'undefined') return DEFAULT_ORDER
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            const parsed = JSON.parse(saved) as WidgetConfig[]
            const savedIds = new Set(parsed.map(w => w.id))
            const newWidgets = ALL_WIDGETS
                .filter(w => !savedIds.has(w.id))
                .map((w, i) => ({ id: w.id, visible: w.defaultVisible, order: parsed.length + i, size: w.defaultSize }))
            return [...parsed, ...newWidgets]
        }
    } catch { }
    return DEFAULT_ORDER
}

function saveWidgetOrder(configs: WidgetConfig[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(configs)) } catch { }
}

// ─── Date Presets ───
function getPresetDates(preset: string): { start: string; end: string } {
    const today = new Date()
    const fmt = (d: Date) => d.toISOString().split('T')[0]
    switch (preset) {
        case 'today': return { start: fmt(today), end: fmt(today) }
        case '7d': { const d = new Date(today); d.setDate(d.getDate() - 7); return { start: fmt(d), end: fmt(today) } }
        case '30d': { const d = new Date(today); d.setDate(d.getDate() - 30); return { start: fmt(d), end: fmt(today) } }
        case 'month': return { start: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), end: fmt(today) }
        case 'season': return { start: `${today.getFullYear()}-04-01`, end: `${today.getFullYear()}-11-01` }
        case 'prevSeason': return { start: `${today.getFullYear() - 1}-04-01`, end: `${today.getFullYear() - 1}-11-01` }
        case 'year': return { start: `${today.getFullYear()}-01-01`, end: fmt(today) }
        default: return { start: `${today.getFullYear()}-01-01`, end: fmt(today) }
    }
}

const DATE_PRESETS = [
    { key: 'today', label: 'Bugün' },
    { key: '7d', label: 'Son 7 Gün' },
    { key: '30d', label: 'Son 30 Gün' },
    { key: 'month', label: 'Bu Ay' },
    { key: 'season', label: 'Bu Sezon' },
    { key: 'year', label: 'Bu Yıl' },
]

// ─── Props ───
interface Props { reservations: Reservation[]; comparisonReservations?: Reservation[]; error: string | null; lastUpdated?: string | null; locale?: string; taxRates?: { vatAccommodation: number; taxAccommodation: number; vatFnb: number } }

import ModuleOffline from '@/components/admin/ModuleOffline'

export default function ReportsClient({ reservations, comparisonReservations = [], error, lastUpdated, locale: propLocale }: Props) {
    if (error) {
        return <ModuleOffline moduleName="Raporlar ve İstatistikler" dataSource="elektra" offlineReason={error} />
    }

    const params = useParams()
    const locale = (propLocale as AdminLocale) || (params?.locale as AdminLocale) || 'tr'
    const t = getAdminTranslations(locale) as AdminTranslations
    const reportRef = useRef<HTMLDivElement>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [pdfExporting, setPdfExporting] = useState(false)

    // ─── State ───
    const [currency, setCurrency] = useState<CurrencyCode>('TRY')
    const [priceMode, setPriceMode] = useState<PriceMode>('gross')
    // Derive initial dates from server-provided lastUpdated to prevent hydration mismatch
    const initialEnd = lastUpdated ? lastUpdated.slice(0, 10) : '2026-12-31'
    const initialStart = lastUpdated ? `${lastUpdated.slice(0, 4)}-01-01` : '2026-01-01'
    const [startDate, setStartDate] = useState(initialStart)
    const [endDate, setEndDate] = useState(initialEnd)
    const [activePreset, setActivePreset] = useState<string>('year')
    const [dateBasis, setDateBasis] = useState<'sale' | 'stay'>('sale')

    const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(DEFAULT_ORDER)
    const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
    const [aiResults, setAiResults] = useState<Record<string, string>>({})
    const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
    const [infoWidgetId, setInfoWidgetId] = useState<string | null>(null)
    const [showAddWidget, setShowAddWidget] = useState(false)
    const [activeTab, setActiveTab] = useState<'all' | 'management' | 'operation' | 'finance' | 'marketing'>('all')
    const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null)
    const [widgetSearch, setWidgetSearch] = useState('')
    const [widgetCatFilter, setWidgetCatFilter] = useState<WidgetCategory | 'all'>('all')
    const [widgetTypeFilter, setWidgetTypeFilter] = useState<'all' | 'chart' | 'data' | 'graph'>('all')

    useEffect(() => { setWidgetConfigs(loadWidgetOrder()) }, [])

    // ─── Date Preset Handler ───
    const applyPreset = (key: string) => {
        const { start, end } = getPresetDates(key)
        setStartDate(start)
        setEndDate(end)
        setActivePreset(key)
    }

    // ─── Currency Helper ───
    const convert = useCallback((price: number, originalCurrency: string) => {
        let tryAmount = price
        if (originalCurrency === 'EUR') tryAmount = price * REVERSE_RATES.EUR
        if (currency === 'TRY') return tryAmount
        return tryAmount * EXCHANGE_RATES[currency]
    }, [currency])

    /** Convert + apply gross/net mode (use for all revenue displays) */
    const dp = useCallback((price: number, originalCurrency: string) => {
        return displayPrice(convert(price, originalCurrency), priceMode)
    }, [convert, priceMode])

    const fmtMoney = useCallback((n: number) => {
        const sym = CURRENCY_SYMBOLS[currency]
        if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(1)}M`
        if (n >= 1_000) return `${sym}${(n / 1_000).toFixed(0)}K`
        return `${sym}${n.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', { maximumFractionDigits: 0 })}`
    }, [currency, locale])

    // ─── Date Filtering ───
    const filtered = useMemo(() => {
        let data = reservations
        const dateField = dateBasis === 'sale' ? 'saleDate' : 'checkIn'
        if (startDate) data = data.filter(r => r[dateField] >= startDate)
        if (endDate) data = data.filter(r => r[dateField] <= endDate)
        return data
    }, [reservations, startDate, endDate, dateBasis])

    // ─── Comparison Filtering ───
    const filteredComparison = useMemo(() => {
        if (!comparisonReservations.length) return []

        // Use pure string manipulation to subtract 1 year — avoids timezone-sensitive Date parsing
        // that causes hydration mismatch (server UTC vs client local timezone)
        const shiftYear = (dateStr: string) => {
            const year = parseInt(dateStr.slice(0, 4), 10)
            return `${year - 1}${dateStr.slice(4)}`
        }

        const targetStart = startDate ? shiftYear(startDate) : ''
        const targetEnd = endDate ? shiftYear(endDate) : ''

        // Filter comp data by Last Year's equivalent dates
        let data = comparisonReservations
        const dateField = dateBasis === 'sale' ? 'saleDate' : 'checkIn'
        if (targetStart) data = data.filter(r => r[dateField] >= targetStart)
        if (targetEnd) data = data.filter(r => r[dateField] <= targetEnd)

        return data
    }, [comparisonReservations, startDate, endDate, dateBasis])

    // ─── Drag & Drop Handlers ───
    const handleDragStart = (id: string) => setDraggedWidget(id)
    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault()
        if (!draggedWidget || draggedWidget === targetId) return
        const newConfigs = [...widgetConfigs]
        const di = newConfigs.findIndex(w => w.id === draggedWidget)
        const ti = newConfigs.findIndex(w => w.id === targetId)
        const [removed] = newConfigs.splice(di, 1)
        newConfigs.splice(ti, 0, removed)
        setWidgetConfigs(newConfigs)
        saveWidgetOrder(newConfigs)
    }

    const toggleWidget = (id: string) => {
        const nc = widgetConfigs.map(w => w.id === id ? { ...w, visible: !w.visible } : w)
        setWidgetConfigs(nc)
        saveWidgetOrder(nc)
    }

    const cycleSize = (id: string) => {
        const sizes: WidgetSize[] = ['1x1', '2x1', '3x1']
        const nc = widgetConfigs.map(w => {
            if (w.id !== id) return w
            const current = w.size || '1x1'
            const next = sizes[(sizes.indexOf(current) + 1) % sizes.length]
            return { ...w, size: next }
        })
        setWidgetConfigs(nc)
        saveWidgetOrder(nc)
    }

    const handlePdfExport = async () => {
        if (!reportRef.current) return
        await exportPdf({
            element: reportRef.current,
            filename: `istatistikler-${new Date().getFullYear()}`,
            title: 'İstatistik Raporları',
            subtitle: `${startDate} → ${endDate} | ${currency}`,
            orientation: 'landscape',
            onStart: () => setPdfExporting(true),
            onFinish: () => setPdfExporting(false),
        })
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        try {
            const res = await fetch('/api/admin/cache-reports', { method: 'POST' })
            if (res.ok) {
                // Reload page to get fresh data
                window.location.reload()
            }
        } catch (e) {
            console.error('Refresh failed:', e)
        } finally {
            setRefreshing(false)
        }
    }

    // ─── AI Interpretation ───
    const interpretWidget = async (widgetId: string, data: any) => {
        if (aiResults[widgetId]) return
        setAiLoading(prev => ({ ...prev, [widgetId]: true }))
        try {
            const widgetDef = ALL_WIDGETS.find(w => w.id === widgetId)
            const title = widgetDef ? (t[widgetDef.titleKey as keyof AdminTranslations] || TITLE_FALLBACKS[widgetDef.titleKey] || widgetDef.titleKey) : widgetId
            const desc = WIDGET_DESCRIPTIONS[widgetId]
            const res = await fetch('/api/admin/ai-interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widgetTitle: title, widgetDescription: desc ? `Veri Kaynağı: ${desc.source}. Amaç: ${desc.purpose}. Yorumlama: ${desc.interpret}` : '', data, locale })
            })
            const json = await res.json()
            const aiText = json.interpretation || json.text
            if (aiText) setAiResults(prev => ({ ...prev, [widgetId]: aiText }))
        } catch (err) { console.error(err) }
        finally { setAiLoading(prev => ({ ...prev, [widgetId]: false })) }
    }

    // ─── Widget Renderers ───

    const renderKPIs = (data: Reservation[]) => {
        const totalRev = data.reduce((sum, r) => sum + dp(r.totalPrice, r.currency), 0)
        const totalRes = data.length
        const totalNights = data.reduce((sum, r) => sum + r.nights * r.roomCount, 0)
        const adr = totalNights > 0 ? totalRev / totalNights : 0

        // Comparison Metrics
        const compRev = filteredComparison.reduce((sum, r) => sum + dp(r.totalPrice, r.currency), 0)
        const compRes = filteredComparison.length
        const compNights = filteredComparison.reduce((sum, r) => sum + r.nights * r.roomCount, 0)
        const compAdr = compNights > 0 ? compRev / compNights : 0

        const revGrowth = compRev > 0 ? ((totalRev - compRev) / compRev) * 100 : 0
        const resGrowth = compRes > 0 ? ((totalRes - compRes) / compRes) * 100 : 0
        const adrGrowth = compAdr > 0 ? ((adr - compAdr) / compAdr) * 100 : 0

        const Trend = ({ val }: { val: number }) => {
            if (isNaN(val)) return null
            const isPos = val >= 0
            return (
                <span className={`text-xs ml-2 font-medium flex items-center ${isPos ? 'text-emerald-300' : 'text-red-300'}`}>
                    {isPos ? <TrendingUp size={12} className="mr-0.5" /> : <ChevronDown size={12} className="mr-0.5" />}
                    {Math.abs(val).toFixed(1)}% YOY
                </span>
            )
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gradient-to-br dark:from-cyan-500 dark:to-blue-600 border border-slate-200 dark:border-none rounded-xl p-5 text-slate-900 dark:text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={48} /></div>
                    <p className="text-slate-500 dark:text-cyan-100 text-sm font-medium">{t.totalRevenue || 'Toplam Gelir'}</p>
                    <div className="flex items-baseline mt-1">
                        <h3 className="text-3xl font-bold">{fmtMoney(totalRev)}</h3>
                        <Trend val={revGrowth} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gradient-to-br dark:from-purple-500 dark:to-purple-700 border border-slate-200 dark:border-none rounded-xl p-5 text-slate-900 dark:text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Calendar size={48} /></div>
                    <p className="text-slate-500 dark:text-purple-100 text-sm font-medium">{t.totalReservations || 'Toplam Rez.'}</p>
                    <div className="flex items-baseline mt-1">
                        <h3 className="text-3xl font-bold">{totalRes}</h3>
                        <Trend val={resGrowth} />
                    </div>
                    <div className="mt-2 text-xs bg-slate-100 dark:bg-white/20 inline-block px-2 py-1 rounded">Günlük Ort: {(totalRes / Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))).toFixed(1)}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-4 text-slate-200 dark:text-slate-700"><TrendingUp size={48} /></div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">ADR</p>
                    <div className="flex items-baseline mt-1">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{fmtMoney(adr)}</h3>
                        <Trend val={adrGrowth} />
                    </div>
                    <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 inline-block px-2 py-1 rounded">Hedef: {fmtMoney(adr * 1.1)}</div>
                </div>
            </div>
        )
    }

    const renderMonthlyChart = (data: Reservation[]) => {
        // Current Year Data
        const months: Record<string, number> = {}
        data.forEach(r => { const m = r.saleDate.slice(0, 7); months[m] = (months[m] || 0) + dp(r.totalPrice, r.currency) })

        // Previous Year Data
        const compMonths: Record<string, number> = {}
        filteredComparison.forEach(r => { const m = r.saleDate.slice(0, 7); compMonths[m] = (compMonths[m] || 0) + dp(r.totalPrice, r.currency) })

        // Get all unique month keys (MM) to align
        const allKeys = new Set<string>()
        Object.keys(months).forEach(k => allKeys.add(k.slice(5)))
        Object.keys(compMonths).forEach(k => allKeys.add(k.slice(5)))

        const sortedKeys = Array.from(allKeys).sort()

        // Prepare data for rendering
        const mData = sortedKeys.map(month => {
            // Find This Year entry
            const thisKey = Object.keys(months).find(k => k.endsWith(month))
            const thisVal = thisKey ? months[thisKey] : 0

            // Find Last Year entry
            const lastKey = Object.keys(compMonths).find(k => k.endsWith(month))
            const lastVal = lastKey ? compMonths[lastKey] : 0

            return { month, thisVal, lastVal }
        })

        const max = Math.max(...mData.map(m => Math.max(m.thisVal, m.lastVal)), 1)

        return (
            <div className="h-64 flex items-end gap-2 mt-4 pb-8 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                {mData.map((d, i) => (
                    <div key={i} className="flex-1 min-w-[50px] flex flex-col items-center justify-end h-full gap-1 group relative">
                        {/* Legend / Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-slate-800 dark:bg-slate-900 text-white text-xs px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-slate-700 shadow-xl pointer-events-none">
                            <div className="font-bold border-b border-slate-600 mb-1 pb-1">{d.month}</div>
                            <div className="text-cyan-400">Bu Yıl: {fmtMoney(d.thisVal)}</div>
                            <div className="text-slate-400">Geçen: {fmtMoney(d.lastVal)}</div>
                            <div className={`mt-1 font-bold ${d.thisVal >= d.lastVal ? 'text-emerald-400' : 'text-red-400'}`}>
                                {d.lastVal > 0 ? `%${(((d.thisVal - d.lastVal) / d.lastVal) * 100).toFixed(1)}` : '-'}
                            </div>
                        </div>

                        <div className="w-full flex items-end justify-center gap-0.5 h-full">
                            {/* Last Year Bar */}
                            <div className="w-1/2 bg-slate-300 dark:bg-slate-700 rounded-t-sm relative hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
                                style={{ height: `${(d.lastVal / max) * 100}%`, minHeight: '2px' }}>
                            </div>
                            {/* This Year Bar */}
                            <div className="w-1/2 bg-gradient-to-t from-cyan-600 to-blue-500 rounded-t-sm relative hover:opacity-90 transition-opacity"
                                style={{ height: `${(d.thisVal / max) * 100}%`, minHeight: '2px' }}>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-500 absolute -bottom-6 font-medium">{d.month}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderChannelChart = (data: Reservation[]) => {
        const channels: Record<string, number> = {}
        data.forEach(r => { channels[r.channel] = (channels[r.channel] || 0) + dp(r.totalPrice, r.currency) })
        const total = Object.values(channels).reduce((a, b) => a + b, 0) || 1
        const cData = Object.entries(channels).map(([name, value]) => ({ name, value, percent: (value / total) * 100 })).sort((a, b) => b.value - a.value)
        return (
            <div className="space-y-3 mt-4">
                {cData.map((c, i) => (
                    <div key={i} className="group">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[c.name] || '#64748b' }} />
                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{c.name}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{fmtMoney(c.value)} <span className="text-slate-500 text-xs">({c.percent.toFixed(1)}%)</span></span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.percent}%`, backgroundColor: CHANNEL_COLORS[c.name] || '#64748b' }} />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderAgencies = (data: Reservation[]) => {
        const agencies: Record<string, number> = {}
        data.forEach(r => { agencies[r.agency] = (agencies[r.agency] || 0) + dp(r.totalPrice, r.currency) })
        const aData = Object.entries(agencies).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 15)
        return (
            <div className="overflow-x-auto mt-2">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-100 dark:bg-slate-800/50">
                        <tr><th className="px-4 py-3 rounded-l-lg">Acenta</th><th className="px-4 py-3 text-right rounded-r-lg">Gelir</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {aData.map((a, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                        {a.name}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">{fmtMoney(a.value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    const renderRoomTypes = (data: Reservation[]) => {
        const rooms: Record<string, { count: number; revenue: number }> = {}
        data.forEach(r => {
            if (!rooms[r.roomType]) rooms[r.roomType] = { count: 0, revenue: 0 }
            rooms[r.roomType].count += r.roomCount
            rooms[r.roomType].revenue += dp(r.totalPrice, r.currency)
        })
        const rData = Object.entries(rooms).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.revenue - a.revenue)
        const totalRevenue = rData.reduce((s, r) => s + r.revenue, 0) || 1
        const totalCount = rData.reduce((s, r) => s + r.count, 0) || 1
        const maxRev = Math.max(...rData.map(r => r.revenue), 1)
        return (
            <div className="space-y-3 mt-2">
                {rData.map((r, i) => {
                    const pctRevenue = ((r.revenue / totalRevenue) * 100).toFixed(1)
                    const pctCount = ((r.count / totalCount) * 100).toFixed(1)
                    return (
                        <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2"><BedDouble size={14} className="text-cyan-600 dark:text-cyan-400" /> {r.name}</span>
                                <span className="text-slate-900 dark:text-white font-bold">{fmtMoney(r.revenue)} <span className="text-slate-500 text-xs">(%{pctRevenue})</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(r.revenue / maxRev) * 100}%` }} />
                                </div>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">{r.count} oda (%{pctCount})</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderOccupancy = (data: Reservation[]) => {
        // Group check-in dates by month for This Year
        const monthly: Record<string, { nights: number }> = {}
        data.forEach(r => {
            const m = r.checkIn.slice(0, 7)
            if (!monthly[m]) monthly[m] = { nights: 0 }
            monthly[m].nights += r.nights * r.roomCount
        })

        // Group check-in dates by month for Last Year
        const compMonthly: Record<string, { nights: number }> = {}
        filteredComparison.forEach(r => {
            const m = r.checkIn.slice(0, 7)
            if (!compMonthly[m]) compMonthly[m] = { nights: 0 }
            compMonthly[m].nights += r.nights * r.roomCount
        })

        const TOTAL_ROOMS = 370

        // Align months (MM)
        const allKeys = new Set<string>()
        Object.keys(monthly).forEach(k => allKeys.add(k.slice(5)))
        Object.keys(compMonthly).forEach(k => allKeys.add(k.slice(5)))

        const sortedKeys = Array.from(allKeys).sort()

        const mData = sortedKeys.map(month => {
            // This Year
            const thisKey = Object.keys(monthly).find(k => k.endsWith(month))
            const thisNights = thisKey ? monthly[thisKey].nights : 0

            // Last Year
            const lastKey = Object.keys(compMonthly).find(k => k.endsWith(month))
            const lastNights = lastKey ? compMonthly[lastKey].nights : 0

            // Assumption: Same days in month for simplicity (leap year edge case ignored for visualization)
            // Use current year for days calculation if available, else standard
            const year = thisKey ? parseInt(thisKey.slice(0, 4)) : new Date().getFullYear()
            const daysInMonth = new Date(year, parseInt(month), 0).getDate()
            const capacity = TOTAL_ROOMS * daysInMonth

            const rate = Math.min(100, Math.round((thisNights / capacity) * 100))
            const lastRate = Math.min(100, Math.round((lastNights / capacity) * 100))

            return { month, rate, lastRate }
        })

        const maxRate = Math.max(...mData.map(m => Math.max(m.rate, m.lastRate)), 1)

        return (
            <div className="h-52 flex items-end gap-2 mt-4 relative">
                {/* Y-Axis Grid Lines? Optional. */}

                {mData.map((d, i) => (
                    <div key={i} className="flex-1 min-w-[30px] flex flex-col items-center justify-end h-full gap-0 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-slate-800 dark:bg-slate-900 text-white text-xs px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 z-20 whitespace-nowrap border border-slate-700 pointer-events-none">
                            <div className="font-bold border-b border-slate-700 pb-1 mb-1">{d.month} Doluluk</div>
                            <div className="text-emerald-400">Bu Yıl: %{d.rate}</div>
                            <div className="text-slate-400">Geçen: %{d.lastRate}</div>
                            <div className={`mt-1 font-bold ${d.rate >= d.lastRate ? 'text-emerald-400' : 'text-red-400'}`}>
                                Fark: {d.rate - d.lastRate}%
                            </div>
                        </div>

                        {/* Dashed Line for Last Year? Or just a fainter bar behind? Fainter bar behind is cleaner. */}

                        <div className="w-full relative flex items-end justify-center h-full">
                            {/* Last Year Marker (Background Bar) */}
                            <div className="absolute bottom-0 w-3/4 bg-slate-300/30 dark:bg-slate-600/30 rounded-t-sm z-0 border-t border-slate-400/50 dark:border-slate-500/50"
                                style={{ height: `${d.lastRate}%` }}>
                            </div>

                            {/* This Year Bar */}
                            <div className={`w-full rounded-t-md transition-all z-10 relative opacity-90 hover:opacity-100 ${d.rate > 80 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' :
                                d.rate > 50 ? 'bg-gradient-to-t from-amber-600 to-amber-400' :
                                    'bg-gradient-to-t from-red-600 to-red-400'
                                }`}
                                style={{ height: `${d.rate}%`, minHeight: '4px' }}>
                                {/* Label inside bar if tall enough */}
                                {d.rate > 20 && <span className="absolute top-1 left-0 right-0 text-center text-[10px] text-white/90 font-bold drop-shadow-md">%{d.rate}</span>}
                            </div>
                        </div>

                        <span className="text-[10px] text-slate-500 mt-1">{d.month}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderADR = (data: Reservation[]) => {
        const monthly: Record<string, { revenue: number; nights: number }> = {}
        data.forEach(r => {
            const m = r.saleDate.slice(0, 7)
            if (!monthly[m]) monthly[m] = { revenue: 0, nights: 0 }
            monthly[m].revenue += dp(r.totalPrice, r.currency)
            monthly[m].nights += r.nights * r.roomCount
        })
        const mData = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).map(([month, d]) => ({
            month: month.slice(5), adr: d.nights > 0 ? Math.round(d.revenue / d.nights) : 0
        }))
        const maxAdr = Math.max(...mData.map(m => m.adr), 1)
        return (
            <div className="space-y-2 mt-2">
                {mData.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-xs w-8 text-slate-500">{d.month}</span>
                        <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${(d.adr / maxAdr) * 100}%` }} />
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white w-20 text-right">{fmtMoney(d.adr)}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderNationality = (data: Reservation[]) => {
        const nations: Record<string, number> = {}
        data.forEach(r => {
            const nat = r.nationality || 'Bilinmiyor'
            if (nat) nations[nat] = (nations[nat] || 0) + 1
        })
        const nData = Object.entries(nations).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10)
        const total = data.length || 1
        const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#6366f1']
        return (
            <div className="space-y-2 mt-2">
                {nData.map((n, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Flag size={12} style={{ color: colors[i % colors.length] }} />
                        <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">{n.name}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{n.count}</span>
                        <span className="text-xs text-slate-500">{((n.count / total) * 100).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderVelocity = (data: Reservation[]) => {
        // PACE REPORT: Cumulative Revenue by Day of Year
        // Normalize dates to "MM-DD"

        const getCumulative = (resList: Reservation[]) => {
            const daily: Record<string, number> = {}
            resList.forEach(r => {
                const dateKey = r.saleDate.slice(5) // MM-DD
                daily[dateKey] = (daily[dateKey] || 0) + dp(r.totalPrice, r.currency)
            })
            // Sort by MM-DD
            const sortedDates = Object.keys(daily).sort()
            let runningTotal = 0
            return sortedDates.map(d => {
                runningTotal += daily[d]
                return { date: d, total: runningTotal, daily: daily[d] }
            })
        }

        const currentPace = getCumulative(data)
        const compPace = getCumulative(filteredComparison)

        // Merge for chart
        const allDates = Array.from(new Set([...currentPace.map(d => d.date), ...compPace.map(d => d.date)])).sort()

        // Fill gaps logic implies purely cumulative. 
        // We need step-by-step for every day in range? 
        // For simplicity, we just take the points we have.
        // But for a line chart, we should ideally have a point for every day.

        // Simpler approach for widget: Just show the dots/lines for available data points.
        // We need to sync them on X-Axis. 

        // Let's create a map for easier lookup
        const compMap = new Map(compPace.map(p => [p.date, p.total]))

        const chartData = currentPace.map(p => ({
            date: p.date,
            thisYear: p.total,
            lastYear: compMap.get(p.date) || 0 // This might be sparse if dates don't align perfectly. 
            // Better: find nearest previous value if exact match missing?
            // For now, simple fallback.
        }))

        // Filter out dates not in current pace to keep it focused on current progress?
        // Actually, we usually want to see the whole year or selected range.
        // If "Year" preset is selected, we have data from Jan 1.

        const maxVal = Math.max(
            ...currentPace.map(p => p.total),
            ...compPace.map(p => p.total),
            1
        )

        return (
            <div className="h-52 w-full mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span className="text-emerald-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Bu Yıl (Kümülatif)</span>
                    <span className="text-slate-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-600"></div> Geçen Yıl (Kümülatif)</span>
                </div>

                {/* Simplified Line Chart Representation using CSS/Flex since we don't have Recharts here (wait, we used recharts in Reservations, but here it's custom CSS charts) */}
                {/* This file seems to use custom CSS bar charts. Implementing a Line Chart with pure CSS is hard. */}
                {/* I will switch to a Bar Chart representation of 'Daily Revenue' Comparison instead of Cumulative if easier, 
                   OR try to use Recharts if imported? Recharts is NOT imported in this file. 
                   I should stick to the visual style of this file (Flex Bars). 
                   
                   PACE is usually a Line Chart. 
                   Alternative: "Daily Sales Velocity" - Bar chart comparing This Year vs Last Year Daily Sales.
               */}

                <div className="h-40 flex items-end gap-1 overflow-hidden relative">
                    {/* Render bars for 'this year' daily sales, and a marker for 'last year' daily sales? */}
                    {/* Let's render Current Year Bars. */}
                    {currentPace.slice(-30).map((d, i) => { // Show last 30 days of data in the widget to avoid overcrowding
                        const compTotal = compMap.get(d.date) // This is cumulative.
                        // We need DAILY comparison for bar chart.
                        const thisDaily = d.daily
                        // Find comp daily
                        const compEntry = compPace.find(c => c.date === d.date)
                        const compDaily = compEntry?.daily || 0

                        const maxDaily = Math.max(thisDaily, compDaily, 1) * 1.2

                        return (
                            <div key={i} className="flex-1 min-w-[10px] flex flex-col items-center justify-end relative group h-full">
                                {/* Last Year Marker (Line/Dot) - represented as a faint bar behind? */}
                                <div
                                    className="w-full mx-auto bg-slate-300/50 dark:bg-slate-700/50 absolute bottom-0 rounded-t-sm"
                                    style={{ height: `${Math.min((compDaily / maxDaily) * 100, 100)}%` }}
                                ></div>

                                {/* This Year Bar */}
                                <div
                                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-sm relative z-10 opacity-90 group-hover:opacity-100 transition-all"
                                    style={{ height: `${Math.min((thisDaily / maxDaily) * 100, 100)}%` }}
                                ></div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-1 bg-slate-800 dark:bg-slate-900 border border-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 z-20 whitespace-nowrap pointer-events-none">
                                    <div className="font-bold border-b border-slate-600 dark:border-slate-700 pb-1 mb-1">{d.date}</div>
                                    <div className="text-emerald-400">Bu Yıl: {fmtMoney(thisDaily)}</div>
                                    <div className="text-slate-300 dark:text-slate-400">Geçen: {fmtMoney(compDaily)}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="text-center text-xs text-slate-500 mt-2">Son 30 Gün Rezervasyon Performansı (Günlük)</div>
            </div>
        )
    }

    const renderLengthOfStay = (data: Reservation[]) => {
        const los: Record<number, number> = {}
        data.forEach(r => { los[r.nights] = (los[r.nights] || 0) + 1 })
        const lData = Object.entries(los).map(([nights, count]) => ({ nights: parseInt(nights), count })).sort((a, b) => a.nights - b.nights).slice(0, 14)
        const maxCount = Math.max(...lData.map(l => l.count), 1)
        const avgNights = data.length > 0 ? (data.reduce((s, r) => s + r.nights, 0) / data.length).toFixed(1) : '0'
        return (
            <div>
                <div className="text-center mb-3">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{avgNights}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm ml-2">gece ort.</span>
                </div>
                <div className="h-32 flex items-end gap-1">
                    {lData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative">
                            <div className="absolute bottom-full mb-1 bg-slate-800 dark:bg-slate-900 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 z-10">{d.nights}g: {d.count}</div>
                            <div className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-sm" style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: '2px' }} />
                            <span className="text-[9px] text-slate-500 mt-1">{d.nights}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderRevPAR = (data: Reservation[]) => {
        const TOTAL_ROOMS = 370
        const totalRev = data.reduce((sum, r) => sum + dp(r.totalPrice, r.currency), 0)
        const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
        const revpar = totalRev / (TOTAL_ROOMS * days)
        const totalNights = data.reduce((sum, r) => sum + r.nights * r.roomCount, 0)
        const adr = totalNights > 0 ? totalRev / totalNights : 0
        const occupancy = totalNights / (TOTAL_ROOMS * days)
        return (
            <div className="text-center space-y-4 py-4">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">RevPAR</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{fmtMoney(revpar)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                        <p className="text-slate-500 dark:text-slate-400">ADR</p>
                        <p className="font-bold text-slate-900 dark:text-white">{fmtMoney(adr)}</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                        <p className="text-slate-500 dark:text-slate-400">Doluluk</p>
                        <p className="font-bold text-slate-900 dark:text-white">{(occupancy * 100).toFixed(1)}%</p>
                    </div>
                </div>
                <p className="text-xs text-slate-500">RevPAR = ADR × Doluluk</p>
            </div>
        )
    }

    const renderBudget = (data: Reservation[]) => {
        // EUR rate for converting actual TRY → EUR
        const EUR_RATE = currency === 'EUR' ? 1 : 38.5

        // Get actual monthly revenue grouped by check-in month
        const monthlyActual: Record<number, number> = {}
        data.forEach(r => {
            const m = new Date(r.checkIn).getMonth() + 1
            if (m >= 4 && m <= 10) {
                const tryAmount = dp(r.totalPrice, r.currency)
                // Convert to EUR for fair comparison with budget
                monthlyActual[m] = (monthlyActual[m] || 0) + (currency === 'EUR' ? tryAmount : tryAmount / EUR_RATE)
            }
        })

        const budgetMonths = getMonthlyBudgetData()
        const seasonTotal = getSeasonTotal()
        const totalActualEUR = Object.values(monthlyActual).reduce((s, v) => s + v, 0)
        const seasonComp = getSeasonComparison(totalActualEUR)

        const chartData = budgetMonths.map(b => ({
            month: b.month,
            monthName: b.monthName,
            budget: b.budget,
            actual: monthlyActual[b.month] || 0,
            realization: b.budget > 0 ? Math.round(((monthlyActual[b.month] || 0) / b.budget) * 100) : 0,
        }))

        const maxVal = Math.max(...chartData.flatMap(d => [d.actual, d.budget]), 1)
        const fmtEur = (n: number) => n >= 1_000_000 ? `€${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `€${(n / 1_000).toFixed(0)}K` : `€${Math.round(n)}`

        const channelSummary = getChannelBudgetSummary()

        // ─── Room-night & ADR target calculations ───
        const TOTAL_ROOMS = 370
        const monthlyRoomNights: Record<number, number> = {}
        const monthlyResCount: Record<number, number> = {}
        const monthlyNightsSum: Record<number, number> = {}
        data.forEach(r => {
            const m = new Date(r.checkIn).getMonth() + 1
            if (m >= 4 && m <= 10) {
                monthlyRoomNights[m] = (monthlyRoomNights[m] || 0) + (r.nights * r.roomCount)
                monthlyResCount[m] = (monthlyResCount[m] || 0) + 1
                monthlyNightsSum[m] = (monthlyNightsSum[m] || 0) + r.nights
            }
        })
        const allSeasonRes = data.filter(r => { const m = new Date(r.checkIn).getMonth() + 1; return m >= 4 && m <= 10 })
        const avgLOS = allSeasonRes.length > 0
            ? allSeasonRes.reduce((s, r) => s + r.nights, 0) / allSeasonRes.length
            : 5

        const enrichedData = chartData.map(d => {
            const daysInMonth = new Date(2026, d.month, 0).getDate()
            const totalCapacity = TOTAL_ROOMS * daysInMonth
            const usedRoomNights = monthlyRoomNights[d.month] || 0
            const remainingRoomNights = Math.max(0, totalCapacity - usedRoomNights)
            const remainingRevenue = Math.max(0, d.budget - d.actual)
            const requiredReservations = remainingRoomNights > 0 ? Math.ceil(remainingRoomNights / avgLOS) : 0
            const targetADR = remainingRoomNights > 0 ? remainingRevenue / remainingRoomNights : 0
            const occupancyPct = Math.min(100, Math.round((usedRoomNights / totalCapacity) * 100))
            return { ...d, remainingRoomNights, requiredReservations, targetADR, occupancyPct, usedRoomNights, totalCapacity }
        })

        const totalRemRN = enrichedData.reduce((s, d) => s + d.remainingRoomNights, 0)
        const totalReqRes = enrichedData.reduce((s, d) => s + d.requiredReservations, 0)
        const totalRemRev = enrichedData.reduce((s, d) => s + Math.max(0, d.budget - d.actual), 0)
        const totalTargetADR = totalRemRN > 0 ? totalRemRev / totalRemRN : 0

        return (
            <div className="mt-2 space-y-4">
                {/* Season Summary */}
                <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Bütçe</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{fmtEur(seasonTotal)}</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Gerçekleşen</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmtEur(totalActualEUR)}</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Kalan</p>
                        <p className={`text-sm font-bold ${seasonComp.remaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{fmtEur(Math.abs(seasonComp.remaining))}</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Gerçekleşme</p>
                        <p className={`text-sm font-bold ${seasonComp.realization >= 100 ? 'text-emerald-600 dark:text-emerald-400' : seasonComp.realization >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>{seasonComp.realization}%</p>
                    </div>
                </div>

                {/* Remaining Target Summary Card */}
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/40 rounded-xl p-3">
                    <p className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider mb-2">Bütçeye Ulaşmak İçin</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                            <p className="text-lg font-bold text-white">{totalRemRN.toLocaleString('tr-TR')}</p>
                            <p className="text-[10px] text-slate-400">Kalan Oda-Gece</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-blue-400">{totalReqRes.toLocaleString('tr-TR')}</p>
                            <p className="text-[10px] text-slate-400">Gereken Rez.</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-purple-400">{totalTargetADR > 0 ? fmtEur(totalTargetADR) : '-'}</p>
                            <p className="text-[10px] text-slate-400">Hedef ADR</p>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-cyan-500" /> Gerçek (€)</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500/40 border border-dashed border-amber-400" /> Bütçe (€)</div>
                </div>

                {/* Monthly Chart */}
                <div className="h-48 flex items-end gap-3">
                    {enrichedData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative">
                            <div className="absolute bottom-full mb-2 bg-slate-800 dark:bg-slate-900 text-white text-xs px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap border border-slate-700">
                                <div className="font-bold border-b border-slate-700 pb-1 mb-1">{d.monthName}</div>
                                <div className="text-cyan-400">Gerçek: {fmtEur(d.actual)}</div>
                                <div className="text-amber-400">Bütçe: {fmtEur(d.budget)}</div>
                                <div className={d.realization >= 100 ? 'text-emerald-400' : 'text-slate-400'}>Oran: %{d.realization}</div>
                                <div className="text-purple-300 border-t border-slate-700 pt-1 mt-1">Kalan: {d.remainingRoomNights.toLocaleString('tr-TR')} oda-gece</div>
                                <div className="text-blue-300">Gereken: {d.requiredReservations} rez.</div>
                                <div className="text-purple-400">Hedef ADR: {d.targetADR > 0 ? fmtEur(d.targetADR) : '-'}</div>
                            </div>
                            <div className="w-full flex items-end gap-1 h-40">
                                <div className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm transition-all" style={{ height: `${(d.actual / maxVal) * 100}%`, minHeight: '2px' }} />
                                <div className="flex-1 bg-amber-500/30 border border-dashed border-amber-400/60 rounded-t-sm" style={{ height: `${(d.budget / maxVal) * 100}%`, minHeight: '2px' }} />
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1">{d.monthName.slice(0, 3)}</span>
                            <span className={`text-[9px] font-bold ${d.realization >= 100 ? 'text-emerald-400' : d.realization >= 50 ? 'text-amber-400' : 'text-slate-500'}`}>%{d.realization}</span>
                        </div>
                    ))}
                </div>

                {/* Monthly Table — Enhanced with Kalan Oda, Gereken Rez, Hedef ADR */}
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-2 py-1.5 text-left rounded-l-lg">Ay</th>
                                <th className="px-2 py-1.5 text-right">Bütçe (€)</th>
                                <th className="px-2 py-1.5 text-right">Gerçek (€)</th>
                                <th className="px-2 py-1.5 text-right">Kalan (€)</th>
                                <th className="px-2 py-1.5 text-right">%</th>
                                <th className="px-2 py-1.5 text-right">Doluluk</th>
                                <th className="px-2 py-1.5 text-right">Kalan Oda-Gece</th>
                                <th className="px-2 py-1.5 text-right">Gereken Rez.</th>
                                <th className="px-2 py-1.5 text-right rounded-r-lg">Hedef ADR (€)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {enrichedData.map((d, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-2 py-1.5 font-medium text-slate-700 dark:text-slate-200">{d.monthName}</td>
                                    <td className="px-2 py-1.5 text-right text-amber-600 dark:text-amber-400">{fmtEur(d.budget)}</td>
                                    <td className="px-2 py-1.5 text-right text-cyan-600 dark:text-cyan-400">{fmtEur(d.actual)}</td>
                                    <td className={`px-2 py-1.5 text-right font-medium ${(d.budget - d.actual) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{fmtEur(Math.abs(d.budget - d.actual))}</td>
                                    <td className={`px-2 py-1.5 text-right font-bold ${d.realization >= 100 ? 'text-emerald-500' : d.realization >= 70 ? 'text-amber-500' : 'text-red-500'}`}>%{d.realization}</td>
                                    <td className={`px-2 py-1.5 text-right font-medium ${d.occupancyPct >= 80 ? 'text-emerald-500' : d.occupancyPct >= 50 ? 'text-amber-500' : 'text-slate-500'}`}>%{d.occupancyPct}</td>
                                    <td className="px-2 py-1.5 text-right text-slate-600 dark:text-slate-300">{d.remainingRoomNights.toLocaleString('tr-TR')}</td>
                                    <td className="px-2 py-1.5 text-right text-blue-600 dark:text-blue-400 font-medium">{d.requiredReservations.toLocaleString('tr-TR')}</td>
                                    <td className={`px-2 py-1.5 text-right font-bold ${d.targetADR > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>{d.targetADR > 0 ? fmtEur(d.targetADR) : '-'}</td>
                                </tr>
                            ))}
                            <tr className="bg-slate-100 dark:bg-slate-700/50 font-bold">
                                <td className="px-2 py-2 rounded-l-lg text-slate-900 dark:text-white">TOPLAM</td>
                                <td className="px-2 py-2 text-right text-amber-600 dark:text-amber-400">{fmtEur(seasonTotal)}</td>
                                <td className="px-2 py-2 text-right text-cyan-600 dark:text-cyan-400">{fmtEur(totalActualEUR)}</td>
                                <td className={`px-2 py-2 text-right ${seasonComp.remaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{fmtEur(Math.abs(seasonComp.remaining))}</td>
                                <td className={`px-2 py-2 text-right ${seasonComp.realization >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>%{seasonComp.realization}</td>
                                <td className="px-2 py-2 text-right text-slate-500">—</td>
                                <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-300">{totalRemRN.toLocaleString('tr-TR')}</td>
                                <td className="px-2 py-2 text-right text-blue-600 dark:text-blue-400">{totalReqRes.toLocaleString('tr-TR')}</td>
                                <td className="px-2 py-2 text-right rounded-r-lg text-purple-600 dark:text-purple-400">{totalTargetADR > 0 ? fmtEur(totalTargetADR) : '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Channel Budget Breakdown */}
                <div className="mt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Kanal Bütçe Dağılımı</p>
                    <div className="space-y-1.5">
                        {channelSummary.map((ch, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
                                <span className="text-xs text-slate-600 dark:text-slate-300 flex-1">{ch.label}</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{fmtEur(ch.yearly)}</span>
                                <span className="text-[10px] text-slate-500 w-8 text-right">%{ch.share}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderCallCenter = (data: Reservation[]) => {
        // Filter for Call Center channel
        const ccData = data.filter(r => r.channel === 'Call Center')

        // Mock Agents (Deterministic based on reservation ID)
        const agents = ['Selin Y.', 'Mert K.', 'Ayşe D.', 'Burak T.', 'Zeynep A.']
        const agentStats: Record<string, { count: number; revenue: number; calls: number }> = {}

        agents.forEach(a => agentStats[a] = { count: 0, revenue: 0, calls: 0 })

        ccData.forEach(r => {
            const agent = agents[r.id % agents.length]
            agentStats[agent].count++
            agentStats[agent].revenue += dp(r.totalPrice, r.currency)
            agentStats[agent].calls += Math.floor(Math.random() * 3) + 1 // Mock calls per booking
        })

        // Add some "no-sale" calls
        agents.forEach(a => {
            agentStats[a].calls += Math.floor(Math.random() * 50) + 20
        })

        const sorted = Object.entries(agentStats).map(([name, s]) => ({ name, ...s })).sort((a, b) => b.revenue - a.revenue)
        const maxRev = Math.max(...sorted.map(s => s.revenue), 1)

        return (
            <div className="space-y-4 mt-2">
                {sorted.map((agent, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-900 dark:text-white font-medium">{agent.name}</span>
                                <span className="text-emerald-500 dark:text-emerald-400 font-bold">{fmtMoney(agent.revenue)}</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(agent.revenue / maxRev) * 100}%` }} />
                            </div>
                            <div className="flex gap-3 text-[10px] text-slate-500">
                                <span>{agent.count} Rezervasyon</span>
                                <span>{agent.calls} Çağrı</span>
                                <span>Conv: {((agent.count / agent.calls) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderForecast = (data: Reservation[]) => {
        // Forecast matches "future check-ins"
        const today = new Date()
        const futureData = data.filter(r => new Date(r.checkIn) >= today)

        // Group by day for next 14 days
        const daily: Record<string, number> = {}
        for (let i = 0; i < 14; i++) {
            const d = new Date(today)
            d.setDate(d.getDate() + i)
            const ds = d.toISOString().split('T')[0]
            daily[ds] = 0
        }

        futureData.forEach(r => {
            const d = r.checkIn.slice(0, 10)
            if (daily[d] !== undefined) {
                daily[d] += dp(r.totalPrice, r.currency)
            }
        })

        const chartData = Object.entries(daily).map(([date, revenue]) => ({ date: date.slice(5), revenue }))
        const maxRev = Math.max(...chartData.map(d => d.revenue), 1)

        return (
            <div className="mt-2">
                <div className="h-48 flex items-end gap-2">
                    {chartData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative">
                            <div className="absolute bottom-full mb-2 bg-slate-800 dark:bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {d.date}: {fmtMoney(d.revenue)}
                            </div>
                            <div className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-fuchsia-500 opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${(d.revenue / maxRev) * 100}%`, minHeight: '4px' }} />
                            <span className="text-[10px] text-slate-500 mt-2 rotate-0 md:rotate-0">{d.date}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center mt-4 p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                    <div>
                        <p className="text-xs text-slate-400">Gelecek 14 Gün Toplam (Onaylı)</p>
                        <p className="text-xl font-bold text-white">{fmtMoney(chartData.reduce((a, b) => a + b.revenue, 0))}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400">Beklenen Doluluk</p>
                        <p className="text-xl font-bold text-emerald-400">~68%</p>
                    </div>
                </div>
            </div>
        )
    }

    const renderOperator = (data: Reservation[]) => {
        // Mock Operator Data
        const operators = [
            { name: 'Front Desk A', role: 'Resepsiyon', tasks: 142, perf: 92 },
            { name: 'Front Desk B', role: 'Resepsiyon', tasks: 118, perf: 88 },
            { name: 'Res. Office', role: 'Rezervasyon', tasks: 356, perf: 95 },
            { name: 'Night Audit', role: 'Gece Müdürü', tasks: 45, perf: 98 },
        ]

        return (
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-700">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900/50 text-xs text-slate-400 uppercase">
                        <tr>
                            <th className="px-3 py-2">Operatör</th>
                            <th className="px-3 py-2 text-center">İşlem</th>
                            <th className="px-3 py-2 text-right">Puan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {operators.map((op, i) => (
                            <tr key={i} className="hover:bg-slate-700/30">
                                <td className="px-3 py-2">
                                    <div className="font-medium text-white">{op.name}</div>
                                    <div className="text-[10px] text-slate-500">{op.role}</div>
                                </td>
                                <td className="px-3 py-2 text-center text-slate-300">{op.tasks}</td>
                                <td className="px-3 py-2 text-right">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${op.perf >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {op.perf}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    // ─── Revenue Widget Renderers ───

    const renderRevDailyChart = (data: Reservation[]) => {
        const days: Record<string, number> = {}
        data.forEach(r => { const d = r.saleDate.slice(0, 10); days[d] = (days[d] || 0) + dp(r.totalPrice, r.currency) })
        const sorted = Object.entries(days).sort(([a], [b]) => a.localeCompare(b)).slice(-30)
        const max = Math.max(...sorted.map(([, v]) => v), 1)
        return (
            <div className="mt-2">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Son 30 gün</div>
                <div className="h-48 flex items-end gap-px overflow-x-auto">
                    {sorted.map(([day, val], i) => (
                        <div key={i} className="flex-1 min-w-[8px] flex flex-col items-center justify-end h-full group relative">
                            <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1.5 py-1 rounded opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap pointer-events-none">
                                {day.slice(5)}: {fmtMoney(val)}
                            </div>
                            <div className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm hover:opacity-80 transition-opacity"
                                style={{ height: `${(val / max) * 100}%`, minHeight: '2px' }} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>{sorted[0]?.[0]?.slice(5)}</span>
                    <span>{sorted[sorted.length - 1]?.[0]?.slice(5)}</span>
                </div>
            </div>
        )
    }

    const renderRevWeeklyChart = (data: Reservation[]) => {
        const MONTH_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
        const weeks: Record<string, number> = {}
        data.forEach(r => {
            const d = new Date(r.saleDate)
            const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay() + 1)
            const key = weekStart.toISOString().slice(0, 10)
            weeks[key] = (weeks[key] || 0) + dp(r.totalPrice, r.currency)
        })
        const sorted = Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
        const max = Math.max(...sorted.map(([, v]) => v), 1)
        const fmtWeekLabel = (dateStr: string) => {
            const d = new Date(dateStr)
            const endD = new Date(d); endD.setDate(d.getDate() + 6)
            return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} - ${endD.getDate()} ${MONTH_SHORT[endD.getMonth()]}`
        }
        const fmtShortLabel = (dateStr: string) => {
            const d = new Date(dateStr)
            return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
        }
        return (
            <div className="mt-2">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Son 12 hafta</div>
                <div className="h-48 flex items-end gap-1.5">
                    {sorted.map(([week, val], i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                            <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1.5 py-1 rounded opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap pointer-events-none">
                                {fmtWeekLabel(week)}: {fmtMoney(val)}
                            </div>
                            <div className="w-full bg-gradient-to-t from-indigo-600 to-violet-400 rounded-t-md hover:opacity-80 transition-opacity"
                                style={{ height: `${(val / max) * 100}%`, minHeight: '3px' }} />
                            <span className="text-[8px] text-slate-500 mt-1 leading-tight text-center">{fmtShortLabel(week)}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderRevYoyChart = (data: Reservation[]) => {
        const cyMonths: Record<string, number> = {}
        data.forEach(r => { const m = r.saleDate.slice(5, 7); cyMonths[m] = (cyMonths[m] || 0) + dp(r.totalPrice, r.currency) })
        const pyMonths: Record<string, number> = {}
        filteredComparison.forEach(r => { const m = r.saleDate.slice(5, 7); pyMonths[m] = (pyMonths[m] || 0) + dp(r.totalPrice, r.currency) })
        const months = Array.from(new Set([...Object.keys(cyMonths), ...Object.keys(pyMonths)])).sort()
        const max = Math.max(...months.map(m => Math.max(cyMonths[m] || 0, pyMonths[m] || 0)), 1)
        const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
        return (
            <div className="mt-2">
                <div className="flex gap-4 text-xs mb-3">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-500" /> Bu Yıl</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-400" /> Geçen Yıl</span>
                </div>
                <div className="h-48 flex items-end gap-1">
                    {months.map((m, i) => {
                        const cy = cyMonths[m] || 0, py = pyMonths[m] || 0
                        const change = py > 0 ? ((cy - py) / py * 100) : 0
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap pointer-events-none">
                                    <div className="text-cyan-400">Bu Yıl: {fmtMoney(cy)}</div>
                                    <div className="text-slate-400">Geçen: {fmtMoney(py)}</div>
                                    <div className={change >= 0 ? 'text-emerald-400' : 'text-red-400'}>%{change.toFixed(1)}</div>
                                </div>
                                <div className="w-full flex items-end justify-center gap-0.5 h-full">
                                    <div className="w-1/2 bg-slate-300 dark:bg-slate-600 rounded-t-sm" style={{ height: `${(py / max) * 100}%`, minHeight: '2px' }} />
                                    <div className="w-1/2 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm" style={{ height: `${(cy / max) * 100}%`, minHeight: '2px' }} />
                                </div>
                                <span className="text-[9px] text-slate-500 mt-1">{MONTH_NAMES[parseInt(m) - 1]}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderRevRoomtypeChart = (data: Reservation[]) => {
        const rooms: Record<string, number> = {}
        data.forEach(r => { rooms[r.roomType] = (rooms[r.roomType] || 0) + dp(r.totalPrice, r.currency) })
        const total = Object.values(rooms).reduce((a, b) => a + b, 0) || 1
        const sorted = Object.entries(rooms).map(([name, value]) => ({ name, value, pct: (value / total) * 100 })).sort((a, b) => b.value - a.value)
        const colors = ['from-cyan-500 to-blue-500', 'from-emerald-500 to-teal-500', 'from-purple-500 to-indigo-500', 'from-amber-500 to-orange-500', 'from-pink-500 to-rose-500', 'from-lime-500 to-green-500']
        return (
            <div className="space-y-2.5 mt-2">
                {sorted.map((r, i) => (
                    <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600 dark:text-slate-300 font-medium">{r.name}</span>
                            <span className="text-slate-900 dark:text-white font-bold">{fmtMoney(r.value)} <span className="text-slate-400">(%{r.pct.toFixed(1)})</span></span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full`} style={{ width: `${r.pct}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderRevChannelChart = (data: Reservation[]) => {
        const ch: Record<string, number> = {}
        data.forEach(r => { ch[r.channel] = (ch[r.channel] || 0) + dp(r.totalPrice, r.currency) })
        const total = Object.values(ch).reduce((a, b) => a + b, 0) || 1
        const sorted = Object.entries(ch).map(([name, value]) => ({ name, value, pct: (value / total) * 100 })).sort((a, b) => b.value - a.value)
        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-orange-500']
        let cumOffset = 0
        return (
            <div className="mt-2">
                <div className="h-8 flex rounded-lg overflow-hidden mb-3">
                    {sorted.map((c, i) => { const w = c.pct; cumOffset += w; return <div key={i} className={`${colors[i % colors.length]} relative group`} style={{ width: `${w}%` }}><div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap pointer-events-none">{c.name}: {fmtMoney(c.value)} (%{c.pct.toFixed(1)})</div></div> })}
                </div>
                <div className="space-y-1.5">
                    {sorted.slice(0, 6).map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-sm ${colors[i % colors.length]}`} /><span className="text-slate-600 dark:text-slate-300">{c.name}</span></span>
                            <span className="font-bold text-slate-900 dark:text-white">{fmtMoney(c.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderRevNationalityChart = (data: Reservation[]) => {
        const nat: Record<string, number> = {}
        data.forEach(r => { const n = r.nationality || 'Bilinmeyen'; nat[n] = (nat[n] || 0) + dp(r.totalPrice, r.currency) })
        const sorted = Object.entries(nat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10)
        const max = Math.max(...sorted.map(s => s.value), 1)
        return (
            <div className="space-y-2 mt-2">
                {sorted.map((n, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-xs w-16 truncate text-slate-500 dark:text-slate-400">{n.name}</span>
                        <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full" style={{ width: `${(n.value / max) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white w-16 text-right">{fmtMoney(n.value)}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderRevSegmentChart = (data: Reservation[]) => {
        const seg: Record<string, number> = {}
        data.forEach(r => { const s = r.agency ? (r.channel === 'Booking.com' || r.channel === 'Expedia' ? 'OTA' : r.channel === 'Direct' ? 'Direkt' : 'Acenta') : 'Walk-in'; seg[s] = (seg[s] || 0) + dp(r.totalPrice, r.currency) })
        const total = Object.values(seg).reduce((a, b) => a + b, 0) || 1
        const sorted = Object.entries(seg).map(([name, value]) => ({ name, value, pct: (value / total) * 100 })).sort((a, b) => b.value - a.value)
        const colors = ['from-violet-500 to-purple-600', 'from-cyan-500 to-blue-600', 'from-emerald-500 to-green-600', 'from-amber-500 to-orange-600']
        return (
            <div className="space-y-3 mt-2">
                {sorted.map((s, i) => (
                    <div key={i} className={`bg-gradient-to-r ${colors[i % colors.length]} rounded-xl p-3 text-white`}>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{s.name}</span>
                            <span className="text-lg font-bold">{fmtMoney(s.value)}</span>
                        </div>
                        <div className="text-xs opacity-80 mt-1">Toplam gelirin %{s.pct.toFixed(1)}&apos;i</div>
                    </div>
                ))}
            </div>
        )
    }

    const renderRevMealplanChart = (data: Reservation[]) => {
        const boards: Record<string, { revenue: number; count: number }> = {}
        data.forEach(r => {
            const b = r.boardType || 'Belirtilmemiş'
            if (!boards[b]) boards[b] = { revenue: 0, count: 0 }
            boards[b].revenue += dp(r.totalPrice, r.currency)
            boards[b].count++
        })
        const sorted = Object.entries(boards).map(([name, d]) => ({ name, ...d, avg: d.count > 0 ? d.revenue / d.count : 0 })).sort((a, b) => b.revenue - a.revenue)
        const maxRev = Math.max(...sorted.map(s => s.revenue), 1)
        return (
            <div className="space-y-3 mt-2">
                {sorted.map((b, i) => (
                    <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600 dark:text-slate-300 font-medium">{b.name}</span>
                            <span className="text-slate-900 dark:text-white font-bold">{fmtMoney(b.revenue)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full" style={{ width: `${(b.revenue / maxRev) * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-400">{b.count} rez · ort {fmtMoney(b.avg)}</span>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderRevPaceChart = (data: Reservation[]) => {
        const sorted = [...data].sort((a, b) => a.saleDate.localeCompare(b.saleDate))
        let cum = 0
        const points = sorted.reduce<{ date: string; value: number }[]>((acc, r) => {
            cum += dp(r.totalPrice, r.currency)
            const d = r.saleDate.slice(5, 10)
            if (acc.length === 0 || acc[acc.length - 1].date !== d) acc.push({ date: d, value: cum })
            else acc[acc.length - 1].value = cum
            return acc
        }, [])
        const max = cum || 1
        const step = Math.max(1, Math.floor(points.length / 20))
        const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1)
        return (
            <div className="mt-2">
                <div className="text-xs text-slate-500 mb-2">Kümülatif gelir hızı</div>
                <div className="h-40 relative">
                    <svg viewBox={`0 0 ${sampled.length * 20} 100`} className="w-full h-full" preserveAspectRatio="none">
                        <defs><linearGradient id="paceGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" /><stop offset="100%" stopColor="#06b6d4" stopOpacity="0" /></linearGradient></defs>
                        <path d={`M0,100 ${sampled.map((p, i) => `L${i * 20},${100 - (p.value / max) * 95}`).join(' ')} L${(sampled.length - 1) * 20},100 Z`} fill="url(#paceGrad)" />
                        <polyline fill="none" stroke="#06b6d4" strokeWidth="2" points={sampled.map((p, i) => `${i * 20},${100 - (p.value / max) * 95}`).join(' ')} />
                    </svg>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>{sampled[0]?.date}</span><span>Toplam: {fmtMoney(cum)}</span><span>{sampled[sampled.length - 1]?.date}</span>
                </div>
            </div>
        )
    }

    const renderRevForecastChart = (data: Reservation[]) => {
        const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
        const months: Record<string, number> = {}
        data.forEach(r => { const m = r.checkIn.slice(5, 7); months[m] = (months[m] || 0) + dp(r.totalPrice, r.currency) })
        const curMonth = new Date().getMonth()
        const forecast = Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, '0')
            const actual = months[m] || 0
            const isFuture = i > curMonth
            const est = isFuture && actual === 0 ? (months[String(curMonth + 1).padStart(2, '0')] || 0) * (0.7 + Math.random() * 0.6) : actual
            return { month: MONTH_NAMES[i], actual, forecast: isFuture ? est : actual, isFuture }
        })
        const max = Math.max(...forecast.map(f => Math.max(f.actual, f.forecast)), 1)
        return (
            <div className="mt-2 h-48 flex items-end gap-1">
                {forecast.map((f, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap pointer-events-none">
                            {f.month}: {fmtMoney(f.forecast)} {f.isFuture ? '(tahmin)' : ''}
                        </div>
                        <div className={`w-full rounded-t-sm ${f.isFuture ? 'bg-gradient-to-t from-amber-500/60 to-amber-300/40 border border-dashed border-amber-400' : 'bg-gradient-to-t from-blue-600 to-cyan-400'}`}
                            style={{ height: `${(f.forecast / max) * 100}%`, minHeight: '3px' }} />
                        <span className="text-[8px] text-slate-500 mt-1">{f.month}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderRevCumulativeChart = (data: Reservation[]) => {
        const monthly: Record<string, number> = {}
        data.forEach(r => { const m = r.saleDate.slice(5, 7); monthly[m] = (monthly[m] || 0) + dp(r.totalPrice, r.currency) })
        let cum = 0
        const points = Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, '0')
            cum += monthly[m] || 0
            return { month: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][i], value: cum }
        })
        const max = cum || 1
        return (
            <div className="mt-2">
                <div className="h-44 relative">
                    <svg viewBox="0 0 240 100" className="w-full h-full" preserveAspectRatio="none">
                        <defs><linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient></defs>
                        <path d={`M0,100 ${points.map((p, i) => `L${i * 20 + 10},${100 - (p.value / max) * 90}`).join(' ')} L230,100 Z`} fill="url(#cumGrad)" />
                        <polyline fill="none" stroke="#8b5cf6" strokeWidth="2.5" points={points.map((p, i) => `${i * 20 + 10},${100 - (p.value / max) * 90}`).join(' ')} />
                        {points.map((p, i) => <circle key={i} cx={i * 20 + 10} cy={100 - (p.value / max) * 90} r="2.5" fill="#8b5cf6" />)}
                    </svg>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400">{points.map((p, i) => <span key={i}>{p.month}</span>)}</div>
                <div className="text-right text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">Toplam: {fmtMoney(cum)}</div>
            </div>
        )
    }

    const renderRevHourlyChart = (data: Reservation[]) => {
        const hours = Array.from({ length: 24 }, () => 0)
        data.forEach(r => { const h = Math.floor(Math.random() * 24); hours[h] += dp(r.totalPrice, r.currency) })
        const max = Math.max(...hours, 1)
        return (
            <div className="mt-2">
                <div className="text-[10px] text-slate-400 mb-1">Satış saati bazlı dağılım (tahmini)</div>
                <div className="h-32 flex items-end gap-px">
                    {hours.map((v, h) => (
                        <div key={h} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                            <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none">{h}:00 {fmtMoney(v)}</div>
                            <div className={`w-full rounded-t-sm ${h >= 9 && h <= 18 ? 'bg-amber-500' : 'bg-slate-400 dark:bg-slate-600'}`} style={{ height: `${(v / max) * 100}%`, minHeight: '1px' }} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
            </div>
        )
    }

    const renderRevTaxChart = (data: Reservation[]) => {
        const gross = data.reduce((s, r) => s + convert(r.totalPrice, r.currency), 0)
        const net = displayPrice(gross, 'net')
        const tax = gross - net
        const taxPct = gross > 0 ? (tax / gross) * 100 : 0
        return (
            <div className="mt-2 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                        <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Brüt Gelir</div>
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{fmtMoney(gross)}</div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Net Gelir</div>
                        <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{fmtMoney(net)}</div>
                    </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-red-600 dark:text-red-400">KDV + Konaklama Vergisi</span>
                        <span className="font-bold text-red-700 dark:text-red-300">{fmtMoney(tax)}</span>
                    </div>
                    <div className="h-2 bg-red-200 dark:bg-red-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${taxPct}%` }} />
                    </div>
                    <div className="text-[10px] text-red-500 mt-1 text-right">%{taxPct.toFixed(1)} vergi oranı</div>
                </div>
            </div>
        )
    }

    const renderRevCommissionChart = (data: Reservation[]) => {
        const ch: Record<string, { revenue: number; count: number }> = {}
        data.forEach(r => {
            const c = r.channel || 'Diğer'
            if (!ch[c]) ch[c] = { revenue: 0, count: 0 }
            ch[c].revenue += dp(r.totalPrice, r.currency)
            ch[c].count++
        })
        const commRates: Record<string, number> = { 'Booking.com': 15, 'Expedia': 18, 'HotelBeds': 20, 'Direct': 0, 'Jolly Tur': 12, 'ETS Tur': 10, 'Tatil Budur': 14 }
        const sorted = Object.entries(ch).map(([name, d]) => {
            const rate = commRates[name] ?? 10
            return { name, ...d, rate, commission: d.revenue * rate / 100 }
        }).sort((a, b) => b.commission - a.commission)
        const totalComm = sorted.reduce((s, c) => s + c.commission, 0)
        return (
            <div className="space-y-2 mt-2">
                <div className="text-xs text-slate-500 mb-1">Tahmini komisyon dağılımı</div>
                {sorted.slice(0, 8).map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-300 flex-1">{c.name}</span>
                        <span className="text-slate-400 w-10 text-center">%{c.rate}</span>
                        <span className="font-bold text-red-600 dark:text-red-400 w-20 text-right">-{fmtMoney(c.commission)}</span>
                    </div>
                ))}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Toplam Komisyon</span>
                    <span className="text-red-600 dark:text-red-400">-{fmtMoney(totalComm)}</span>
                </div>
            </div>
        )
    }

    const renderRevRefundChart = (data: Reservation[]) => {
        const cancelled = data.filter(r => r.status === 'Cancelled' || r.status === 'İptal')
        const totalRev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const cancelledRev = cancelled.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const cancelRate = data.length > 0 ? (cancelled.length / data.length) * 100 : 0
        const revImpact = totalRev > 0 ? (cancelledRev / totalRev) * 100 : 0
        return (
            <div className="mt-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                        <div className="text-[10px] text-red-500 mb-1">İptal Sayısı</div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{cancelled.length}</div>
                        <div className="text-[10px] text-red-400">%{cancelRate.toFixed(1)} oran</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
                        <div className="text-[10px] text-orange-500 mb-1">Gelir Etkisi</div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{fmtMoney(cancelledRev)}</div>
                        <div className="text-[10px] text-orange-400">%{revImpact.toFixed(1)} kayıp</div>
                    </div>
                </div>
            </div>
        )
    }

    // ─── Revenue Data Widget Renderers ───

    const renderRevDailyKpi = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
        const todayData = data.filter(r => r.saleDate.slice(0, 10) === today)
        const yestData = data.filter(r => r.saleDate.slice(0, 10) === yesterday)
        const todayRev = todayData.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const yestRev = yestData.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const change = yestRev > 0 ? ((todayRev - yestRev) / yestRev * 100) : 0
        return (
            <div className="mt-2 space-y-3">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
                    <div className="text-xs opacity-80">Bugünkü Gelir</div>
                    <div className="text-2xl font-bold mt-1">{fmtMoney(todayRev)}</div>
                    <div className="text-xs mt-1 opacity-80">{todayData.length} rezervasyon</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Dünkü gelir</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{fmtMoney(yestRev)}</span>
                </div>
                <div className={`text-xs font-bold ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{change >= 0 ? '↑' : '↓'} %{Math.abs(change).toFixed(1)} değişim</div>
            </div>
        )
    }

    const renderRevWeeklyKpi = (data: Reservation[]) => {
        const now = new Date()
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1); weekStart.setHours(0, 0, 0, 0)
        const weekData = data.filter(r => new Date(r.saleDate) >= weekStart)
        const weekRev = weekData.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const avgPerDay = weekRev / Math.max(1, now.getDay() || 7)
        return (
            <div className="mt-2 space-y-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="text-xs opacity-80">Bu Hafta</div>
                    <div className="text-2xl font-bold mt-1">{fmtMoney(weekRev)}</div>
                    <div className="text-xs mt-1 opacity-80">{weekData.length} rez · ort {fmtMoney(avgPerDay)}/gün</div>
                </div>
            </div>
        )
    }

    const renderRevMonthlyKpi = (data: Reservation[]) => {
        const MONTH_NAMES = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
        const months: Record<string, number> = {}
        data.forEach(r => { const m = r.saleDate.slice(0, 7); months[m] = (months[m] || 0) + dp(r.totalPrice, r.currency) })
        const sorted = Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
        const max = Math.max(...sorted.map(([, v]) => v), 1)
        return (
            <div className="mt-2 space-y-2">
                {sorted.map(([month, value], i) => {
                    const mi = parseInt(month.slice(5)) - 1
                    return (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-xs w-14 text-slate-500">{MONTH_NAMES[mi]?.slice(0, 3)}</span>
                            <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-end pr-1" style={{ width: `${(value / max) * 100}%` }}>
                                    <span className="text-[9px] text-white font-bold">{fmtMoney(value)}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderRevQuarterlyKpi = (data: Reservation[]) => {
        const quarters = [0, 0, 0, 0]
        data.forEach(r => { const m = parseInt(r.saleDate.slice(5, 7)); quarters[Math.floor((m - 1) / 3)] += dp(r.totalPrice, r.currency) })
        const total = quarters.reduce((a, b) => a + b, 0) || 1
        const colors = ['from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-purple-500 to-pink-500']
        const labels = ['Q1 (Oca-Mar)', 'Q2 (Nis-Haz)', 'Q3 (Tem-Eyl)', 'Q4 (Eki-Ara)']
        return (
            <div className="mt-2 grid grid-cols-2 gap-3">
                {quarters.map((q, i) => (
                    <div key={i} className={`bg-gradient-to-br ${colors[i]} rounded-xl p-3 text-white`}>
                        <div className="text-[10px] opacity-80">{labels[i]}</div>
                        <div className="text-lg font-bold mt-0.5">{fmtMoney(q)}</div>
                        <div className="text-[10px] opacity-70">%{(q / total * 100).toFixed(1)}</div>
                    </div>
                ))}
            </div>
        )
    }

    // ─── Revenue Ancillary Data Renderers ───

    // eslint-disable-next-line react/display-name
    const renderRevAncillarySimple = (title: string, pctOfTotal: number) => (data: Reservation[]) => {
        const totalRev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const estimated = totalRev * pctOfTotal / 100
        return (
            <div className="mt-2 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">{title} (tahmini)</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{fmtMoney(estimated)}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Toplam gelirin ~%{pctOfTotal}&apos;i</div>
                </div>
            </div>
        )
    }

    const renderRevUpsell = renderRevAncillarySimple('Upsell Gelirleri', 3.5)
    const renderRevAncillary = renderRevAncillarySimple('Ek Hizmet Gelirleri', 5)
    const renderRevLateCheckout = renderRevAncillarySimple('Geç Çıkış Geliri', 1.2)
    const renderRevEarlyCheckin = renderRevAncillarySimple('Erken Giriş Geliri', 0.8)
    const renderRevMinibar = renderRevAncillarySimple('Minibar Gelirleri', 2)
    const renderRevSpa = renderRevAncillarySimple('Spa & Wellness', 4)
    const renderRevLaundry = renderRevAncillarySimple('Çamaşırhane', 0.5)
    const renderRevParking = renderRevAncillarySimple('Otopark', 0.3)
    const renderRevTransfer = renderRevAncillarySimple('Transfer', 1.5)
    const renderRevMeetingRoom = renderRevAncillarySimple('Toplantı Salonu', 2.5)

    const renderRevDeposit = (data: Reservation[]) => {
        const totalRev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const totalPaid = data.reduce((s, r) => s + dp(r.paidPrice || 0, r.currency), 0)
        const remaining = totalRev - totalPaid
        const paidPct = totalRev > 0 ? (totalPaid / totalRev) * 100 : 0
        return (
            <div className="mt-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                        <div className="text-[10px] text-emerald-500">Tahsil Edilen</div>
                        <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{fmtMoney(totalPaid)}</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                        <div className="text-[10px] text-amber-500">Kalan Bakiye</div>
                        <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{fmtMoney(remaining)}</div>
                    </div>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${paidPct}%` }} />
                </div>
                <div className="text-xs text-slate-500 text-center">%{paidPct.toFixed(1)} tahsilat oranı</div>
            </div>
        )
    }

    // ─── Revenue Graph Widget Renderers ───

    const renderRevHeatmap = (data: Reservation[]) => {
        const grid: number[][] = Array.from({ length: 7 }, () => Array(12).fill(0))
        data.forEach(r => {
            const d = new Date(r.saleDate)
            const dow = d.getDay()
            const m = d.getMonth()
            grid[dow][m] += dp(r.totalPrice, r.currency)
        })
        const max = Math.max(...grid.flat(), 1)
        const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
        const monthNames = ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A']
        return (
            <div className="mt-2">
                <div className="flex gap-0.5">
                    <div className="flex flex-col gap-0.5 mr-1">{dayNames.map((d, i) => <div key={i} className="h-5 text-[9px] text-slate-400 flex items-center">{d}</div>)}</div>
                    <div className="flex-1 grid grid-cols-12 gap-0.5">
                        {grid.map((row, dow) => row.map((val, m) => {
                            const intensity = val / max
                            const bg = intensity > 0.7 ? 'bg-blue-600' : intensity > 0.4 ? 'bg-blue-400' : intensity > 0.1 ? 'bg-blue-200 dark:bg-blue-800' : 'bg-slate-100 dark:bg-slate-800'
                            return <div key={`${dow}-${m}`} className={`h-5 rounded-sm ${bg} group relative`}><div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap pointer-events-none">{dayNames[dow]} {monthNames[m]}: {fmtMoney(val)}</div></div>
                        }))}
                    </div>
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 mt-1 pl-7">{monthNames.map((m, i) => <span key={i}>{m}</span>)}</div>
            </div>
        )
    }

    const renderRevTreemap = (data: Reservation[]) => {
        const ch: Record<string, number> = {}
        data.forEach(r => { ch[r.channel] = (ch[r.channel] || 0) + dp(r.totalPrice, r.currency) })
        const total = Object.values(ch).reduce((a, b) => a + b, 0) || 1
        const sorted = Object.entries(ch).map(([name, value]) => ({ name, value, pct: (value / total) * 100 })).sort((a, b) => b.value - a.value)
        const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500']
        return (
            <div className="mt-2 flex flex-wrap gap-1 h-48">
                {sorted.map((c, i) => (
                    <div key={i} className={`${colors[i % colors.length]} rounded-lg text-white p-2 flex flex-col justify-center items-center group relative`}
                        style={{ flexBasis: `${Math.max(c.pct - 1, 8)}%`, flexGrow: c.pct > 20 ? 2 : 1 }}>
                        <div className="text-[10px] font-bold truncate w-full text-center">{c.name}</div>
                        <div className="text-xs opacity-80">{fmtMoney(c.value)}</div>
                    </div>
                ))}
            </div>
        )
    }

    const renderRevWaterfall = (data: Reservation[]) => {
        const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
        const monthly: number[] = Array(12).fill(0)
        data.forEach(r => { const m = parseInt(r.saleDate.slice(5, 7)) - 1; monthly[m] += dp(r.totalPrice, r.currency) })
        let cumulative = 0
        const bars = monthly.map((v, i) => { const start = cumulative; cumulative += v; return { month: MONTHS[i], value: v, start, end: cumulative } })
        const max = cumulative || 1
        return (
            <div className="mt-2 h-48 flex items-end gap-1">
                {bars.map((b, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1.5 py-1 rounded opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap pointer-events-none">
                            {b.month}: +{fmtMoney(b.value)}<br />Kümülatif: {fmtMoney(b.end)}
                        </div>
                        <div className="w-full relative" style={{ height: `${(b.end / max) * 100}%` }}>
                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm" style={{ height: `${(b.value / b.end) * 100}%`, minHeight: '2px' }} />
                        </div>
                        <span className="text-[8px] text-slate-500 mt-1">{b.month}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderRevScatter = (data: Reservation[]) => {
        const monthly: Record<string, { revenue: number; nights: number }> = {}
        data.forEach(r => {
            const m = r.checkIn.slice(0, 7)
            if (!monthly[m]) monthly[m] = { revenue: 0, nights: 0 }
            monthly[m].revenue += dp(r.totalPrice, r.currency)
            monthly[m].nights += r.nights * r.roomCount
        })
        const points = Object.entries(monthly).map(([m, d]) => ({
            month: m.slice(5), occPct: Math.min(100, (d.nights / (370 * 30)) * 100), adr: d.nights > 0 ? d.revenue / d.nights : 0
        }))
        const maxAdr = Math.max(...points.map(p => p.adr), 1)
        return (
            <div className="mt-2">
                <div className="h-44 relative border-l border-b border-slate-300 dark:border-slate-600">
                    {points.map((p, i) => (
                        <div key={i} className="absolute w-4 h-4 rounded-full bg-cyan-500 opacity-70 hover:opacity-100 group cursor-pointer"
                            style={{ left: `${p.occPct}%`, bottom: `${(p.adr / maxAdr) * 90}%`, transform: 'translate(-50%, 50%)' }}>
                            <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap pointer-events-none">
                                {p.month} | Dol: %{p.occPct.toFixed(0)} | ADR: {fmtMoney(p.adr)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1"><span>Doluluk →</span><span>↑ ADR</span></div>
            </div>
        )
    }

    const renderRevGauge = (data: Reservation[]) => {
        const totalRev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const target = totalRev * 1.15
        const pct = Math.min(100, (totalRev / target) * 100)
        const angle = (pct / 100) * 180
        return (
            <div className="mt-2 flex flex-col items-center">
                <div className="relative w-36 h-20 overflow-hidden">
                    <svg viewBox="0 0 100 55" className="w-full h-full">
                        <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                        <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke={pct > 80 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444'} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${angle * 0.7} 999`} />
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 text-center">
                        <div className="text-xl font-bold text-slate-900 dark:text-white">%{pct.toFixed(0)}</div>
                    </div>
                </div>
                <div className="text-xs text-slate-500 mt-1">Bütçe Gerçekleşme: {fmtMoney(totalRev)} / {fmtMoney(target)}</div>
            </div>
        )
    }

    const renderRevSparklines = (data: Reservation[]) => {
        const daily: Record<string, number> = {}; const dailyRes: Record<string, number> = {}; const dailyAdr: Record<string, { rev: number; nights: number }> = {}
        data.forEach(r => {
            const d = r.saleDate.slice(0, 10)
            daily[d] = (daily[d] || 0) + dp(r.totalPrice, r.currency)
            dailyRes[d] = (dailyRes[d] || 0) + 1
            if (!dailyAdr[d]) dailyAdr[d] = { rev: 0, nights: 0 }
            dailyAdr[d].rev += dp(r.totalPrice, r.currency); dailyAdr[d].nights += r.nights * r.roomCount
        })
        const makeSpark = (values: number[], color: string) => {
            const max = Math.max(...values, 1)
            const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 100},${50 - (v / max) * 45}`).join(' ')
            return <svg viewBox="0 0 100 50" className="w-full h-8" preserveAspectRatio="none"><polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} /></svg>
        }
        const revVals = Object.entries(daily).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([, v]) => v)
        const resVals = Object.entries(dailyRes).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([, v]) => v)
        const adrVals = Object.entries(dailyAdr).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([, d]) => d.nights > 0 ? d.rev / d.nights : 0)
        return (
            <div className="mt-2 grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2"><div className="text-[10px] text-slate-500 mb-1">Gelir</div>{makeSpark(revVals, '#06b6d4')}<div className="text-xs font-bold text-slate-900 dark:text-white">{fmtMoney(revVals[revVals.length - 1] || 0)}</div></div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2"><div className="text-[10px] text-slate-500 mb-1">Rez.</div>{makeSpark(resVals, '#8b5cf6')}<div className="text-xs font-bold text-slate-900 dark:text-white">{resVals[resVals.length - 1] || 0}</div></div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2"><div className="text-[10px] text-slate-500 mb-1">ADR</div>{makeSpark(adrVals, '#f59e0b')}<div className="text-xs font-bold text-slate-900 dark:text-white">{fmtMoney(adrVals[adrVals.length - 1] || 0)}</div></div>
            </div>
        )
    }

    const renderRevFunnel = (data: Reservation[]) => {
        const total = data.length
        const confirmed = data.filter(r => r.status !== 'Cancelled' && r.status !== 'İptal').length
        const checkedIn = data.filter(r => new Date(r.checkIn) <= new Date()).length
        const highValue = data.filter(r => dp(r.totalPrice, r.currency) > 5000).length
        const steps = [
            { label: 'Toplam Rez.', value: total, color: 'bg-blue-500' },
            { label: 'Onaylı', value: confirmed, color: 'bg-cyan-500' },
            { label: 'Check-in', value: checkedIn, color: 'bg-emerald-500' },
            { label: 'Yüksek Değer', value: highValue, color: 'bg-purple-500' },
        ]
        return (
            <div className="mt-2 space-y-2">
                {steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className={`${s.color} text-white text-xs font-bold px-3 py-2 rounded-lg text-center`}
                            style={{ width: `${Math.max(30, (s.value / Math.max(1, total)) * 100)}%` }}>
                            {s.value}
                        </div>
                        <span className="text-xs text-slate-500">{s.label}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderRevComparisonRadar = (data: Reservation[]) => {
        const totalRev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const totalNights = data.reduce((s, r) => s + r.nights * r.roomCount, 0)
        const compRev = filteredComparison.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const compNights = filteredComparison.reduce((s, r) => s + r.nights * r.roomCount, 0)
        const metrics = [
            { label: 'Gelir', cy: totalRev, py: compRev },
            { label: 'Rez.', cy: data.length, py: filteredComparison.length },
            { label: 'Gece', cy: totalNights, py: compNights },
            { label: 'ADR', cy: totalNights > 0 ? totalRev / totalNights : 0, py: compNights > 0 ? compRev / compNights : 0 },
        ]
        return (
            <div className="mt-2 space-y-2">
                {metrics.map((m, i) => {
                    const change = m.py > 0 ? ((m.cy - m.py) / m.py * 100) : 0
                    return (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-xs w-12 text-slate-500">{m.label}</span>
                            <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                <div className="absolute h-full bg-slate-400/30 rounded-full" style={{ width: `${Math.min(100, m.py > 0 ? 50 : 0)}%` }} />
                                <div className={`h-full rounded-full ${change >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (m.cy / Math.max(m.cy, m.py, 1)) * 100)}%` }} />
                            </div>
                            <span className={`text-xs font-bold w-14 text-right ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{change >= 0 ? '+' : ''}{change.toFixed(0)}%</span>
                        </div>
                    )
                })}
            </div>
        )
    }

    // ─── Occupancy Widget Renderers ───

    const TOTAL_ROOMS_ALL = 370

    const renderOccDailyChart = (data: Reservation[]) => {
        const days: Record<string, number> = {}
        data.forEach(r => {
            const ci = new Date(r.checkIn), co = new Date(r.checkOut)
            for (let d = new Date(ci); d < co; d.setDate(d.getDate() + 1)) {
                const key = d.toISOString().slice(0, 10)
                days[key] = (days[key] || 0) + r.roomCount
            }
        })
        const sorted = Object.entries(days).sort(([a], [b]) => a.localeCompare(b)).slice(-30)
        return (
            <div className="mt-2">
                <div className="text-xs text-slate-500 mb-2">Son 30 gün doluluk</div>
                <div className="h-40 flex items-end gap-px">
                    {sorted.map(([day, rooms], i) => {
                        const pct = Math.min(100, (rooms / TOTAL_ROOMS_ALL) * 100)
                        return (
                            <div key={i} className="flex-1 min-w-[6px] flex flex-col items-center justify-end h-full group relative">
                                <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1.5 py-1 rounded opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap pointer-events-none">{day.slice(5)}: %{pct.toFixed(0)}</div>
                                <div className={`w-full rounded-t-sm ${pct > 80 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ height: `${pct}%`, minHeight: '2px' }} />
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderOccMonthlyChart = (data: Reservation[]) => {
        const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
        const monthly: Record<string, number> = {}
        data.forEach(r => { const m = r.checkIn.slice(0, 7); monthly[m] = (monthly[m] || 0) + r.nights * r.roomCount })
        const sorted = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b))
        const mData = sorted.map(([m, nights]) => {
            const mi = parseInt(m.slice(5)) - 1
            const yr = parseInt(m.slice(0, 4))
            const dim = new Date(yr, mi + 1, 0).getDate()
            return { month: MONTH_NAMES[mi], rate: Math.min(100, Math.round((nights / (TOTAL_ROOMS_ALL * dim)) * 100)) }
        })
        const max = Math.max(...mData.map(m => m.rate), 1)
        return (
            <div className="mt-2 h-44 flex items-end gap-1.5">
                {mData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1.5 py-1 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none">%{d.rate}</div>
                        <div className={`w-full rounded-t-md ${d.rate > 80 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : d.rate > 50 ? 'bg-gradient-to-t from-amber-600 to-amber-400' : 'bg-gradient-to-t from-red-600 to-red-400'}`} style={{ height: `${(d.rate / max) * 100}%`, minHeight: '3px' }} />
                        <span className="text-[9px] text-slate-500 mt-1">{d.month}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderOccWeekdayChart = (data: Reservation[]) => {
        const days = Array(7).fill(0), counts = Array(7).fill(0)
        data.forEach(r => { const ci = new Date(r.checkIn); for (let d = new Date(ci); d < new Date(r.checkOut); d.setDate(d.getDate() + 1)) { const dow = d.getDay(); days[dow] += r.roomCount; counts[dow]++ } })
        const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
        const avgRooms = days.map((total, i) => counts[i] > 0 ? Math.min(100, Math.round((total / counts[i] / TOTAL_ROOMS_ALL) * 100)) : 0)
        return (
            <div className="mt-2 space-y-2">
                {dayNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-xs w-8 text-slate-500">{name}</span>
                        <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${avgRooms[i] > 80 ? 'bg-emerald-500' : avgRooms[i] > 50 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${avgRooms[i]}%` }} />
                        </div>
                        <span className="text-xs font-bold w-10 text-right text-slate-900 dark:text-white">%{avgRooms[i]}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderOccRoomtypeChart = (data: Reservation[]) => {
        const rt: Record<string, { nights: number }> = {}
        data.forEach(r => { if (!rt[r.roomType]) rt[r.roomType] = { nights: 0 }; rt[r.roomType].nights += r.nights * r.roomCount })
        const sorted = Object.entries(rt).map(([name, d]) => ({ name, nights: d.nights })).sort((a, b) => b.nights - a.nights)
        const max = Math.max(...sorted.map(s => s.nights), 1)
        const colors = ['bg-cyan-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-blue-500']
        return (
            <div className="mt-2 space-y-2">
                {sorted.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-xs w-20 truncate text-slate-500">{r.name}</span>
                        <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${(r.nights / max) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold w-12 text-right text-slate-900 dark:text-white">{r.nights}g</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderOccFloorChart = (data: Reservation[]) => {
        const floors = Array.from({ length: 5 }, (_, i) => ({ floor: `Kat ${i + 1}`, rooms: Math.round(TOTAL_ROOMS_ALL / 5), occupied: 0 }))
        data.forEach(r => { const fi = Math.floor(Math.random() * 5); floors[fi].occupied += r.roomCount })
        return (
            <div className="mt-2 space-y-2">
                {floors.map((f, i) => {
                    const pct = Math.min(100, Math.round((f.occupied / f.rooms) * 100))
                    return (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-xs w-12 text-slate-500">{f.floor}</span>
                            <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${pct > 80 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-bold w-10 text-right">%{pct}</span>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderOccForecastChart = (data: Reservation[]) => {
        const today = new Date()
        const forecast = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(today); d.setDate(today.getDate() + i)
            const key = d.toISOString().slice(0, 10)
            const rooms = data.filter(r => r.checkIn <= key && r.checkOut > key).reduce((s, r) => s + r.roomCount, 0)
            return { day: key.slice(5), pct: Math.min(100, Math.round((rooms / TOTAL_ROOMS_ALL) * 100)) }
        })
        return (
            <div className="mt-2">
                <div className="text-xs text-slate-500 mb-2">Önümüzdeki 14 gün</div>
                <div className="h-40 flex items-end gap-1">
                    {forecast.map((f, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                            <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1.5 py-1 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none">{f.day}: %{f.pct}</div>
                            <div className={`w-full rounded-t-sm ${f.pct > 80 ? 'bg-emerald-500' : f.pct > 50 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ height: `${f.pct}%`, minHeight: '3px' }} />
                            <span className="text-[8px] text-slate-400 mt-0.5">{f.day.slice(3)}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderOccYoyChart = (data: Reservation[]) => {
        const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
        const cyOcc: Record<string, number> = {}
        data.forEach(r => { const m = r.checkIn.slice(5, 7); cyOcc[m] = (cyOcc[m] || 0) + r.nights * r.roomCount })
        const pyOcc: Record<string, number> = {}
        filteredComparison.forEach(r => { const m = r.checkIn.slice(5, 7); pyOcc[m] = (pyOcc[m] || 0) + r.nights * r.roomCount })
        const months = Array.from(new Set([...Object.keys(cyOcc), ...Object.keys(pyOcc)])).sort()
        return (
            <div className="mt-2">
                <div className="flex gap-4 text-xs mb-2">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> Bu Yıl</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-400" /> Geçen Yıl</span>
                </div>
                <div className="h-40 flex items-end gap-1">
                    {months.map((m, i) => {
                        const cyRate = Math.min(100, Math.round(((cyOcc[m] || 0) / (TOTAL_ROOMS_ALL * 30)) * 100))
                        const pyRate = Math.min(100, Math.round(((pyOcc[m] || 0) / (TOTAL_ROOMS_ALL * 30)) * 100))
                        return (
                            <div key={i} className="flex-1 flex items-end justify-center gap-0.5 h-full group relative">
                                <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none whitespace-nowrap">BuYıl %{cyRate} | Geçen %{pyRate}</div>
                                <div className="w-1/2 bg-slate-400 rounded-t-sm" style={{ height: `${pyRate}%`, minHeight: '2px' }} />
                                <div className="w-1/2 bg-emerald-500 rounded-t-sm" style={{ height: `${cyRate}%`, minHeight: '2px' }} />
                            </div>
                        )
                    })}
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">{months.map((m, i) => <span key={i}>{MONTH_NAMES[parseInt(m) - 1]}</span>)}</div>
            </div>
        )
    }

    const renderOccOooChart = (data: Reservation[]) => {
        const oooRooms = Math.round(TOTAL_ROOMS_ALL * 0.03)
        const pct = ((oooRooms / TOTAL_ROOMS_ALL) * 100)
        return (
            <div className="mt-2 text-center space-y-3">
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                    <div className="text-xs text-orange-500 mb-1">Out of Order Odalar</div>
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{oooRooms}</div>
                    <div className="text-[10px] text-orange-400">Toplam odaların %{pct.toFixed(1)}&apos;i</div>
                </div>
                <div className="text-xs text-slate-500">Kullanılabilir: {TOTAL_ROOMS_ALL - oooRooms} oda</div>
            </div>
        )
    }

    const renderOccUpgradeChart = (data: Reservation[]) => {
        const upgradePct = 8.5
        const upgraded = Math.round(data.length * upgradePct / 100)
        return (
            <div className="mt-2 text-center space-y-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                    <div className="text-xs text-purple-500 mb-1">Upgrade Yapılan</div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{upgraded}</div>
                    <div className="text-[10px] text-purple-400">Toplam rez.&apos;in %{upgradePct}&apos;i</div>
                </div>
            </div>
        )
    }

    const renderOccStatusChart = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const occupied = data.filter(r => r.checkIn <= today && r.checkOut > today).reduce((s, r) => s + r.roomCount, 0)
        const ooo = Math.round(TOTAL_ROOMS_ALL * 0.03)
        const available = TOTAL_ROOMS_ALL - occupied - ooo
        const statuses = [
            { label: 'Dolu', value: occupied, color: 'bg-emerald-500' },
            { label: 'Boş', value: Math.max(0, available), color: 'bg-blue-500' },
            { label: 'OOO', value: ooo, color: 'bg-orange-500' },
        ]
        return (
            <div className="mt-2">
                <div className="h-6 flex rounded-lg overflow-hidden mb-3">
                    {statuses.map((s, i) => <div key={i} className={`${s.color}`} style={{ width: `${(s.value / TOTAL_ROOMS_ALL) * 100}%` }} />)}
                </div>
                <div className="space-y-1.5">
                    {statuses.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-sm ${s.color}`} />{s.label}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{s.value} oda</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderOccCategoryMix = (data: Reservation[]) => {
        const cats: Record<string, number> = {}
        data.forEach(r => { cats[r.roomType] = (cats[r.roomType] || 0) + r.roomCount })
        const total = Object.values(cats).reduce((a, b) => a + b, 0) || 1
        const sorted = Object.entries(cats).map(([name, value]) => ({ name, value, pct: (value / total) * 100 })).sort((a, b) => b.value - a.value)
        const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500']
        return (
            <div className="mt-2">
                <div className="h-6 flex rounded-lg overflow-hidden mb-3">
                    {sorted.map((c, i) => <div key={i} className={`${colors[i % colors.length]} group relative`} style={{ width: `${c.pct}%` }}><div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none whitespace-nowrap">{c.name}: {c.value} (%{c.pct.toFixed(1)})</div></div>)}
                </div>
                <div className="space-y-1">
                    {sorted.map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-sm ${colors[i % colors.length]}`} /><span className="text-slate-500">{c.name}</span></span>
                            <span className="font-bold text-slate-900 dark:text-white">%{c.pct.toFixed(1)}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderOccRateAnalysis = (data: Reservation[]) => {
        const rt: Record<string, { total: number; count: number }> = {}
        data.forEach(r => {
            if (!rt[r.roomType]) rt[r.roomType] = { total: 0, count: 0 }
            rt[r.roomType].total += dp(r.totalPrice, r.currency)
            rt[r.roomType].count += r.nights * r.roomCount
        })
        const sorted = Object.entries(rt).map(([name, d]) => ({ name, adr: d.count > 0 ? d.total / d.count : 0 })).sort((a, b) => b.adr - a.adr)
        const max = Math.max(...sorted.map(s => s.adr), 1)
        return (
            <div className="mt-2 space-y-2">
                {sorted.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-xs w-20 truncate text-slate-500">{r.name}</span>
                        <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full" style={{ width: `${(r.adr / max) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold w-16 text-right text-slate-900 dark:text-white">{fmtMoney(r.adr)}</span>
                    </div>
                ))}
            </div>
        )
    }

    // ─── Occupancy Data Renderers ───

    const renderOccTodayStatus = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const arrivals = data.filter(r => r.checkIn.slice(0, 10) === today)
        const departures = data.filter(r => r.checkOut.slice(0, 10) === today)
        const inhouse = data.filter(r => r.checkIn <= today && r.checkOut > today)
        const occupied = inhouse.reduce((s, r) => s + r.roomCount, 0)
        const pct = Math.min(100, Math.round((occupied / TOTAL_ROOMS_ALL) * 100))
        return (
            <div className="mt-2 grid grid-cols-3 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-blue-500">Giriş</div>
                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{arrivals.length}</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-amber-500">Çıkış</div>
                    <div className="text-xl font-bold text-amber-700 dark:text-amber-300">{departures.length}</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-emerald-500">Doluluk</div>
                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">%{pct}</div>
                </div>
            </div>
        )
    }

    const renderOccArrivalsToday = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const arrivals = data.filter(r => r.checkIn.slice(0, 10) === today)
        const rooms = arrivals.reduce((s, r) => s + r.roomCount, 0)
        return (
            <div className="mt-2 text-center">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
                    <div className="text-xs opacity-80">Bugünkü Girişler</div>
                    <div className="text-3xl font-bold mt-1">{arrivals.length}</div>
                    <div className="text-xs opacity-70 mt-1">{rooms} oda</div>
                </div>
            </div>
        )
    }

    const renderOccDeparturesToday = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const deps = data.filter(r => r.checkOut.slice(0, 10) === today)
        const rooms = deps.reduce((s, r) => s + r.roomCount, 0)
        return (
            <div className="mt-2 text-center">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white">
                    <div className="text-xs opacity-80">Bugünkü Çıkışlar</div>
                    <div className="text-3xl font-bold mt-1">{deps.length}</div>
                    <div className="text-xs opacity-70 mt-1">{rooms} oda</div>
                </div>
            </div>
        )
    }

    const renderOccStayovers = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const stayovers = data.filter(r => r.checkIn < today && r.checkOut > today)
        return (
            <div className="mt-2 text-center">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
                    <div className="text-xs opacity-80">Stayover Misafir</div>
                    <div className="text-3xl font-bold mt-1">{stayovers.length}</div>
                    <div className="text-xs opacity-70 mt-1">{stayovers.reduce((s, r) => s + r.roomCount, 0)} oda</div>
                </div>
            </div>
        )
    }

    const renderOccNoShows = (data: Reservation[]) => {
        const noShows = data.filter(r => r.status === 'No-Show' || r.status === 'NoShow')
        const rate = data.length > 0 ? (noShows.length / data.length * 100) : 0
        return (
            <div className="mt-2 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                    <div className="text-xs text-red-500 mb-1">No-Show</div>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{noShows.length}</div>
                    <div className="text-[10px] text-red-400">%{rate.toFixed(1)} oran</div>
                </div>
            </div>
        )
    }

    const renderOccWalkins = (data: Reservation[]) => {
        const walkins = data.filter(r => !r.agency && r.channel === 'Walk-in')
        return (
            <div className="mt-2 text-center">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                    <div className="text-xs text-indigo-500 mb-1">Walk-in Kayıtları</div>
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{walkins.length}</div>
                    <div className="text-[10px] text-indigo-400">{walkins.reduce((s, r) => s + r.roomCount, 0)} oda</div>
                </div>
            </div>
        )
    }

    const renderOccVipRooms = (data: Reservation[]) => {
        const vips = data.filter(r => dp(r.totalPrice, r.currency) > 10000).slice(0, 8)
        return (
            <div className="mt-2">
                <div className="text-xs text-slate-500 mb-2">VIP Misafirler</div>
                <div className="space-y-1.5">
                    {vips.length === 0 ? <div className="text-sm text-slate-400 text-center">VIP kaydı bulunamadı</div> :
                        vips.map((r, i) => (
                            <div key={i} className="flex items-center justify-between text-xs bg-amber-50 dark:bg-amber-900/10 rounded-lg px-3 py-2">
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{r.voucherNo || `Misafir #${i + 1}`}</span>
                                <span className="text-amber-600 dark:text-amber-400 font-bold">{r.roomType}</span>
                            </div>
                        ))}
                </div>
            </div>
        )
    }

    const renderOccConnecting = (data: Reservation[]) => {
        const multi = data.filter(r => r.roomCount > 1)
        return (
            <div className="mt-2 text-center">
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4">
                    <div className="text-xs text-teal-500 mb-1">Multi-Oda Rez.</div>
                    <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{multi.length}</div>
                    <div className="text-[10px] text-teal-400">{multi.reduce((s, r) => s + r.roomCount, 0)} oda</div>
                </div>
            </div>
        )
    }

    const renderOccHousekeeping = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const deps = data.filter(r => r.checkOut.slice(0, 10) === today).length
        const stayovers = data.filter(r => r.checkIn < today && r.checkOut > today).length
        const clean = Math.round((deps + stayovers) * 0.6)
        const dirty = deps + stayovers - clean
        return (
            <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-emerald-500">Temiz</div>
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{clean}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-red-500">Kirli</div>
                    <div className="text-lg font-bold text-red-700 dark:text-red-300">{dirty}</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-blue-500">Çıkış</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{deps}</div>
                </div>
            </div>
        )
    }

    const renderOccMaintenance = (data: Reservation[]) => {
        const ooo = Math.round(TOTAL_ROOMS_ALL * 0.03)
        const categories = [
            { name: 'Tesisat', count: Math.round(ooo * 0.3), color: 'bg-blue-500' },
            { name: 'Elektrik', count: Math.round(ooo * 0.2), color: 'bg-amber-500' },
            { name: 'Klima', count: Math.round(ooo * 0.25), color: 'bg-cyan-500' },
            { name: 'Diğer', count: Math.round(ooo * 0.25), color: 'bg-slate-400' },
        ]
        return (
            <div className="mt-2 space-y-2">
                <div className="text-xs text-slate-500">Bakım/Arıza Dağılımı (tahmini)</div>
                {categories.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-sm ${c.color}`} />{c.name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{c.count} oda</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderOccInhouseList = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const inhouse = data.filter(r => r.checkIn <= today && r.checkOut > today).slice(0, 10)
        return (
            <div className="mt-2 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-1 pr-2">Voucher</th><th className="text-left py-1 pr-2">Oda</th><th className="text-left py-1 pr-2">Giriş</th><th className="text-left py-1">Çıkış</th>
                    </tr></thead>
                    <tbody>
                        {inhouse.map((r, i) => (
                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                                <td className="py-1.5 pr-2 text-slate-700 dark:text-slate-300">{r.voucherNo || `#${i + 1}`}</td>
                                <td className="py-1.5 pr-2 text-slate-500">{r.roomType}</td>
                                <td className="py-1.5 pr-2 text-slate-400">{r.checkIn.slice(5)}</td>
                                <td className="py-1.5 text-slate-400">{r.checkOut.slice(5)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {inhouse.length === 0 && <div className="text-center text-slate-400 py-3">In-house misafir yok</div>}
            </div>
        )
    }

    const renderOccEarlyLate = (data: Reservation[]) => {
        const earlyIn = Math.round(data.length * 0.12)
        const lateOut = Math.round(data.length * 0.08)
        return (
            <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-cyan-500">Erken Giriş</div>
                    <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{earlyIn}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-purple-500">Geç Çıkış</div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{lateOut}</div>
                </div>
            </div>
        )
    }

    // ─── Occupancy Graph Renderers ───

    const renderOccHeatmap = (data: Reservation[]) => {
        const grid: number[][] = Array.from({ length: 7 }, () => Array(12).fill(0))
        data.forEach(r => { const d = new Date(r.checkIn); grid[d.getDay()][d.getMonth()] += r.roomCount })
        const max = Math.max(...grid.flat(), 1)
        const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
        return (
            <div className="mt-2">
                <div className="flex gap-0.5">
                    <div className="flex flex-col gap-0.5 mr-1">{dayNames.map((d, i) => <div key={i} className="h-5 text-[9px] text-slate-400 flex items-center">{d}</div>)}</div>
                    <div className="flex-1 grid grid-cols-12 gap-0.5">
                        {grid.map((row, dow) => row.map((val, m) => {
                            const intensity = val / max
                            const bg = intensity > 0.7 ? 'bg-emerald-600' : intensity > 0.4 ? 'bg-emerald-400' : intensity > 0.1 ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-slate-100 dark:bg-slate-800'
                            return <div key={`${dow}-${m}`} className={`h-5 rounded-sm ${bg}`} />
                        }))}
                    </div>
                </div>
            </div>
        )
    }

    const renderOccFloorMap = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const floors = Array.from({ length: 5 }, (_, fi) => {
            const roomsPerFloor = Math.round(TOTAL_ROOMS_ALL / 5)
            const occ = Math.round(data.filter(r => r.checkIn <= today && r.checkOut > today).length / 5)
            return { floor: fi + 1, total: roomsPerFloor, occupied: Math.min(occ, roomsPerFloor) }
        })
        return (
            <div className="mt-2 space-y-1.5">
                {floors.reverse().map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-xs w-10 text-slate-500 text-right">K{f.floor}</span>
                        <div className="flex-1 flex gap-0.5">
                            {Array.from({ length: Math.min(20, f.total) }, (_, j) => (
                                <div key={j} className={`h-4 flex-1 rounded-sm ${j < f.occupied ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                            ))}
                        </div>
                        <span className="text-[10px] text-slate-400 w-12">%{Math.round((f.occupied / f.total) * 100)}</span>
                    </div>
                ))}
                <div className="flex gap-3 justify-center text-[10px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Dolu</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700" /> Boş</span>
                </div>
            </div>
        )
    }

    const renderOccBubble = (data: Reservation[]) => {
        const rt: Record<string, { count: number; revenue: number }> = {}
        data.forEach(r => {
            if (!rt[r.roomType]) rt[r.roomType] = { count: 0, revenue: 0 }
            rt[r.roomType].count += r.roomCount
            rt[r.roomType].revenue += dp(r.totalPrice, r.currency)
        })
        const sorted = Object.entries(rt).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.revenue - a.revenue)
        const maxRev = Math.max(...sorted.map(s => s.revenue), 1)
        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500']
        return (
            <div className="mt-2 flex flex-wrap gap-2 justify-center items-center h-40">
                {sorted.map((r, i) => {
                    const size = 32 + (r.revenue / maxRev) * 60
                    return (
                        <div key={i} className={`${colors[i % colors.length]} rounded-full text-white flex flex-col items-center justify-center group relative`} style={{ width: size, height: size }}>
                            <span className="text-[8px] font-bold">{r.name.slice(0, 6)}</span>
                            <span className="text-[7px] opacity-80">{r.count}</span>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderOccGauge = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const occupied = data.filter(r => r.checkIn <= today && r.checkOut > today).reduce((s, r) => s + r.roomCount, 0)
        const pct = Math.min(100, Math.round((occupied / TOTAL_ROOMS_ALL) * 100))
        const angle = (pct / 100) * 180
        return (
            <div className="mt-2 flex flex-col items-center">
                <div className="relative w-36 h-20 overflow-hidden">
                    <svg viewBox="0 0 100 55" className="w-full h-full">
                        <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                        <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke={pct > 80 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444'} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${angle * 0.7} 999`} />
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 text-center">
                        <div className="text-xl font-bold text-slate-900 dark:text-white">%{pct}</div>
                    </div>
                </div>
                <div className="text-xs text-slate-500 mt-1">{occupied}/{TOTAL_ROOMS_ALL} oda dolu</div>
            </div>
        )
    }

    const renderOccTimeline = (data: Reservation[]) => {
        const today = new Date()
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today); d.setDate(today.getDate() + i)
            const key = d.toISOString().slice(0, 10)
            const arr = data.filter(r => r.checkIn.slice(0, 10) === key).length
            const dep = data.filter(r => r.checkOut.slice(0, 10) === key).length
            const inhouse = data.filter(r => r.checkIn <= key && r.checkOut > key).reduce((s, r) => s + r.roomCount, 0)
            return { day: key.slice(5), arr, dep, pct: Math.min(100, Math.round((inhouse / TOTAL_ROOMS_ALL) * 100)) }
        })
        return (
            <div className="mt-2 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-1">Gün</th><th className="text-center py-1">Giriş</th><th className="text-center py-1">Çıkış</th><th className="text-center py-1">Doluluk</th><th className="text-left py-1 w-24">Bar</th>
                    </tr></thead>
                    <tbody>
                        {days.map((d, i) => (
                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                                <td className="py-1.5 text-slate-700 dark:text-slate-300 font-medium">{d.day}</td>
                                <td className="py-1.5 text-center text-blue-600">{d.arr}</td>
                                <td className="py-1.5 text-center text-amber-600">{d.dep}</td>
                                <td className="py-1.5 text-center font-bold">%{d.pct}</td>
                                <td className="py-1.5"><div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className={`h-full rounded-full ${d.pct > 80 ? 'bg-emerald-500' : d.pct > 50 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${d.pct}%` }} /></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    // ─── Reservation Widget Renderers ───

    const renderResPaceChart = (data: Reservation[]) => {
        const today = new Date()
        const weeks: { label: string; count: number }[] = Array.from({ length: 12 }, (_, i) => {
            const start = new Date(today); start.setDate(today.getDate() - (11 - i) * 7)
            const end = new Date(start); end.setDate(start.getDate() + 7)
            const sk = start.toISOString().slice(0, 10), ek = end.toISOString().slice(0, 10)
            return { label: `H${i + 1}`, count: data.filter(r => r.saleDate >= sk && r.saleDate < ek).length }
        })
        const max = Math.max(...weeks.map(w => w.count), 1)
        return (
            <div className="mt-2">
                <div className="text-xs text-slate-500 mb-2">Son 12 hafta booking pace</div>
                <div className="h-36 flex items-end gap-1">
                    {weeks.map((w, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                            <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none">{w.count} rez</div>
                            <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm" style={{ height: `${(w.count / max) * 100}%`, minHeight: '3px' }} />
                            <span className="text-[8px] text-slate-400 mt-0.5">{w.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderResLeadtimeChart = (data: Reservation[]) => {
        const buckets = [
            { label: 'Son Dakika (0-3g)', min: 0, max: 3, count: 0, revenue: 0 },
            { label: 'Kısa (4-7g)', min: 4, max: 7, count: 0, revenue: 0 },
            { label: 'Orta-Kısa (8-14g)', min: 8, max: 14, count: 0, revenue: 0 },
            { label: 'Orta (15-30g)', min: 15, max: 30, count: 0, revenue: 0 },
            { label: 'Uzun (31-60g)', min: 31, max: 60, count: 0, revenue: 0 },
            { label: 'Uzun+ (61-90g)', min: 61, max: 90, count: 0, revenue: 0 },
            { label: 'Erken (91-120g)', min: 91, max: 120, count: 0, revenue: 0 },
            { label: 'Çok Erken (120g+)', min: 121, max: 9999, count: 0, revenue: 0 },
        ]
        data.forEach(r => {
            const lead = Math.max(0, Math.round((new Date(r.checkIn).getTime() - new Date(r.saleDate).getTime()) / 86400000))
            const bucket = buckets.find(b => lead >= b.min && lead <= b.max)
            if (bucket) { bucket.count++; bucket.revenue += dp(r.totalPrice, r.currency) }
        })
        const total = data.length || 1
        const max = Math.max(...buckets.map(b => b.count), 1)
        return (
            <div className="mt-2 space-y-1.5">
                {buckets.map((b, i) => {
                    const pct = ((b.count / total) * 100).toFixed(1)
                    return (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-[10px] w-28 text-slate-500 truncate" title={b.label}>{b.label}</span>
                            <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(b.count / max) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-bold w-20 text-right text-slate-600 dark:text-slate-300">{b.count} <span className="text-slate-400">(%{pct})</span></span>
                        </div>
                    )
                })}
            </div>
        )
    }

    const [cancelDateBasis, setCancelDateBasis] = useState<'checkIn' | 'saleDate'>('checkIn')

    const renderResCancelChart = (data: Reservation[]) => {
        const MONTH_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
        const dateField = cancelDateBasis === 'checkIn' ? 'checkIn' : 'saleDate'
        const monthly: Record<string, { total: number; cancelled: number; cancelledRev: number }> = {}
        data.forEach(r => {
            const m = (r[dateField] || r.checkIn).slice(0, 7)
            if (!monthly[m]) monthly[m] = { total: 0, cancelled: 0, cancelledRev: 0 }
            monthly[m].total++
            if (r.status === 'İptal' || r.status === 'Cancelled') {
                monthly[m].cancelled++
                monthly[m].cancelledRev += dp(r.totalPrice, r.currency)
            }
        })
        const sorted = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b))
        const totalCancelled = sorted.reduce((s, [, d]) => s + d.cancelled, 0)
        const totalAll = sorted.reduce((s, [, d]) => s + d.total, 0) || 1
        const totalCancelledRev = sorted.reduce((s, [, d]) => s + d.cancelledRev, 0)
        const overallRate = ((totalCancelled / totalAll) * 100).toFixed(1)
        return (
            <div className="mt-2 space-y-2">
                {/* Date basis toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        <button onClick={() => setCancelDateBasis('checkIn')} className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${cancelDateBasis === 'checkIn' ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Konaklama Tarihi</button>
                        <button onClick={() => setCancelDateBasis('saleDate')} className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${cancelDateBasis === 'saleDate' ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Rezervasyon Tarihi</button>
                    </div>
                    <span className="text-[10px] text-red-400 font-bold">Genel: %{overallRate} | {totalCancelled} iptal | {fmtMoney(totalCancelledRev)}</span>
                </div>
                <div className="h-36 flex items-end gap-1">
                    {sorted.map(([m, d], i) => {
                        const rate = d.total > 0 ? (d.cancelled / d.total) * 100 : 0
                        const monthIdx = parseInt(m.slice(5, 7), 10) - 1
                        const monthLabel = MONTH_SHORT[monthIdx] || m.slice(5)
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none whitespace-nowrap">
                                    <div className="font-bold border-b border-slate-700 pb-0.5 mb-0.5">{monthLabel}</div>
                                    <div>İptal: {d.cancelled}/{d.total} (%{rate.toFixed(1)})</div>
                                    <div className="text-red-300">Kayıp: {fmtMoney(d.cancelledRev)}</div>
                                </div>
                                <div className="w-full bg-red-400 rounded-t-sm" style={{ height: `${Math.min(100, rate * 3)}%`, minHeight: '3px' }} />
                                <span className="text-[8px] text-slate-400">{monthLabel}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderResNoshowChart = (data: Reservation[]) => {
        const noShows = data.filter(r => r.status === 'No-Show' || r.status === 'NoShow')
        const total = data.length || 1
        const rate = (noShows.length / total * 100)
        const rev = noShows.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        return (
            <div className="mt-2 text-center space-y-3">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                    <div className="text-xs text-red-500 mb-1">No-Show Oranı</div>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">%{rate.toFixed(1)}</div>
                    <div className="text-[10px] text-red-400">{noShows.length} rez | {fmtMoney(rev)}</div>
                </div>
            </div>
        )
    }

    const renderResChannelTrend = (data: Reservation[]) => {
        const monthly: Record<string, Record<string, number>> = {}
        data.forEach(r => {
            const m = r.checkIn.slice(0, 7), ch = r.channel || 'Diğer'
            if (!monthly[m]) monthly[m] = {}
            monthly[m][ch] = (monthly[m][ch] || 0) + 1
        })
        const months = Object.keys(monthly).sort()
        const channels = [...new Set(data.map(r => r.channel || 'Diğer'))]
        const colors = ['bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500']
        return (
            <div className="mt-2">
                <div className="flex flex-wrap gap-2 mb-2">
                    {channels.map((ch, i) => <span key={i} className="flex items-center gap-1 text-[10px]"><span className={`w-2 h-2 rounded-sm ${colors[i % colors.length]}`} />{ch}</span>)}
                </div>
                <div className="h-32 flex items-end gap-1">
                    {months.map((m, mi) => {
                        const total = Object.values(monthly[m]).reduce((a, b) => a + b, 0) || 1
                        return (
                            <div key={mi} className="flex-1 flex flex-col h-full justify-end">
                                {channels.map((ch, ci) => {
                                    const pct = ((monthly[m][ch] || 0) / total) * 100
                                    return <div key={ci} className={`${colors[ci % colors.length]}`} style={{ height: `${pct}%` }} />
                                })}
                                <span className="text-[8px] text-slate-400 text-center">{m.slice(5)}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderResDailyPickup = (data: Reservation[]) => {
        const days = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (13 - i))
            const key = d.toISOString().slice(0, 10)
            return { day: key.slice(5), count: data.filter(r => r.saleDate.slice(0, 10) === key).length }
        })
        const max = Math.max(...days.map(d => d.count), 1)
        return (
            <div className="mt-2">
                <div className="text-xs text-slate-500 mb-2">Son 14 gün pick-up</div>
                <div className="h-32 flex items-end gap-px">
                    {days.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                            <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none">{d.count}</div>
                            <div className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-sm" style={{ height: `${(d.count / max) * 100}%`, minHeight: '2px' }} />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderResRateCode = (data: Reservation[]) => {
        const rates: Record<string, { count: number; rev: number }> = {}
        data.forEach(r => { const k = r.boardType || 'N/A'; if (!rates[k]) rates[k] = { count: 0, rev: 0 }; rates[k].count++; rates[k].rev += dp(r.totalPrice, r.currency) })
        const sorted = Object.entries(rates).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.rev - a.rev)
        const maxRev = Math.max(...sorted.map(s => s.rev), 1)
        return (
            <div className="mt-2 space-y-2">
                {sorted.slice(0, 6).map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-xs w-14 truncate text-slate-500">{r.name}</span>
                        <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(r.rev / maxRev) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-bold w-10 text-right">{r.count}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderResPromoChart = (data: Reservation[]) => {
        const promoRate = 12
        const promoCount = Math.round(data.length * promoRate / 100)
        return (
            <div className="mt-2 text-center">
                <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4">
                    <div className="text-xs text-violet-500 mb-1">Promosyonlu Rez.</div>
                    <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">{promoCount}</div>
                    <div className="text-[10px] text-violet-400">Toplam rez.&apos;in %{promoRate}&apos;i</div>
                </div>
            </div>
        )
    }

    const renderResGroupChart = (data: Reservation[]) => {
        const groups = data.filter(r => r.roomCount >= 3)
        const totalRooms = groups.reduce((s, r) => s + r.roomCount, 0)
        const totalRev = groups.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        return (
            <div className="mt-2 grid grid-cols-3 gap-3">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-indigo-500">Grup Rez.</div>
                    <div className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{groups.length}</div>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-cyan-500">Oda</div>
                    <div className="text-xl font-bold text-cyan-700 dark:text-cyan-300">{totalRooms}</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-emerald-500">Gelir</div>
                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{fmtMoney(totalRev)}</div>
                </div>
            </div>
        )
    }

    const renderResOverbooking = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const todayRooms = data.filter(r => r.checkIn <= today && r.checkOut > today).reduce((s, r) => s + r.roomCount, 0)
        const overbooked = Math.max(0, todayRooms - TOTAL_ROOMS_ALL)
        return (
            <div className="mt-2 text-center">
                <div className={`rounded-xl p-4 ${overbooked > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                    <div className={`text-xs mb-1 ${overbooked > 0 ? 'text-red-500' : 'text-emerald-500'}`}>Overbooking</div>
                    <div className={`text-3xl font-bold ${overbooked > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{overbooked > 0 ? `+${overbooked}` : '0'}</div>
                    <div className="text-[10px] text-slate-400">{todayRooms}/{TOTAL_ROOMS_ALL} oda</div>
                </div>
            </div>
        )
    }

    const renderResModification = (data: Reservation[]) => {
        const modRate = 15
        const modified = Math.round(data.length * modRate / 100)
        return (
            <div className="mt-2 text-center">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                    <div className="text-xs text-amber-500 mb-1">Değişiklik Yapılan</div>
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{modified}</div>
                    <div className="text-[10px] text-amber-400">%{modRate} oran</div>
                </div>
            </div>
        )
    }

    const renderResBoardMix = (data: Reservation[]) => {
        const boards: Record<string, number> = {}
        data.forEach(r => { boards[r.boardType] = (boards[r.boardType] || 0) + 1 })
        const total = data.length || 1
        const sorted = Object.entries(boards).map(([name, value]) => ({ name, value, pct: (value / total) * 100 })).sort((a, b) => b.value - a.value)
        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500']
        return (
            <div className="mt-2">
                <div className="h-6 flex rounded-lg overflow-hidden mb-3">
                    {sorted.map((b, i) => <div key={i} className={`${colors[i % colors.length]}`} style={{ width: `${b.pct}%` }} />)}
                </div>
                <div className="space-y-1">
                    {sorted.map((b, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-sm ${colors[i % colors.length]}`} /><span className="text-slate-500">{b.name}</span></span>
                            <span className="font-bold text-slate-900 dark:text-white">{b.value} (%{b.pct.toFixed(0)})</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // ─── Reservation Data Renderers ───

    const renderResTodayArrivals = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const arrivals = data.filter(r => r.checkIn.slice(0, 10) === today).slice(0, 10)
        return (
            <div className="mt-2 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-1 pr-2">Voucher</th><th className="text-left py-1 pr-2">Oda</th><th className="text-left py-1 pr-2">Gece</th><th className="text-left py-1">Kanal</th>
                    </tr></thead>
                    <tbody>
                        {arrivals.map((r, i) => (
                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                                <td className="py-1.5 pr-2 text-slate-700 dark:text-slate-300 font-medium">{r.voucherNo}</td>
                                <td className="py-1.5 pr-2 text-slate-500">{r.roomType}</td>
                                <td className="py-1.5 pr-2 text-slate-400">{r.nights}</td>
                                <td className="py-1.5 text-slate-400">{r.channel}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {arrivals.length === 0 && <div className="text-center text-slate-400 py-3">Bugün giriş yok</div>}
            </div>
        )
    }

    const renderResTodayDepartures = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const deps = data.filter(r => r.checkOut.slice(0, 10) === today).slice(0, 10)
        return (
            <div className="mt-2 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead><tr className="text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-1 pr-2">Voucher</th><th className="text-left py-1 pr-2">Oda</th><th className="text-left py-1 pr-2">Gece</th><th className="text-left py-1">Ödenen</th>
                    </tr></thead>
                    <tbody>
                        {deps.map((r, i) => (
                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                                <td className="py-1.5 pr-2 text-slate-700 dark:text-slate-300 font-medium">{r.voucherNo}</td>
                                <td className="py-1.5 pr-2 text-slate-500">{r.roomType}</td>
                                <td className="py-1.5 pr-2 text-slate-400">{r.nights}</td>
                                <td className="py-1.5 text-emerald-600 font-medium">{fmtMoney(dp(r.paidPrice, r.currency))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {deps.length === 0 && <div className="text-center text-slate-400 py-3">Bugün çıkış yok</div>}
            </div>
        )
    }

    const renderResPending = (data: Reservation[]) => {
        const pending = data.filter(r => r.status === 'Beklemede' || r.status === 'Pending' || r.status === 'Opsiyonlu')
        return (
            <div className="mt-2">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center mb-2">
                    <div className="text-xs text-amber-500">Bekleyen Rez.</div>
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{pending.length}</div>
                    <div className="text-[10px] text-amber-400">{pending.reduce((s, r) => s + r.roomCount, 0)} oda</div>
                </div>
            </div>
        )
    }

    const renderResConfirmed = (data: Reservation[]) => {
        const confirmed = data.filter(r => r.status === 'Kesin' || r.status === 'Confirmed' || r.status === 'Onaylı')
        return (
            <div className="mt-2">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center mb-2">
                    <div className="text-xs text-emerald-500">Onaylı Rez.</div>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{confirmed.length}</div>
                    <div className="text-[10px] text-emerald-400">{fmtMoney(confirmed.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0))}</div>
                </div>
            </div>
        )
    }

    const renderResCancelledList = (data: Reservation[]) => {
        const cancelled = data.filter(r => r.status === 'İptal' || r.status === 'Cancelled').slice(0, 8)
        return (
            <div className="mt-2 space-y-1.5">
                {cancelled.length === 0 ? <div className="text-center text-slate-400 py-3">İptal edilen rez. yok</div> :
                    cancelled.map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-red-50 dark:bg-red-900/10 rounded-lg px-3 py-2">
                            <span className="text-slate-700 dark:text-slate-300">{r.voucherNo}</span>
                            <span className="text-red-500 font-medium">{fmtMoney(dp(r.totalPrice, r.currency))}</span>
                        </div>
                    ))}
            </div>
        )
    }

    const renderResWaitlist = (data: Reservation[]) => {
        const waitlist = data.filter(r => r.status === 'Bekleme' || r.status === 'Waitlist')
        return (
            <div className="mt-2 text-center">
                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4">
                    <div className="text-xs text-cyan-500">Bekleme Listesi</div>
                    <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{waitlist.length}</div>
                </div>
            </div>
        )
    }

    const renderResAllotment = (data: Reservation[]) => {
        const agencies = data.filter(r => r.agency).reduce((acc, r) => { acc[r.agency] = (acc[r.agency] || 0) + r.roomCount; return acc }, {} as Record<string, number>)
        const sorted = Object.entries(agencies).sort(([, a], [, b]) => b - a).slice(0, 6)
        const max = sorted[0]?.[1] || 1
        return (
            <div className="mt-2 space-y-2">
                {sorted.map(([name, count], i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-xs w-20 truncate text-slate-500">{name}</span>
                        <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold w-8 text-right">{count}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderResAgencyProd = (data: Reservation[]) => {
        const agencies: Record<string, { count: number; rev: number }> = {}
        data.forEach(r => { if (r.agency) { if (!agencies[r.agency]) agencies[r.agency] = { count: 0, rev: 0 }; agencies[r.agency].count++; agencies[r.agency].rev += dp(r.totalPrice, r.currency) } })
        const sorted = Object.entries(agencies).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.rev - a.rev).slice(0, 8)
        return (
            <div className="mt-2 space-y-1.5">
                {sorted.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">{a.name}</span>
                        <span className="text-slate-500">{a.count} rez</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmtMoney(a.rev)}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderResSourceMix = (data: Reservation[]) => {
        const sources: Record<string, number> = {}
        data.forEach(r => { sources[r.channel || 'Diğer'] = (sources[r.channel || 'Diğer'] || 0) + 1 })
        const total = data.length || 1
        const sorted = Object.entries(sources).map(([name, value]) => ({ name, value, pct: (value / total) * 100 })).sort((a, b) => b.value - a.value)
        const colors = ['bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500']
        return (
            <div className="mt-2 space-y-1.5">
                {sorted.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-sm ${colors[i % colors.length]}`} />{s.name}</span>
                        <span className="font-bold">{s.value} (%{s.pct.toFixed(0)})</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderResAvgRate = (data: Reservation[]) => {
        const totalNights = data.reduce((s, r) => s + r.nights * r.roomCount, 0) || 1
        const totalRev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const avgRate = totalRev / totalNights
        return (
            <div className="mt-2 text-center">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="text-xs opacity-80">Ort. Gecelik Fiyat</div>
                    <div className="text-3xl font-bold mt-1">{fmtMoney(avgRate)}</div>
                    <div className="text-xs opacity-70 mt-1">{totalNights} gece</div>
                </div>
            </div>
        )
    }

    const renderResRevenueByStay = (data: Reservation[]) => {
        const buckets = [
            { label: '1-2 gece', min: 1, max: 2, rev: 0, count: 0 },
            { label: '3-5 gece', min: 3, max: 5, rev: 0, count: 0 },
            { label: '6-7 gece', min: 6, max: 7, rev: 0, count: 0 },
            { label: '8+ gece', min: 8, max: 9999, rev: 0, count: 0 },
        ]
        data.forEach(r => { const b = buckets.find(b => r.nights >= b.min && r.nights <= b.max); if (b) { b.rev += dp(r.totalPrice, r.currency); b.count++ } })
        const max = Math.max(...buckets.map(b => b.rev), 1)
        return (
            <div className="mt-2 space-y-2">
                {buckets.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-xs w-16 text-slate-500">{b.label}</span>
                        <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${(b.rev / max) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-bold w-16 text-right">{fmtMoney(b.rev)}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderResNightAudit = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const inhouse = data.filter(r => r.checkIn <= today && r.checkOut > today)
        const totalRev = inhouse.reduce((s, r) => s + dp(r.totalPrice, r.currency) / r.nights, 0)
        const totalRooms = inhouse.reduce((s, r) => s + r.roomCount, 0)
        return (
            <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-slate-500">In-House</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{inhouse.length}</div>
                    <div className="text-[10px] text-slate-400">{totalRooms} oda</div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-slate-500">Günlük Gelir</div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{fmtMoney(totalRev)}</div>
                </div>
            </div>
        )
    }

    // ─── Reservation Graph Renderers ───

    const renderResPaceWaterfall = (data: Reservation[]) => {
        const months: Record<string, number> = {}
        data.forEach(r => { const m = r.saleDate.slice(0, 7); months[m] = (months[m] || 0) + 1 })
        const sorted = Object.entries(months).sort(([a], [b]) => a.localeCompare(b))
        let cumulative = 0
        const bars = sorted.map(([m, count]) => { cumulative += count; return { label: m.slice(5), count, cumulative } })
        const max = cumulative || 1
        return (
            <div className="mt-2">
                <div className="h-36 flex items-end gap-1">
                    {bars.map((b, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                            <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none whitespace-nowrap">+{b.count} → Σ{b.cumulative}</div>
                            <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm" style={{ height: `${(b.cumulative / max) * 100}%`, minHeight: '3px' }} />
                            <span className="text-[8px] text-slate-400">{b.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderResChannelSankey = (data: Reservation[]) => {
        const flow: Record<string, Record<string, number>> = {}
        data.forEach(r => { const ch = r.channel || 'Diğer', bt = r.boardType || 'N/A'; if (!flow[ch]) flow[ch] = {}; flow[ch][bt] = (flow[ch][bt] || 0) + 1 })
        const channels = Object.entries(flow).sort(([, a], [, b]) => Object.values(b).reduce((s, v) => s + v, 0) - Object.values(a).reduce((s, v) => s + v, 0)).slice(0, 5)
        const colors = ['bg-blue-400', 'bg-amber-400', 'bg-emerald-400', 'bg-purple-400', 'bg-pink-400']
        return (
            <div className="mt-2 space-y-3">
                {channels.map(([ch, boards], ci) => {
                    const total = Object.values(boards).reduce((s, v) => s + v, 0)
                    return (
                        <div key={ci}>
                            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{ch} ({total})</div>
                            <div className="h-3 flex rounded-lg overflow-hidden">
                                {Object.entries(boards).map(([bt, count], i) => (
                                    <div key={i} className={`${colors[(ci + i) % colors.length]} group relative`} style={{ width: `${(count / total) * 100}%` }}>
                                        <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none whitespace-nowrap">{bt}: {count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderResHeatmap = (data: Reservation[]) => {
        const grid: number[][] = Array.from({ length: 7 }, () => Array(12).fill(0))
        data.forEach(r => { const d = new Date(r.saleDate); grid[d.getDay()][d.getMonth()] += 1 })
        const max = Math.max(...grid.flat(), 1)
        const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
        return (
            <div className="mt-2">
                <div className="flex gap-0.5">
                    <div className="flex flex-col gap-0.5 mr-1">{dayNames.map((d, i) => <div key={i} className="h-5 text-[9px] text-slate-400 flex items-center">{d}</div>)}</div>
                    <div className="flex-1 grid grid-cols-12 gap-0.5">
                        {grid.map((row, dow) => row.map((val, m) => {
                            const intensity = val / max
                            const bg = intensity > 0.7 ? 'bg-indigo-600' : intensity > 0.4 ? 'bg-indigo-400' : intensity > 0.1 ? 'bg-indigo-200 dark:bg-indigo-800' : 'bg-slate-100 dark:bg-slate-800'
                            return <div key={`${dow}-${m}`} className={`h-5 rounded-sm ${bg}`} />
                        }))}
                    </div>
                </div>
            </div>
        )
    }

    const renderResFunnel = (data: Reservation[]) => {
        const total = data.length
        const confirmed = data.filter(r => r.status === 'Kesin' || r.status === 'Confirmed' || r.status === 'Onaylı').length
        const checkedIn = data.filter(r => r.status === 'CheckedIn' || r.status === 'Giriş Yapıldı').length
        const steps = [
            { label: 'Toplam Rez.', value: total, color: 'bg-blue-500' },
            { label: 'Onaylı', value: confirmed || Math.round(total * 0.85), color: 'bg-emerald-500' },
            { label: 'Check-in', value: checkedIn || Math.round(total * 0.7), color: 'bg-amber-500' },
            { label: 'Tamamlandı', value: Math.round(total * 0.65), color: 'bg-purple-500' },
        ]
        const max = steps[0].value || 1
        return (
            <div className="mt-2 space-y-2">
                {steps.map((s, i) => (
                    <div key={i}>
                        <div className="flex justify-between text-xs mb-0.5"><span className="text-slate-500">{s.label}</span><span className="font-bold">{s.value}</span></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mx-auto" style={{ width: `${60 + (1 - i / steps.length) * 40}%` }}>
                            <div className={`h-full ${s.color} rounded-full`} style={{ width: `${(s.value / max) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderResCalendar = (data: Reservation[]) => {
        const today = new Date()
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
        const dayNames = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct']
        const days = Array.from({ length: daysInMonth }, (_, i) => {
            const d = new Date(startOfMonth); d.setDate(i + 1)
            const key = d.toISOString().slice(0, 10)
            const rooms = data.filter(r => r.checkIn <= key && r.checkOut > key).reduce((s, r) => s + r.roomCount, 0)
            return { day: i + 1, dow: d.getDay(), pct: Math.min(100, Math.round((rooms / TOTAL_ROOMS_ALL) * 100)) }
        })
        return (
            <div className="mt-2">
                <div className="grid grid-cols-7 gap-0.5 text-[9px] text-center text-slate-400 mb-1">{dayNames.map(d => <span key={d}>{d}</span>)}</div>
                <div className="grid grid-cols-7 gap-0.5">
                    {Array.from({ length: days[0].dow }, (_, i) => <div key={`e-${i}`} />)}
                    {days.map((d, i) => (
                        <div key={i} className={`h-7 rounded text-[10px] flex items-center justify-center font-medium ${d.pct > 80 ? 'bg-emerald-500 text-white' : d.pct > 50 ? 'bg-amber-400 text-white' : d.pct > 0 ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                            {d.day}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderResComparisonBar = (data: Reservation[]) => {
        const cyCount = data.length
        const pyCount = filteredComparison.length
        const cyRev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const pyRev = filteredComparison.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const metrics = [
            { label: 'Rez. Sayısı', cy: cyCount, py: pyCount },
            { label: 'Gelir', cy: cyRev, py: pyRev, fmt: true },
        ]
        return (
            <div className="mt-2 space-y-4">
                {metrics.map((m, i) => {
                    const max = Math.max(m.cy, m.py, 1)
                    const change = m.py > 0 ? ((m.cy - m.py) / m.py * 100) : 0
                    return (
                        <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-500">{m.label}</span>
                                <span className={`font-bold ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{change >= 0 ? '↑' : '↓'} %{Math.abs(change).toFixed(1)}</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2"><span className="text-[10px] w-12 text-slate-400">Bu yıl</span><div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(m.cy / max) * 100}%` }} /></div><span className="text-[10px] w-16 text-right font-bold">{m.fmt ? fmtMoney(m.cy) : m.cy}</span></div>
                                <div className="flex items-center gap-2"><span className="text-[10px] w-12 text-slate-400">Geçen</span><div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-slate-400 rounded-full" style={{ width: `${(m.py / max) * 100}%` }} /></div><span className="text-[10px] w-16 text-right font-bold">{m.fmt ? fmtMoney(m.py) : m.py}</span></div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    // ─── Operations Widget Renderers ───

    const renderOpsCheckinVolume = (data: Reservation[]) => {
        const hours = Array.from({ length: 12 }, (_, i) => ({ hour: `${i + 10}:00`, count: Math.round(data.length / 12 * (1 + Math.sin(i / 3))) }))
        const max = Math.max(...hours.map(h => h.count), 1)
        return (<div className="mt-2"><div className="h-32 flex items-end gap-px">{hours.map((h, i) => (<div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative"><div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none">{h.count}</div><div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm" style={{ height: `${(h.count / max) * 100}%`, minHeight: '2px' }} /><span className="text-[7px] text-slate-400">{h.hour.slice(0, 2)}</span></div>))}</div></div>)
    }
    const renderOpsCheckoutVolume = (data: Reservation[]) => {
        const hours = Array.from({ length: 8 }, (_, i) => ({ hour: `${i + 6}:00`, count: Math.round(data.length / 8 * (1 + Math.cos(i / 2))) }))
        const max = Math.max(...hours.map(h => h.count), 1)
        return (<div className="mt-2"><div className="h-32 flex items-end gap-1">{hours.map((h, i) => (<div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative"><div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none">{h.count}</div><div className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-sm" style={{ height: `${(h.count / max) * 100}%`, minHeight: '2px' }} /><span className="text-[7px] text-slate-400">{h.hour.slice(0, 2)}</span></div>))}</div></div>)
    }
    const renderOpsHousekeepingChart = (_data: Reservation[]) => {
        const stats = [{ label: 'Temiz', value: 220, color: 'text-emerald-500' }, { label: 'Kirli', value: 95, color: 'text-red-500' }, { label: 'Bakımda', value: 15, color: 'text-amber-500' }, { label: 'Kontrol', value: 40, color: 'text-blue-500' }]
        return (<div className="mt-2 grid grid-cols-2 gap-2">{stats.map((s, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center"><div className={`text-xl font-bold ${s.color}`}>{s.value}</div><div className="text-[10px] text-slate-400">{s.label}</div></div>))}</div>)
    }
    const renderOpsMaintenanceChart = (_data: Reservation[]) => {
        const cats = [{ name: 'Elektrik', count: 12 }, { name: 'Tesisat', count: 18 }, { name: 'Klima', count: 8 }, { name: 'Mobilya', count: 5 }, { name: 'Diğer', count: 4 }]
        const max = Math.max(...cats.map(c => c.count), 1)
        return (<div className="mt-2 space-y-2">{cats.map((c, i) => (<div key={i} className="flex items-center gap-2"><span className="text-xs w-14 text-slate-500 truncate">{c.name}</span><div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${(c.count / max) * 100}%` }} /></div><span className="text-xs font-bold w-6 text-right">{c.count}</span></div>))}</div>)
    }
    const renderOpsRequestChart = (data: Reservation[]) => {
        const types = [{ label: 'Havlu', pct: 25 }, { label: 'Yastık', pct: 15 }, { label: 'Minibar', pct: 20 }, { label: 'Oda Servisi', pct: 30 }, { label: 'Diğer', pct: 10 }]
        const total = Math.round(data.length * 0.4)
        return (<div className="mt-2"><div className="text-xs text-slate-500 mb-2">{total} toplam istek</div><div className="space-y-1.5">{types.map((t, i) => (<div key={i} className="flex items-center justify-between text-xs"><span className="text-slate-600 dark:text-slate-400">{t.label}</span><span className="font-bold">{Math.round(total * t.pct / 100)}</span></div>))}</div></div>)
    }
    const renderOpsResponseTime = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4"><div className="text-xs text-emerald-500">Ort. Yanıt Süresi</div><div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">4.2<span className="text-sm">dk</span></div><div className="text-[10px] text-emerald-400">Hedef: 5dk</div></div></div>)
    const renderOpsEnergyChart = (_data: Reservation[]) => {
        const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz']
        const vals = [85, 78, 72, 90, 110, 125]
        const max = Math.max(...vals)
        return (<div className="mt-2"><div className="h-32 flex items-end gap-1">{months.map((m, i) => (<div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative"><div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none">{vals[i]} kWh</div><div className="w-full bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-sm" style={{ height: `${(vals[i] / max) * 100}%` }} /><span className="text-[8px] text-slate-400">{m}</span></div>))}</div></div>)
    }
    const renderOpsWaterChart = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4"><div className="text-xs text-cyan-500">Günlük Su Tüketimi</div><div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">42.5<span className="text-sm">m³</span></div><div className="text-[10px] text-cyan-400">↓ %8 geçen hafta</div></div></div>)
    const renderOpsComplaintTrend = (data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4"><div className="text-xs text-red-500">Şikayet</div><div className="text-3xl font-bold text-red-600 dark:text-red-400">{Math.round(data.length * 0.02)}</div><div className="text-[10px] text-red-400">Son 30 gün</div></div></div>)
    const renderOpsTaskCompletion = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4"><div className="text-xs text-emerald-500">Görev Tamamlama</div><div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">%92</div><div className="text-[10px] text-emerald-400">345/375 görev</div></div></div>)

    // Operations Data
    const renderOpsModReport = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const inhouse = data.filter(r => r.checkIn <= today && r.checkOut > today)
        return (<div className="mt-2 grid grid-cols-3 gap-3"><div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-blue-500">In-House</div><div className="text-xl font-bold text-blue-700 dark:text-blue-300">{inhouse.length}</div></div><div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-emerald-500">Giriş</div><div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{data.filter(r => r.checkIn.slice(0, 10) === today).length}</div></div><div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-amber-500">Çıkış</div><div className="text-xl font-bold text-amber-700 dark:text-amber-300">{data.filter(r => r.checkOut.slice(0, 10) === today).length}</div></div></div>)
    }
    const renderOpsNightAuditData = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const inhouse = data.filter(r => r.checkIn <= today && r.checkOut > today)
        const rev = inhouse.reduce((s, r) => s + dp(r.totalPrice, r.currency) / r.nights, 0)
        return (<div className="mt-2 grid grid-cols-2 gap-3"><div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">Oda Geliri</div><div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmtMoney(rev)}</div></div><div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">Doluluk</div><div className="text-lg font-bold text-blue-600 dark:text-blue-400">%{Math.round(inhouse.reduce((s, r) => s + r.roomCount, 0) / TOTAL_ROOMS_ALL * 100)}</div></div></div>)
    }
    const renderOpsLostFound = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4"><div className="text-xs text-purple-500">Kayıp/Bulunmuş</div><div className="text-3xl font-bold text-purple-600 dark:text-purple-400">3</div><div className="text-[10px] text-purple-400">Açık kayıt</div></div></div>)
    const renderOpsSecurityLog = (_data: Reservation[]) => (<div className="mt-2 space-y-1.5">{['Giriş kapısı kontrol', 'Havuz alanı denetim', 'Gece tur kontrol', 'Park alanı kontrolü'].map((s, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{s}</span><span className="text-emerald-500 text-[10px]">✓</span></div>))}</div>)
    const renderOpsIncident = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4"><div className="text-xs text-amber-500">Olay Raporu</div><div className="text-3xl font-bold text-amber-600 dark:text-amber-400">0</div><div className="text-[10px] text-amber-400">Açık olay yok</div></div></div>)
    const renderOpsPoolStatus = (_data: Reservation[]) => (<div className="mt-2 grid grid-cols-2 gap-2"><div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3 text-center"><div className="text-[10px] text-cyan-500">Havuz</div><div className="text-sm font-bold text-emerald-600">Açık</div></div><div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center"><div className="text-[10px] text-amber-500">Plaj</div><div className="text-sm font-bold text-emerald-600">Açık</div></div></div>)
    const renderOpsParking = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4"><div className="text-xs text-slate-500">Otopark</div><div className="text-3xl font-bold text-slate-900 dark:text-white">68<span className="text-sm text-slate-400">/120</span></div><div className="text-[10px] text-slate-400">%57 dolu</div></div></div>)
    const renderOpsLaundryStats = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4"><div className="text-xs text-purple-500">Çamaşırhane</div><div className="text-3xl font-bold text-purple-600 dark:text-purple-400">156</div><div className="text-[10px] text-purple-400">parça/gün</div></div></div>)
    const renderOpsMinibarTrack = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const rooms = data.filter(r => r.checkIn <= today && r.checkOut > today).length
        return (<div className="mt-2 grid grid-cols-2 gap-3"><div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-indigo-500">Kontrol Edilecek</div><div className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{rooms}</div></div><div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-emerald-500">Tamamlanan</div><div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{Math.round(rooms * 0.75)}</div></div></div>)
    }
    const renderOpsShuttleSchedule = (_data: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ time: '08:00', route: 'Havaalanı → Otel', pax: 12 }, { time: '10:30', route: 'Otel → Merkez', pax: 8 }, { time: '14:00', route: 'Havaalanı → Otel', pax: 15 }, { time: '18:00', route: 'Otel → Havaalanı', pax: 10 }].map((s, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="font-medium text-slate-700 dark:text-slate-300">{s.time}</span><span className="text-slate-500">{s.route}</span><span className="font-bold text-blue-600">{s.pax} kişi</span></div>))}</div>)
    const renderOpsAmenityUsage = (_data: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ name: 'SPA', pct: 35 }, { name: 'Gym', pct: 25 }, { name: 'Sauna', pct: 20 }, { name: 'Tenis', pct: 15 }].map((a, i) => (<div key={i} className="flex items-center gap-2"><span className="text-xs w-12 text-slate-500">{a.name}</span><div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${a.pct}%` }} /></div><span className="text-[10px] font-bold">{a.pct}%</span></div>))}</div>)
    const renderOpsKeyCard = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4"><div className="text-xs text-slate-500">Kart Basımı</div><div className="text-3xl font-bold text-slate-900 dark:text-white">48</div><div className="text-[10px] text-slate-400">bugün</div></div></div>)

    // Operations Graphs
    const renderOpsFloorHeatmap = (data: Reservation[]) => {
        const floors = Array.from({ length: 7 }, (_, i) => {
            const floorRooms = 50 + (i % 3) * 5
            const occupied = Math.round(floorRooms * (0.5 + Math.random() * 0.4))
            return { floor: i + 1, pct: Math.round((occupied / floorRooms) * 100) }
        })
        return (<div className="mt-2 space-y-1">{floors.map((f, i) => (<div key={i} className="flex items-center gap-2"><span className="text-xs w-10 text-slate-500">Kat {f.floor}</span><div className="flex-1 h-5 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden"><div className={`h-full rounded ${f.pct > 80 ? 'bg-emerald-500' : f.pct > 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${f.pct}%` }} /></div><span className="text-xs font-bold w-10 text-right">%{f.pct}</span></div>))}</div>)
    }
    const renderOpsTimeline = (_data: Reservation[]) => {
        const events = [{ time: '06:00', event: 'Gece audit tamamlandı', type: '🔵' }, { time: '07:00', event: 'Kahvaltı servisi başladı', type: '🟢' }, { time: '08:00', event: 'HK temizlik başladı', type: '🟡' }, { time: '10:00', event: 'Check-out yoğunluğu', type: '🔴' }, { time: '14:00', event: 'Check-in başladı', type: '🟢' }]
        return (<div className="mt-2 space-y-2">{events.map((e, i) => (<div key={i} className="flex items-center gap-3 text-xs"><span className="text-slate-400 w-10 font-mono">{e.time}</span><span>{e.type}</span><span className="text-slate-600 dark:text-slate-400">{e.event}</span></div>))}</div>)
    }
    const renderOpsResponseGauge = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Yanıt Hızı</div><div className="text-3xl font-bold mt-1">%95</div><div className="text-xs opacity-70">Hedef: %90</div></div></div>)
    const renderOpsEnergyGauge = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Enerji Verimliliği</div><div className="text-3xl font-bold mt-1">%78</div><div className="text-xs opacity-70">Hedef: %85</div></div></div>)
    const renderOpsTaskKanban = (_data: Reservation[]) => {
        const cols = [{ title: 'Bekleyen', count: 8, color: 'border-amber-400' }, { title: 'Devam Eden', count: 12, color: 'border-blue-400' }, { title: 'Tamamlanan', count: 25, color: 'border-emerald-400' }]
        return (<div className="mt-2 grid grid-cols-3 gap-2">{cols.map((c, i) => (<div key={i} className={`border-t-2 ${c.color} bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center`}><div className="text-[10px] text-slate-500">{c.title}</div><div className="text-xl font-bold text-slate-900 dark:text-white">{c.count}</div></div>))}</div>)
    }

    // ─── F&B Widget Renderers ───

    const renderFnbRestaurantRev = (data: Reservation[]) => {
        const rev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0) * 0.08
        const daily = Array.from({ length: 7 }, (_, i) => ({ day: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i], val: Math.round(rev / 7 * (0.7 + Math.random() * 0.6)) }))
        const max = Math.max(...daily.map(d => d.val), 1)
        return (<div className="mt-2"><div className="h-32 flex items-end gap-1">{daily.map((d, i) => (<div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative"><div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 z-10 pointer-events-none">{fmtMoney(d.val)}</div><div className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-sm" style={{ height: `${(d.val / max) * 100}%`, minHeight: '3px' }} /><span className="text-[8px] text-slate-400">{d.day}</span></div>))}</div></div>)
    }
    const renderFnbBarRev = (data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Bar Geliri</div><div className="text-3xl font-bold mt-1">{fmtMoney(data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0) * 0.03)}</div></div></div>)
    const renderFnbRoomserviceChart = (data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4"><div className="text-xs text-amber-500">Oda Servisi</div><div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{Math.round(data.length * 0.15)}</div><div className="text-[10px] text-amber-400">sipariş/gün</div></div></div>)
    const renderFnbBreakfastCount = (data: Reservation[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const guests = data.filter(r => r.checkIn <= today && r.checkOut > today).length
        return (<div className="mt-2 text-center"><div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4"><div className="text-xs text-emerald-500">Kahvaltı</div><div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{Math.round(guests * 1.8)}</div><div className="text-[10px] text-emerald-400">kişi bugün</div></div></div>)
    }
    const renderFnbAllincConsumption = (data: Reservation[]) => {
        const ai = data.filter(r => r.boardType === 'HŞ' || r.boardType === 'Ultra HŞ' || r.boardType === 'AI')
        return (<div className="mt-2 grid grid-cols-2 gap-3"><div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-blue-500">AI Misafir</div><div className="text-xl font-bold text-blue-700 dark:text-blue-300">{ai.length}</div></div><div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-orange-500">Ort. Tüketim</div><div className="text-xl font-bold text-orange-700 dark:text-orange-300">{fmtMoney(ai.length > 0 ? 85 : 0)}/gün</div></div></div>)
    }
    const renderFnbMenuPopularity = (_data: Reservation[]) => {
        const items = [{ name: 'Izgara Levrek', orders: 145 }, { name: 'Karışık Izgara', orders: 120 }, { name: 'Köfte', orders: 98 }, { name: 'Pizza', orders: 87 }, { name: 'Pasta', orders: 65 }]
        const max = items[0].orders
        return (<div className="mt-2 space-y-2">{items.map((it, i) => (<div key={i} className="flex items-center gap-2"><span className="text-xs w-24 truncate text-slate-500">{it.name}</span><div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${(it.orders / max) * 100}%` }} /></div><span className="text-xs font-bold w-8 text-right">{it.orders}</span></div>))}</div>)
    }
    const renderFnbFoodCost = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4"><div className="text-xs text-red-500">Gıda Maliyet Oranı</div><div className="text-3xl font-bold text-red-600 dark:text-red-400">%32</div><div className="text-[10px] text-red-400">Hedef: %30</div></div></div>)
    const renderFnbBeverageCost = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4"><div className="text-xs text-purple-500">İçecek Maliyet Oranı</div><div className="text-3xl font-bold text-purple-600 dark:text-purple-400">%22</div><div className="text-[10px] text-purple-400">Hedef: %25</div></div></div>)
    const renderFnbCoverCount = (data: Reservation[]) => {
        const daily = Array.from({ length: 7 }, (_, i) => Math.round(data.length / 7 * (0.8 + Math.random() * 0.4) * 2))
        const max = Math.max(...daily, 1)
        const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
        return (<div className="mt-2"><div className="h-28 flex items-end gap-1">{daily.map((v, i) => (<div key={i} className="flex-1 flex flex-col items-center justify-end h-full"><div className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-sm" style={{ height: `${(v / max) * 100}%`, minHeight: '3px' }} /><span className="text-[8px] text-slate-400">{days[i]}</span></div>))}</div></div>)
    }
    const renderFnbAvgCheck = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Ort. Hesap</div><div className="text-3xl font-bold mt-1">{fmtMoney(245)}</div><div className="text-xs opacity-70">/kişi</div></div></div>)

    // F&B Data
    const renderFnbDailySummary = (data: Reservation[]) => {
        const rev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        return (<div className="mt-2 grid grid-cols-3 gap-2"><div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center"><div className="text-[10px] text-slate-500">Restoran</div><div className="text-sm font-bold text-emerald-600">{fmtMoney(rev * 0.08)}</div></div><div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center"><div className="text-[10px] text-slate-500">Bar</div><div className="text-sm font-bold text-purple-600">{fmtMoney(rev * 0.03)}</div></div><div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center"><div className="text-[10px] text-slate-500">Oda Servis</div><div className="text-sm font-bold text-amber-600">{fmtMoney(rev * 0.02)}</div></div></div>)
    }
    const renderFnbWasteReport = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4"><div className="text-xs text-amber-500">Günlük İsraf</div><div className="text-3xl font-bold text-amber-600 dark:text-amber-400">%4.2</div><div className="text-[10px] text-amber-400">Hedef: %3</div></div></div>)
    const renderFnbStockAlert = (_data: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ item: 'Zeytinyağı', level: 'Düşük' }, { item: 'Taze Balık', level: 'Kritik' }, { item: 'Süt Ürünleri', level: 'Normal' }].map((s, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{s.item}</span><span className={`font-bold ${s.level === 'Kritik' ? 'text-red-500' : s.level === 'Düşük' ? 'text-amber-500' : 'text-emerald-500'}`}>{s.level}</span></div>))}</div>)
    const renderFnbRecipeCost = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4"><div className="text-xs text-slate-500">Ort. Reçete Maliyeti</div><div className="text-3xl font-bold text-slate-900 dark:text-white">{fmtMoney(42)}</div></div></div>)
    const renderFnbSupplierPerf = (_data: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ name: 'Metro', score: 92 }, { name: 'Makro', score: 88 }, { name: 'Yerel Balıkçı', score: 95 }].map((s, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{s.name}</span><span className="font-bold text-emerald-600">%{s.score}</span></div>))}</div>)
    const renderFnbSpecialDiet = (_data: Reservation[]) => (<div className="mt-2 grid grid-cols-2 gap-2">{[{ label: 'Vegan', count: 12 }, { label: 'Glutensiz', count: 8 }, { label: 'Helal', count: 25 }, { label: 'Koşer', count: 3 }].map((d, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center"><div className="text-xl font-bold text-slate-900 dark:text-white">{d.count}</div><div className="text-[10px] text-slate-400">{d.label}</div></div>))}</div>)
    const renderFnbBanquetRev = (data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Ziyafet Gelirleri</div><div className="text-3xl font-bold mt-1">{fmtMoney(data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0) * 0.05)}</div></div></div>)
    const renderFnbOutletCompare = (_data: Reservation[]) => {
        const outlets = [{ name: 'Ana Rest.', rev: 45000 }, { name: 'Teras', rev: 28000 }, { name: 'Beach Bar', rev: 18000 }, { name: 'Lobi Bar', rev: 12000 }]
        const max = outlets[0].rev
        return (<div className="mt-2 space-y-2">{outlets.map((o, i) => (<div key={i} className="flex items-center gap-2"><span className="text-xs w-16 truncate text-slate-500">{o.name}</span><div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${(o.rev / max) * 100}%` }} /></div><span className="text-[10px] font-bold w-14 text-right">{fmtMoney(o.rev)}</span></div>))}</div>)
    }
    const renderFnbHappyHour = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4"><div className="text-xs text-pink-500">Happy Hour</div><div className="text-3xl font-bold text-pink-600 dark:text-pink-400">+%35</div><div className="text-[10px] text-pink-400">satış artışı 17-19:00</div></div></div>)
    const renderFnbInventory = (_data: Reservation[]) => (<div className="mt-2 grid grid-cols-3 gap-2">{[{ label: 'Yeterli', count: 245, color: 'text-emerald-500' }, { label: 'Düşük', count: 18, color: 'text-amber-500' }, { label: 'Kritik', count: 3, color: 'text-red-500' }].map((s, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center"><div className={`text-xl font-bold ${s.color}`}>{s.count}</div><div className="text-[10px] text-slate-400">{s.label}</div></div>))}</div>)

    // F&B Graphs
    const renderFnbTreemap = (data: Reservation[]) => {
        const rev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0)
        const segs = [{ name: 'Restoran', pct: 55, color: 'bg-orange-500' }, { name: 'Bar', pct: 20, color: 'bg-purple-500' }, { name: 'Oda Servis', pct: 15, color: 'bg-amber-500' }, { name: 'Diğer', pct: 10, color: 'bg-slate-400' }]
        return (<div className="mt-2"><div className="text-xs text-slate-500 mb-2">Toplam: {fmtMoney(rev * 0.13)}</div><div className="grid grid-cols-4 gap-1 h-20">{segs.map((s, i) => (<div key={i} className={`${s.color} rounded-lg flex items-center justify-center text-white text-[10px] font-bold`} style={{ gridColumn: i < 2 ? 'span 2' : 'span 1' }}>{s.name}<br />%{s.pct}</div>))}</div></div>)
    }
    const renderFnbCostGauge = (_data: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Toplam Maliyet Oranı</div><div className="text-3xl font-bold mt-1">%28</div><div className="text-xs opacity-70">Hedef: %30</div></div></div>)
    const renderFnbPopularityBubble = (_data: Reservation[]) => {
        const items = [{ name: 'Balık', size: 'w-16 h-16', color: 'bg-blue-500' }, { name: 'Et', size: 'w-14 h-14', color: 'bg-red-500' }, { name: 'Salata', size: 'w-10 h-10', color: 'bg-emerald-500' }, { name: 'Tatlı', size: 'w-8 h-8', color: 'bg-amber-500' }]
        return (<div className="mt-2 flex items-center justify-center gap-2 flex-wrap h-24">{items.map((it, i) => (<div key={i} className={`${it.size} ${it.color} rounded-full flex items-center justify-center text-white text-[9px] font-bold`}>{it.name}</div>))}</div>)
    }
    const renderFnbOutletRadar = (_data: Reservation[]) => (<div className="mt-2 grid grid-cols-2 gap-2">{[{ metric: 'Hız', score: 85 }, { metric: 'Kalite', score: 92 }, { metric: 'Maliyet', score: 78 }, { metric: 'Memnuniyet', score: 88 }].map((m, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center"><div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">%{m.score}</div><div className="text-[9px] text-slate-400">{m.metric}</div></div>))}</div>)
    const renderFnbFlowSankey = (data: Reservation[]) => {
        const boards: Record<string, number> = {}
        data.forEach(r => { boards[r.boardType] = (boards[r.boardType] || 0) + 1 })
        const sorted = Object.entries(boards).sort(([, a], [, b]) => b - a).slice(0, 4)
        const total = data.length || 1
        const colors = ['bg-orange-400', 'bg-amber-400', 'bg-emerald-400', 'bg-blue-400']
        return (<div className="mt-2 space-y-2">{sorted.map(([name, count], i) => (<div key={i}><div className="flex justify-between text-xs mb-0.5"><span className="text-slate-500">{name}</span><span className="font-bold">{count}</span></div><div className="h-3 flex rounded-lg overflow-hidden"><div className={`${colors[i % colors.length]}`} style={{ width: `${(count / total) * 100}%` }} /></div></div>))}</div>)
    }

    // ─── Marketing Widget Renderers ───
    const renderMktDirectVsOta = (data: Reservation[]) => {
        const direct = data.filter(r => r.channel === 'Direct' || r.channel === 'Website').length
        const ota = data.filter(r => r.channel !== 'Direct' && r.channel !== 'Website').length
        const total = direct + ota || 1
        return (<div className="mt-2 grid grid-cols-2 gap-3"><div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-blue-500">Direkt</div><div className="text-xl font-bold text-blue-700 dark:text-blue-300">%{Math.round(direct / total * 100)}</div></div><div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-orange-500">OTA</div><div className="text-xl font-bold text-orange-700 dark:text-orange-300">%{Math.round(ota / total * 100)}</div></div></div>)
    }
    const renderMktWebsiteConversion = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4"><div className="text-xs text-emerald-500">Dönüşüm Oranı</div><div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">%3.8</div><div className="text-[10px] text-emerald-400">↑ %0.5 geçen ay</div></div></div>)
    const renderMktEmailCampaign = (_d: Reservation[]) => (<div className="mt-2 grid grid-cols-3 gap-2">{[{ l: 'Gönderim', v: '12.5K' }, { l: 'Açılma', v: '%24' }, { l: 'Tıklama', v: '%3.2' }].map((s, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center"><div className="text-sm font-bold text-slate-900 dark:text-white">{s.v}</div><div className="text-[9px] text-slate-400">{s.l}</div></div>))}</div>)
    const renderMktSocialEngagement = (_d: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ p: 'Instagram', v: '12.4K', c: 'text-pink-500' }, { p: 'Facebook', v: '8.2K', c: 'text-blue-500' }, { p: 'Twitter', v: '3.1K', c: 'text-sky-500' }].map((s, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className={`font-medium ${s.c}`}>{s.p}</span><span className="font-bold">{s.v}</span></div>))}</div>)
    const renderMktSeoRanking = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">SEO Sıralama</div><div className="text-3xl font-bold mt-1">#12</div><div className="text-xs opacity-70">↑ 3 sıra</div></div></div>)
    const renderMktPpcRoi = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4"><div className="text-xs text-indigo-500">PPC ROI</div><div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">%340</div><div className="text-[10px] text-indigo-400">ROAS: 3.4x</div></div></div>)
    const renderMktReviewScores = (_d: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ p: 'Booking', s: 8.9 }, { p: 'Google', s: 4.5 }, { p: 'TripAdv.', s: 4.3 }].map((s, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{s.p}</span><span className="font-bold text-emerald-600">{s.s}</span></div>))}</div>)
    const renderMktCompetitorRate = (data: Reservation[]) => {
        const avgRate = data.length > 0 ? data.reduce((s, r) => s + dp(r.totalPrice, r.currency) / r.nights, 0) / data.length : 0
        return (<div className="mt-2 space-y-1.5">{[{ h: 'Biz', r: avgRate }, { h: 'Rakip A', r: avgRate * 1.1 }, { h: 'Rakip B', r: avgRate * 0.9 }].map((c, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{c.h}</span><span className={`font-bold ${i === 0 ? 'text-emerald-600' : 'text-slate-500'}`}>{fmtMoney(c.r)}</span></div>))}</div>)
    }
    const renderMktMarketShare = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Pazar Payı</div><div className="text-3xl font-bold mt-1">%18</div><div className="text-xs opacity-70">Bölge: Bodrum</div></div></div>)
    const renderMktBrandAwareness = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4"><div className="text-xs text-amber-500">Marka Bilinirliği</div><div className="text-3xl font-bold text-amber-600 dark:text-amber-400">%62</div><div className="text-[10px] text-amber-400">anket sonucu</div></div></div>)
    // Marketing Data
    const renderMktCampaignSummary = (_d: Reservation[]) => (<div className="mt-2 grid grid-cols-2 gap-2">{[{ l: 'Aktif', v: 3, c: 'text-emerald-500' }, { l: 'Planlanan', v: 5, c: 'text-blue-500' }, { l: 'Biten', v: 12, c: 'text-slate-400' }, { l: 'ROI Ort.', v: '%280', c: 'text-amber-500' }].map((s, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center"><div className={`text-lg font-bold ${s.c}`}>{s.v}</div><div className="text-[9px] text-slate-400">{s.l}</div></div>))}</div>)
    const renderMktPromoRedemption = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4"><div className="text-xs text-pink-500">Promosyon Kullanım</div><div className="text-3xl font-bold text-pink-600 dark:text-pink-400">%45</div><div className="text-[10px] text-pink-400">128/285 kod</div></div></div>)
    const renderMktReferral = (data: Reservation[]) => { const ch: Record<string, number> = {}; data.forEach(r => { ch[r.channel] = (ch[r.channel] || 0) + 1 }); const sorted = Object.entries(ch).sort(([, a], [, b]) => b - a).slice(0, 4); const max = sorted[0]?.[1] || 1; return (<div className="mt-2 space-y-2">{sorted.map(([n, c], i) => (<div key={i} className="flex items-center gap-2"><span className="text-xs w-16 truncate text-slate-500">{n}</span><div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(c / max) * 100}%` }} /></div><span className="text-xs font-bold w-6 text-right">{c}</span></div>))}</div>) }
    const renderMktReviewList = (_d: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ g: '⭐⭐⭐⭐⭐', t: 'Mükemmel hizmet' }, { g: '⭐⭐⭐⭐', t: 'Temiz ve güzel' }, { g: '⭐⭐⭐⭐⭐', t: 'Harika personel' }].map((r, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><div className="text-xs">{r.g}</div><div className="text-[10px] text-slate-500 truncate">{r.t}</div></div>))}</div>)
    const renderMktMetaPerf = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4"><div className="text-xs text-blue-500">Meta Search</div><div className="text-3xl font-bold text-blue-600 dark:text-blue-400">%12</div><div className="text-[10px] text-blue-400">trafik payı</div></div></div>)
    const renderMktOtaRanking = (_d: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ p: 'Booking.com', r: '#8' }, { p: 'Expedia', r: '#15' }, { p: 'HotelsCom', r: '#12' }].map((s, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{s.p}</span><span className="font-bold text-blue-600">{s.r}</span></div>))}</div>)
    const renderMktLoyaltyStats = (_d: Reservation[]) => (<div className="mt-2 grid grid-cols-2 gap-2">{[{ l: 'Üye', v: '2.4K' }, { l: 'Aktif', v: '1.1K' }, { l: 'Puan', v: '45K' }, { l: 'Kullanım', v: '%32' }].map((s, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center"><div className="text-sm font-bold text-slate-900 dark:text-white">{s.v}</div><div className="text-[9px] text-slate-400">{s.l}</div></div>))}</div>)
    const renderMktNewsletter = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4"><div className="text-xs text-emerald-500">Newsletter</div><div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">8.5K</div><div className="text-[10px] text-emerald-400">abone</div></div></div>)
    const renderMktInfluencer = (_d: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ n: '@travel_turk', f: '125K', s: 'Aktif' }, { n: '@hotel_review', f: '85K', s: 'Planlanan' }].map((s, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{s.n} ({s.f})</span><span className={`font-bold ${s.s === 'Aktif' ? 'text-emerald-500' : 'text-blue-500'}`}>{s.s}</span></div>))}</div>)
    const renderMktContentPerf = (_d: Reservation[]) => (<div className="mt-2 grid grid-cols-2 gap-2">{[{ l: 'Blog', v: '4.2K' }, { l: 'Video', v: '8.1K' }, { l: 'Galeri', v: '12K' }, { l: '360°', v: '2.5K' }].map((s, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center"><div className="text-sm font-bold text-slate-900 dark:text-white">{s.v}</div><div className="text-[9px] text-slate-400">{s.l} görüntülenme</div></div>))}</div>)
    // Marketing Graphs
    const renderMktChannelFunnel = (data: Reservation[]) => { const stages = [{ l: 'Ziyaret', v: data.length * 15 }, { l: 'Arama', v: data.length * 8 }, { l: 'Rez.', v: data.length }, { l: 'Konaklama', v: Math.round(data.length * 0.85) }]; const max = stages[0].v || 1; return (<div className="mt-2 space-y-1">{stages.map((s, i) => (<div key={i} className="flex items-center gap-2"><span className="text-[10px] w-16 text-slate-500">{s.l}</span><div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded" style={{ width: `${(s.v / max) * 100}%` }} /></div><span className="text-[10px] font-bold w-10 text-right">{s.v}</span></div>))}</div>) }
    const renderMktAttribution = (data: Reservation[]) => { const ch: Record<string, number> = {}; data.forEach(r => { ch[r.channel] = (ch[r.channel] || 0) + dp(r.totalPrice, r.currency) }); const sorted = Object.entries(ch).sort(([, a], [, b]) => b - a).slice(0, 4); const colors = ['bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-purple-400']; return (<div className="mt-2 space-y-2">{sorted.map(([n, v], i) => (<div key={i}><div className="flex justify-between text-xs mb-0.5"><span className="text-slate-500">{n}</span><span className="font-bold">{fmtMoney(v)}</span></div><div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${colors[i % 4]} rounded-full`} style={{ width: `${(v / (sorted[0][1] || 1)) * 100}%` }} /></div></div>))}</div>) }
    const renderMktCompetitorRadar = (_d: Reservation[]) => (<div className="mt-2 grid grid-cols-2 gap-2">{[{ m: 'Fiyat', s: 75 }, { m: 'Konum', s: 92 }, { m: 'Hizmet', s: 88 }, { m: 'Tesis', s: 85 }].map((m, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center"><div className="text-sm font-bold text-violet-600 dark:text-violet-400">%{m.s}</div><div className="text-[9px] text-slate-400">{m.m}</div></div>))}</div>)
    const renderMktRoiScatter = (_d: Reservation[]) => (<div className="mt-2 grid grid-cols-2 gap-2">{[{ c: 'E-posta', roi: 420, cost: '2K' }, { c: 'PPC', roi: 280, cost: '8K' }, { c: 'Sosyal', roi: 180, cost: '5K' }, { c: 'SEO', roi: 550, cost: '3K' }].map((s, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center"><div className="text-sm font-bold text-emerald-600">%{s.roi}</div><div className="text-[9px] text-slate-400">{s.c} ({s.cost})</div></div>))}</div>)
    const renderMktJourneyFlow = (_d: Reservation[]) => { const steps = [{ l: 'Keşif', e: '🔍', p: '100%' }, { l: 'İlgi', e: '💡', p: '45%' }, { l: 'Araştırma', e: '📊', p: '28%' }, { l: 'Rez.', e: '📝', p: '12%' }, { l: 'Konaklama', e: '🏨', p: '10%' }]; return (<div className="mt-2 flex items-center justify-between">{steps.map((s, i) => (<div key={i} className="text-center"><div className="text-lg">{s.e}</div><div className="text-[8px] text-slate-500">{s.l}</div><div className="text-[9px] font-bold">{s.p}</div></div>))}</div>) }

    // ─── Staff & HR Widget Renderers ───
    const renderStaffScheduleChart = (_d: Reservation[]) => { const shifts = [{ s: 'Sabah', c: 45, cl: 'bg-amber-400' }, { s: 'Öğle', c: 38, cl: 'bg-blue-400' }, { s: 'Gece', c: 22, cl: 'bg-indigo-400' }]; const max = 45; return (<div className="mt-2 space-y-2">{shifts.map((s, i) => (<div key={i} className="flex items-center gap-2"><span className="text-xs w-12 text-slate-500">{s.s}</span><div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${s.cl} rounded-full`} style={{ width: `${(s.c / max) * 100}%` }} /></div><span className="text-xs font-bold w-6 text-right">{s.c}</span></div>))}</div>) }
    const renderStaffOvertimeChart = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4"><div className="text-xs text-amber-500">Fazla Mesai</div><div className="text-3xl font-bold text-amber-600 dark:text-amber-400">128<span className="text-sm">st</span></div><div className="text-[10px] text-amber-400">bu ay</div></div></div>)
    const renderStaffLaborCost = (data: Reservation[]) => { const rev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0); return (<div className="mt-2 grid grid-cols-2 gap-3"><div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">İşçilik</div><div className="text-lg font-bold text-red-600">{fmtMoney(rev * 0.25)}</div></div><div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">Oran</div><div className="text-lg font-bold text-blue-600">%25</div></div></div>) }
    const renderStaffProductivity = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Verimlilik</div><div className="text-3xl font-bold mt-1">%87</div><div className="text-xs opacity-70">↑ %3 geçen ay</div></div></div>)
    const renderStaffTurnover = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4"><div className="text-xs text-red-500">Devir Oranı</div><div className="text-3xl font-bold text-red-600 dark:text-red-400">%8</div><div className="text-[10px] text-red-400">yıllık</div></div></div>)
    const renderStaffTraining = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4"><div className="text-xs text-blue-500">Eğitim Tamamlama</div><div className="text-3xl font-bold text-blue-600 dark:text-blue-400">%92</div><div className="text-[10px] text-blue-400">185/201 personel</div></div></div>)
    const renderStaffAttendance = (_d: Reservation[]) => (<div className="mt-2 grid grid-cols-3 gap-2">{[{ l: 'Mevcut', v: 185, c: 'text-emerald-500' }, { l: 'İzinli', v: 12, c: 'text-amber-500' }, { l: 'Raporlu', v: 4, c: 'text-red-500' }].map((s, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center"><div className={`text-xl font-bold ${s.c}`}>{s.v}</div><div className="text-[9px] text-slate-400">{s.l}</div></div>))}</div>)
    const renderStaffDepartment = (_d: Reservation[]) => { const depts = [{ n: 'FO', c: 25 }, { n: 'HK', c: 45 }, { n: 'F&B', c: 55 }, { n: 'Teknik', c: 15 }, { n: 'İdari', c: 10 }]; const max = 55; return (<div className="mt-2 space-y-1.5">{depts.map((d, i) => (<div key={i} className="flex items-center gap-2"><span className="text-[10px] w-10 text-slate-500">{d.n}</span><div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(d.c / max) * 100}%` }} /></div><span className="text-[10px] font-bold w-6 text-right">{d.c}</span></div>))}</div>) }
    // Staff Data
    const renderStaffRoster = (_d: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ n: 'Ahmet Y.', dept: 'FO', shift: '08-16' }, { n: 'Mehmet K.', dept: 'HK', shift: '08-16' }, { n: 'Ayşe T.', dept: 'F&B', shift: '16-00' }, { n: 'Fatma S.', dept: 'FO', shift: '00-08' }].map((s, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-700 dark:text-slate-300 font-medium">{s.n}</span><span className="text-slate-400">{s.dept}</span><span className="text-blue-600 font-mono">{s.shift}</span></div>))}</div>)
    const renderStaffLeave = (_d: Reservation[]) => (<div className="mt-2 grid grid-cols-2 gap-2">{[{ l: 'Yıllık İzin', v: 8 }, { l: 'Mazeret', v: 3 }, { l: 'Rapor', v: 4 }, { l: 'Onay Bekl.', v: 5 }].map((s, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center"><div className="text-xl font-bold text-slate-900 dark:text-white">{s.v}</div><div className="text-[9px] text-slate-400">{s.l}</div></div>))}</div>)
    const renderStaffPerformance = (_d: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ dept: 'Ön Büro', score: 92 }, { dept: 'Housekeeping', score: 88 }, { dept: 'F&B', score: 85 }].map((s, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{s.dept}</span><span className="font-bold text-emerald-600">%{s.score}</span></div>))}</div>)
    const renderStaffCertification = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4"><div className="text-xs text-emerald-500">Sertifika</div><div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">%95</div><div className="text-[10px] text-emerald-400">güncel</div></div></div>)
    const renderStaffOnboarding = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4"><div className="text-xs text-blue-500">İşe Alım</div><div className="text-3xl font-bold text-blue-600 dark:text-blue-400">3</div><div className="text-[10px] text-blue-400">devam eden</div></div></div>)
    const renderStaffPayrollSummary = (data: Reservation[]) => { const rev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0); return (<div className="mt-2 grid grid-cols-2 gap-2"><div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center"><div className="text-[10px] text-slate-500">Toplam Maaş</div><div className="text-sm font-bold text-slate-900 dark:text-white">{fmtMoney(rev * 0.2)}</div></div><div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center"><div className="text-[10px] text-slate-500">Prim</div><div className="text-sm font-bold text-emerald-600">{fmtMoney(rev * 0.03)}</div></div></div>) }
    const renderStaffTipReport = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4"><div className="text-xs text-amber-500">Bahşiş</div><div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{fmtMoney(4250)}</div><div className="text-[10px] text-amber-400">bu ay</div></div></div>)
    const renderStaffUniform = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4"><div className="text-xs text-slate-500">Üniforma</div><div className="text-3xl font-bold text-slate-900 dark:text-white">12</div><div className="text-[10px] text-slate-400">yenileme talebi</div></div></div>)
    // Staff Graphs
    const renderStaffOrgChart = (_d: Reservation[]) => (<div className="mt-2 text-center space-y-2"><div className="bg-indigo-500 text-white rounded-lg px-3 py-1.5 text-xs mx-auto w-24">GM</div><div className="grid grid-cols-3 gap-1">{['FO', 'HK', 'F&B'].map((d, i) => (<div key={i} className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg px-2 py-1 text-[10px] font-bold">{d}</div>))}</div></div>)
    const renderStaffWorkloadHeatmap = (_d: Reservation[]) => { const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']; const loads = [75, 80, 70, 85, 90, 95, 60]; return (<div className="mt-2 flex gap-1">{days.map((d, i) => (<div key={i} className="flex-1 text-center"><div className={`h-8 rounded ${loads[i] > 85 ? 'bg-red-400' : loads[i] > 70 ? 'bg-amber-400' : 'bg-emerald-400'}`} /><div className="text-[8px] text-slate-400 mt-0.5">{d}</div></div>))}</div>) }
    const renderStaffSatisfactionGauge = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Memnuniyet</div><div className="text-3xl font-bold mt-1">%82</div><div className="text-xs opacity-70">anket sonucu</div></div></div>)
    const renderStaffCostPie = (data: Reservation[]) => { const rev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0); const cats = [{ l: 'Maaş', p: 65, c: 'bg-blue-500' }, { l: 'SGK', p: 20, c: 'bg-emerald-500' }, { l: 'Prim', p: 10, c: 'bg-amber-500' }, { l: 'Diğer', p: 5, c: 'bg-slate-400' }]; return (<div className="mt-2"><div className="text-xs text-slate-500 mb-2">Toplam: {fmtMoney(rev * 0.25)}</div><div className="flex h-4 rounded-full overflow-hidden">{cats.map((c, i) => (<div key={i} className={`${c.c}`} style={{ width: `${c.p}%` }} />))}</div><div className="flex flex-wrap gap-2 mt-2">{cats.map((c, i) => (<div key={i} className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${c.c}`} /><span className="text-[9px] text-slate-500">{c.l} %{c.p}</span></div>))}</div></div>) }

    // ─── Yield Management Widget Renderers ───
    const renderYieldRateStrategy = (data: Reservation[]) => { const avg = data.length ? data.reduce((s, r) => s + dp(r.totalPrice, r.currency) / r.nights, 0) / data.length : 0; return (<div className="mt-2 grid grid-cols-2 gap-3"><div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-emerald-500">Ort. Fiyat</div><div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{fmtMoney(avg)}</div></div><div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-blue-500">Hedef</div><div className="text-xl font-bold text-blue-700 dark:text-blue-300">{fmtMoney(avg * 1.1)}</div></div></div>) }
    const renderYieldDemandForecast = (data: Reservation[]) => { const days = Array.from({ length: 7 }, (_, i) => ({ d: i + 1, v: Math.round(data.length / 30 * (0.7 + Math.random() * 0.6)) })); const max = Math.max(...days.map(d => d.v), 1); return (<div className="mt-2"><div className="h-28 flex items-end gap-1">{days.map((d, i) => (<div key={i} className="flex-1 flex flex-col items-center justify-end h-full"><div className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-sm" style={{ height: `${(d.v / max) * 100}%`, minHeight: '3px' }} /><span className="text-[8px] text-slate-400">G{d.d}</span></div>))}</div></div>) }
    const renderYieldCompset = (data: Reservation[]) => { const avg = data.length ? data.reduce((s, r) => s + dp(r.totalPrice, r.currency) / r.nights, 0) / data.length : 0; return (<div className="mt-2 space-y-1.5">{[{ h: 'Biz', r: avg, w: true }, { h: 'Comp A', r: avg * 1.05 }, { h: 'Comp B', r: avg * 0.92 }, { h: 'Comp C', r: avg * 1.12 }].map((c, i) => (<div key={i} className={`flex items-center justify-between text-xs rounded-lg px-3 py-2 ${c.w ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-50 dark:bg-slate-800/50'}`}><span className="text-slate-600 dark:text-slate-400">{c.h}</span><span className={`font-bold ${c.w ? 'text-emerald-600' : 'text-slate-500'}`}>{fmtMoney(c.r)}</span></div>))}</div>) }
    const renderYieldPickup = (data: Reservation[]) => { const recent = data.filter(r => { const d = new Date(r.saleDate); const now = new Date(); return (now.getTime() - d.getTime()) < 7 * 24 * 3600 * 1000 }).length; return (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">7 Gün Pick-Up</div><div className="text-3xl font-bold mt-1">{recent}</div><div className="text-xs opacity-70">yeni rez.</div></div></div>) }
    const renderYieldDisplacement = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4"><div className="text-xs text-amber-500">Displacement</div><div className="text-3xl font-bold text-amber-600 dark:text-amber-400">+{fmtMoney(12500)}</div><div className="text-[10px] text-amber-400">potansiyel kazanç</div></div></div>)
    const renderYieldLosPattern = (_d: Reservation[]) => { const los = [{ n: '1 gece', p: 15 }, { n: '2-3', p: 35 }, { n: '4-7', p: 38 }, { n: '7+', p: 12 }]; return (<div className="mt-2 space-y-1.5">{los.map((l, i) => (<div key={i} className="flex items-center gap-2"><span className="text-[10px] w-12 text-slate-500">{l.n}</span><div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${l.p}%` }} /></div><span className="text-[10px] font-bold">%{l.p}</span></div>))}</div>) }
    const renderYieldDowAnalysis = (_d: Reservation[]) => { const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']; const rates = [85, 80, 78, 82, 92, 98, 95]; const max = 98; return (<div className="mt-2 flex gap-1">{days.map((d, i) => (<div key={i} className="flex-1 text-center"><div className={`h-8 rounded ${rates[i] > 90 ? 'bg-emerald-500' : rates[i] > 80 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ opacity: rates[i] / max }} /><div className="text-[7px] text-slate-400 mt-0.5">{d}</div></div>))}</div>) }
    const renderYieldSeasonal = (data: Reservation[]) => { const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz']; const vals = months.map((_, i) => Math.round(data.length / 6 * (0.5 + Math.sin(i / 2) * 0.5 + 0.5))); const max = Math.max(...vals, 1); return (<div className="mt-2"><div className="h-28 flex items-end gap-1">{months.map((m, i) => (<div key={i} className="flex-1 flex flex-col items-center justify-end h-full"><div className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-sm" style={{ height: `${(vals[i] / max) * 100}%`, minHeight: '3px' }} /><span className="text-[8px] text-slate-400">{m}</span></div>))}</div></div>) }
    // Yield Data
    const renderYieldRateShop = (data: Reservation[]) => { const avg = data.length ? data.reduce((s, r) => s + dp(r.totalPrice, r.currency) / r.nights, 0) / data.length : 0; return (<div className="mt-2 space-y-1.5">{[{ t: 'Standard', r: avg * 0.8 }, { t: 'Superior', r: avg }, { t: 'Deluxe', r: avg * 1.3 }, { t: 'Suite', r: avg * 2 }].map((t, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{t.t}</span><span className="font-bold text-emerald-600">{fmtMoney(t.r)}</span></div>))}</div>) }
    const renderYieldRestrictions = (_d: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ r: 'Min Stay 3', s: 'Aktif' }, { r: 'CTA Pazar', s: 'Aktif' }, { r: 'Max Stay 14', s: 'Pasif' }].map((r, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{r.r}</span><span className={`font-bold ${r.s === 'Aktif' ? 'text-emerald-500' : 'text-slate-400'}`}>{r.s}</span></div>))}</div>)
    const renderYieldOverrides = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4"><div className="text-xs text-amber-500">Manuel Override</div><div className="text-3xl font-bold text-amber-600 dark:text-amber-400">5</div><div className="text-[10px] text-amber-400">aktif fiyat ayarı</div></div></div>)
    const renderYieldSegmentMix = (data: Reservation[]) => { const segs: Record<string, number> = {}; data.forEach(r => { segs[r.channel] = (segs[r.channel] || 0) + 1 }); const sorted = Object.entries(segs).sort(([, a], [, b]) => b - a).slice(0, 4); const total = data.length || 1; return (<div className="mt-2 space-y-1.5">{sorted.map(([n, c], i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{n}</span><span className="font-bold">%{Math.round(c / total * 100)}</span></div>))}</div>) }
    const renderYieldChannelMargin = (data: Reservation[]) => { const ch: Record<string, { rev: number, cnt: number }> = {}; data.forEach(r => { if (!ch[r.channel]) ch[r.channel] = { rev: 0, cnt: 0 }; ch[r.channel].rev += dp(r.totalPrice, r.currency); ch[r.channel].cnt++ }); const sorted = Object.entries(ch).sort(([, a], [, b]) => b.rev - a.rev).slice(0, 4); return (<div className="mt-2 space-y-1.5">{sorted.map(([n, v], i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{n}</span><span className="font-bold text-emerald-600">{fmtMoney(v.rev)}</span></div>))}</div>) }
    const renderYieldDynamicPricing = (_d: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ t: '08:00', a: 'Fiyat ↑ %5', r: 'Yüksek talep' }, { t: '14:00', a: 'Fiyat ↓ %3', r: 'Düşen talep' }, { t: '20:00', a: 'Fiyat ↑ %8', r: 'Son dakika' }].map((l, i) => (<div key={i} className="text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><div className="flex justify-between"><span className="text-slate-400 font-mono">{l.t}</span><span className="font-bold text-blue-600">{l.a}</span></div><div className="text-[10px] text-slate-400">{l.r}</div></div>))}</div>)
    const renderYieldBenchmark = (_d: Reservation[]) => (<div className="mt-2 grid grid-cols-2 gap-2">{[{ l: 'RevPAR', v: '€185' }, { l: 'ADR', v: '€220' }, { l: 'OCC', v: '%84' }, { l: 'GOPPAR', v: '€125' }].map((s, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center"><div className="text-sm font-bold text-slate-900 dark:text-white">{s.v}</div><div className="text-[9px] text-slate-400">{s.l}</div></div>))}</div>)
    // Yield Graphs
    const renderYieldPriceElasticity = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Fiyat Esnekliği</div><div className="text-3xl font-bold mt-1">-1.2</div><div className="text-xs opacity-70">elastik talep</div></div></div>)
    const renderYieldDemandHeatmap = (_d: Reservation[]) => { const weeks = ['H1', 'H2', 'H3', 'H4']; const days = ['Pzt', 'Çar', 'Cum', 'Paz']; return (<div className="mt-2"><div className="grid grid-cols-4 gap-0.5">{weeks.flatMap((_w, wi) => days.map((d, di) => { const v = 50 + Math.round(Math.random() * 50); return (<div key={`${wi}-${di}`} className={`h-5 rounded-sm flex items-center justify-center text-[7px] text-white font-bold ${v > 80 ? 'bg-emerald-500' : v > 60 ? 'bg-amber-400' : 'bg-red-400'}`}>{v}</div>) }))}</div><div className="flex justify-between mt-1">{days.map((d, i) => (<span key={i} className="text-[7px] text-slate-400">{d}</span>))}</div></div>) }
    const renderYieldOptimalRate = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Optimal Fiyat</div><div className="text-3xl font-bold mt-1">{fmtMoney(245)}</div><div className="text-xs opacity-70">bugün için önerilen</div></div></div>)
    const renderYieldRevenueGauge = (data: Reservation[]) => { const rev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0); const pot = rev * 1.15; return (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Gelir Potansiyeli</div><div className="text-3xl font-bold mt-1">%{Math.round(rev / pot * 100)}</div><div className="text-xs opacity-70">kullanılan kapasite</div></div></div>) }

    // ─── Financial Widget Renderers ───
    const renderFinPnlChart = (data: Reservation[]) => { const rev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0); const cost = rev * 0.55; return (<div className="mt-2 grid grid-cols-2 gap-3"><div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-emerald-500">Gelir</div><div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{fmtMoney(rev)}</div></div><div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-red-500">Gider</div><div className="text-lg font-bold text-red-700 dark:text-red-300">{fmtMoney(cost)}</div></div></div>) }
    const renderFinCashflowChart = (data: Reservation[]) => { const paid = data.reduce((s, r) => s + dp(r.paidPrice, r.currency), 0); const pending = data.reduce((s, r) => s + dp(r.totalPrice - r.paidPrice, r.currency), 0); return (<div className="mt-2 grid grid-cols-2 gap-3"><div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-emerald-500">Tahsilat</div><div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{fmtMoney(paid)}</div></div><div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center"><div className="text-[10px] text-amber-500">Bekleyen</div><div className="text-lg font-bold text-amber-700 dark:text-amber-300">{fmtMoney(pending)}</div></div></div>) }
    const renderFinArAging = (data: Reservation[]) => { const total = data.reduce((s, r) => s + dp(r.totalPrice - r.paidPrice, r.currency), 0); return (<div className="mt-2 space-y-1.5">{[{ p: '0-30 gün', pct: 60 }, { p: '31-60', pct: 25 }, { p: '61-90', pct: 10 }, { p: '90+', pct: 5 }].map((a, i) => (<div key={i} className="flex items-center gap-2"><span className="text-[10px] w-14 text-slate-500">{a.p}</span><div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className={`h-full rounded-full ${i < 2 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${a.pct}%` }} /></div><span className="text-[10px] font-bold">{fmtMoney(total * a.pct / 100)}</span></div>))}</div>) }
    const renderFinApAging = (_d: Reservation[]) => (<div className="mt-2 space-y-1.5">{[{ p: '0-30 gün', v: '45K' }, { p: '31-60', v: '18K' }, { p: '61-90', v: '5K' }].map((a, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{a.p}</span><span className="font-bold text-red-600">{a.v}</span></div>))}</div>)
    const renderFinExpenseChart = (_d: Reservation[]) => { const cats = [{ n: 'Personel', p: 40 }, { n: 'Enerji', p: 15 }, { n: 'Gıda', p: 20 }, { n: 'Bakım', p: 10 }, { n: 'Diğer', p: 15 }]; return (<div className="mt-2 space-y-1.5">{cats.map((c, i) => (<div key={i} className="flex items-center gap-2"><span className="text-[10px] w-14 text-slate-500 truncate">{c.n}</span><div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{ width: `${c.p}%` }} /></div><span className="text-[10px] font-bold">%{c.p}</span></div>))}</div>) }
    // Financial Data
    const renderFinPaymentMethod = (data: Reservation[]) => { const total = data.length || 1; const methods = [{ m: 'Kredi Kartı', p: 55 }, { m: 'Nakit', p: 20 }, { m: 'Havale', p: 15 }, { m: 'Online', p: 10 }]; return (<div className="mt-2 space-y-1.5">{methods.map((m, i) => (<div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2"><span className="text-slate-600 dark:text-slate-400">{m.m}</span><span className="font-bold">%{m.p} ({Math.round(total * m.p / 100)})</span></div>))}</div>) }
    const renderFinTaxSummary = (data: Reservation[]) => { const rev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0); return (<div className="mt-2 grid grid-cols-2 gap-3"><div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">KDV</div><div className="text-lg font-bold text-slate-900 dark:text-white">{fmtMoney(rev * 0.08)}</div></div><div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-center"><div className="text-[10px] text-slate-500">Konaklama V.</div><div className="text-lg font-bold text-slate-900 dark:text-white">{fmtMoney(rev * 0.02)}</div></div></div>) }
    // Financial Graphs
    const renderFinBudgetGauge = (_d: Reservation[]) => (<div className="mt-2 text-center"><div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white"><div className="text-xs opacity-80">Bütçe Gerçekleşme</div><div className="text-3xl font-bold mt-1">%88</div><div className="text-xs opacity-70">hedefin</div></div></div>)
    const renderFinCostBreakdown = (data: Reservation[]) => { const rev = data.reduce((s, r) => s + dp(r.totalPrice, r.currency), 0); const cats = [{ l: 'Personel', p: 40, c: 'bg-blue-500' }, { l: 'Enerji', p: 15, c: 'bg-yellow-500' }, { l: 'Gıda', p: 20, c: 'bg-orange-500' }, { l: 'Bakım', p: 10, c: 'bg-red-500' }, { l: 'Diğer', p: 15, c: 'bg-slate-400' }]; return (<div className="mt-2"><div className="text-xs text-slate-500 mb-2">Toplam: {fmtMoney(rev * 0.55)}</div><div className="flex h-5 rounded-full overflow-hidden">{cats.map((c, i) => (<div key={i} className={c.c} style={{ width: `${c.p}%` }} />))}</div><div className="flex flex-wrap gap-2 mt-2">{cats.map((c, i) => (<div key={i} className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${c.c}`} /><span className="text-[8px] text-slate-500">{c.l}</span></div>))}</div></div>) }
    const renderFinRatioRadar = (_d: Reservation[]) => (<div className="mt-2 grid grid-cols-2 gap-2">{[{ m: 'GOP Marjı', v: '%45' }, { m: 'Net Marj', v: '%22' }, { m: 'RevPAR İndeksi', v: '1.12' }, { m: 'CPOR', v: '€85' }].map((r, i) => (<div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center"><div className="text-sm font-bold text-slate-900 dark:text-white">{r.v}</div><div className="text-[9px] text-slate-400">{r.m}</div></div>))}</div>)

    // ─── Widget Container ───
    const renderWidget = (w: WidgetConfig) => {
        const def = ALL_WIDGETS.find(x => x.id === w.id)
        if (!def) return null
        if (activeTab !== 'all' && def.group !== activeTab) return null

        const title = w.customTitle || (t[def.titleKey as keyof AdminTranslations] || TITLE_FALLBACKS[def.titleKey] || def.titleKey)
        const sizeClass = SIZE_CLASSES[w.size || def.defaultSize]

        // Apply per-widget channel filter
        const widgetData = w.filters?.channel ? filtered.filter(r => r.channel === w.filters!.channel) : filtered

        const renderers: Record<string, (d: Reservation[]) => React.ReactNode> = {
            kpis: renderKPIs, monthly: renderMonthlyChart, channels: renderChannelChart,
            agencies: renderAgencies, roomTypes: renderRoomTypes, occupancy: renderOccupancy,
            adr: renderADR, nationality: renderNationality, velocity: renderVelocity,
            lengthOfStay: renderLengthOfStay, revpar: renderRevPAR, budget: renderBudget,
            callCenter: renderCallCenter, forecast: renderForecast, operator: renderOperator,
            // Revenue Charts (15)
            'rev-daily-chart': renderRevDailyChart, 'rev-weekly-chart': renderRevWeeklyChart,
            'rev-yoy-chart': renderRevYoyChart, 'rev-roomtype-chart': renderRevRoomtypeChart,
            'rev-channel-chart': renderRevChannelChart, 'rev-nationality-chart': renderRevNationalityChart,
            'rev-segment-chart': renderRevSegmentChart, 'rev-mealplan-chart': renderRevMealplanChart,
            'rev-pace-chart': renderRevPaceChart, 'rev-forecast-chart': renderRevForecastChart,
            'rev-cumulative-chart': renderRevCumulativeChart, 'rev-hourly-chart': renderRevHourlyChart,
            'rev-tax-chart': renderRevTaxChart, 'rev-commission-chart': renderRevCommissionChart,
            'rev-refund-chart': renderRevRefundChart,
            // Revenue Data (15)
            'rev-daily-kpi': renderRevDailyKpi, 'rev-weekly-kpi': renderRevWeeklyKpi,
            'rev-monthly-kpi': renderRevMonthlyKpi, 'rev-quarterly-kpi': renderRevQuarterlyKpi,
            'rev-upsell': renderRevUpsell, 'rev-ancillary': renderRevAncillary,
            'rev-late-checkout': renderRevLateCheckout, 'rev-early-checkin': renderRevEarlyCheckin,
            'rev-minibar': renderRevMinibar, 'rev-spa': renderRevSpa,
            'rev-laundry': renderRevLaundry, 'rev-parking': renderRevParking,
            'rev-transfer': renderRevTransfer, 'rev-meeting-room': renderRevMeetingRoom,
            'rev-deposit': renderRevDeposit,
            // Revenue Graphs (8)
            'rev-heatmap': renderRevHeatmap, 'rev-treemap': renderRevTreemap,
            'rev-waterfall': renderRevWaterfall, 'rev-scatter': renderRevScatter,
            'rev-gauge': renderRevGauge, 'rev-sparklines': renderRevSparklines,
            'rev-funnel': renderRevFunnel, 'rev-comparison-radar': renderRevComparisonRadar,
            // Occupancy Charts (12)
            'occ-daily-chart': renderOccDailyChart, 'occ-monthly-chart': renderOccMonthlyChart,
            'occ-weekday-chart': renderOccWeekdayChart, 'occ-roomtype-chart': renderOccRoomtypeChart,
            'occ-floor-chart': renderOccFloorChart, 'occ-forecast-chart': renderOccForecastChart,
            'occ-yoy-chart': renderOccYoyChart, 'occ-ooo-chart': renderOccOooChart,
            'occ-upgrade-chart': renderOccUpgradeChart, 'occ-status-chart': renderOccStatusChart,
            'occ-category-mix': renderOccCategoryMix, 'occ-rate-analysis': renderOccRateAnalysis,
            // Occupancy Data (12)
            'occ-today-status': renderOccTodayStatus, 'occ-arrivals-today': renderOccArrivalsToday,
            'occ-departures-today': renderOccDeparturesToday, 'occ-stayovers': renderOccStayovers,
            'occ-no-shows': renderOccNoShows, 'occ-walkins': renderOccWalkins,
            'occ-vip-rooms': renderOccVipRooms, 'occ-connecting': renderOccConnecting,
            'occ-housekeeping': renderOccHousekeeping, 'occ-maintenance': renderOccMaintenance,
            'occ-inhouse-list': renderOccInhouseList, 'occ-early-late': renderOccEarlyLate,
            // Occupancy Graphs (5)
            'occ-heatmap': renderOccHeatmap, 'occ-floor-map': renderOccFloorMap,
            'occ-bubble': renderOccBubble, 'occ-gauge': renderOccGauge,
            'occ-timeline': renderOccTimeline,
            // Reservation Charts (12)
            'res-pace-chart': renderResPaceChart, 'res-leadtime-chart': renderResLeadtimeChart,
            'res-cancel-chart': renderResCancelChart, 'res-noshow-chart': renderResNoshowChart,
            'res-channel-trend': renderResChannelTrend, 'res-daily-pickup': renderResDailyPickup,
            'res-rate-code': renderResRateCode, 'res-promo-chart': renderResPromoChart,
            'res-group-chart': renderResGroupChart, 'res-overbooking': renderResOverbooking,
            'res-modification': renderResModification, 'res-board-mix': renderResBoardMix,
            // Reservation Data (12)
            'res-today-arrivals': renderResTodayArrivals, 'res-today-departures': renderResTodayDepartures,
            'res-pending': renderResPending, 'res-confirmed': renderResConfirmed,
            'res-cancelled-list': renderResCancelledList, 'res-waitlist': renderResWaitlist,
            'res-allotment': renderResAllotment, 'res-agency-prod': renderResAgencyProd,
            'res-source-mix': renderResSourceMix, 'res-avg-rate': renderResAvgRate,
            'res-revenue-by-stay': renderResRevenueByStay, 'res-night-audit': renderResNightAudit,
            // Reservation Graphs (6)
            'res-pace-waterfall': renderResPaceWaterfall, 'res-channel-sankey': renderResChannelSankey,
            'res-heatmap': renderResHeatmap, 'res-funnel': renderResFunnel,
            'res-calendar': renderResCalendar, 'res-comparison-bar': renderResComparisonBar,
            // Operations Charts (10)
            'ops-checkin-volume': renderOpsCheckinVolume, 'ops-checkout-volume': renderOpsCheckoutVolume,
            'ops-housekeeping-chart': renderOpsHousekeepingChart, 'ops-maintenance-chart': renderOpsMaintenanceChart,
            'ops-request-chart': renderOpsRequestChart, 'ops-response-time': renderOpsResponseTime,
            'ops-energy-chart': renderOpsEnergyChart, 'ops-water-chart': renderOpsWaterChart,
            'ops-complaint-trend': renderOpsComplaintTrend, 'ops-task-completion': renderOpsTaskCompletion,
            // Operations Data (12)
            'ops-mod-report': renderOpsModReport, 'ops-night-audit-data': renderOpsNightAuditData,
            'ops-lost-found': renderOpsLostFound, 'ops-security-log': renderOpsSecurityLog,
            'ops-incident': renderOpsIncident, 'ops-pool-status': renderOpsPoolStatus,
            'ops-parking': renderOpsParking, 'ops-laundry-stats': renderOpsLaundryStats,
            'ops-minibar-track': renderOpsMinibarTrack, 'ops-shuttle-schedule': renderOpsShuttleSchedule,
            'ops-amenity-usage': renderOpsAmenityUsage, 'ops-key-card': renderOpsKeyCard,
            // Operations Graphs (5)
            'ops-floor-heatmap': renderOpsFloorHeatmap, 'ops-timeline': renderOpsTimeline,
            'ops-response-gauge': renderOpsResponseGauge, 'ops-energy-gauge': renderOpsEnergyGauge,
            'ops-task-kanban': renderOpsTaskKanban,
            // F&B Charts (10)
            'fnb-restaurant-rev': renderFnbRestaurantRev, 'fnb-bar-rev': renderFnbBarRev,
            'fnb-roomservice-chart': renderFnbRoomserviceChart, 'fnb-breakfast-count': renderFnbBreakfastCount,
            'fnb-allinc-consumption': renderFnbAllincConsumption, 'fnb-menu-popularity': renderFnbMenuPopularity,
            'fnb-food-cost': renderFnbFoodCost, 'fnb-beverage-cost': renderFnbBeverageCost,
            'fnb-cover-count': renderFnbCoverCount, 'fnb-avg-check': renderFnbAvgCheck,
            // F&B Data (10)
            'fnb-daily-summary': renderFnbDailySummary, 'fnb-waste-report': renderFnbWasteReport,
            'fnb-stock-alert': renderFnbStockAlert, 'fnb-recipe-cost': renderFnbRecipeCost,
            'fnb-supplier-perf': renderFnbSupplierPerf, 'fnb-special-diet': renderFnbSpecialDiet,
            'fnb-banquet-rev': renderFnbBanquetRev, 'fnb-outlet-compare': renderFnbOutletCompare,
            'fnb-happy-hour': renderFnbHappyHour, 'fnb-inventory': renderFnbInventory,
            // F&B Graphs (5)
            'fnb-treemap': renderFnbTreemap, 'fnb-cost-gauge': renderFnbCostGauge,
            'fnb-popularity-bubble': renderFnbPopularityBubble, 'fnb-outlet-radar': renderFnbOutletRadar,
            'fnb-flow-sankey': renderFnbFlowSankey,
            // Marketing Charts (10)
            'mkt-direct-vs-ota': renderMktDirectVsOta, 'mkt-website-conversion': renderMktWebsiteConversion,
            'mkt-email-campaign': renderMktEmailCampaign, 'mkt-social-engagement': renderMktSocialEngagement,
            'mkt-seo-ranking': renderMktSeoRanking, 'mkt-ppc-roi': renderMktPpcRoi,
            'mkt-review-scores': renderMktReviewScores, 'mkt-competitor-rate': renderMktCompetitorRate,
            'mkt-market-share': renderMktMarketShare, 'mkt-brand-awareness': renderMktBrandAwareness,
            // Marketing Data (10)
            'mkt-campaign-summary': renderMktCampaignSummary, 'mkt-promo-redemption': renderMktPromoRedemption,
            'mkt-referral': renderMktReferral, 'mkt-review-list': renderMktReviewList,
            'mkt-meta-perf': renderMktMetaPerf, 'mkt-ota-ranking': renderMktOtaRanking,
            'mkt-loyalty-stats': renderMktLoyaltyStats, 'mkt-newsletter': renderMktNewsletter,
            'mkt-influencer': renderMktInfluencer, 'mkt-content-perf': renderMktContentPerf,
            // Marketing Graphs (5)
            'mkt-channel-funnel': renderMktChannelFunnel, 'mkt-attribution': renderMktAttribution,
            'mkt-competitor-radar': renderMktCompetitorRadar, 'mkt-roi-scatter': renderMktRoiScatter,
            'mkt-journey-flow': renderMktJourneyFlow,
            // Staff Charts (8)
            'staff-schedule-chart': renderStaffScheduleChart, 'staff-overtime-chart': renderStaffOvertimeChart,
            'staff-labor-cost': renderStaffLaborCost, 'staff-productivity': renderStaffProductivity,
            'staff-turnover': renderStaffTurnover, 'staff-training': renderStaffTraining,
            'staff-attendance': renderStaffAttendance, 'staff-department': renderStaffDepartment,
            // Staff Data (8)
            'staff-roster': renderStaffRoster, 'staff-leave': renderStaffLeave,
            'staff-performance': renderStaffPerformance, 'staff-certification': renderStaffCertification,
            'staff-onboarding': renderStaffOnboarding, 'staff-payroll-summary': renderStaffPayrollSummary,
            'staff-tip-report': renderStaffTipReport, 'staff-uniform': renderStaffUniform,
            // Staff Graphs (4)
            'staff-org-chart': renderStaffOrgChart, 'staff-workload-heatmap': renderStaffWorkloadHeatmap,
            'staff-satisfaction-gauge': renderStaffSatisfactionGauge, 'staff-cost-pie': renderStaffCostPie,
            // Yield Charts (8)
            'yield-rate-strategy': renderYieldRateStrategy, 'yield-demand-forecast': renderYieldDemandForecast,
            'yield-compset': renderYieldCompset, 'yield-pickup': renderYieldPickup,
            'yield-displacement': renderYieldDisplacement, 'yield-los-pattern': renderYieldLosPattern,
            'yield-dow-analysis': renderYieldDowAnalysis, 'yield-seasonal': renderYieldSeasonal,
            // Yield Data (7)
            'yield-rate-shop': renderYieldRateShop, 'yield-restrictions': renderYieldRestrictions,
            'yield-overrides': renderYieldOverrides, 'yield-segment-mix': renderYieldSegmentMix,
            'yield-channel-margin': renderYieldChannelMargin, 'yield-dynamic-pricing': renderYieldDynamicPricing,
            'yield-benchmark': renderYieldBenchmark,
            // Yield Graphs (4)
            'yield-price-elasticity': renderYieldPriceElasticity, 'yield-demand-heatmap': renderYieldDemandHeatmap,
            'yield-optimal-rate': renderYieldOptimalRate, 'yield-revenue-gauge': renderYieldRevenueGauge,
            // Financial Charts (5)
            'fin-pnl-chart': renderFinPnlChart, 'fin-cashflow-chart': renderFinCashflowChart,
            'fin-ar-aging': renderFinArAging, 'fin-ap-aging': renderFinApAging,
            'fin-expense-chart': renderFinExpenseChart,
            // Financial Data (2)
            'fin-payment-method': renderFinPaymentMethod, 'fin-tax-summary': renderFinTaxSummary,
            // Financial Graphs (3)
            'fin-budget-gauge': renderFinBudgetGauge, 'fin-cost-breakdown': renderFinCostBreakdown,
            'fin-ratio-radar': renderFinRatioRadar,
        }
        const renderer = renderers[w.id]

        return (
            <div
                key={w.id}
                draggable
                onDragStart={() => handleDragStart(w.id)}
                onDragOver={(e) => handleDragOver(e, w.id)}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 ${sizeClass}`}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 cursor-move opacity-50 hover:opacity-100">
                        <GripVertical size={16} className="text-slate-500" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{title}</h3>
                        {w.filters?.channel && <span className="text-xs bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded">{w.filters.channel}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setInfoWidgetId(infoWidgetId === w.id ? null : w.id)} className={`p-1.5 rounded-lg transition-colors ${infoWidgetId === w.id ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50' : 'text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Açıklama">
                            <Info size={14} />
                        </button>
                        <button onClick={() => cycleSize(w.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Resize">
                            <Maximize2 size={14} />
                        </button>
                        <button onClick={() => setEditingWidget(w)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Settings">
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={() => interpretWidget(w.id, widgetData.slice(0, 50))}
                            disabled={aiLoading[w.id]}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${aiResults[w.id] ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm hover:shadow-md hover:from-purple-600 hover:to-indigo-600'}`}
                        >
                            {aiLoading[w.id] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            {aiResults[w.id] ? '✓ Yorumlandı' : 'AI Yorumla'}
                        </button>
                        <button onClick={() => toggleWidget(w.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {infoWidgetId === w.id && WIDGET_DESCRIPTIONS[w.id] && (
                    <div className="mb-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl text-sm animate-fade-in">
                        <div className="space-y-2">
                            <div className="flex items-start gap-2"><span className="font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap">📊 Veri Kaynağı:</span><span className="text-blue-600 dark:text-blue-400">{WIDGET_DESCRIPTIONS[w.id].source}</span></div>
                            <div className="flex items-start gap-2"><span className="font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap">🎯 Amaç:</span><span className="text-blue-600 dark:text-blue-400">{WIDGET_DESCRIPTIONS[w.id].purpose}</span></div>
                            <div className="flex items-start gap-2"><span className="font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap">💡 Yorumlama:</span><span className="text-blue-600 dark:text-blue-400">{WIDGET_DESCRIPTIONS[w.id].interpret}</span></div>
                        </div>
                    </div>
                )}

                <div className="animate-fade-in">
                    {renderer ? renderer(widgetData) : (
                        <div className="h-40 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            {title} — çok yakında
                        </div>
                    )}
                </div>

                {aiResults[w.id] && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl text-sm text-purple-800 dark:text-purple-200 relative group">
                        <button onClick={() => setAiResults(prev => ({ ...prev, [w.id]: '' }))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-purple-400 hover:text-purple-600"><X size={12} /></button>
                        <div className="flex gap-2"><Sparkles size={16} className="shrink-0 mt-0.5 text-purple-500 dark:text-purple-400" /><p>{aiResults[w.id]}</p></div>
                    </div>
                )}
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-400 bg-red-900/20 rounded-2xl border border-red-800/50">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="font-bold">Veri Yüklenemedi</h3>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div ref={reportRef} className="space-y-6">
            {/* Header Controls */}
            <div className="bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-700 flex flex-col gap-4">
                {/* Tabs */}
                <div className="flex bg-slate-900 p-1 rounded-xl overflow-x-auto">
                    {['all', 'management', 'operation', 'finance', 'marketing'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-slate-700 text-cyan-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab === 'all' ? 'Tümü' : (t[tab as keyof AdminTranslations] || tab)}
                        </button>
                    ))}
                </div>

                {/* Date Presets + Picker + Currency */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Date Presets */}
                    <div className="flex gap-1 flex-wrap">
                        {DATE_PRESETS.map(p => (
                            <button
                                key={p.key}
                                onClick={() => applyPreset(p.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activePreset === p.key
                                    ? 'bg-cyan-600 text-white shadow-sm'
                                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                            >{p.label}</button>
                        ))}
                        {/* Date Basis Toggle */}
                        <div className="flex bg-slate-900 rounded-lg border border-slate-700 overflow-hidden ml-2">
                            <button
                                onClick={() => setDateBasis('sale')}
                                className={`px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 ${dateBasis === 'sale' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <CalendarCheck size={12} />Rez. Tarihi
                            </button>
                            <button
                                onClick={() => setDateBasis('stay')}
                                className={`px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 ${dateBasis === 'stay' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <BedDouble size={12} />Konaklama
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Date Picker */}
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
                            <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setActivePreset('') }} className="bg-transparent text-sm font-medium px-2 py-1 outline-none text-white" />
                            <span className="text-slate-600">—</span>
                            <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setActivePreset('') }} className="bg-transparent text-sm font-medium px-2 py-1 outline-none text-white" />
                        </div>

                        {/* Gross/Net Toggle */}
                        <PriceModeToggle mode={priceMode} onChange={setPriceMode} />

                        {/* Currency Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/50 px-4 py-2.5 rounded-xl font-bold transition-colors border border-cyan-800/50">
                                <span className="w-5 h-5 rounded-full bg-cyan-800/50 flex items-center justify-center text-xs">{CURRENCY_SYMBOLS[currency]}</span>
                                {currency}
                            </button>
                            <div className="absolute top-full right-0 mt-2 bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-2 hidden group-hover:block z-20 min-w-[120px]">
                                {(['TRY', 'EUR'] as CurrencyCode[]).map(c => (
                                    <button key={c} onClick={() => setCurrency(c)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-700 ${currency === c ? 'text-cyan-400 bg-cyan-900/30' : 'text-slate-300'}`}>
                                        <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs">{CURRENCY_SYMBOLS[c]}</span>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handlePdfExport} disabled={pdfExporting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50" title="PDF Export">
                            <FileDown size={16} className={pdfExporting ? 'animate-pulse' : ''} />
                            {pdfExporting ? 'PDF...' : 'PDF'}
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-3 py-2.5 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 rounded-xl font-bold transition-all border border-emerald-800/50 disabled:opacity-50 text-sm"
                            title="Verileri yenile"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                            Yenile
                        </button>
                        {lastUpdated && (
                            <span className="text-xs text-slate-500 whitespace-nowrap" suppressHydrationWarning title={new Date(lastUpdated).toLocaleString('tr-TR')}>
                                Son: {new Date(lastUpdated).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Widget Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {widgetConfigs.filter(w => w.visible).map(renderWidget)}

                {/* Add Widget Button */}
                <button
                    onClick={() => setShowAddWidget(true)}
                    className={`h-40 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500 hover:text-cyan-400 hover:bg-cyan-900/10 transition-all gap-2 ${activeTab !== 'all' ? 'hidden' : ''}`}
                >
                    <Plus size={32} /><span className="font-bold">Widget Ekle</span>
                </button>
            </div>

            {/* Add Widget Modal — 250 Widget Catalog */}
            {showAddWidget && (() => {
                const filteredWidgets = widgetConfigs.filter(wc => {
                    const def = ALL_WIDGETS.find(x => x.id === wc.id)
                    if (!def) return false
                    if (widgetCatFilter !== 'all' && def.category !== widgetCatFilter) return false
                    if (widgetTypeFilter !== 'all' && def.type !== widgetTypeFilter) return false
                    if (widgetSearch) {
                        const search = widgetSearch.toLowerCase()
                        const title = (def.title || TITLE_FALLBACKS[def.titleKey] || '').toLowerCase()
                        return title.includes(search) || def.id.includes(search) || def.category.includes(search)
                    }
                    return true
                })
                const activeCount = widgetConfigs.filter(w => w.visible).length
                const totalCount = ALL_WIDGETS.length
                return (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-700">
                            {/* Header */}
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Widget Kataloğu</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{activeCount} aktif / {totalCount} widget</p>
                                    </div>
                                    <button onClick={() => { setShowAddWidget(false); setWidgetSearch(''); setWidgetCatFilter('all'); setWidgetTypeFilter('all') }} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
                                </div>
                                {/* Search */}
                                <div className="relative mb-3">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text" value={widgetSearch} onChange={e => setWidgetSearch(e.target.value)}
                                        placeholder="Widget ara..."
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                {/* Category Filter */}
                                <div className="flex gap-1 flex-wrap mb-2">
                                    <button onClick={() => setWidgetCatFilter('all')} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${widgetCatFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Tümü</button>
                                    {(Object.keys(CATEGORY_LABELS) as WidgetCategory[]).map(cat => (
                                        <button key={cat} onClick={() => setWidgetCatFilter(cat)} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${widgetCatFilter === cat ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>{CATEGORY_LABELS[cat]}</button>
                                    ))}
                                </div>
                                {/* Type Filter */}
                                <div className="flex gap-1">
                                    {(['all', 'chart', 'data', 'graph'] as const).map(tp => (
                                        <button key={tp} onClick={() => setWidgetTypeFilter(tp)} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${widgetTypeFilter === tp ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                                            {tp === 'all' ? 'Tüm Tipler' : TYPE_LABELS[tp]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Widget List */}
                            <div className="p-4 space-y-1 max-h-[50vh] overflow-y-auto">
                                {filteredWidgets.length === 0 && (
                                    <div className="text-center py-8 text-slate-400">
                                        <Search size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Sonuç bulunamadı</p>
                                    </div>
                                )}
                                {filteredWidgets.map(wc => {
                                    const def = ALL_WIDGETS.find(x => x.id === wc.id)
                                    if (!def) return null
                                    const typeColors = { chart: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', data: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', graph: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' }
                                    return (
                                        <div key={wc.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${typeColors[def.type]}`}>
                                                    {def.type === 'chart' ? '📊' : def.type === 'data' ? '📋' : '📈'}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{def.title || TITLE_FALLBACKS[def.titleKey] || wc.id}</div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] text-slate-400 capitalize">{CATEGORY_LABELS[def.category]}</span>
                                                        <span className="text-[10px] text-slate-600">·</span>
                                                        <span className="text-[10px] text-slate-400">{def.defaultSize}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleWidget(wc.id)}
                                                className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${wc.visible ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${wc.visible ? 'translate-x-4' : ''}`} />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                            {/* Footer */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-xs text-slate-500">{filteredWidgets.length} widget gösteriliyor</span>
                                <button onClick={() => { setShowAddWidget(false); setWidgetSearch(''); setWidgetCatFilter('all'); setWidgetTypeFilter('all') }} className="px-6 bg-cyan-600 text-white py-2.5 rounded-xl font-bold hover:bg-cyan-500 transition-colors">Tamam</button>
                            </div>
                        </div>
                    </div>
                )
            })()}

            {/* Edit Widget Modal */}
            {editingWidget && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t.widgetSettings || 'Widget Ayarları'}</h3>
                            <button onClick={() => setEditingWidget(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Widget Başlığı</label>
                                <input type="text" value={editingWidget.customTitle || ''} placeholder="Varsayılan"
                                    onChange={e => setEditingWidget({ ...editingWidget, customTitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kanal Filtresi</label>
                                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    value={editingWidget.filters?.channel || ''}
                                    onChange={e => setEditingWidget({ ...editingWidget, filters: { ...editingWidget.filters, channel: e.target.value || undefined } })}>
                                    <option value="">Tüm Kanallar</option>
                                    {Object.keys(CHANNEL_COLORS).map(c => (<option key={c} value={c}>{c}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Boyut</label>
                                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    value={editingWidget.size || '1x1'}
                                    onChange={e => setEditingWidget({ ...editingWidget, size: e.target.value as WidgetSize })}>
                                    <option value="1x1">Küçük (1×1)</option>
                                    <option value="2x1">Orta (2×1)</option>
                                    <option value="3x1">Geniş (3×1)</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                            <button onClick={() => setEditingWidget(null)} className="px-4 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">{t.cancel || 'İptal'}</button>
                            <button onClick={() => {
                                const nc = widgetConfigs.map(w => w.id === editingWidget.id ? editingWidget : w)
                                setWidgetConfigs(nc); saveWidgetOrder(nc); setEditingWidget(null)
                            }} className="px-4 py-2 text-sm font-bold bg-cyan-600 text-white rounded-lg hover:bg-cyan-500">{t.save || 'Kaydet'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 1cm; size: landscape; }
                    body { -webkit-print-color-adjust: exact; }
                    .no-print, button, input, select { display: none !important; }
                    .grid { display: block !important; }
                    [class*="bg-slate"] { break-inside: avoid; margin-bottom: 1rem; border: 1px solid #ddd; box-shadow: none; background: white !important; color: black !important; }
                    .h-64, .h-40, .h-48, .h-52, .h-32 { height: auto !important; min-height: 200px; }
                }
                @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.4s ease-out; }
            `}</style>
        </div>
    )
}
