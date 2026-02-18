'use client'

import { useState, useMemo } from 'react'
import {
    Package, TrendingUp, TrendingDown, AlertTriangle,
    Search, ChevronLeft, ChevronRight, FileText, BarChart3,
    Calendar, DollarSign, Warehouse, ArrowUpRight, ArrowDownRight,
    Clock, Filter, RefreshCw, Users, Eye, X
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts'
import type { StockItem, AccountingReceipt, ForecastDay, AccountingKPI } from '@/lib/services/accounting'

// ─── Types ─────────────────────────────────────────────────────

interface Props {
    data: {
        kpis: AccountingKPI
        stock: StockItem[]
        receipts: AccountingReceipt[]
        forecast: ForecastDay[]
        dataSource: 'live' | 'demo'
    } | null
    error: string | null
}

const TABS = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'receipts', label: 'Muhasebe Fişleri', icon: FileText },
    { id: 'stock', label: 'Stok Yönetimi', icon: Warehouse },
    { id: 'forecast', label: 'Forecast', icon: Calendar },
    { id: 'cari', label: 'Cari Hesaplar', icon: DollarSign },
]

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#ef4444', '#06b6d4']

function fmt(n: number): string {
    return n.toLocaleString('tr-TR')
}

// ─── Component ─────────────────────────────────────────────────

export default function AccountingClient({ data, error }: Props) {
    const [tab, setTab] = useState('overview')
    const [stockSearch, setStockSearch] = useState('')
    const [stockGroup, setStockGroup] = useState('')
    const [receiptSearch, setReceiptSearch] = useState('')
    const [receiptType, setReceiptType] = useState('')
    const [receiptPage, setReceiptPage] = useState(0)
    const PAGE_SIZE = 20

    if (error || !data) {
        return (
            <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-700 dark:text-red-400 font-medium">{error || 'Veri yüklenemedi'}</p>
                </div>
            </div>
        )
    }

    const { kpis, stock, receipts, forecast } = data

    // ─── Stock Filters ─────────────────────────────────────────
    const stockGroups = useMemo(() => [...new Set(stock.map(s => s.group))].filter(Boolean).sort(), [stock])
    const filteredStock = useMemo(() => {
        let items = stock
        if (stockSearch) items = items.filter(s => s.name.toLowerCase().includes(stockSearch.toLowerCase()) || s.code.includes(stockSearch))
        if (stockGroup) items = items.filter(s => s.group === stockGroup)
        return items
    }, [stock, stockSearch, stockGroup])

    // ─── Receipt Filters ───────────────────────────────────────
    const receiptTypes = useMemo(() => [...new Set(receipts.map(r => r.type))].filter(Boolean).sort(), [receipts])
    const filteredReceipts = useMemo(() => {
        let items = receipts
        if (receiptSearch) items = items.filter(r =>
            r.description.toLowerCase().includes(receiptSearch.toLowerCase()) ||
            r.receiptNo.toLowerCase().includes(receiptSearch.toLowerCase()) ||
            r.accountName.toLowerCase().includes(receiptSearch.toLowerCase())
        )
        if (receiptType) items = items.filter(r => r.type === receiptType)
        return items.sort((a, b) => b.date.localeCompare(a.date))
    }, [receipts, receiptSearch, receiptType])

    const receiptPages = Math.ceil(filteredReceipts.length / PAGE_SIZE)
    const pagedReceipts = filteredReceipts.slice(receiptPage * PAGE_SIZE, (receiptPage + 1) * PAGE_SIZE)

    // ─── Stock by Group (for chart) ────────────────────────────
    const stockByGroup = useMemo(() => {
        const map = new Map<string, { group: string; count: number; value: number }>()
        for (const s of stock) {
            const g = s.group || 'Diğer'
            const entry = map.get(g) || { group: g, count: 0, value: 0 }
            entry.count++
            entry.value += s.totalValue
            map.set(g, entry)
        }
        return Array.from(map.values()).sort((a, b) => b.value - a.value)
    }, [stock])

    // ─── Receipt by Type (for chart) ───────────────────────────
    const receiptByType = useMemo(() => {
        const map = new Map<string, { type: string; count: number; totalAmount: number }>()
        for (const r of receipts) {
            const t = r.type || 'Diğer'
            const entry = map.get(t) || { type: t, count: 0, totalAmount: 0 }
            entry.count++
            entry.totalAmount += r.debit + r.credit
            map.set(t, entry)
        }
        return Array.from(map.values()).sort((a, b) => b.count - a.count)
    }, [receipts])

    // ─── Monthly receipt summary ───────────────────────────────
    const monthlyReceipts = useMemo(() => {
        const map = new Map<string, { month: string; debit: number; credit: number }>()
        for (const r of receipts) {
            const m = r.date.slice(0, 7)
            const entry = map.get(m) || { month: m, debit: 0, credit: 0 }
            entry.debit += r.debit
            entry.credit += r.credit
            map.set(m, entry)
        }
        return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month))
    }, [receipts])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Muhasebe</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ElektraWeb ERP entegrasyonu ile muhasebe ve stok yönetimi</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${data.dataSource === 'live'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${data.dataSource === 'live' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                    {data.dataSource === 'live' ? 'Canlı Veri' : 'Demo Veri'}
                </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
                {TABS.map(t => {
                    const Icon = t.icon
                    return (
                        <button key={t.id} onClick={() => { setTab(t.id); setReceiptPage(0) }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}>
                            <Icon className="w-4 h-4" /> {t.label}
                        </button>
                    )
                })}
            </div>

            {/* ═══════ TAB 1: Overview ═══════ */}
            {tab === 'overview' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KPICard label="Toplam Stok Kalemi" value={fmt(kpis.totalStockItems)} icon={<Package className="w-5 h-5" />} color="blue" />
                        <KPICard label="Stok Değeri" value={`₺${fmt(kpis.totalStockValue)}`} icon={<Warehouse className="w-5 h-5" />} color="green" />
                        <KPICard label="Muhasebe Fişi" value={fmt(kpis.receiptCount)} icon={<FileText className="w-5 h-5" />} color="purple" />
                        <KPICard label="Forecast Doluluk" value={`%${kpis.forecastOccupancy}`} icon={<TrendingUp className="w-5 h-5" />} color="amber" />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Stock by Group Pie */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Stok Dağılımı (Değer)</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={stockByGroup} dataKey="value" nameKey="group" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                            {stockByGroup.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <RTooltip formatter={(v: any) => `₺${fmt(Number(v))}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Monthly Debit/Credit */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Aylık Borç / Alacak</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyReceipts}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}K`} />
                                        <RTooltip formatter={(v: any) => `₺${fmt(Number(v))}`} />
                                        <Legend />
                                        <Bar dataKey="debit" name="Borç" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="credit" name="Alacak" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Type Breakdown + Forecast Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Fiş Tipi Dağılımı</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={receiptByType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: any) => `${String(name).slice(0, 12)} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                            {receiptByType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <RTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">30 Günlük Doluluk Tahmini</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={forecast}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                                        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                                        <RTooltip formatter={(v: any) => `%${v}`} />
                                        <Area type="monotone" dataKey="occupancy" name="Doluluk %" stroke="#3b82f6" fill="#3b82f680" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ TAB 2: Receipts ═══════ */}
            {tab === 'receipts' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" value={receiptSearch} onChange={e => { setReceiptSearch(e.target.value); setReceiptPage(0) }}
                                placeholder="Fiş ara (açıklama, numara, hesap)..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                        </div>
                        <select value={receiptType} onChange={e => { setReceiptType(e.target.value); setReceiptPage(0) }}
                            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                            <option value="">Tüm Fiş Tipleri</option>
                            {receiptTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tarih</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fiş No</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tip</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hesap</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Açıklama</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Borç</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Alacak</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bakiye</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {pagedReceipts.map(r => (
                                        <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{r.date}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400">{r.receiptNo}</td>
                                            <td className="px-4 py-3"><span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{r.type}</span></td>
                                            <td className="px-4 py-3 text-sm"><span className="font-mono text-gray-500">{r.accountCode}</span> <span className="text-gray-700 dark:text-gray-300">{r.accountName}</span></td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{r.description}</td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-red-600 dark:text-red-400">{r.debit > 0 ? `₺${fmt(r.debit)}` : '-'}</td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-green-600 dark:text-green-400">{r.credit > 0 ? `₺${fmt(r.credit)}` : '-'}</td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">₺{fmt(r.balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{filteredReceipts.length} fiş, sayfa {receiptPage + 1}/{receiptPages || 1}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setReceiptPage(p => Math.max(0, p - 1))} disabled={receiptPage === 0} className="p-2 rounded-lg bg-white dark:bg-gray-800 border disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={() => setReceiptPage(p => Math.min(receiptPages - 1, p + 1))} disabled={receiptPage >= receiptPages - 1} className="p-2 rounded-lg bg-white dark:bg-gray-800 border disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ TAB 3: Stock ═══════ */}
            {tab === 'stock' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" value={stockSearch} onChange={e => setStockSearch(e.target.value)}
                                placeholder="Stok ara (isim veya kod)..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                        </div>
                        <select value={stockGroup} onChange={e => setStockGroup(e.target.value)}
                            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                            <option value="">Tüm Gruplar</option>
                            {stockGroups.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    {/* Stock Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Kalem</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{filteredStock.length}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Değer</p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">₺{fmt(filteredStock.reduce((s, i) => s + i.totalValue, 0))}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Grup Sayısı</p>
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stockGroups.length}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Ort. Birim Fiyat</p>
                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">₺{fmt(Math.round(filteredStock.reduce((s, i) => s + i.unitPrice, 0) / (filteredStock.length || 1)))}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kod</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stok Adı</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Grup</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Birim</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Miktar</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Birim Fiyat</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Toplam Değer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredStock.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400">{s.code}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{s.name}</td>
                                            <td className="px-4 py-3"><span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">{s.group}</span></td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{s.unit}</td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{fmt(s.quantity)}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">₺{fmt(s.unitPrice)}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-green-600 dark:text-green-400">₺{fmt(s.totalValue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <td colSpan={6} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">Toplam:</td>
                                        <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400">₺{fmt(filteredStock.reduce((s, i) => s + i.totalValue, 0))}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ TAB 4: Forecast ═══════ */}
            {tab === 'forecast' && (
                <div className="space-y-6">
                    {/* Forecast KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KPICard label="Ort. Doluluk" value={`%${kpis.forecastOccupancy}`} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
                        <KPICard label="Ort. Gelir/Gün" value={`₺${fmt(kpis.avgForecastRevenue)}`} icon={<DollarSign className="w-5 h-5" />} color="green" />
                        <KPICard label="Toplam Beklenen Gelir" value={`₺${fmt(forecast.reduce((s, f) => s + f.revenue, 0))}`} icon={<BarChart3 className="w-5 h-5" />} color="purple" />
                        <KPICard label="Maks. Doluluk" value={`%${Math.max(...forecast.map(f => f.occupancy))}`} icon={<ArrowUpRight className="w-5 h-5" />} color="amber" />
                    </div>

                    {/* Occupancy + Revenue Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">30 Günlük Forecast — Doluluk & Gelir</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={forecast}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={[0, 100]} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}K`} />
                                    <RTooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="occupancy" name="Doluluk %" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Gelir (₺)" stroke="#10b981" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Arrival/Departure Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Giriş / Çıkış Tahmini</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={forecast}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <RTooltip />
                                    <Legend />
                                    <Bar dataKey="expectedArrivals" name="Giriş" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expectedDepartures" name="Çıkış" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Forecast Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giriş</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Çıkış</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Konaklayan</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Misafir</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Doluluk</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Boş Oda</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gelir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {forecast.map(f => (
                                        <tr key={f.date} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white">{f.date}</td>
                                            <td className="px-4 py-2.5 text-sm text-right text-blue-600 dark:text-blue-400 font-medium">{f.expectedArrivals}</td>
                                            <td className="px-4 py-2.5 text-sm text-right text-amber-600 dark:text-amber-400 font-medium">{f.expectedDepartures}</td>
                                            <td className="px-4 py-2.5 text-sm text-right text-gray-700 dark:text-gray-300">{f.stayovers}</td>
                                            <td className="px-4 py-2.5 text-sm text-right text-gray-700 dark:text-gray-300">{f.totalGuests}</td>
                                            <td className="px-4 py-2.5 text-sm text-right">
                                                <span className={`font-semibold ${f.occupancy >= 80 ? 'text-green-600 dark:text-green-400' : f.occupancy >= 50 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>%{f.occupancy}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-sm text-right text-gray-500">{f.availableRooms}</td>
                                            <td className="px-4 py-2.5 text-sm text-right font-semibold text-green-600 dark:text-green-400">₺{fmt(f.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ TAB 5: Cari Hesaplar ═══════ */}
            {tab === 'cari' && <CariHesaplarTab />}
        </div>
    )
}

// ─── Cari Hesaplar Tab Component ────────────────────────────────

type CariHesapType = 'Tedarikçi' | 'Acenta' | 'Diğer'
interface CariHesap {
    id: string; code: string; name: string; type: CariHesapType
    debit: number; credit: number; balance: number; currency: string
    isOverdue: boolean; lastTransaction: string
    transactions: { date: string; description: string; debit: number; credit: number; balance: number }[]
}

function generateCariHesaplar(): CariHesap[] {
    const accounts: CariHesap[] = [
        { id: 'CH001', code: '120.01.001', name: 'Özgür Et Gıda A.Ş.', type: 'Tedarikçi', debit: 285000, credit: 262000, balance: -23000, currency: 'TRY', isOverdue: true, lastTransaction: '2026-02-15', transactions: [] },
        { id: 'CH002', code: '120.01.002', name: 'Banvit Tavukçuluk', type: 'Tedarikçi', debit: 210000, credit: 210000, balance: 0, currency: 'TRY', isOverdue: false, lastTransaction: '2026-02-14', transactions: [] },
        { id: 'CH003', code: '120.01.003', name: 'Sütaş Süt Ürünleri', type: 'Tedarikçi', debit: 165000, credit: 152000, balance: -13000, currency: 'TRY', isOverdue: false, lastTransaction: '2026-02-13', transactions: [] },
        { id: 'CH004', code: '120.01.004', name: 'Bodrum Hal Toptancılık', type: 'Tedarikçi', debit: 180000, credit: 175000, balance: -5000, currency: 'TRY', isOverdue: false, lastTransaction: '2026-02-14', transactions: [] },
        { id: 'CH005', code: '120.01.005', name: 'Coca-Cola İçecek', type: 'Tedarikçi', debit: 95000, credit: 88000, balance: -7000, currency: 'TRY', isOverdue: false, lastTransaction: '2026-02-10', transactions: [] },
        { id: 'CH006', code: '120.01.006', name: 'Efes Pilsen', type: 'Tedarikçi', debit: 125000, credit: 118000, balance: -7000, currency: 'TRY', isOverdue: true, lastTransaction: '2026-02-08', transactions: [] },
        { id: 'CH007', code: '120.01.007', name: 'Henkel Temizlik', type: 'Tedarikçi', debit: 75000, credit: 75000, balance: 0, currency: 'TRY', isOverdue: false, lastTransaction: '2026-02-09', transactions: [] },
        { id: 'CH008', code: '120.01.008', name: 'Bioderma Kozmetik', type: 'Tedarikçi', debit: 55000, credit: 48000, balance: -7000, currency: 'TRY', isOverdue: false, lastTransaction: '2026-02-13', transactions: [] },
        { id: 'CH009', code: '120.01.009', name: 'Özdilek Tekstil', type: 'Tedarikçi', debit: 185000, credit: 160000, balance: -25000, currency: 'TRY', isOverdue: true, lastTransaction: '2026-01-28', transactions: [] },
        { id: 'CH010', code: '120.01.010', name: 'Philips Aydınlatma', type: 'Tedarikçi', debit: 42000, credit: 42000, balance: 0, currency: 'TRY', isOverdue: false, lastTransaction: '2026-02-03', transactions: [] },
        { id: 'CH011', code: '120.02.001', name: 'TUI Group', type: 'Acenta', debit: 0, credit: 1250000, balance: 1250000, currency: 'EUR', isOverdue: false, lastTransaction: '2026-02-16', transactions: [] },
        { id: 'CH012', code: '120.02.002', name: 'Thomas Cook (Jet2)', type: 'Acenta', debit: 0, credit: 580000, balance: 580000, currency: 'EUR', isOverdue: false, lastTransaction: '2026-02-15', transactions: [] },
        { id: 'CH013', code: '120.02.003', name: 'Coral Travel', type: 'Acenta', debit: 0, credit: 420000, balance: 420000, currency: 'EUR', isOverdue: false, lastTransaction: '2026-02-12', transactions: [] },
        { id: 'CH014', code: '120.02.004', name: 'Pegas Touristik', type: 'Acenta', debit: 0, credit: 310000, balance: 310000, currency: 'EUR', isOverdue: false, lastTransaction: '2026-02-10', transactions: [] },
        { id: 'CH015', code: '120.02.005', name: 'ETS Tur', type: 'Acenta', debit: 0, credit: 680000, balance: 680000, currency: 'TRY', isOverdue: false, lastTransaction: '2026-02-14', transactions: [] },
        { id: 'CH016', code: '120.02.006', name: 'Jolly Tur', type: 'Acenta', debit: 0, credit: 520000, balance: 520000, currency: 'TRY', isOverdue: false, lastTransaction: '2026-02-11', transactions: [] },
        { id: 'CH017', code: '120.02.007', name: 'Booking.com BV', type: 'Acenta', debit: 0, credit: 890000, balance: 890000, currency: 'EUR', isOverdue: false, lastTransaction: '2026-02-16', transactions: [] },
        { id: 'CH018', code: '120.02.008', name: 'Expedia Group', type: 'Acenta', debit: 0, credit: 340000, balance: 340000, currency: 'EUR', isOverdue: false, lastTransaction: '2026-02-09', transactions: [] },
        { id: 'CH019', code: '120.03.001', name: 'Turkcell İletişim', type: 'Diğer', debit: 28000, credit: 28000, balance: 0, currency: 'TRY', isOverdue: false, lastTransaction: '2026-02-01', transactions: [] },
        { id: 'CH020', code: '120.03.002', name: 'AEDAŞ Elektrik', type: 'Diğer', debit: 145000, credit: 120000, balance: -25000, currency: 'TRY', isOverdue: true, lastTransaction: '2026-02-05', transactions: [] },
        { id: 'CH021', code: '120.03.003', name: 'MUSKİ Su İdaresi', type: 'Diğer', debit: 62000, credit: 55000, balance: -7000, currency: 'TRY', isOverdue: false, lastTransaction: '2026-02-07', transactions: [] },
        { id: 'CH022', code: '120.03.004', name: 'Aksigorta A.Ş.', type: 'Diğer', debit: 320000, credit: 320000, balance: 0, currency: 'TRY', isOverdue: false, lastTransaction: '2026-01-15', transactions: [] },
        { id: 'CH023', code: '120.03.005', name: 'SGK Bodrum', type: 'Diğer', debit: 890000, credit: 820000, balance: -70000, currency: 'TRY', isOverdue: true, lastTransaction: '2026-02-10', transactions: [] },
        { id: 'CH024', code: '120.03.006', name: 'Vergi Dairesi Bodrum', type: 'Diğer', debit: 450000, credit: 450000, balance: 0, currency: 'TRY', isOverdue: false, lastTransaction: '2026-01-25', transactions: [] },
        { id: 'CH025', code: '120.03.007', name: 'Daikin Klima Servis', type: 'Diğer', debit: 85000, credit: 78000, balance: -7000, currency: 'TRY', isOverdue: false, lastTransaction: '2026-02-06', transactions: [] },
    ]

    // Generate random transactions for each account
    accounts.forEach(acc => {
        const txns: CariHesap['transactions'] = []
        let runBal = 0
        const baseDate = new Date('2026-01-01')
        const descriptions = acc.type === 'Tedarikçi'
            ? ['Fatura', 'Ödeme', 'İade', 'Fatura', 'Ödeme']
            : acc.type === 'Acenta'
                ? ['Rezrvasyon #', 'Ödeme', 'Depozito', 'Komisyon', 'Havale']
                : ['Fatura', 'Ödeme', 'Tahakkuk', 'Ödeme', 'Fatura']

        for (let i = 0; i < 8; i++) {
            const d = new Date(baseDate)
            d.setDate(d.getDate() + i * 6 + Math.floor(Math.random() * 4))
            const isDebit = i % 3 !== 1
            const amount = Math.round((Math.random() * 30000 + 5000) * 100) / 100
            runBal += isDebit ? -amount : amount
            txns.push({
                date: d.toISOString().split('T')[0],
                description: descriptions[i % descriptions.length] + (i % 3 === 0 ? ` #${1000 + i}` : ''),
                debit: isDebit ? amount : 0,
                credit: isDebit ? 0 : amount,
                balance: Math.round(runBal * 100) / 100,
            })
        }
        acc.transactions = txns
    })

    return accounts
}

function CariHesaplarTab() {
    const accounts = useMemo(() => generateCariHesaplar(), [])
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<CariHesapType | 'all'>('all')
    const [selectedAccount, setSelectedAccount] = useState<CariHesap | null>(null)
    const [page, setPage] = useState(0)
    const PER_PAGE = 10

    const filtered = useMemo(() => {
        return accounts.filter(a => {
            const matchSearch = search === '' || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search)
            const matchType = typeFilter === 'all' || a.type === typeFilter
            return matchSearch && matchType
        })
    }, [accounts, search, typeFilter])

    const totalPages = Math.ceil(filtered.length / PER_PAGE)
    const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

    // KPIs
    const totalAccounts = accounts.length
    const totalDebitBal = accounts.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0)
    const totalCreditBal = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0)
    const overdueCount = accounts.filter(a => a.isOverdue).length

    const typeColors: Record<CariHesapType, string> = {
        'Tedarikçi': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'Acenta': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Diğer': 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
                <KPICard label="Toplam Hesap" value={String(totalAccounts)} icon={<Users className="w-5 h-5" />} color="blue" />
                <KPICard label="Borç Bakiye" value={`₺${fmt(totalDebitBal)}`} icon={<TrendingDown className="w-5 h-5" />} color="amber" />
                <KPICard label="Alacak Bakiye" value={`€${fmt(Math.round(totalCreditBal))}`} icon={<TrendingUp className="w-5 h-5" />} color="green" />
                <KPICard label="Vadesi Geçmiş" value={String(overdueCount)} icon={<AlertTriangle className="w-5 h-5" />} color="purple" />
            </div>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(0) }}
                            placeholder="Hesap adı veya kodu ara..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['all', 'Tedarikçi', 'Acenta', 'Diğer'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => { setTypeFilter(t); setPage(0) }}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${typeFilter === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                            >
                                {t === 'all' ? 'Tümü' : t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-4 py-2.5 text-left rounded-l-lg">Hesap Kodu</th>
                                <th className="px-4 py-2.5 text-left">Hesap Adı</th>
                                <th className="px-4 py-2.5 text-center">Tip</th>
                                <th className="px-4 py-2.5 text-right">Borç</th>
                                <th className="px-4 py-2.5 text-right">Alacak</th>
                                <th className="px-4 py-2.5 text-right">Bakiye</th>
                                <th className="px-4 py-2.5 text-center">Vade</th>
                                <th className="px-4 py-2.5 text-center rounded-r-lg">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {paged.map(acc => (
                                <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{acc.code}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{acc.name}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${typeColors[acc.type]}`}>{acc.type}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-medium">
                                        {acc.debit > 0 ? `₺${fmt(acc.debit)}` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-medium">
                                        {acc.credit > 0 ? `${acc.currency === 'EUR' ? '€' : '₺'}${fmt(acc.credit)}` : '-'}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-bold ${acc.balance < 0 ? 'text-red-600 dark:text-red-400' : acc.balance > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                        {acc.balance === 0 ? '0' : `${acc.balance < 0 ? '-' : ''}${acc.currency === 'EUR' ? '€' : '₺'}${fmt(Math.abs(acc.balance))}`}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {acc.isOverdue ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[11px] font-medium">
                                                <AlertTriangle className="w-3 h-3" /> Geçmiş
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">Normal</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => setSelectedAccount(acc)}
                                            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                                            title="Ekstre Görüntüle"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {paged.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">Sonuç bulunamadı</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500">{filtered.length} hesap bulundu</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="flex items-center px-3 text-sm text-gray-600 dark:text-gray-300">{page + 1}/{totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Ekstre Modal */}
            {selectedAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedAccount(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedAccount.name}</h3>
                                <p className="text-sm text-gray-500">{selectedAccount.code} · <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${typeColors[selectedAccount.type]}`}>{selectedAccount.type}</span></p>
                            </div>
                            <button onClick={() => setSelectedAccount(null)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        {/* Balance Summary */}
                        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Borç</p>
                                <p className="text-lg font-bold text-red-600 dark:text-red-400">₺{fmt(selectedAccount.debit)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Alacak</p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{selectedAccount.currency === 'EUR' ? '€' : '₺'}{fmt(selectedAccount.credit)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Bakiye</p>
                                <p className={`text-lg font-bold ${selectedAccount.balance < 0 ? 'text-red-600 dark:text-red-400' : selectedAccount.balance > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                    {selectedAccount.balance === 0 ? '0' : `${selectedAccount.balance < 0 ? '-' : ''}${selectedAccount.currency === 'EUR' ? '€' : '₺'}${fmt(Math.abs(selectedAccount.balance))}`}
                                </p>
                            </div>
                        </div>
                        {/* Transactions */}
                        <div className="overflow-y-auto max-h-[50vh] px-6 py-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Hesap Hareketleri</p>
                            <table className="w-full text-sm">
                                <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-3 py-2 text-left rounded-l-lg">Tarih</th>
                                        <th className="px-3 py-2 text-left">Açıklama</th>
                                        <th className="px-3 py-2 text-right">Borç</th>
                                        <th className="px-3 py-2 text-right">Alacak</th>
                                        <th className="px-3 py-2 text-right rounded-r-lg">Bakiye</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {selectedAccount.transactions.map((tx, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                            <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{tx.date}</td>
                                            <td className="px-3 py-2 text-gray-900 dark:text-white">{tx.description}</td>
                                            <td className="px-3 py-2 text-right text-red-600 dark:text-red-400">{tx.debit > 0 ? `₺${fmt(tx.debit)}` : ''}</td>
                                            <td className="px-3 py-2 text-right text-green-600 dark:text-green-400">{tx.credit > 0 ? `₺${fmt(tx.credit)}` : ''}</td>
                                            <td className={`px-3 py-2 text-right font-medium ${tx.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>₺{fmt(Math.round(tx.balance))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Source */}
            <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
                    <Clock className="w-3 h-3" /> Demo Veri — ERP entegrasyonu devam ediyor
                </span>
            </div>
        </div>
    )
}

// ─── KPI Card Component ────────────────────────────────────────

function KPICard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: 'blue' | 'green' | 'purple' | 'amber' }) {
    const colors = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    }
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    )
}
