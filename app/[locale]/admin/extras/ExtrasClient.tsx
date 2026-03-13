'use client'

import { useState, useMemo } from 'react'
import {
    Sparkles, Coffee, UtensilsCrossed, TrendingUp, Calendar,
    DollarSign, BarChart3, Download, ArrowRightLeft
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { AdminTranslations } from '@/lib/admin-translations'
import { DepartmentRevenue } from '@/lib/services/elektra'
import ModuleOffline from '@/components/admin/ModuleOffline'

interface Props {
    spaData: DepartmentRevenue[]
    minibarData: DepartmentRevenue[]
    restaurantData: DepartmentRevenue[]
    translations: AdminTranslations
    error?: string
}

export default function ExtrasClient({ spaData, minibarData, restaurantData, translations: rawT, error }: Props) {
    const t = rawT;
    const e = rawT.extrasPage;

    if (error) {
        return <ModuleOffline moduleName="Ekstra Satışlar" dataSource="elektra" offlineReason={error} />
    }

    const [activeTab, setActiveTab] = useState<'overview' | 'spa' | 'minibar' | 'restaurant'>('overview')
    const [currency, setCurrency] = useState<'TRY' | 'EUR'>('EUR')

    const eurRate = data?.exchangeRates?.EUR_TO_TRY || 1 // Live rate from API
    const RATES = { EUR: 1, TRY: eurRate }

    // Helper: Convert
    const convert = (amount: number, fromCurrency: string) => {
        let inEur = amount
        if (fromCurrency === 'TRY') inEur = eurRate > 0 ? amount / eurRate : amount
        if (currency === 'EUR') return inEur
        return inEur * eurRate
    }

    // Helper: Total Revenue
    const calcTotal = (data: DepartmentRevenue[]) => data.reduce((sum, d) => sum + convert(d.revenue, d.currency), 0)

    const totals = useMemo(() => ({
        spa: calcTotal(spaData),
        minibar: calcTotal(minibarData),
        restaurant: calcTotal(restaurantData),
        all: calcTotal(spaData) + calcTotal(minibarData) + calcTotal(restaurantData)
    }), [spaData, minibarData, restaurantData, currency])

    // Helper: Format Money
    const fmt = (n: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
    }

    // Chart Renderer (Recharts)
    const renderChart = (data: DepartmentRevenue[], color: string, name: string) => {
        // Prepare data for Recharts
        const chartData = data.map(d => ({
            date: d.date.split('-').slice(1).join('/'), // MM/DD
            value: Math.round(convert(d.revenue, d.currency)),
            original: d.revenue,
            currency: d.currency
        }))

        return (
            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`color${name}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" vertical={false} />
                        <XAxis dataKey="date" stroke="currentColor" className="text-slate-500 dark:text-slate-400" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="currentColor" className="text-slate-500 dark:text-slate-400" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                                            <p className="font-bold text-slate-900 dark:text-white">{fmt(payload[0].value as number)}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{name}</p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill={`url(#color${name})`} strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="flex justify-end">
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    {(['EUR', 'TRY'] as const).map(c => (
                        <button key={c} onClick={() => setCurrency(c)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${currency === c ? 'bg-cyan-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center text-[10px]">{c === 'EUR' ? '€' : '₺'}</span>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab('overview')} className={`cursor-pointer p-4 rounded-xl border transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white border-blue-500 shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500/50 text-slate-700 dark:text-slate-300'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-sm font-medium ${activeTab === 'overview' ? 'text-blue-100' : 'text-gray-500'}`}>{e?.totalExtras}</p>
                            <h3 className="text-2xl font-bold mt-1">{fmt(totals.all)}</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${activeTab === 'overview' ? 'bg-blue-500' : 'bg-blue-50 text-blue-600'}`}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                </div>

                <div onClick={() => setActiveTab('spa')} className={`cursor-pointer p-4 rounded-xl border transition-all ${activeTab === 'spa' ? 'bg-purple-600 text-white border-purple-500 shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-500/50 text-slate-700 dark:text-slate-300'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-sm font-medium ${activeTab === 'spa' ? 'text-purple-100' : 'text-gray-500'}`}>{t.spaRevenue}</p>
                            <h3 className="text-2xl font-bold mt-1">{fmt(totals.spa)}</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${activeTab === 'spa' ? 'bg-purple-500' : 'bg-purple-50 text-purple-600'}`}>
                            <Sparkles size={20} />
                        </div>
                    </div>
                </div>

                <div onClick={() => setActiveTab('minibar')} className={`cursor-pointer p-4 rounded-xl border transition-all ${activeTab === 'minibar' ? 'bg-amber-600 text-white border-amber-500 shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-500/50 text-slate-700 dark:text-slate-300'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-sm font-medium ${activeTab === 'minibar' ? 'text-amber-100' : 'text-gray-500'}`}>{t.minibarRevenue}</p>
                            <h3 className="text-2xl font-bold mt-1">{fmt(totals.minibar)}</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${activeTab === 'minibar' ? 'bg-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                            <Coffee size={20} />
                        </div>
                    </div>
                </div>

                <div onClick={() => setActiveTab('restaurant')} className={`cursor-pointer p-4 rounded-xl border transition-all ${activeTab === 'restaurant' ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 text-slate-700 dark:text-slate-300'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-sm font-medium ${activeTab === 'restaurant' ? 'text-emerald-100' : 'text-gray-500'}`}>{t.restaurantExtras}</p>
                            <h3 className="text-2xl font-bold mt-1">{fmt(totals.restaurant)}</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${activeTab === 'restaurant' ? 'bg-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
                            <UtensilsCrossed size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <BarChart3 size={20} className="text-gray-400" />
                        {activeTab === 'overview' ? e?.dailyTotalRev :
                            activeTab === 'spa' ? `${t.spaRevenue} Analizi` :
                                activeTab === 'minibar' ? `${t.minibarRevenue} Analizi` :
                                    `${t.restaurantExtras} Analizi`}
                    </h3>
                    <span className="text-xs font-bold px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-lg border border-cyan-200 dark:border-cyan-800">
                        Elektra PMS
                    </span>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {spaData.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 mb-2">{t.spaRevenue}</h4>
                                {renderChart(spaData, '#9333ea', t.spaRevenue)}
                            </div>
                        )}
                        {minibarData.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 mb-2">{t.minibarRevenue}</h4>
                                {renderChart(minibarData, '#d97706', t.minibarRevenue)}
                            </div>
                        )}
                        {restaurantData.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 mb-2">{t.restaurantExtras}</h4>
                                {renderChart(restaurantData, '#059669', t.restaurantExtras)}
                            </div>
                        )}
                        {spaData.length === 0 && minibarData.length === 0 && restaurantData.length === 0 && (
                            <div className="py-16 text-center text-slate-400">
                                <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
                                <p className="font-medium">{e?.noDataSelected}</p>
                                <p className="text-sm mt-1">{e?.pmsWaiting}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'spa' && (spaData.length > 0 ? renderChart(spaData, '#9333ea', t.spaRevenue) : <div className="py-16 text-center text-slate-400"><Sparkles size={48} className="mx-auto mb-4 opacity-30" /><p>{e?.noSpaData}</p></div>)}
                {activeTab === 'minibar' && (minibarData.length > 0 ? renderChart(minibarData, '#d97706', t.minibarRevenue) : <div className="py-16 text-center text-slate-400"><Coffee size={48} className="mx-auto mb-4 opacity-30" /><p>{e?.noMinibarData}</p></div>)}
                {activeTab === 'restaurant' && (restaurantData.length > 0 ? renderChart(restaurantData, '#059669', t.restaurantExtras) : <div className="py-16 text-center text-slate-400"><UtensilsCrossed size={48} className="mx-auto mb-4 opacity-30" /><p>{e?.noRestData}</p></div>)}
            </div>

            {/* Department Comparison */}
            {(spaData.length > 0 || minibarData.length > 0 || restaurantData.length > 0) && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                        <BarChart3 size={20} className="text-gray-400" /> {e?.deptComparison}
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={[
                            { name: 'SPA', value: Math.round(totals.spa), fill: '#9333ea' },
                            { name: 'Minibar', value: Math.round(totals.minibar), fill: '#d97706' },
                            { name: 'Restoran', value: Math.round(totals.restaurant), fill: '#059669' },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis fontSize={12} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                            <Tooltip formatter={(value: any) => [fmt(value), e?.revenue]} />
                            <Bar dataKey="value" name="Gelir" radius={[8, 8, 0, 0]}>
                                {[
                                    <rect key="spa" fill="#9333ea" />,
                                ].map(() => null)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        {[
                            { label: 'SPA', value: totals.spa, color: '#9333ea', pct: totals.all > 0 ? (totals.spa / totals.all * 100).toFixed(1) : '0' },
                            { label: 'Minibar', value: totals.minibar, color: '#d97706', pct: totals.all > 0 ? (totals.minibar / totals.all * 100).toFixed(1) : '0' },
                            { label: 'Restoran', value: totals.restaurant, color: '#059669', pct: totals.all > 0 ? (totals.restaurant / totals.all * 100).toFixed(1) : '0' },
                        ].map(d => (
                            <div key={d.label} className="text-center">
                                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: d.color }} />
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{d.label}</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{fmt(d.value)}</p>
                                <p className="text-[10px] text-slate-400">%{d.pct}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cross-Module Navigation */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-3">{e?.relatedModules}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { href: 'yield', label: 'Yield Management', desc: e?.yieldDesc, icon: TrendingUp },
                        { href: 'reports', label: '{t.reportsPage.managementReports}', desc: e?.reportsDesc, icon: BarChart3 },
                        { href: 'reservations', label: '{t.reservationsPage?.reservations}', desc: e?.reservationsDesc, icon: Calendar },
                        { href: 'purchasing', label: '{t.reportsPage.purchasingReports}', desc: e?.purchasingDesc, icon: DollarSign },
                    ].map((m, i) => (
                        <a key={i} href={`../${m.href}`} className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors group">
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
