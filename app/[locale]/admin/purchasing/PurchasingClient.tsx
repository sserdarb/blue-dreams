'use client'

import { useState, useMemo } from 'react'
import {
    Package, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
    ShoppingCart, Users, BarChart3, Search, ChevronLeft, ChevronRight,
    ArrowUpRight, ArrowDownRight, Minus, Filter, Truck, Star, DollarSign,
    Wifi, WifiOff
} from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, RadialBarChart, RadialBar, Legend, Cell, PieChart, Pie
} from 'recharts'
import type {
    PurchaseOrder, Vendor, InventoryNeed, PriceTrend, PurchasePerformance
} from '@/lib/services/purchasing'
import ModuleOffline from '@/components/admin/ModuleOffline'

interface Props {
    data: {
        kpis: {
            totalSpent: number
            activeOrders: number
            criticalItems: number
            avgPerformance: number
            totalOrders: number
            vendorCount: number
        }
        orders: PurchaseOrder[]
        vendors: Vendor[]
        inventory: InventoryNeed[]
        priceTrends: PriceTrend[]
        performance: PurchasePerformance
        dataSource?: 'live' | 'demo'
    } | null
    error: string | null
}

const NEED_COLORS = {
    critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', badge: 'bg-red-500', label: 'Kritik' },
    low: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', badge: 'bg-amber-500', label: 'Düşük' },
    ok: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-500', label: 'Yeterli' },
    excess: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', badge: 'bg-blue-500', label: 'Fazla' },
}

const STATUS_STYLES: Record<string, string> = {
    'Teslim Edildi': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Beklemede': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Kısmi Teslim': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'İptal': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b']

export default function PurchasingClient({ data, error }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'vendors' | 'prices'>('overview')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [deptFilter, setDeptFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [selectedPriceTrend, setSelectedPriceTrend] = useState(0)
    const [orderPage, setOrderPage] = useState(0)
    const PAGE_SIZE = 15

    if (error || !data) {
        return <ModuleOffline moduleName="Satın Alma & Lojistik" dataSource="purchasing_erp" offlineReason={error || 'Veri yüklenemedi'} />
    }

    const { kpis, orders, vendors, inventory, priceTrends, performance, dataSource = 'demo' } = data
    const isLive = dataSource === 'live'

    const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n)

    // ─── Filtered Orders ───
    const filteredOrders = useMemo(() => {
        let result = orders
        if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter)
        if (deptFilter !== 'all') result = result.filter(o => o.department === deptFilter)
        if (search) {
            const s = search.toLowerCase()
            result = result.filter(o =>
                o.vendor.toLowerCase().includes(s) ||
                o.id.toLowerCase().includes(s) ||
                o.items.some(i => i.name.toLowerCase().includes(s))
            )
        }
        return result
    }, [orders, statusFilter, deptFilter, search])

    const pagedOrders = filteredOrders.slice(orderPage * PAGE_SIZE, (orderPage + 1) * PAGE_SIZE)
    const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE)

    // ─── Filtered Inventory ───
    const filteredInventory = useMemo(() => {
        if (categoryFilter === 'all') return inventory
        return inventory.filter(n => n.item.category === categoryFilter)
    }, [inventory, categoryFilter])

    // Category spending breakdown
    const categorySpending = useMemo(() => {
        const map = new Map<string, number>()
        orders.forEach(o => {
            const dept = o.department
            map.set(dept, (map.get(dept) || 0) + o.totalAmount)
        })
        return Array.from(map.entries())
            .map(([name, value], i) => ({ name, value, fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
            .sort((a, b) => b.value - a.value)
    }, [orders])

    const departments = [...new Set(orders.map(o => o.department))]
    const categories = [...new Set(inventory.map(n => n.item.category))]

    const tabs = [
        { key: 'overview', label: 'Genel Bakış', icon: BarChart3 },
        { key: 'orders', label: 'Siparişler', icon: ShoppingCart },
        { key: 'inventory', label: 'Envanter', icon: Package },
        { key: 'vendors', label: 'Tedarikçiler', icon: Users },
        { key: 'prices', label: 'Fiyat Analizi', icon: TrendingUp },
    ] as const

    const scoreColor = (score: number) => {
        if (score >= 85) return 'text-emerald-500'
        if (score >= 70) return 'text-amber-500'
        return 'text-red-500'
    }

    const scoreBarColor = (score: number) => {
        if (score >= 85) return '#10b981'
        if (score >= 70) return '#f59e0b'
        return '#ef4444'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        Satın Alma Raporları
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 ${isLive
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            }`}>
                            {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
                            {isLive ? 'Canlı API' : 'Demo Veri'}
                        </span>
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {isLive
                            ? 'Elektra ERP sisteminden canlı veri · Tedarik performansı, envanter analizi ve fiyat trendleri'
                            : 'Demo veri ile çalışıyor · ERP bağlantısı için ELEKTRA_ERP_* env değişkenlerini ayarlayın'
                        }
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Bu Ay Harcama', value: fmt(kpis.totalSpent), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: 'Aktif Sipariş', value: kpis.activeOrders.toString(), icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Kritik Stok', value: kpis.criticalItems.toString(), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
                    { label: 'Ort. Performans', value: `${kpis.avgPerformance}%`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Toplam Sipariş', value: kpis.totalOrders.toString(), icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { label: 'Tedarikçi', value: kpis.vendorCount.toString(), icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
                ].map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded-lg ${card.bg}`}>
                                <card.icon size={14} className={card.color} />
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{card.label}</span>
                        </div>
                        <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.key
                                ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {/* ─── OVERVIEW TAB ─── */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Performance Score + Category Pie */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Performance Scores */}
                                <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5">
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                        <Star size={16} className="text-amber-500" />
                                        Satın Alma Performans Skoru
                                        {performance.trend === 'up' && <ArrowUpRight size={16} className="text-emerald-500" />}
                                        {performance.trend === 'down' && <ArrowDownRight size={16} className="text-red-500" />}
                                        {performance.trend === 'stable' && <Minus size={16} className="text-slate-400" />}
                                    </h3>

                                    {/* Score Breakdown */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
                                        {[
                                            { label: 'Genel', score: performance.overallScore, weight: '' },
                                            { label: 'Tedarikçi', score: performance.vendorScore, weight: '25%' },
                                            { label: 'Fiyat', score: performance.priceScore, weight: '30%' },
                                            { label: 'Teslimat', score: performance.deliveryScore, weight: '25%' },
                                            { label: 'Kalite', score: performance.qualityScore, weight: '20%' },
                                        ].map((s, i) => (
                                            <div key={i} className={`text-center p-3 rounded-lg ${i === 0 ? 'bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-800'}`}>
                                                <p className={`text-2xl font-bold ${scoreColor(s.score)}`}>{s.score}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
                                                {s.weight && <p className="text-[10px] text-slate-400 dark:text-slate-500">Ağırlık: {s.weight}</p>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Monthly Trend Chart */}
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={performance.monthlyScores}>
                                                <defs>
                                                    <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v.slice(5)} />
                                                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                                <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg, #1f2937)', borderColor: 'var(--tooltip-border, #374151)', color: 'var(--tooltip-text, #f3f4f6)' }} />
                                                <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#perfGrad)" strokeWidth={2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Department Spending Pie */}
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5">
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Departman Harcamaları</h3>
                                    <div className="h-52">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categorySpending}
                                                    cx="50%" cy="50%"
                                                    innerRadius={45} outerRadius={75}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {categorySpending.map((entry, idx) => (
                                                        <Cell key={idx} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ backgroundColor: 'var(--tooltip-bg, #1f2937)', borderColor: 'var(--tooltip-border, #374151)', color: 'var(--tooltip-text, #f3f4f6)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-1.5 mt-2">
                                        {categorySpending.map((c, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
                                                    <span className="text-slate-600 dark:text-slate-300">{c.name}</span>
                                                </div>
                                                <span className="font-medium text-slate-700 dark:text-slate-200">{fmt(c.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Critical Inventory Alerts */}
                            {inventory.filter(n => n.needLevel === 'critical' || n.needLevel === 'low').length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
                                    <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                                        <AlertTriangle size={16} />
                                        Stok Uyarıları — Acil Sipariş Gerekli
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {inventory.filter(n => n.needLevel === 'critical' || n.needLevel === 'low').map((n, i) => (
                                            <div key={i} className={`${NEED_COLORS[n.needLevel].bg} rounded-lg p-3`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-sm font-medium ${NEED_COLORS[n.needLevel].text}`}>{n.item.name}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${NEED_COLORS[n.needLevel].badge}`}>
                                                        {NEED_COLORS[n.needLevel].label}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                                                    <p>Mevcut: {n.item.currentStock} {n.item.unit} · Min: {n.item.minStock}</p>
                                                    <p>{n.daysOfSupply} gün yeterli · Sipariş: {n.suggestedOrderQty} {n.item.unit}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Top Vendors */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">En İyi Tedarikçiler</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {vendors.slice(0, 4).map((v, i) => (
                                        <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{v.name}</span>
                                                <span className={`text-lg font-bold ${scoreColor(v.performanceScore)}`}>{v.performanceScore}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                                                <div className="flex justify-between"><span>Zamanında Teslimat</span><span className="font-medium">{v.onTimeRate}%</span></div>
                                                <div className="flex justify-between"><span>Toplam Sipariş</span><span className="font-medium">{v.totalOrders}</span></div>
                                                <div className="flex justify-between"><span>Ort. Teslimat</span><span className="font-medium">{v.avgDeliveryDays} gün</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── ORDERS TAB ─── */}
                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
                                    <Search size={16} className="text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Sipariş, tedarikçi veya ürün ara..."
                                        value={search}
                                        onChange={e => { setSearch(e.target.value); setOrderPage(0) }}
                                        className="bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none w-full"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={e => { setStatusFilter(e.target.value); setOrderPage(0) }}
                                    className="bg-slate-100 dark:bg-slate-700/50 text-sm text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 border-none outline-none"
                                >
                                    <option value="all">Tüm Durumlar</option>
                                    <option value="Teslim Edildi">Teslim Edildi</option>
                                    <option value="Beklemede">Beklemede</option>
                                    <option value="Kısmi Teslim">Kısmi Teslim</option>
                                    <option value="İptal">İptal</option>
                                </select>
                                <select
                                    value={deptFilter}
                                    onChange={e => { setDeptFilter(e.target.value); setOrderPage(0) }}
                                    className="bg-slate-100 dark:bg-slate-700/50 text-sm text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 border-none outline-none"
                                >
                                    <option value="all">Tüm Departmanlar</option>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            {/* Orders Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="text-left py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Sipariş No</th>
                                            <th className="text-left py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tarih</th>
                                            <th className="text-left py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tedarikçi</th>
                                            <th className="text-left py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Departman</th>
                                            <th className="text-left py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Kalem</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tutar</th>
                                            <th className="text-center py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Durum</th>
                                            <th className="text-left py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Onaylayan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedOrders.map((o, i) => (
                                            <tr key={o.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{o.id}</td>
                                                <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{o.date}</td>
                                                <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-200">{o.vendor}</td>
                                                <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{o.department}</td>
                                                <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-xs max-w-[200px] truncate" title={o.items.map(i => i.name).join(', ')}>
                                                    {o.items.length} kalem
                                                </td>
                                                <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-200">{fmt(o.totalAmount)}</td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[o.status] || ''}`}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400">{o.approvedBy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{filteredOrders.length} sipariş</p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setOrderPage(Math.max(0, orderPage - 1))} disabled={orderPage === 0} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-40">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-xs text-slate-600 dark:text-slate-300">{orderPage + 1} / {totalPages}</span>
                                    <button onClick={() => setOrderPage(Math.min(totalPages - 1, orderPage + 1))} disabled={orderPage >= totalPages - 1} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-40">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── INVENTORY TAB ─── */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-4">
                            {/* Category Filter */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Filter size={16} className="text-slate-400" />
                                <button onClick={() => setCategoryFilter('all')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${categoryFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Tümü</button>
                                {categories.map(c => (
                                    <button key={c} onClick={() => setCategoryFilter(c)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${categoryFilter === c ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                        {c}
                                    </button>
                                ))}
                            </div>

                            {/* Summary Badges */}
                            <div className="flex flex-wrap gap-3">
                                {(['critical', 'low', 'ok', 'excess'] as const).map(level => {
                                    const count = filteredInventory.filter(n => n.needLevel === level).length
                                    return (
                                        <div key={level} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${NEED_COLORS[level].bg} ${NEED_COLORS[level].text}`}>
                                            <div className={`w-2 h-2 rounded-full ${NEED_COLORS[level].badge}`} />
                                            {NEED_COLORS[level].label}: {count}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Inventory Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="text-left py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Ürün</th>
                                            <th className="text-left py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Kategori</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Mevcut</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Min</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Günlük Tüketim</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Gün Yeterli</th>
                                            <th className="text-center py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Durum</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Sipariş Önerisi</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tahmini Maliyet</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInventory.map((n, i) => (
                                            <tr key={n.item.id} className={`border-b border-slate-100 dark:border-slate-800 ${n.needLevel === 'critical' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                                <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-200">{n.item.name}</td>
                                                <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-xs">{n.item.category}</td>
                                                <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">{n.item.currentStock}</td>
                                                <td className="py-3 px-3 text-right font-mono text-slate-500 dark:text-slate-400">{n.item.minStock}</td>
                                                <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">{n.item.avgDailyConsumption}</td>
                                                <td className={`py-3 px-3 text-right font-bold ${NEED_COLORS[n.needLevel].text}`}>{n.daysOfSupply}</td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-medium ${NEED_COLORS[n.needLevel].badge}`}>
                                                        {NEED_COLORS[n.needLevel].label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-200">
                                                    {n.suggestedOrderQty > 0 ? `${n.suggestedOrderQty} ${n.item.unit}` : '—'}
                                                </td>
                                                <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">
                                                    {n.estimatedCost > 0 ? fmt(n.estimatedCost) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ─── VENDORS TAB ─── */}
                    {activeTab === 'vendors' && (
                        <div className="space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="text-left py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tedarikçi</th>
                                            <th className="text-left py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Kategori</th>
                                            <th className="text-center py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Performans</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Sipariş</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Toplam Harcama</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Ort. Teslimat</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Zamanında %</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">İade %</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Fiyat Rekabet</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vendors.map((v, i) => (
                                            <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">#{i + 1}</span>
                                                        <span className="font-medium text-slate-700 dark:text-slate-200">{v.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-xs">{v.category}</td>
                                                <td className="py-3 px-3 text-center">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full transition-all" style={{
                                                                width: `${v.performanceScore}%`,
                                                                backgroundColor: scoreBarColor(v.performanceScore)
                                                            }} />
                                                        </div>
                                                        <span className={`text-xs font-bold ${scoreColor(v.performanceScore)}`}>{v.performanceScore}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">{v.totalOrders}</td>
                                                <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-200">{fmt(v.totalSpent)}</td>
                                                <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">{v.avgDeliveryDays} gün</td>
                                                <td className="py-3 px-3 text-right">
                                                    <span className={v.onTimeRate >= 95 ? 'text-emerald-600 dark:text-emerald-400' : v.onTimeRate >= 90 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>{v.onTimeRate}%</span>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <span className={v.returnRate <= 1 ? 'text-emerald-600 dark:text-emerald-400' : v.returnRate <= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>{v.returnRate}%</span>
                                                </td>
                                                <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">{v.priceCompetitiveness}/100</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Scoring Info */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 text-xs text-slate-500 dark:text-slate-400">
                                <p className="font-semibold mb-1">Performans Skoru Hesaplama:</p>
                                <p>Skor = Tedarikçi Güvenilirliği × 0.25 + Fiyat Rekabetçiliği × 0.30 + Teslimat Hızı × 0.25 + Kalite (İade Oranı) × 0.20</p>
                            </div>
                        </div>
                    )}

                    {/* ─── PRICES TAB ─── */}
                    {activeTab === 'prices' && (
                        <div className="space-y-4">
                            {/* Product Selector */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Ürün:</span>
                                <select
                                    value={selectedPriceTrend}
                                    onChange={e => setSelectedPriceTrend(Number(e.target.value))}
                                    className="bg-slate-100 dark:bg-slate-700/50 text-sm text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 border-none outline-none min-w-[200px]"
                                >
                                    {priceTrends.map((pt, i) => (
                                        <option key={i} value={i}>{pt.itemName} ({pt.category})</option>
                                    ))}
                                </select>
                                {priceTrends[selectedPriceTrend] && (
                                    <span className={`text-sm font-medium ${priceTrends[selectedPriceTrend].changePercent > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {priceTrends[selectedPriceTrend].changePercent > 0 ? '+' : ''}{priceTrends[selectedPriceTrend].changePercent}%
                                        <span className="text-xs text-slate-400 ml-1">(12 ay)</span>
                                    </span>
                                )}
                            </div>

                            {/* Price Chart */}
                            {priceTrends[selectedPriceTrend] && (
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5">
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                        {priceTrends[selectedPriceTrend].itemName} — Son 12 Ay Fiyat Trendi
                                    </h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={priceTrends[selectedPriceTrend].data}>
                                                <defs>
                                                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v.slice(5)} />
                                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₺${v}`} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'var(--tooltip-bg, #1f2937)', borderColor: 'var(--tooltip-border, #374151)', color: 'var(--tooltip-text, #f3f4f6)' }}
                                                    formatter={(v: any, name: any) => [`₺${v}`, name === 'price' ? 'Alım Fiyatı' : 'Pazar Ortalaması']}
                                                />
                                                <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#priceGrad)" strokeWidth={2} name="price" />
                                                <Area type="monotone" dataKey="marketAvg" stroke="#94a3b8" strokeDasharray="5 5" fill="none" strokeWidth={1.5} name="marketAvg" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* All Items Price Change Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="text-left py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Ürün</th>
                                            <th className="text-left py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Kategori</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Güncel Fiyat</th>
                                            <th className="text-right py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">12 Ay Değişim</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {priceTrends.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).map((pt, i) => (
                                            <tr key={pt.itemId} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors" onClick={() => setSelectedPriceTrend(priceTrends.findIndex(p => p.itemId === pt.itemId))}>
                                                <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">{pt.itemName}</td>
                                                <td className="py-2.5 px-3 text-xs text-slate-500 dark:text-slate-400">{pt.category}</td>
                                                <td className="py-2.5 px-3 text-right font-medium text-slate-700 dark:text-slate-200">
                                                    ₺{pt.data[pt.data.length - 1]?.price || 0}
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    <span className={`inline-flex items-center gap-1 font-medium ${pt.changePercent > 5 ? 'text-red-500' : pt.changePercent > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                        {pt.changePercent > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                        {pt.changePercent > 0 ? '+' : ''}{pt.changePercent}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
