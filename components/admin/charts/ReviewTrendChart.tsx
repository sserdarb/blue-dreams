'use client'

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { GuestReview } from '@/lib/services/elektra'

interface ReviewTrendChartProps {
    data: GuestReview[]
}

export function ReviewTrendChart({ data }: ReviewTrendChartProps) {
    // Aggregate daily averages
    const byDate = new Map<string, { totalScore: number; count: number }>()

    data.forEach((review) => {
        if (!review.date) return
        const dateStr = review.date.slice(0, 10)
        if (!byDate.has(dateStr)) {
            byDate.set(dateStr, { totalScore: 0, count: 0 })
        }
        const entry = byDate.get(dateStr)!
        entry.totalScore += review.rating
        entry.count += 1
    })

    const formattedData = Array.from(byDate.entries())
        .map(([date, stats]) => ({
            date,
            displayDate: new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
            avgRating: Number((stats.totalScore / stats.count).toFixed(1))
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700">
                    <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500" />
                        <span className="text-slate-600 dark:text-slate-400">Ortalama Puan:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                            {payload[0].value} / 10
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
                        <linearGradient id="colorReview" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
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
                        domain={[0, 10]}
                        width={30}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                        type="monotone"
                        dataKey="avgRating"
                        stroke="#ec4899"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorReview)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#ec4899' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
