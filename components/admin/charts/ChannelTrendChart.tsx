'use client'

import {
    ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Bar, Line, Legend
} from 'recharts'
import { SalesData } from '@/lib/services/elektra'

interface ChannelTrendChartProps {
    data: SalesData[]
    channel: 'web' | 'callCenter' | 'ota' | 'tourOperator' | 'direct'
    color: string
    currency?: 'TRY' | 'EUR' | 'USD'
    exchangeRate?: number
}

export function ChannelTrendChart({ data, channel, color, currency = 'TRY', exchangeRate = 38.5 }: ChannelTrendChartProps) {
    const symbol = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : '₺')
    const divisor = currency === 'TRY' ? 1 : (currency === 'EUR' ? exchangeRate : 35.7)

    // Format dates for X-axis and convert currency
    const formattedData = data.map(d => {
        const date = new Date(d.date)
        const prefix = channel === 'tourOperator' ? 'tourOp' : channel
        return {
            ...d,
            revenue: d[channel as keyof SalesData] as number / divisor,
            resCount: d[`${prefix}Res` as keyof SalesData] as number,
            rnCount: d[`${prefix}RN` as keyof SalesData] as number,
            displayDate: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
        }
    })

    // Format currency
    const formatYAxis = (tickItem: number) => {
        if (tickItem === 0) return '0'
        if (tickItem >= 1000000) return `${symbol}${(tickItem / 1000000).toFixed(1)}M`
        if (tickItem >= 1000) return `${symbol}${(tickItem / 1000).toFixed(0)}K`
        return `${symbol}${tickItem.toFixed(0)}`
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 z-50">
                    <p className="font-medium text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-100 dark:border-slate-700 pb-1">{label}</p>
                    <div className="space-y-1">
                        {payload.map((p: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.color }} />
                                    <span className="text-slate-600 dark:text-slate-400 capitalize">{p.name}:</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {p.dataKey === 'revenue'
                                        ? `${symbol}${Number(p.value).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
                                        : Number(p.value).toLocaleString('tr-TR')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={formattedData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id={`color${channel}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700/50" />
                    <XAxis
                        dataKey="displayDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748B' }}
                        dy={10}
                        minTickGap={20}
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748B' }}
                        tickFormatter={formatYAxis}
                        width={60}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        width={40}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent', stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />

                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="Ciro"
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill={`url(#color${channel})`}
                        activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                    />
                    <Bar yAxisId="right" dataKey="resCount" name="Rez. Adeti" fill="#94a3b8" barSize={20} radius={[4, 4, 0, 0]} opacity={0.6} />
                    <Line yAxisId="right" type="monotone" dataKey="rnCount" name="Room Night" stroke="#e2e8f0" strokeWidth={2} dot={{ r: 3, fill: '#e2e8f0' }} />

                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}
