'use client'

import { useState, useMemo } from 'react'
import {
    Sparkles, Coffee, UtensilsCrossed, TrendingUp, Calendar,
    DollarSign, BarChart3, Download
} from 'lucide-react'
import { AdminTranslations } from '@/lib/admin-translations'
import { DepartmentRevenue } from '@/lib/services/elektra'

interface Props {
    spaData: DepartmentRevenue[]
    minibarData: DepartmentRevenue[]
    restaurantData: DepartmentRevenue[]
    translations: AdminTranslations
}

export default function ExtrasClient({ spaData, minibarData, restaurantData, translations: t }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'spa' | 'minibar' | 'restaurant'>('overview')

    // Helper: Total Revenue
    const calcTotal = (data: DepartmentRevenue[]) => data.reduce((sum, d) => sum + d.revenue, 0)

    const totals = useMemo(() => ({
        spa: calcTotal(spaData),
        minibar: calcTotal(minibarData),
        restaurant: calcTotal(restaurantData),
        all: calcTotal(spaData) + calcTotal(minibarData) + calcTotal(restaurantData)
    }), [spaData, minibarData, restaurantData])

    // Helper: Format Money
    const fmt = (n: number, currency = 'EUR') => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
    }

    // Chart Renderer (Simple Bar)
    const renderChart = (data: DepartmentRevenue[], colorClass: string) => {
        const max = Math.max(...data.map(d => d.revenue)) || 1
        return (
            <div className="h-64 flex items-end gap-1 mt-6 pb-2 border-b dark:border-gray-700">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group relative min-w-[20px]">
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            {d.date}: {fmt(d.revenue, d.currency)}
                        </div>
                        <div
                            className={`w-full ${colorClass} rounded-t-sm transition-all hover:opacity-80 relative`}
                            style={{ height: `${(d.revenue / max) * 100}%` }}
                        >
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab('overview')} className={`cursor-pointer p-4 rounded-xl border transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white border-blue-500 shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}>
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

                <div onClick={() => setActiveTab('spa')} className={`cursor-pointer p-4 rounded-xl border transition-all ${activeTab === 'spa' ? 'bg-purple-600 text-white border-purple-500 shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}>
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

                <div onClick={() => setActiveTab('minibar')} className={`cursor-pointer p-4 rounded-xl border transition-all ${activeTab === 'minibar' ? 'bg-amber-600 text-white border-amber-500 shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-amber-300'}`}>
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

                <div onClick={() => setActiveTab('restaurant')} className={`cursor-pointer p-4 rounded-xl border transition-all ${activeTab === 'restaurant' ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-emerald-300'}`}>
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
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
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
                            <h4 className="text-sm font-bold text-gray-500 mb-2">{t.spaRevenue}</h4>
                            {renderChart(spaData, 'bg-purple-500')}
                        </div>
                    </div>
                )}

                {activeTab === 'spa' && renderChart(spaData, 'bg-purple-500')}
                {activeTab === 'minibar' && renderChart(minibarData, 'bg-amber-500')}
                {activeTab === 'restaurant' && renderChart(restaurantData, 'bg-emerald-500')}
            </div>
        </div>
    )
}
