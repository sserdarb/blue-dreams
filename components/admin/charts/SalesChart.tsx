'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { SalesData } from '@/lib/services/elektra'

export function SalesChart({ data }: { data: SalesData[] }) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                        formatter={(value: any) => `₺${Number(value).toLocaleString('tr-TR')}`}
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
