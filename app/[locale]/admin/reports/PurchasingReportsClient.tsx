'use client'

import React, { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Package, Truck, ShoppingCart, AlertTriangle, BarChart3, TrendingUp, TrendingDown, ArrowUpRight, Users, CalendarRange, Filter, DollarSign, Calendar } from 'lucide-react'

import { InventoryNeed, PriceTrend, StockItem } from '@/lib/services/purchasing'

// ─── Types ────────────────────────────────────────────────────

interface PurchaseOrder { id: string; date: string; vendor: string; department: string; totalAmount: number; currency: string; status: string }
interface Vendor { id: string; name: string; category: string; totalOrders: number; totalSpent: number; avgDeliveryDays: number; onTimeRate: number; returnRate: number; performanceScore: number }
interface PurchasingKPIs { totalSpent: number; activeOrders: number; criticalItems: number; avgPerformance: number; totalOrders: number; vendorCount: number; dataSource: string }

interface Props {
    kpis: PurchasingKPIs
    stockItems: StockItem[]
    purchaseOrders: PurchaseOrder[]
    vendors: Vendor[]
    inventoryNeeds: InventoryNeed[]
    priceTrends: PriceTrend[]
    dataSource: string
}

// ─── Helpers ──────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })
const fmtK = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : fmt(n)
const fmtTry = (n: number) => `₺${fmtK(n)}`

const STATUS_COLORS: Record<string, string> = {
    'Teslim Edildi': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Beklemede': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Kısmi Teslim': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'İptal': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6', '#6366f1']

// ─── Component ────────────────────────────────────────────────

export default function PurchasingReportsClient({ kpis, stockItems, purchaseOrders, vendors, inventoryNeeds, priceTrends, dataSource }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'vendors'>('overview')
    const [datePreset, setDatePreset] = useState<'month' | 'quarter' | 'year' | 'custom'>('year')
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('ALL')

    const tabs = [
        { key: 'overview' as const, label: 'Genel Bakış', icon: BarChart3 },
        { key: 'orders' as const, label: 'Siparişler', icon: ShoppingCart },
        { key: 'inventory' as const, label: 'Stok Durumu', icon: Package },
        { key: 'vendors' as const, label: 'Tedarikçiler', icon: Users },
    ]

    // Date-filtered orders
    const filteredOrders = useMemo(() => {
        let orders = purchaseOrders
        if (datePreset !== 'year' || customStart || customEnd) {
            const now = new Date()
            let start = '', end = ''
            if (datePreset === 'month') {
                start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
                end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`
            } else if (datePreset === 'quarter') {
                const q = Math.floor(now.getMonth() / 3)
                start = `${now.getFullYear()}-${String(q * 3 + 1).padStart(2, '0')}-01`
                const endMonth = q * 3 + 3
                const lastDay = new Date(now.getFullYear(), endMonth, 0).getDate()
                end = `${now.getFullYear()}-${String(endMonth).padStart(2, '0')}-${lastDay}`
            } else if (datePreset === 'custom' && customStart && customEnd) {
                start = customStart; end = customEnd
            }
            if (start && end) {
                orders = orders.filter(o => o.date >= start && o.date <= end)
            }
        }
        if (statusFilter !== 'ALL') {
            orders = orders.filter(o => o.status === statusFilter)
        }
        return orders
    }, [purchaseOrders, datePreset, customStart, customEnd, statusFilter])

    // Category distribution from stock items
    const categoryData = useMemo(() => {
        const map = new Map<string, number>()
        stockItems.forEach(s => {
            map.set(s.category, (map.get(s.category) || 0) + 1)
        })
        return Array.from(map.entries()).map(([name, count], i) => ({
            name,
            value: count,
            color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
        })).sort((a, b) => b.value - a.value)
    }, [stockItems])

    // Order status distribution
    const orderStatusData = useMemo(() => {
        const map = new Map<string, number>()
        filteredOrders.forEach(o => {
            map.set(o.status, (map.get(o.status) || 0) + 1)
        })
        const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']
        return Array.from(map.entries()).map(([name, value], i) => ({
            name,
            value,
            color: colors[i % colors.length]
        }))
    }, [filteredOrders])

    // Monthly spend (with previous year comparison)
    const monthlySpend = useMemo(() => {
        const map = new Map<string, number>()
        const prevMap = new Map<string, number>()
        const MONTHS_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
        const currentYear = new Date().getFullYear()
        filteredOrders.forEach(o => {
            const m = parseInt(o.date.slice(5, 7)) - 1
            if (m >= 0 && m < 12) {
                const key = MONTHS_SHORT[m]
                map.set(key, (map.get(key) || 0) + o.totalAmount)
            }
        })
        // Previous year orders from all orders (not filtered by date preset)
        purchaseOrders.forEach(o => {
            const y = parseInt(o.date.slice(0, 4))
            if (y === currentYear - 1) {
                const m = parseInt(o.date.slice(5, 7)) - 1
                if (m >= 0 && m < 12) {
                    const key = MONTHS_SHORT[m]
                    prevMap.set(key, (prevMap.get(key) || 0) + o.totalAmount)
                }
            }
        })
        return MONTHS_SHORT.map(m => ({
            name: m,
            Harcama: Math.round((map.get(m) || 0) / 1000),
            'ÖncekiYıl': Math.round((prevMap.get(m) || 0) / 1000),
        }))
    }, [filteredOrders, purchaseOrders])

    // Filtered total spend
    const filteredTotalSpend = useMemo(() => filteredOrders.reduce((s, o) => s + o.totalAmount, 0), [filteredOrders])

    // Previous year total for YoY comparison
    const prevYearSpend = useMemo(() => {
        const currentYear = new Date().getFullYear()
        return purchaseOrders
            .filter(o => parseInt(o.date.slice(0, 4)) === currentYear - 1)
            .reduce((s, o) => s + o.totalAmount, 0)
    }, [purchaseOrders])

    const yoyPct = prevYearSpend > 0 ? ((filteredTotalSpend - prevYearSpend) / prevYearSpend * 100) : 0

    // Department breakdown
    const departmentData = useMemo(() => {
        const map = new Map<string, number>()
        filteredOrders.forEach(o => {
            map.set(o.department, (map.get(o.department) || 0) + o.totalAmount)
        })
        return Array.from(map.entries())
            .map(([name, value], i) => ({ name, value: Math.round(value / 1000), color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
            .sort((a, b) => b.value - a.value)
    }, [filteredOrders])

    // Top 10 vendors
    const topVendors = useMemo(() => vendors.slice(0, 10), [vendors])

    // Unique statuses for filter
    const uniqueStatuses = useMemo(() => {
        const set = new Set<string>()
        purchaseOrders.forEach(o => set.add(o.status))
        return Array.from(set)
    }, [purchaseOrders])

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 bg-white dark:bg-[#1e293b] p-2 rounded-2xl border border-slate-200 dark:border-white/10">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
                <div className="flex-1" />

                {/* Date Range Filter */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <CalendarRange size={14} className="text-slate-400 ml-1" />
                    {(['month', 'quarter', 'year'] as const).map(p => (
                        <button
                            key={p}
                            onClick={() => setDatePreset(p)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${datePreset === p ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        >
                            {p === 'month' ? 'Ay' : p === 'quarter' ? 'Çeyrek' : 'Yıl'}
                        </button>
                    ))}
                    <button
                        onClick={() => setDatePreset('custom')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${datePreset === 'custom' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                        Özel
                    </button>
                </div>
                {datePreset === 'custom' && (
                    <div className="flex items-center gap-1">
                        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-slate-700 dark:text-slate-300" />
                        <span className="text-slate-400 text-[10px]">–</span>
                        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-slate-700 dark:text-slate-300" />
                    </div>
                )}

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="pl-7 pr-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors outline-none appearance-none cursor-pointer"
                    >
                        <option value="ALL">Tüm Durumlar</option>
                        {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <Filter size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <span className={`self-center px-2 py-1 rounded text-[10px] font-bold uppercase ${dataSource === 'live' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {dataSource === 'live' ? '● Canlı' : '● Demo'}
                </span>
            </div>

            {/* ═══ OVERVIEW TAB ═══ */}
            {activeTab === 'overview' && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Toplam Harcama', value: fmtTry(filteredTotalSpend), icon: ShoppingCart, gradient: 'from-orange-500 to-amber-500', yoy: yoyPct },
                            { label: 'Sipariş', value: fmt(filteredOrders.length), icon: Truck, gradient: 'from-blue-500 to-cyan-500' },
                            { label: 'Kritik Stok', value: fmt(kpis.criticalItems), icon: AlertTriangle, gradient: 'from-red-500 to-rose-500' },
                            { label: 'Tedarikçi Performansı', value: `%${kpis.avgPerformance}`, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500' },
                        ].map((card, i) => (
                            <div key={i} className="relative overflow-hidden bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-10 rounded-bl-[60px]`} />
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                                        <card.icon size={18} className="text-white" />
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">{card.label}</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</div>
                                {'yoy' in card && card.yoy !== undefined && card.yoy !== 0 && (
                                    <span className={`text-[10px] font-bold mt-1 inline-block px-1.5 py-0.5 rounded ${card.yoy > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                        {card.yoy > 0 ? '+' : ''}{card.yoy.toFixed(1)}% YoY
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Monthly Spend Chart + Category Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Aylık Satın Alma Harcaması (₺K)</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={monthlySpend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}K`} />
                                    <Tooltip formatter={(value: any, name: any) => [`₺${value}K`, name === 'ÖncekiYıl' ? 'Önceki Yıl' : 'Bu Yıl']} />
                                    <Legend />
                                    <Bar dataKey="Harcama" name="Bu Yıl" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                                    <Line type="monotone" dataKey="ÖncekiYıl" name="Önceki Yıl" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Departman Harcama Dağılımı</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={departmentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={2}>
                                        {departmentData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => [`₺${value}K`, '']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1 mt-2">
                                {departmentData.slice(0, 6).map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                            <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">₺{d.value}K</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Stok Kategori Dağılımı</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={2}>
                                        {categoryData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1 mt-2">
                                {categoryData.slice(0, 6).map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                            <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Price Trends */}
                    {priceTrends.length > 0 && (
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Fiyat Trendleri</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {priceTrends.map((pt, i) => {
                                    const lastData = pt.data && pt.data.length > 0 ? pt.data[pt.data.length - 1] : null
                                    return (
                                        <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                            <div className="text-xs text-slate-500 mb-1">{pt.category || pt.itemName}</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{lastData ? `₺${fmt(lastData.price)}` : '-'}</span>
                                                <span className={`flex items-center gap-0.5 text-xs font-bold ${pt.changePercent > 0 ? 'text-red-500' : pt.changePercent < 0 ? 'text-emerald-500' : 'text-slate-400'
                                                    }`}>
                                                    {pt.changePercent > 0 ? <TrendingUp size={12} /> : pt.changePercent < 0 ? <TrendingDown size={12} /> : '—'}
                                                    {pt.changePercent > 0 ? '+' : ''}{pt.changePercent}%
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ═══ ORDERS TAB ═══ */}
            {activeTab === 'orders' && (
                <>
                    {/* Order Status Summary */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {orderStatusData.map((os, i) => (
                            <div key={i} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: os.color }} />
                                    <span className="text-xs text-slate-500">{os.name}</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">{os.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Satın Alma Siparişleri</h3>
                            <p className="text-xs text-slate-500">Son 50 sipariş</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-[#0f172a]">
                                    <tr className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                                        <th className="p-3 text-left">Tarih</th>
                                        <th className="p-3 text-left">Tedarikçi</th>
                                        <th className="p-3 text-left">Departman</th>
                                        <th className="p-3 text-right">Tutar</th>
                                        <th className="p-3 text-center">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {filteredOrders.slice(0, 50).map((order, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-xs font-mono text-slate-600 dark:text-slate-400">{order.date}</td>
                                            <td className="p-3 font-medium text-slate-900 dark:text-white">{order.vendor}</td>
                                            <td className="p-3 text-slate-600 dark:text-slate-400">{order.department}</td>
                                            <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">{fmtTry(order.totalAmount)}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-500'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ INVENTORY TAB ═══ */}
            {activeTab === 'inventory' && (
                <>
                    {/* Critical Items */}
                    <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 dark:from-red-900/20 dark:via-orange-900/20 dark:to-amber-900/20 border border-red-200 dark:border-red-500/20 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} /> Kritik Stok Seviyeleri
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {inventoryNeeds.filter(n => n.needLevel === 'critical' || n.needLevel === 'low').slice(0, 8).map((item, i) => (
                                <div key={i} className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-3">
                                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.item.name}</div>
                                    <div className="flex justify-between items-end mt-1">
                                        <div>
                                            <div className={`text-lg font-bold ${item.needLevel === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
                                                {fmt(item.item.currentStock)}
                                            </div>
                                            <div className="text-[10px] text-slate-400">Min: {fmt(item.item.minStock)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xs font-bold ${item.daysOfSupply <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                                                {item.daysOfSupply} gün
                                            </div>
                                            <div className="text-[10px] text-slate-400">kalan</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Full Stock Table */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Stok Listesi</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-[#0f172a]">
                                    <tr className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                                        <th className="p-3 text-left">Ürün</th>
                                        <th className="p-3 text-left">Kategori</th>
                                        <th className="p-3 text-right">Mevcut</th>
                                        <th className="p-3 text-right">Min</th>
                                        <th className="p-3 text-right">Son Fiyat</th>
                                        <th className="p-3 text-left">Tedarikçi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {stockItems.slice(0, 40).map((item, i) => {
                                        const isLow = item.currentStock <= item.minStock
                                        return (
                                            <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${isLow ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                                <td className="p-3 font-medium text-slate-900 dark:text-white">{item.name}</td>
                                                <td className="p-3 text-slate-600 dark:text-slate-400 text-xs">{item.category}</td>
                                                <td className={`p-3 text-right font-mono font-bold ${isLow ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {fmt(item.currentStock)} {item.unit}
                                                </td>
                                                <td className="p-3 text-right font-mono text-slate-500">{fmt(item.minStock)}</td>
                                                <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">₺{fmt(item.lastPrice)}</td>
                                                <td className="p-3 text-xs text-slate-500 truncate max-w-[120px]">{item.vendor || '-'}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ VENDORS TAB ═══ */}
            {activeTab === 'vendors' && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tedarikçi Performans Tablosu</h3>
                        <p className="text-xs text-slate-500">Performans skoru = Zamanında teslimat × Fiyat rekabetçiliği × Düşük iade oranı</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-[#0f172a]">
                                <tr className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="p-3 text-left">Tedarikçi</th>
                                    <th className="p-3 text-left">Kategori</th>
                                    <th className="p-3 text-right">Sipariş</th>
                                    <th className="p-3 text-right">Toplam Harcama</th>
                                    <th className="p-3 text-right">Ort. Teslimat</th>
                                    <th className="p-3 text-right">Zamanında</th>
                                    <th className="p-3 text-right">İade</th>
                                    <th className="p-3 text-right">Skor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                {topVendors.map((v, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-700' : 'bg-slate-200 text-slate-600'
                                                    }`}>{i + 1}</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{v.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-xs text-slate-500">{v.category}</td>
                                        <td className="p-3 text-right font-mono">{fmt(v.totalOrders)}</td>
                                        <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">{fmtTry(v.totalSpent)}</td>
                                        <td className="p-3 text-right font-mono">{v.avgDeliveryDays} gün</td>
                                        <td className="p-3 text-right">
                                            <span className={`font-mono ${v.onTimeRate >= 90 ? 'text-emerald-600' : v.onTimeRate >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                                                %{v.onTimeRate}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <span className={`font-mono ${v.returnRate <= 2 ? 'text-emerald-600' : v.returnRate <= 5 ? 'text-amber-600' : 'text-red-600'}`}>
                                                %{v.returnRate}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${v.performanceScore >= 80 ? 'bg-emerald-500' : v.performanceScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${v.performanceScore}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono font-bold text-xs">{v.performanceScore}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Cross-Module Navigation */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-3">İlgili Modüller</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { href: '../yield', label: 'Yield Management', desc: 'ADR analizi, fiyat matrisi', icon: TrendingUp },
                        { href: '../reports', label: 'Yönetim Raporları', desc: 'S26, Pace, milliyet', icon: BarChart3 },
                        { href: '../extras', label: 'Ekstra Satışlar', desc: 'SPA, Minibar, Restoran', icon: DollarSign },
                        { href: '../accounting', label: 'Muhasebe', desc: 'Stok, fişler, forecast', icon: Calendar },
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
