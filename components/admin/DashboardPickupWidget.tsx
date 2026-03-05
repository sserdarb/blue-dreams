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
    recentPickups: { resNo: string, guestName: string, checkIn: string, price: number, currency: string, isCancelled: boolean }[]
    majorImpacts: { resNo: string, guestName: string, checkIn: string, price: number, currency: string, isCancelled: boolean }[]
}

interface DashboardPickupWidgetProps {
    data: PickupStats
    currency?: 'TRY' | 'EUR' | 'USD'
    exchangeRate?: number
}

export default function DashboardPickupWidget({ data, currency = 'TRY', exchangeRate = 38.5 }: DashboardPickupWidgetProps) {
    if (!data) return null;

    const symbol = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : '₺')
    const usdRate = 35.7
    const divisor = currency === 'TRY' ? 1 : (currency === 'EUR' ? exchangeRate : usdRate)

    const convertPrice = (price: number, nativeCurrency: string) => {
        let p = price
        nativeCurrency = (nativeCurrency || 'EUR').trim()
        if (currency === 'TRY') {
            return nativeCurrency === 'EUR' ? p * exchangeRate : (nativeCurrency === 'USD' ? p * usdRate : p)
        } else if (currency === 'EUR') {
            return nativeCurrency === 'TRY' ? p / exchangeRate : (nativeCurrency === 'USD' ? (p * usdRate) / exchangeRate : p)
        } else if (currency === 'USD') {
            return nativeCurrency === 'TRY' ? p / usdRate : (nativeCurrency === 'EUR' ? (p * exchangeRate) / usdRate : p)
        }
        return p
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Trend Chart */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
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
                                {symbol}{(data.revenue / divisor).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
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
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={18} className="text-emerald-500" />
                        <h3 className="font-bold text-slate-900 dark:text-white">Pozitif Etki (En Yüksek Ciro)</h3>
                    </div>
                    {data.majorImpacts.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">Bu aralıkta büyük etkili rezervasyon bulunamadı.</p>
                    ) : (
                        <div className="space-y-3">
                            {data.majorImpacts.map((imp, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-sm">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">{imp.guestName}</p>
                                        <p className="text-xs text-slate-500">Giriş: {new Date(imp.checkIn).toLocaleDateString('tr-TR')} • {imp.resNo}</p>
                                    </div>
                                    <div className="text-right text-emerald-600 dark:text-emerald-400 font-bold">
                                        +{convertPrice(imp.price || 0, imp.currency).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} {symbol}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={18} className="text-blue-500" />
                        <h3 className="font-bold text-slate-900 dark:text-white">Son Hareketler</h3>
                    </div>
                    {data.recentPickups.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">Son hareket bulunmuyor.</p>
                    ) : (
                        <div className="space-y-3">
                            {data.recentPickups.slice(0, 4).map((rec, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        {rec.isCancelled ?
                                            <TrendingDown size={14} className="text-red-500 flex-shrink-0" /> :
                                            <TrendingUp size={14} className="text-emerald-500 flex-shrink-0" />
                                        }
                                        <span className={`truncate max-w-[100px] ${rec.isCancelled ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white font-medium'}`}>
                                            {rec.guestName}
                                        </span>
                                    </div>
                                    <div className={`text-right font-semibold ${rec.isCancelled ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                        {rec.isCancelled ? '-' : ''}{convertPrice(rec.price || 0, rec.currency).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} {symbol}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}
