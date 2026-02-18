'use client'

import React, { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { Users, Building2, Briefcase, GraduationCap, Heart, TrendingUp, DollarSign, UserCheck, ArrowUpRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

interface DepartmentData { name: string; headCount: number; seasonalAdd: number; avgSalary: number; color: string; icon: string }
interface PersonnelCost { category: string; code: string; amount: number; percentage: number; description: string }
interface MonthlyHR { month: string; totalStaff: number; totalCost: number; avgCostPerPerson: number; prevYearStaff: number; prevYearCost: number }
interface HRKPIs { totalStaff: number; seasonalStaff: number; totalCost: number; avgCostPerPerson: number; sgkCost: number; revenuePerEmployee: number; staffTurnover: number; costGrowth: number }
interface PositionDistribution { position: string; count: number; percentage: number; color: string }
interface DepartmentPerformance { department: string; headCount: number; totalCost: number; revenueGenerated: number; costPerEmployee: number; revenuePerEmployee: number; efficiency: number; color: string }
interface Benchmark { metric: string; hotel: number; industry: number; status: 'above' | 'below' | 'at' }
interface SeasonalPlan { month: string; permanent: number; seasonal: number; total: number }

interface Props {
    kpis: HRKPIs
    departments: DepartmentData[]
    personnelCosts: PersonnelCost[]
    monthlyData: MonthlyHR[]
    positionDistribution: PositionDistribution[]
    departmentPerformance: DepartmentPerformance[]
    benchmarks: Benchmark[]
    seasonalPlan: SeasonalPlan[]
    dataSource: string
}

// ─── Helpers ──────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })
const fmtK = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : fmt(n)
const fmtTry = (n: number) => `₺${fmtK(n)}`

// ─── Component ────────────────────────────────────────────────

export default function HRReportsClient({ kpis, departments, personnelCosts, monthlyData, positionDistribution, departmentPerformance, benchmarks, seasonalPlan, dataSource }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'costs' | 'benchmarks'>('overview')

    const tabs = [
        { key: 'overview' as const, label: 'Genel Bakış', icon: Users },
        { key: 'departments' as const, label: 'Departmanlar', icon: Building2 },
        { key: 'costs' as const, label: 'Maliyet Analizi', icon: DollarSign },
        { key: 'benchmarks' as const, label: 'Kıyaslama', icon: TrendingUp },
    ]

    // Chart data
    const monthlyChartData = useMemo(() => monthlyData.map(m => ({
        name: m.month,
        'Personel Sayısı': m.totalStaff,
        'Önceki Yıl': m.prevYearStaff,
        'Toplam Maliyet': Math.round(m.totalCost / 1_000_000),
        'Önceki Yıl Maliyet': Math.round(m.prevYearCost / 1_000_000),
    })), [monthlyData])

    const seasonalChartData = useMemo(() => seasonalPlan.map(s => ({
        name: s.month,
        Kadrolu: s.permanent,
        Sezonluk: s.seasonal,
    })), [seasonalPlan])

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 bg-white dark:bg-[#1e293b] p-2 rounded-2xl border border-slate-200 dark:border-white/10">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/20'
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
                            { label: 'Toplam Personel', value: fmt(kpis.totalStaff), sub: `+${kpis.seasonalStaff} sezonluk`, icon: Users, gradient: 'from-violet-500 to-purple-500' },
                            { label: 'Aylık Toplam Maliyet', value: fmtTry(kpis.totalCost), sub: `+%${kpis.costGrowth} YoY`, icon: DollarSign, gradient: 'from-pink-500 to-rose-500' },
                            { label: 'Kişi Başı Maliyet', value: fmtTry(kpis.avgCostPerPerson), sub: 'Aylık ortalama', icon: UserCheck, gradient: 'from-blue-500 to-cyan-500' },
                            { label: 'Personel Başı Gelir', value: fmtTry(kpis.revenuePerEmployee), sub: `Devir: %${kpis.staffTurnover}`, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500' },
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
                                <div className="text-xs text-slate-400">{card.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Monthly Staff + Seasonal Plan */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Aylık Personel Sayısı</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={monthlyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Personel Sayısı" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Önceki Yıl" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Sezonluk Kadro Planı</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={seasonalChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Kadrolu" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="Sezonluk" stackId="a" fill="#d946ef" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Position Distribution Pie */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Pozisyon Dağılımı</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={positionDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={100} dataKey="count" nameKey="position" paddingAngle={2}>
                                        {positionDistribution.map((p, i) => <Cell key={i} fill={p.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => [fmt(value) + ' kişi', '']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 flex flex-col justify-center">
                                {positionDistribution.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{p.position}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{fmt(p.count)}</span>
                                            <span className="text-xs text-slate-400">%{p.percentage}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ DEPARTMENTS TAB ═══ */}
            {activeTab === 'departments' && (
                <>
                    {/* Department Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {departments.map((dept, i) => (
                            <div key={i} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-4 relative overflow-hidden hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center text-2xl opacity-20">{dept.icon}</div>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg mb-2" style={{ backgroundColor: dept.color + '20' }}>{dept.icon}</div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">{dept.name}</div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-xl font-bold" style={{ color: dept.color }}>{dept.headCount}</div>
                                        <div className="text-[10px] text-slate-400">kadrolu</div>
                                    </div>
                                    {dept.seasonalAdd > 0 && (
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-purple-500">+{dept.seasonalAdd}</div>
                                            <div className="text-[10px] text-slate-400">sezonluk</div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 text-[10px] text-slate-400">
                                    Ort. Maaş: {fmtTry(dept.avgSalary)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Department Performance Table */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Departman Verimlilik Analizi</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-[#0f172a]">
                                    <tr className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                                        <th className="p-3 text-left">Departman</th>
                                        <th className="p-3 text-right">Personel</th>
                                        <th className="p-3 text-right">Toplam Maliyet</th>
                                        <th className="p-3 text-right">Üretilen Gelir</th>
                                        <th className="p-3 text-right">Kişi Başı Maliyet</th>
                                        <th className="p-3 text-right">Kişi Başı Gelir</th>
                                        <th className="p-3 text-right">Verimlilik</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {departmentPerformance.map((dept, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                                                    <span className="font-medium text-slate-900 dark:text-white">{dept.department}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right font-mono">{dept.headCount}</td>
                                            <td className="p-3 text-right font-mono text-red-500">{fmtTry(dept.totalCost)}</td>
                                            <td className="p-3 text-right font-mono text-emerald-600">{fmtTry(dept.revenueGenerated)}</td>
                                            <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">{fmtTry(dept.costPerEmployee)}</td>
                                            <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">{fmtTry(dept.revenuePerEmployee)}</td>
                                            <td className="p-3 text-right">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${dept.efficiency >= 2 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    dept.efficiency >= 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {dept.efficiency}x
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

            {/* ═══ COSTS TAB ═══ */}
            {activeTab === 'costs' && (
                <>
                    {/* SGK Highlight */}
                    <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-violet-500/10 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-5">
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">SGK İşveren Payı</div>
                                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{fmtTry(kpis.sgkCost)}</div>
                                <div className="text-xs text-purple-500 mt-0.5">%22.5 oranı ile</div>
                            </div>
                            <div>
                                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Aylık Toplam Personel Gideri</div>
                                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{fmtTry(kpis.totalCost)}</div>
                                <div className="text-xs text-purple-500 mt-0.5">Brüt + SGK + Vergiler</div>
                            </div>
                            <div>
                                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Yıllık Maliyet Artışı</div>
                                <div className="text-2xl font-bold text-red-600">%{kpis.costGrowth}</div>
                                <div className="text-xs text-purple-500 mt-0.5">Asgari ücret artışı etkisi</div>
                            </div>
                        </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Maliyet Kalemleri</h3>
                            <div className="space-y-3">
                                {personnelCosts.map((cost, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div>
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{cost.category}</span>
                                                <span className="text-[10px] text-slate-400 ml-2">({cost.code})</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-800 dark:text-white">{fmtTry(cost.amount)}</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                                                style={{ width: `${cost.percentage}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">{cost.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Aylık Maliyet Trendi (Milyon ₺)</h3>
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={monthlyChartData}>
                                    <defs>
                                        <linearGradient id="hrCostGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}M`} />
                                    <Tooltip formatter={(value: any) => [`₺${value}M`, '']} />
                                    <Legend />
                                    <Area type="monotone" dataKey="Toplam Maliyet" stroke="#8b5cf6" fill="url(#hrCostGrad)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="Önceki Yıl Maliyet" stroke="#94a3b8" fill="transparent" strokeWidth={1.5} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ BENCHMARKS TAB ═══ */}
            {activeTab === 'benchmarks' && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sektör Kıyaslama</h3>
                        <p className="text-xs text-slate-500 mt-1">5 yıldızlı resort otel sektör ortalamaları ile karşılaştırma</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-[#0f172a]">
                                <tr className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="p-3 text-left">Metrik</th>
                                    <th className="p-3 text-right">Blue Dreams</th>
                                    <th className="p-3 text-right">Sektör Ort.</th>
                                    <th className="p-3 text-center">Durum</th>
                                    <th className="p-3 text-left">Yorum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                {benchmarks.map((b, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-medium text-slate-900 dark:text-white">{b.metric}</td>
                                        <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">{typeof b.hotel === 'number' && b.hotel % 1 !== 0 ? b.hotel.toFixed(2) : fmt(b.hotel)}</td>
                                        <td className="p-3 text-right font-mono text-slate-500">{typeof b.industry === 'number' && b.industry % 1 !== 0 ? b.industry.toFixed(2) : fmt(b.industry)}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.status === 'above' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                b.status === 'at' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {b.status === 'above' ? '✓ Üstünde' : b.status === 'at' ? '≈ Eşit' : '✗ Altında'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-xs text-slate-500">
                                            {b.status === 'above' ? 'Sektör ortalamasının üzerinde performans' :
                                                b.status === 'at' ? 'Sektör ile uyumlu' :
                                                    'İyileştirme alanı'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
