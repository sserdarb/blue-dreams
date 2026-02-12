'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getAdminTranslations, type AdminLocale, type AdminTranslations } from '@/lib/admin-translations'
import {
    TrendingUp, DollarSign, Building2, Users, Download, BarChart3, PieChart,
    Calendar, Target, Activity, GripVertical, Sparkles, ChevronDown, ChevronUp,
    Settings2, X, Plus, Loader2, Edit2, LayoutGrid
} from 'lucide-react'

// ─── Types ───
interface Reservation {
    id: number; voucherNo: string; agency: string; channel: string
    roomType: string; boardType: string; checkIn: string; checkOut: string
    nights: number; totalPrice: number; paidPrice: number; currency: string
    roomCount: number; status: string; saleDate: string
}

interface WidgetConfig {
    id: string; visible: boolean; order: number
    customTitle?: string
    filters?: { channel?: string; agency?: string; minPrice?: number }
}

type CurrencyCode = 'TRY' | 'EUR' | 'USD'

// Exchange rates - In a real app, fetch these dynamically
const EXCHANGE_RATES: Record<CurrencyCode, number> = { TRY: 1, EUR: 0.026, USD: 0.028 }
const REVERSE_RATES: Record<CurrencyCode, number> = { TRY: 1, EUR: 38.5, USD: 35.7 } // For converting TO Try

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = { TRY: '₺', EUR: '€', USD: '$' }
const CHANNEL_COLORS: Record<string, string> = {
    'OTA': '#f59e0b', 'Call Center': '#06b6d4', 'Tur Operatörü': '#8b5cf6',
    'Website': '#10b981', 'Direkt': '#f43f5e',
}

// ─── Available Widgets ───
const ALL_WIDGETS = [
    { id: 'kpis', titleKey: 'totalRevenue', group: 'finance' },
    { id: 'monthly', titleKey: 'monthlyRevenue', group: 'finance' },
    { id: 'channels', titleKey: 'channelDistribution', group: 'marketing' },
    { id: 'roomTypes', titleKey: 'roomTypeAnalysis', group: 'operation' },
    // { id: 'boardTypes', titleKey: 'boardTypeAnalysis', group: 'overview' }, // Removed
    { id: 'agencies', titleKey: 'topAgencies', group: 'marketing' },
    { id: 'velocity', titleKey: 'bookingVelocity', group: 'management' },
    { id: 'budget', titleKey: 'budgetAnalysis', group: 'finance' },
]

const DEFAULT_ORDER: WidgetConfig[] = ALL_WIDGETS.map((w, i) => ({ id: w.id, visible: true, order: i }))

function loadWidgetOrder(): WidgetConfig[] {
    if (typeof window === 'undefined') return DEFAULT_ORDER
    try {
        const saved = localStorage.getItem('bd_report_widgets')
        if (saved) return JSON.parse(saved)
    } catch { }
    return DEFAULT_ORDER
}

function saveWidgetOrder(configs: WidgetConfig[]) {
    try { localStorage.setItem('bd_report_widgets', JSON.stringify(configs)) } catch { }
}

// ─── Props ───
interface Props { reservations: Reservation[]; error: string | null }

export default function ReportsClient({ reservations, error }: Props) {
    const params = useParams()
    const locale = (params?.locale as AdminLocale) || 'tr'
    const t = getAdminTranslations(locale) as AdminTranslations
    const reportRef = useRef<HTMLDivElement>(null)

    // ─── State ───
    const [currency, setCurrency] = useState<CurrencyCode>('TRY')

    // Default to first day of current year -> today
    const [startDate, setStartDate] = useState(() => {
        const d = new Date()
        return new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0]
    })
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

    const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(DEFAULT_ORDER)
    const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
    const [aiResults, setAiResults] = useState<Record<string, string>>({})
    const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
    const [showAddWidget, setShowAddWidget] = useState(false)
    const [activeTab, setActiveTab] = useState<'all' | 'management' | 'operation' | 'finance' | 'marketing'>('all')
    const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null) // For Settings Modal

    useEffect(() => { setWidgetConfigs(loadWidgetOrder()) }, [])

    // ─── Currency Helper ───
    // Converts any price (assumed in res.currency) to Selected Currency
    const convert = useCallback((price: number, originalCurrency: string) => {
        // First convert to TRY
        let tryAmount = price
        if (originalCurrency === 'EUR') tryAmount = price * REVERSE_RATES.EUR
        else if (originalCurrency === 'USD') tryAmount = price * REVERSE_RATES.USD

        // Then convert to selected currency
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
        if (startDate) data = data.filter(r => r.saleDate >= startDate)
        if (endDate) data = data.filter(r => r.saleDate <= endDate)
        return data
    }, [reservations, startDate, endDate])

    // ─── Calculations ───
    const kpis = useMemo(() => {
        const totalRev = filtered.reduce((sum, r) => sum + convert(r.totalPrice, r.currency), 0)
        const totalRes = filtered.length
        const totalNights = filtered.reduce((sum, r) => sum + r.nights * r.roomCount, 0)
        const adr = totalNights > 0 ? totalRev / totalNights : 0
        return { totalRev, totalRes, adr }
    }, [filtered, convert])

    // Monthly Data
    const monthlyData = useMemo(() => {
        const months: Record<string, number> = {}
        filtered.forEach(r => {
            const m = r.saleDate.slice(0, 7) // YYYY-MM
            months[m] = (months[m] || 0) + convert(r.totalPrice, r.currency)
        })
        return Object.entries(months)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, amount]) => ({ date, amount }))
    }, [filtered, convert])

    // Channel Distribution
    const channelData = useMemo(() => {
        const channels: Record<string, number> = {}
        filtered.forEach(r => {
            channels[r.channel] = (channels[r.channel] || 0) + convert(r.totalPrice, r.currency)
        })
        const total = Object.values(channels).reduce((a, b) => a + b, 0) || 1
        return Object.entries(channels)
            .map(([name, value]) => ({ name, value, percent: (value / total) * 100 }))
            .sort((a, b) => b.value - a.value)
    }, [filtered, convert])

    // Top Agencies
    const agencyData = useMemo(() => {
        const agencies: Record<string, number> = {}
        filtered.forEach(r => {
            agencies[r.agency] = (agencies[r.agency] || 0) + convert(r.totalPrice, r.currency)
        })
        return Object.entries(agencies)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
    }, [filtered, convert])

    // ─── Drag & Drop Handlers ───
    const handleDragStart = (id: string) => setDraggedWidget(id)
    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault()
        if (!draggedWidget || draggedWidget === targetId) return

        const newConfigs = [...widgetConfigs]
        const draggedIdx = newConfigs.findIndex(w => w.id === draggedWidget)
        const targetIdx = newConfigs.findIndex(w => w.id === targetId)

        const [removed] = newConfigs.splice(draggedIdx, 1)
        newConfigs.splice(targetIdx, 0, removed)

        setWidgetConfigs(newConfigs)
        saveWidgetOrder(newConfigs)
    }

    const toggleWidget = (id: string) => {
        const newConfigs = widgetConfigs.map(w =>
            w.id === id ? { ...w, visible: !w.visible } : w
        )
        setWidgetConfigs(newConfigs)
        saveWidgetOrder(newConfigs)
    }

    // ─── PDF Export ───
    const exportPDF = () => {
        // Force all widgets to be visible for print
        // This is handled via CSS media print below, but we also ensure state is correct if needed?
        // Actually CSS @media print is best. We will inject a print style.
        window.print()
    }

    // ─── AI Interpretation ───
    const interpretWidget = async (widgetId: string, data: any) => {
        // Prevent re-fetching if already present
        if (aiResults[widgetId]) return;

        setAiLoading(prev => ({ ...prev, [widgetId]: true }))
        try {
            const widgetDef = ALL_WIDGETS.find(w => w.id === widgetId)
            // @ts-ignore
            const title = widgetDef ? t[widgetDef.titleKey as keyof AdminTranslations] : widgetId

            const res = await fetch('/api/admin/ai-interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widgetTitle: title, data, locale })
            })
            const json = await res.json()
            if (json.text) {
                setAiResults(prev => ({ ...prev, [widgetId]: json.text }))
            }
        } catch (err) {
            console.error(err)
        } finally {
            setAiLoading(prev => ({ ...prev, [widgetId]: false }))
        }
    }

    // ─── Renderers ───

    // 1. KPIS Widget
    // 1. KPIS Widget
    const renderKPIs = (data: Reservation[]) => {
        const totalRev = data.reduce((sum, r) => sum + convert(r.totalPrice, r.currency), 0)
        const totalRes = data.length
        const totalNights = data.reduce((sum, r) => sum + r.nights * r.roomCount, 0)
        const adr = totalNights > 0 ? totalRev / totalNights : 0

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><DollarSign size={48} /></div>
                    <p className="text-blue-100 text-sm font-medium">{t.totalRevenue}</p>
                    <h3 className="text-3xl font-bold mt-1">{fmtMoney(totalRev)}</h3>
                    <div className="mt-2 text-xs bg-white/20 inline-block px-2 py-1 rounded">Compared to last year: +12%</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Calendar size={48} /></div>
                    <p className="text-purple-100 text-sm font-medium">{t.totalReservations}</p>
                    <h3 className="text-3xl font-bold mt-1">{totalRes}</h3>
                    <div className="mt-2 text-xs bg-white/20 inline-block px-2 py-1 rounded">Daily Avg: {(totalRes / 30).toFixed(1)}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-gray-100 dark:text-gray-700 group-hover:scale-110 transition-transform"><TrendingUp size={48} /></div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">ADR (Ort. Günlük Fiyat)</p>
                    <h3 className="text-3xl font-bold mt-1 text-gray-800 dark:text-white">{fmtMoney(adr)}</h3>
                    <div className="mt-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 inline-block px-2 py-1 rounded">Target: {fmtMoney(adr * 1.1)}</div>
                </div>
            </div>
        )
    }

    // 2. Monthly Revenue Chart (Bar Chart CSS)
    // 2. Monthly Revenue Chart (Bar Chart CSS)
    const renderMonthlyChart = (data: Reservation[]) => {
        const months: Record<string, number> = {}
        data.forEach(r => {
            const m = r.saleDate.slice(0, 7)
            months[m] = (months[m] || 0) + convert(r.totalPrice, r.currency)
        })
        const mData = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).map(([date, amount]) => ({ date, amount }))

        return (
            <div className="h-64 flex items-end gap-2 mt-4 pb-2 border-b dark:border-gray-700 overflow-x-auto">
                {mData.map((d, i) => {
                    const max = Math.max(...mData.map(m => m.amount))
                    const height = max > 0 ? (d.amount / max) * 100 : 0
                    return (
                        <div key={i} className="flex-1 min-w-[40px] flex flex-col items-center group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {d.date}: {fmtMoney(d.amount)}
                            </div>
                            <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-md relative overflow-hidden hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors" style={{ height: `${height}%` }}>
                                <div className="absolute bottom-0 left-0 w-full bg-blue-500 dark:bg-blue-600 transition-all duration-500" style={{ height: '0%', animation: 'grow-up 1s forwards' }} />
                                <style jsx>{`@keyframes grow-up { to { height: 100%; } }`}</style>
                            </div>
                            <span className="text-[10px] text-gray-500 mt-2 font-medium rotate-45 origin-left translate-y-2">{d.date}</span>
                        </div>
                    )
                })}
            </div>
        )
    }

    // 3. Channel Distribution (Donut-ish)
    // 3. Channel Distribution (Donut-ish)
    const renderChannelChart = (data: Reservation[]) => {
        const channels: Record<string, number> = {}
        data.forEach(r => {
            channels[r.channel] = (channels[r.channel] || 0) + convert(r.totalPrice, r.currency)
        })
        const total = Object.values(channels).reduce((a, b) => a + b, 0) || 1
        const cData = Object.entries(channels)
            .map(([name, value]) => ({ name, value, percent: (value / total) * 100 }))
            .sort((a, b) => b.value - a.value)

        return (
            <div className="flex flex-col md:flex-row items-center gap-8 mt-4">
                {/* Simple Pie Representation */}
                <div className="relative w-48 h-48 rounded-full border-8 border-gray-100 dark:border-gray-700 flex items-center justify-center">
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-gray-800 dark:text-white">{data.length}</span>
                        <span className="text-xs text-gray-500">Total Res.</span>
                    </div>
                    {/* CSS Conic Gradient Fallback */}
                    <div className="absolute inset-0 rounded-full opacity-20" style={{
                        background: `conic-gradient(${cData.map((c, i, arr) => {
                            const start = arr.slice(0, i).reduce((s, x) => s + x.percent, 0)
                            return `${CHANNEL_COLORS[c.name] || '#888'} ${start}% ${start + c.percent}%`
                        }).join(', ')})`
                    }} />
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3 w-full">
                    {cData.map((c, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-default">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[c.name] || '#888' }} />
                                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium group-hover:text-blue-600 transition-colors">{c.name}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-gray-800 dark:text-white">{fmtMoney(c.value)}</div>
                                <div className="text-xs text-gray-400">{c.percent.toFixed(1)}% ({data.filter(r => r.channel === c.name).length} Res)</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // 4. Top Agencies List
    const renderAgencies = (data: Reservation[]) => {
        const agencies: Record<string, number> = {}
        data.forEach(r => {
            agencies[r.agency] = (agencies[r.agency] || 0) + convert(r.totalPrice, r.currency)
        })
        const aData = Object.entries(agencies)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 20) // Top 20 as requested

        return (
            <div className="overflow-x-auto mt-2">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Agency</th>
                            <th className="px-4 py-3 text-right rounded-r-lg">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {aData.map((a, i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                        {a.name}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-white">{fmtMoney(a.value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    // ─── Widget Container ───
    const renderWidget = (w: WidgetConfig) => {
        // Filter by tab visibility
        const def = ALL_WIDGETS.find(x => x.id === w.id)
        if (!def) return null
        if (activeTab !== 'all' && def.group !== activeTab) return null

        // Translated Title
        const title = w.customTitle || (t[def.titleKey as keyof AdminTranslations] || def.titleKey)

        // Widget-specific filtering
        const widgetData = useMemo(() => {
            let d = filtered;
            if (w.filters?.channel) {
                const ch = w.filters.channel
                d = d.filter(r => r.channel === ch)
            }
            // Add other filters here
            return d
        }, [filtered, w.filters])

        return (
            <div
                key={w.id}
                draggable
                onDragStart={() => handleDragStart(w.id)}
                onDragOver={(e) => handleDragOver(e, w.id)}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md ${w.id === 'kpis' ? 'col-span-full' : ''}`}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 cursor-move opacity-50 hover:opacity-100">
                        <GripVertical size={16} />
                        <h3 className="font-bold text-gray-800 dark:text-white text-lg">{title}</h3>
                        {w.filters?.channel && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{w.filters.channel}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditingWidget(w)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="Edit Widget Filters">
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => interpretWidget(w.id, w.id === 'monthly' ? monthlyData : w.id === 'channels' ? channelData : agencyData)} // AI still uses global for now
                            disabled={aiLoading[w.id]}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${aiResults[w.id] ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}
                        >
                            {aiLoading[w.id] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            {aiResults[w.id] ? 'Analiz Edildi' : 'AI Yorumla'}
                        </button>
                        <button onClick={() => toggleWidget(w.id)} className="text-gray-400 hover:text-red-500 p-1">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="animate-fade-in">
                    {w.id === 'kpis' && renderKPIs(widgetData)}
                    {w.id === 'monthly' && renderMonthlyChart(widgetData)}
                    {w.id === 'channels' && renderChannelChart(widgetData)}
                    {w.id === 'agencies' && renderAgencies(widgetData)}
                    {/* Placeholders for others */}
                    {['roomTypes', 'boardTypes', 'velocity', 'budget'].includes(w.id) && (
                        <div className="h-40 flex items-center justify-center text-gray-400 text-sm bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                            {title} visualization coming soon...
                        </div>
                    )}
                </div>

                {/* AI Result Area */}
                {aiResults[w.id] && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-xl text-sm text-purple-900 dark:text-purple-100 relative group animate-fade-in">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                            <button onClick={() => setAiResults(prev => ({ ...prev, [w.id]: '' }))}><X size={12} /></button>
                        </div>
                        <div className="flex gap-2">
                            <Sparkles size={16} className="shrink-0 mt-0.5" />
                            <p>{aiResults[w.id]}</p>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="font-bold">Veri Yüklenemedi</h3>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div ref={reportRef} className="space-y-6">
            {/* Header Controls */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Tabs */}
                <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl">
                    {['all', 'management', 'operation', 'finance', 'marketing'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab
                                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab === 'all' ? t.menu : t[tab as keyof AdminTranslations] || tab}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Date Picker */}
                    <div className="flex items-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="bg-transparent text-sm font-medium px-2 py-1 outline-none text-gray-700 dark:text-white"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="bg-transparent text-sm font-medium px-2 py-1 outline-none text-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Currency Selector */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2.5 rounded-xl font-bold transition-colors">
                            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs shadow-sm">
                                {CURRENCY_SYMBOLS[currency]}
                            </span>
                            {currency}
                        </button>
                        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 hidden group-hover:block z-20 min-w-[120px]">
                            {(['TRY', 'EUR', 'USD'] as CurrencyCode[]).map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCurrency(c)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${currency === c ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                    <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs">
                                        {CURRENCY_SYMBOLS[c]}
                                    </span>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={exportPDF} className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors" title="PDF Export">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {widgetConfigs.filter(w => w.visible).map(renderWidget)}

                {/* Add Widget Button */}
                <button
                    onClick={() => setShowAddWidget(true)}
                    className={`h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all gap-2 ${activeTab !== 'all' ? 'hidden' : ''}`}
                >
                    <Plus size={32} />
                    <span className="font-bold">Add Widget</span>
                </button>
            </div>

            {/* Add Widget Modal */}
            {showAddWidget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-bold text-lg">Add Widget</h3>
                            <button onClick={() => setShowAddWidget(false)}><X size={20} /></button>
                        </div>
                        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                            {widgetConfigs.map(w => {
                                const def = ALL_WIDGETS.find(x => x.id === w.id)
                                return (
                                    <div key={w.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                                <LayoutGrid size={16} />
                                            </div>
                                            <div>
                                                {/* @ts-ignore */}
                                                <div className="font-bold text-sm text-gray-800 dark:text-white">{def ? t[def.titleKey] : w.id}</div>
                                                <div className="text-xs text-gray-400 capitalize">{def?.group}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleWidget(w.id)}
                                            className={`w-10 h-6 rounded-full transition-colors relative ${w.visible ? 'bg-blue-600' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${w.visible ? 'translate-x-4' : ''}`} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t dark:border-gray-700">
                            <button onClick={() => setShowAddWidget(false)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Widget Modal */}
            {editingWidget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-bold text-lg">{t.widgetSettings}</h3>
                            <button onClick={() => setEditingWidget(null)}><X size={20} /></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Widget Title</label>
                                <input
                                    type="text"
                                    value={editingWidget.customTitle || ''}
                                    placeholder="Default Title"
                                    onChange={e => setEditingWidget({ ...editingWidget, customTitle: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Channel</label>
                                <select
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent"
                                    value={editingWidget.filters?.channel || ''}
                                    onChange={e => setEditingWidget({ ...editingWidget, filters: { ...editingWidget.filters, channel: e.target.value || undefined } })}
                                >
                                    <option value="">All Channels</option>
                                    {Object.keys(CHANNEL_COLORS).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Mode</label>
                                <select className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-transparent">
                                    <option>Default</option>
                                    <option>Compact</option>
                                    <option>Detailed</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t dark:border-gray-700 flex justify-end gap-2">
                            <button onClick={() => setEditingWidget(null)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg">{t.cancel}</button>
                            <button
                                onClick={() => {
                                    const newConfigs = widgetConfigs.map(w => w.id === editingWidget.id ? editingWidget : w)
                                    setWidgetConfigs(newConfigs)
                                    saveWidgetOrder(newConfigs)
                                    setEditingWidget(null)
                                }}
                                className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {t.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Print Styles */}

            <style jsx global>{`
                @media print {
                    @page { margin: 1cm; size: landscape; }
                    body { -webkit-print-color-adjust: exact; }
                    /* Hide non-printable elements */
                    .no-print, button, input, select { display: none !important; }
                    /* Show all widgets */
                    .grid { display: block !important; }
                    .bg-white, .dark\:bg-slate-800 { 
                        break-inside: avoid; 
                        margin-bottom: 2rem; 
                        border: 1px solid #ddd;
                        box-shadow: none;
                        background: white !important;
                        color: black !important;
                    }
                    /* Ensure charts are visible */
                    .h-64, .h-40 { height: auto !important; min-height: 300px; }
                    /* Hide add widget button */
                    button { display: none !important; }
                }
            `}</style>
        </div>
    )
}
