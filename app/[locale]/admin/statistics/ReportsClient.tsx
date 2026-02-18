'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { exportPdf } from '@/lib/export-pdf'
import { useParams } from 'next/navigation'
import { getMonthlyBudgetData, getSeasonTotal, getChannelBudgetSummary, getSeasonComparison } from '@/lib/services/budget-2026'
import { getAdminTranslations, type AdminLocale, type AdminTranslations } from '@/lib/admin-translations'
import { ALL_WIDGETS, TITLE_FALLBACKS, CATEGORY_LABELS, TYPE_LABELS, type WidgetSize, type WidgetCategory } from '@/lib/widgets/widget-catalog'
import {
    TrendingUp, DollarSign, Building2, Users, Download, BarChart3, PieChart,
    Calendar, Target, Activity, GripVertical, Sparkles, ChevronDown, ChevronUp,
    Settings2, X, Plus, Loader2, Edit2, LayoutGrid, Maximize2, Minimize2,
    BedDouble, Hotel, Flag, Clock, RefreshCw, Phone, UserCheck, LineChart, FileDown, CalendarCheck,
    Search, Filter
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
interface Props { reservations: Reservation[]; comparisonReservations?: Reservation[]; error: string | null; lastUpdated?: string | null; locale?: string }

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
    const [startDate, setStartDate] = useState(() => `${new Date().getFullYear()}-01-01`)
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
    const [activePreset, setActivePreset] = useState<string>('year')
    const [dateBasis, setDateBasis] = useState<'sale' | 'stay'>('sale')

    const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(DEFAULT_ORDER)
    const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
    const [aiResults, setAiResults] = useState<Record<string, string>>({})
    const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
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

        let targetStart = '', targetEnd = ''

        if (startDate) {
            const d = new Date(startDate)
            d.setFullYear(d.getFullYear() - 1)
            targetStart = d.toISOString().split('T')[0]
        }

        if (endDate) {
            const d = new Date(endDate)
            d.setFullYear(d.getFullYear() - 1)
            targetEnd = d.toISOString().split('T')[0]
        }

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
            const res = await fetch('/api/admin/ai-interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widgetTitle: title, data, locale })
            })
            const json = await res.json()
            const aiText = json.interpretation || json.text
            if (aiText) setAiResults(prev => ({ ...prev, [widgetId]: aiText }))
        } catch (err) { console.error(err) }
        finally { setAiLoading(prev => ({ ...prev, [widgetId]: false })) }
    }

    // ─── Widget Renderers ───

    const renderKPIs = (data: Reservation[]) => {
        const totalRev = data.reduce((sum, r) => sum + convert(r.totalPrice, r.currency), 0)
        const totalRes = data.length
        const totalNights = data.reduce((sum, r) => sum + r.nights * r.roomCount, 0)
        const adr = totalNights > 0 ? totalRev / totalNights : 0

        // Comparison Metrics
        const compRev = filteredComparison.reduce((sum, r) => sum + convert(r.totalPrice, r.currency), 0)
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
        data.forEach(r => { const m = r.saleDate.slice(0, 7); months[m] = (months[m] || 0) + convert(r.totalPrice, r.currency) })

        // Previous Year Data
        const compMonths: Record<string, number> = {}
        filteredComparison.forEach(r => { const m = r.saleDate.slice(0, 7); compMonths[m] = (compMonths[m] || 0) + convert(r.totalPrice, r.currency) })

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
        data.forEach(r => { channels[r.channel] = (channels[r.channel] || 0) + convert(r.totalPrice, r.currency) })
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
        data.forEach(r => { agencies[r.agency] = (agencies[r.agency] || 0) + convert(r.totalPrice, r.currency) })
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
            rooms[r.roomType].revenue += convert(r.totalPrice, r.currency)
        })
        const rData = Object.entries(rooms).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.revenue - a.revenue)
        const maxRev = Math.max(...rData.map(r => r.revenue), 1)
        return (
            <div className="space-y-3 mt-2">
                {rData.map((r, i) => (
                    <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2"><BedDouble size={14} className="text-cyan-600 dark:text-cyan-400" /> {r.name}</span>
                            <span className="text-slate-900 dark:text-white font-bold">{fmtMoney(r.revenue)} <span className="text-slate-500 text-xs">({r.count} oda)</span></span>
                        </div>
                        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(r.revenue / maxRev) * 100}%` }} />
                        </div>
                    </div>
                ))}
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
            monthly[m].revenue += convert(r.totalPrice, r.currency)
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
                daily[dateKey] = (daily[dateKey] || 0) + convert(r.totalPrice, r.currency)
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
        const totalRev = data.reduce((sum, r) => sum + convert(r.totalPrice, r.currency), 0)
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
                const tryAmount = convert(r.totalPrice, r.currency)
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
            agentStats[agent].revenue += convert(r.totalPrice, r.currency)
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
                daily[d] += convert(r.totalPrice, r.currency)
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
                        <button onClick={() => cycleSize(w.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Resize">
                            <Maximize2 size={14} />
                        </button>
                        <button onClick={() => setEditingWidget(w)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Settings">
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={() => interpretWidget(w.id, widgetData.slice(0, 50))}
                            disabled={aiLoading[w.id]}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${aiResults[w.id] ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/70'}`}
                        >
                            {aiLoading[w.id] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            {aiResults[w.id] ? '✓' : 'AI'}
                        </button>
                        <button onClick={() => toggleWidget(w.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                </div>

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
                            <span className="text-xs text-slate-500 whitespace-nowrap" title={new Date(lastUpdated).toLocaleString('tr-TR')}>
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
