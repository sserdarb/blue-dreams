'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { SalesData } from '@/lib/services/elektra'

interface SalesChartProps {
    data: SalesData[]
    currency?: 'TRY' | 'EUR' | 'USD'
    exchangeRate?: number // EUR_TO_TRY rate
}

const CURRENCY_SYMBOLS: Record<string, string> = {
    TRY: '₺',
    EUR: '€',
    USD: '$',
}

export function SalesChart({ data, currency = 'TRY', exchangeRate = 38.5 }: SalesChartProps) {
    const symbol = CURRENCY_SYMBOLS[currency] || '₺'
    const divisor = currency === 'TRY' ? 1 : exchangeRate

    // Convert data if not TRY
    const chartData = currency === 'TRY' ? data : data.map(d => ({
        ...d,
        web: d.web / divisor,
        callCenter: d.callCenter / divisor,
        ota: d.ota / divisor,
        tourOperator: d.tourOperator / divisor,
        direct: d.direct / divisor,
    }))

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorTourOp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOTA" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCall" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorWeb" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${symbol}${(value / 1000).toFixed(0)}k`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
                                        <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
                                        {payload.map((p: any, index: number) => (
                                            <div key={index} className="flex items-center gap-2 text-xs mb-1">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                                <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
                                                <span className="font-bold text-slate-900 dark:text-white ml-auto">
                                                    {symbol}{Number(p.value).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="tourOperator" stackId="1" stroke="#8b5cf6" fill="url(#colorTourOp)" name="Tur Operatörü" />
                    <Area type="monotone" dataKey="ota" stackId="1" stroke="#f59e0b" fill="url(#colorOTA)" name="OTA" />
                    <Area type="monotone" dataKey="callCenter" stackId="1" stroke="#0ea5e9" fill="url(#colorCall)" name="Call Center" />
                    <Area type="monotone" dataKey="web" stackId="1" stroke="#ec4899" fill="url(#colorWeb)" name="Website" />
                    <Area type="monotone" dataKey="direct" stackId="1" stroke="#10b981" fill="url(#colorDirect)" name="Direkt" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
