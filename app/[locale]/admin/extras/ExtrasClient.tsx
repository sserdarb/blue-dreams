'use client'

import { useState, useMemo } from 'react'
import {
    Sparkles, Coffee, UtensilsCrossed, TrendingUp, Calendar,
    DollarSign, BarChart3, Download, ArrowRightLeft
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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

export default function ExtrasClient({ spaData, minibarData, restaurantData, translations: t, error }: Props) {
    if (error) {
        return <ModuleOffline moduleName="Ekstra Satışlar" dataSource="elektra" offlineReason={error} />
    }

    const [activeTab, setActiveTab] = useState<'overview' | 'spa' | 'minibar' | 'restaurant'>('overview')
    const [currency, setCurrency] = useState<'TRY' | 'EUR'>('EUR')

    const RATES = { EUR: 1, TRY: 38.5 } // Fixed rates for demo/speed or fetch from prop if available

    // Helper: Convert
    const convert = (amount: number, fromCurrency: string) => {
        let inEur = amount
        if (fromCurrency === 'TRY') inEur = amount / 38.5
        if (currency === 'EUR') return inEur
        return inEur * 38.5
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
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
                <button
                    onClick={() => setCurrency(prev => prev === 'EUR' ? 'TRY' : 'EUR')}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <ArrowRightLeft size={16} />
                    <span className="font-bold">{currency}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab('overview')} className={`cursor-pointer p-4 rounded-xl border transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white border-blue-500 shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500/50 text-slate-700 dark:text-slate-300'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-sm font-medium ${activeTab === 'overview' ? 'text-blue-100' : 'text-gray-500'}`}>Toplam Ekstra</p>
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
                        {activeTab === 'overview' ? 'Günlük Toplam Gelir' :
                            activeTab === 'spa' ? `${t.spaRevenue} Analizi` :
                                activeTab === 'minibar' ? `${t.minibarRevenue} Analizi` :
                                    `${t.restaurantExtras} Analizi`}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg border border-green-200">
                            Canlı Veri (Simüle)
                        </span>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-sm font-bold text-slate-400 mb-2">{t.spaRevenue}</h4>
                            {renderChart(spaData, '#9333ea', t.spaRevenue)}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-400 mb-2">{t.minibarRevenue}</h4>
                            {renderChart(minibarData, '#d97706', t.minibarRevenue)}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-400 mb-2">{t.restaurantExtras}</h4>
                            {renderChart(restaurantData, '#059669', t.restaurantExtras)}
                        </div>
                    </div>
                )}

                {activeTab === 'spa' && renderChart(spaData, '#9333ea', t.spaRevenue)}
                {activeTab === 'minibar' && renderChart(minibarData, '#d97706', t.minibarRevenue)}
                {activeTab === 'restaurant' && renderChart(restaurantData, '#059669', t.restaurantExtras)}
            </div>
        </div>
    )
}
