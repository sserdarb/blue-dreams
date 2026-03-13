'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Clock, Activity, AlertCircle } from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface PickupStats {
    newReservations: number
    cancelledReservations: number
    netPickup: number
    revenue: number
    dailyTrend: { date: string, new: number, cancelled: number }[]
    recentPickups: { resNo: string, guestName: string, checkIn: string, price: number, currency: string, isCancelled: boolean }[] // legacy
    majorImpacts: { resNo: string, guestName: string, checkIn: string, price: number, currency: string, isCancelled: boolean }[] // legacy
    agencyImpacts: { name: string, pickupRevenue: number }[]
}

interface DashboardPickupWidgetProps {
    data: PickupStats
    currency?: 'TRY' | 'EUR' | 'USD'
    exchangeRate?: number
    usdRate?: number
}

export default function DashboardPickupWidget({ data, currency = 'TRY', exchangeRate, usdRate = 1 }: DashboardPickupWidgetProps) {
    if (!data) return null;

    const symbol = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : '₺')
    const divisor = currency === 'TRY' ? 1 : (currency === 'EUR' ? exchangeRate : usdRate)

    const convertPrice = (price: number, nativeCurrency: string) => {
        let p = price
        nativeCurrency = (nativeCurrency || 'EUR').trim()

        const rate = exchangeRate || 1; // Live rate from API
        if (currency === 'TRY') {
            return nativeCurrency === 'EUR' ? p * rate : (nativeCurrency === 'USD' ? p * usdRate : p)
        } else if (currency === 'EUR') {
            return nativeCurrency === 'TRY' ? p / rate : (nativeCurrency === 'USD' ? (p * usdRate) / rate : p)
        } else if (currency === 'USD') {
            return nativeCurrency === 'TRY' ? p / usdRate : (nativeCurrency === 'EUR' ? (p * rate) / usdRate : p)
        }
        return p
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Trend Chart */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm lg:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
                    <div className="flex items-center gap-2">
                        <Activity size={20} className="text-blue-500" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gelişim (Pickup) Trendi</h2>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Net Pickup</p>
                            <p className={`text-lg font-bold ${data.netPickup >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {data.netPickup > 0 ? '+' : ''}{data.netPickup} Rez.
                            </p>
                        </div>
                        <div className="text-right border-l md:border-l-0 border-slate-200 dark:border-white/10 pl-4">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Ciro Etkisi</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {symbol}{(data.revenue / (divisor || 1)).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCancel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(val) => {
                                    const d = new Date(val);
                                    return `${d.getDate()}/${d.getMonth() + 1}`;
                                }}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(val) => new Date(val as string).toLocaleDateString('tr-TR')}
                            />
                            <Area type="monotone" name="Yeni Rezervasyon" dataKey="new" stroke="#10b981" fillOpacity={1} fill="url(#colorNew)" strokeWidth={2} />
                            <Area type="monotone" name="İptal" dataKey="cancelled" stroke="#ef4444" fillOpacity={1} fill="url(#colorCancel)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Impact Tables */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-0 shadow-sm overflow-hidden flex flex-col">
                {/* Positive Impact */}
                <div className="p-5 flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-emerald-500" />
                            <h3 className="font-bold text-slate-900 dark:text-white">Pozitif Etki (Ciro Artışı)</h3>
                        </div>
                    </div>
                    {data.agencyImpacts?.filter(a => a.pickupRevenue > 0).length === 0 ? (
                        <p className="text-sm text-slate-500 py-2">Pozitif etki eden acente bulunamadı.</p>
                    ) : (
                        <div className="space-y-3">
                            {data.agencyImpacts?.filter(a => a.pickupRevenue > 0).slice(0, 5).map((imp, idx) => (
                                <div key={idx} className="flex justify-between items-center group p-1.5 -mx-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate pr-2">{imp.name}</span>
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        +{symbol}{imp.pickupRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Negative Impact */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-red-50/30 dark:bg-red-900/10 flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingDown size={18} className="text-red-500" />
                            <h3 className="font-bold text-slate-900 dark:text-white">Negatif Etki (İptal / Kayıp)</h3>
                        </div>
                    </div>
                    {data.agencyImpacts?.filter(a => a.pickupRevenue < 0).length === 0 ? (
                        <p className="text-sm text-slate-500 py-2">Negatif etki eden acente bulunamadı.</p>
                    ) : (
                        <div className="space-y-3">
                            {data.agencyImpacts?.filter(a => a.pickupRevenue < 0).sort((a, b) => a.pickupRevenue - b.pickupRevenue).slice(0, 5).map((imp, idx) => (
                                <div key={idx} className="flex justify-between items-center group p-1.5 -mx-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate pr-2">{imp.name}</span>
                                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                        {symbol}{imp.pickupRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}
