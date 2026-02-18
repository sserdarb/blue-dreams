'use client'

import React, { useState, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, FileText, Receipt, BarChart3, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

interface TrialBalanceRow { accountCode: string; accountName: string; debit: number; credit: number; balance: number; group: string }
interface MonthlyFinance { month: string; revenue: number; expense: number; profit: number; prevYearRevenue: number; prevYearExpense: number }
interface DepartmentRevenue { department: string; revenue: number; percentage: number; color: string }
interface PaymentMethodBreakdown { method: string; amount: number; count: number; percentage: number; color: string }
interface ExpenseBreakdown { category: string; code: string; amount: number; percentage: number; color: string }
interface FinanceKPIs { totalRevenue: number; totalExpense: number; profitMargin: number; cashFlow: number; revenueGrowth: number; expenseGrowth: number; collectionRate: number; invoiceCount: number }

interface Props {
    kpis: FinanceKPIs
    monthlyData: MonthlyFinance[]
    trialBalance: TrialBalanceRow[]
    departmentRevenue: DepartmentRevenue[]
    paymentMethods: PaymentMethodBreakdown[]
    expenseBreakdown: ExpenseBreakdown[]
    dataSource: string
}

// ─── Helpers ──────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })
const fmtK = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : fmt(n)
const fmtTry = (n: number) => `₺${fmtK(n)}`

// ─── Component ────────────────────────────────────────────────

export default function FinanceReportsClient({ kpis, monthlyData, trialBalance, departmentRevenue, paymentMethods, expenseBreakdown, dataSource }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'mizan' | 'tahsilat' | 'gelir'>('overview')

    const tabs = [
        { key: 'overview' as const, label: 'Genel Bakış', icon: BarChart3 },
        { key: 'mizan' as const, label: 'Mizan', icon: FileText },
        { key: 'tahsilat' as const, label: 'Tahsilat', icon: CreditCard },
        { key: 'gelir' as const, label: 'Gelir Analizi', icon: DollarSign },
    ]

    // Chart data for monthly revenue vs expense
    const monthlyChartData = useMemo(() => monthlyData.map(m => ({
        name: m.month,
        Gelir: Math.round(m.revenue / 1_000_000),
        Gider: Math.round(m.expense / 1_000_000),
        Kâr: Math.round(m.profit / 1_000_000),
        'Önceki Yıl Gelir': Math.round(m.prevYearRevenue / 1_000_000),
    })), [monthlyData])

    // Trial balance by group
    const trialGroups = useMemo(() => {
        const groups: Record<string, { debit: number; credit: number; count: number }> = {}
        for (const row of trialBalance) {
            if (!groups[row.group]) groups[row.group] = { debit: 0, credit: 0, count: 0 }
            groups[row.group].debit += row.debit
            groups[row.group].credit += row.credit
            groups[row.group].count += 1
        }
        return groups
    }, [trialBalance])

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 bg-white dark:bg-[#1e293b] p-2 rounded-2xl border border-slate-200 dark:border-white/10">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
                <div className="flex-1" />
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
                            { label: 'Toplam Gelir', value: fmtTry(kpis.totalRevenue), icon: TrendingUp, change: `+${kpis.revenueGrowth}%`, changeType: 'up' as const, color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
                            { label: 'Toplam Gider', value: fmtTry(kpis.totalExpense), icon: TrendingDown, change: `+${kpis.expenseGrowth}%`, changeType: 'down' as const, color: 'red', gradient: 'from-red-500 to-rose-500' },
                            { label: 'Kâr Marjı', value: `%${kpis.profitMargin}`, icon: BarChart3, change: 'Net Kâr', changeType: 'neutral' as const, color: 'blue', gradient: 'from-blue-500 to-indigo-500' },
                            { label: 'Tahsilat Oranı', value: `%${kpis.collectionRate.toFixed(1)}`, icon: Wallet, change: `${kpis.invoiceCount} fatura`, changeType: 'neutral' as const, color: 'purple', gradient: 'from-purple-500 to-violet-500' },
                        ].map((card, i) => (
                            <div key={i} className="relative overflow-hidden bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-10 rounded-bl-[60px]`} />
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                                        <card.icon size={18} className="text-white" />
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">{card.label}</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{card.value}</div>
                                <div className={`text-xs font-semibold flex items-center gap-1 ${card.changeType === 'up' ? 'text-emerald-600' : card.changeType === 'down' ? 'text-red-500' : 'text-slate-400'
                                    }`}>
                                    {card.changeType === 'up' && <ArrowUpRight size={12} />}
                                    {card.changeType === 'down' && <ArrowDownRight size={12} />}
                                    {card.change} YoY
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Monthly Revenue vs Expense Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Aylık Gelir vs Gider (Milyon ₺)</h3>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={monthlyChartData} barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}M`} />
                                    <Tooltip formatter={(value: any) => [`₺${value}M`, '']} />
                                    <Legend />
                                    <Bar dataKey="Gelir" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Önceki Yıl Gelir" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.5} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Department Revenue Pie */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Departman Gelir Dağılımı</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={departmentRevenue} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="revenue" nameKey="department" paddingAngle={2}>
                                        {departmentRevenue.map((d, i) => <Cell key={i} fill={d.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => [fmtTry(value), '']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {departmentRevenue.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                            <span className="text-slate-600 dark:text-slate-400">{d.department}</span>
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">%{d.percentage}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Kâr Trend */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Aylık Kâr Trendi (Milyon ₺)</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={monthlyChartData}>
                                <defs>
                                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}M`} />
                                <Tooltip formatter={(value: any) => [`₺${value}M`, '']} />
                                <Area type="monotone" dataKey="Kâr" stroke="#10b981" fill="url(#profitGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

            {/* ═══ MIZAN TAB ═══ */}
            {activeTab === 'mizan' && (
                <>
                    {/* Group Summary */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(trialGroups).map(([group, data], i) => {
                            const colors = { 'Gelir': 'emerald', 'Gider': 'red', 'Aktif': 'blue', 'Pasif': 'purple' }
                            const color = colors[group as keyof typeof colors] || 'slate'
                            return (
                                <div key={i} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-4">
                                    <div className="text-xs text-slate-500 font-medium mb-1">{group} ({data.count} hesap)</div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-[10px] text-slate-400">Borç</div>
                                            <div className={`text-sm font-bold text-${color}-600`}>{fmtTry(data.debit)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-400">Alacak</div>
                                            <div className={`text-sm font-bold text-${color}-500`}>{fmtTry(data.credit)}</div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Trial Balance Table */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mizan Tablosu</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-[#0f172a]">
                                    <tr className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                                        <th className="p-3 text-left">Hesap Kodu</th>
                                        <th className="p-3 text-left">Hesap Adı</th>
                                        <th className="p-3 text-left">Grup</th>
                                        <th className="p-3 text-right">Borç</th>
                                        <th className="p-3 text-right">Alacak</th>
                                        <th className="p-3 text-right">Bakiye</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {trialBalance.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-mono text-xs text-slate-600 dark:text-slate-400">{row.accountCode}</td>
                                            <td className="p-3 text-slate-900 dark:text-white font-medium">{row.accountName}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.group === 'Gelir' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    row.group === 'Gider' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        row.group === 'Aktif' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                    }`}>{row.group}</span>
                                            </td>
                                            <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{row.debit > 0 ? fmtTry(row.debit) : '-'}</td>
                                            <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{row.credit > 0 ? fmtTry(row.credit) : '-'}</td>
                                            <td className={`p-3 text-right font-mono font-bold ${row.balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {fmtTry(Math.abs(row.balance))} {row.balance < 0 ? 'A' : 'B'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ TAHSILAT TAB ═══ */}
            {activeTab === 'tahsilat' && (
                <>
                    {/* Payment Method Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {paymentMethods.map((pm, i) => (
                            <div key={i} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-4 relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: pm.color }} />
                                <div className="text-xs text-slate-500 mb-1">{pm.method}</div>
                                <div className="text-lg font-bold text-slate-900 dark:text-white">{fmtTry(pm.amount)}</div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[10px] text-slate-400">{fmt(pm.count)} işlem</span>
                                    <span className="text-xs font-bold" style={{ color: pm.color }}>%{pm.percentage}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Payment Distribution Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Ödeme Yöntemi Dağılımı</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="amount" nameKey="method" paddingAngle={3}>
                                        {paymentMethods.map((pm, i) => <Cell key={i} fill={pm.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => [fmtTry(value), '']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Aylık Tahsilat Trendi</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={monthlyChartData}>
                                    <defs>
                                        <linearGradient id="collGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}M`} />
                                    <Tooltip formatter={(value: any) => [`₺${value}M`, '']} />
                                    <Area type="monotone" dataKey="Gelir" stroke="#3b82f6" fill="url(#collGrad)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ GELİR ANALİZİ TAB ═══ */}
            {activeTab === 'gelir' && (
                <>
                    {/* Revenue by Department */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Departman Bazlı Gelir</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={departmentRevenue} layout="vertical" barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => fmtK(v)} />
                                <YAxis dataKey="department" type="category" tick={{ fontSize: 11 }} width={120} />
                                <Tooltip formatter={(value: any) => [fmtTry(value), 'Gelir']} />
                                <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                                    {departmentRevenue.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Expense Breakdown + YoY */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Gider Dağılımı</h3>
                            <div className="space-y-3">
                                {expenseBreakdown.map((exp, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-slate-600 dark:text-slate-400">{exp.category}</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{fmtTry(exp.amount)}</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${exp.percentage}%`, backgroundColor: exp.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Yıllar Arası Gelir Karşılaştırması</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}M`} />
                                    <Tooltip formatter={(value: any) => [`₺${value}M`, '']} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Gelir" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Önceki Yıl Gelir" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
