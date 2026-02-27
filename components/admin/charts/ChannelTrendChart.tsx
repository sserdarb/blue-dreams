'use client'

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { SalesData } from '@/lib/services/elektra'

interface ChannelTrendChartProps {
    data: SalesData[]
    channel: 'web' | 'callCenter' | 'ota' | 'tourOperator' | 'direct'
    color: string
}

export function ChannelTrendChart({ data, channel, color }: ChannelTrendChartProps) {
    // Format dates for X-axis (e.g., "DD MMM")
    const formattedData = data.map(d => {
        const date = new Date(d.date)
        return {
            ...d,
            displayDate: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
        }
    })

    // Format currency
    const formatYAxis = (tickItem: number) => {
        if (tickItem === 0) return '0'
        if (tickItem >= 1000000) return `₺${(tickItem / 1000000).toFixed(1)}M`
        if (tickItem >= 1000) return `₺${(tickItem / 1000).toFixed(0)}K`
        return `₺${tickItem}`
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700">
                    <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-slate-600 dark:text-slate-400">Hacim:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                            ₺{payload[0].value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
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
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748B' }}
                        tickFormatter={formatYAxis}
                        width={60}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                        type="monotone"
                        dataKey={channel}
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill={`url(#color${channel})`}
                        activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
