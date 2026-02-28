'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    PhoneCall, Users, Clock, Loader2, ArrowUpRight, BarChart2, CheckCircle2, XCircle, TrendingUp
} from 'lucide-react'
import { AdminTranslations } from '@/lib/admin-translations'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts'
import DashboardFilter from '@/components/admin/DashboardFilter'
import { useSearchParams } from 'next/navigation'

interface Props {
    locale: string
    t: AdminTranslations
}

interface CallStat {
    AgentName: string
    AgentExtension: string
    TotalCalls: number
    TotalSeconds: number
}

interface ConversionStat {
    AgentName: string
    TotalOpportunities: number
    ConvertedSales: number
}

interface HourlyTrend {
    Hour: number
    CallCount: number
}

interface DailyTrend {
    Date: string
    CallCount: number
}

export default function CallCenterClient({ locale, t }: Props) {
    const [loading, setLoading] = useState(false)
    const [callStats, setCallStats] = useState<CallStat[]>([])
    const [conversionStats, setConversionStats] = useState<ConversionStat[]>([])
    const [hourlyTrend, setHourlyTrend] = useState<HourlyTrend[]>([])
    const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([])

    const searchParams = useSearchParams()
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    const fetchAnalysisData = useCallback(async () => {
        setLoading(true)
        try {
            let url = `/api/admin/asisia/call-center`
            const params = new URLSearchParams()
            if (fromDate) params.append('start', fromDate)
            if (toDate) params.append('end', toDate)
            if (params.toString()) url += `?${params.toString()}`

            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setCallStats(data.callStats || [])
                setConversionStats(data.conversionStats || [])
                setHourlyTrend(data.hourlyTrend || [])
                setDailyTrend(data.dailyTrend || [])
            }
        } catch (error) {
            console.error('Failed to fetch call center data:', error)
        }
        setLoading(false)
    }, [fromDate, toDate])

    useEffect(() => {
        fetchAnalysisData()
    }, [fetchAnalysisData])

    // Derive Merged Agent View
    const mergedAgents = React.useMemo(() => {
        // Collect all unique names
        const names = Array.from(new Set([
            ...callStats.map(s => s.AgentName),
            ...conversionStats.map(s => s.AgentName)
        ]));

        return names.map(name => {
            const calls = callStats.find(c => c.AgentName === name)
            const convs = conversionStats.find(c => c.AgentName === name)

            const opps = convs?.TotalOpportunities || 0
            const sales = convs?.ConvertedSales || 0
            const convRate = opps > 0 ? ((sales / opps) * 100).toFixed(1) : '0.0'

            return {
                name,
                extension: calls?.AgentExtension || '-',
                totalCalls: calls?.TotalCalls || 0,
                totalMinutes: calls ? Math.round(calls.TotalSeconds / 60) : 0,
                opportunities: opps,
                sales,
                conversionRate: parseFloat(convRate)
            }
        }).sort((a, b) => b.totalCalls - a.totalCalls)
    }, [callStats, conversionStats]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                        <PhoneCall className="text-cyan-600 dark:text-cyan-400" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Çağrı Merkezi & Agent Performansı</h1>
                        <p className="text-sm text-slate-500">Asisia PMS üzerinden canlı çağrı hacmi ve teklif dönüşüm oranları (CR)</p>
                    </div>
                </div>
                <DashboardFilter />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-cyan-500" size={32} />
                </div>
            ) : (
                <>
                    {/* Top KPI row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                                <PhoneCall className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Çağrı Hacmi</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {mergedAgents.reduce((sum, a) => sum + a.totalCalls, 0).toLocaleString('tr-TR')}
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
                                <CheckCircle2 className="text-amber-600 dark:text-amber-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Gönderilen Teklif (Quote)</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {mergedAgents.reduce((sum, a) => sum + a.opportunities, 0).toLocaleString('tr-TR')}
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center shrink-0">
                                <ArrowUpRight className="text-emerald-600 dark:text-emerald-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Satış (Converted)</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {mergedAgents.reduce((sum, a) => sum + a.sales, 0).toLocaleString('tr-TR')}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Agent Table & Charts */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Users size={18} className="text-cyan-500" />
                                    Agent (Temsilci) Performans Tablosu
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Temsilci</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Dahili / SIP</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Karşılanan Çağrı</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Konuşma (Dk)</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Toplam Teklif</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Dönüşen (Satış)</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">CR (Dönüşüm %)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {mergedAgents.length === 0 ? (
                                            <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Seçili tarihlerde veri bulunamadı.</td></tr>
                                        ) : mergedAgents.map((agent, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{agent.name}</td>
                                                <td className="px-6 py-4 text-slate-500"><code>{agent.extension}</code></td>
                                                <td className="px-6 py-4">{agent.totalCalls.toLocaleString('tr-TR')}</td>
                                                <td className="px-6 py-4">{agent.totalMinutes.toLocaleString('tr-TR')} Dk</td>
                                                <td className="px-6 py-4 text-amber-600 font-medium">{agent.opportunities}</td>
                                                <td className="px-6 py-4 text-emerald-600 font-medium">{agent.sales}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${agent.conversionRate > 20 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                                style={{ width: `${Math.min(agent.conversionRate, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-bold text-slate-700 dark:text-slate-300">%{agent.conversionRate}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Conversions Chart */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <BarChart2 size={18} className="text-purple-500" />
                                Agent Teklif Dönüşümü (Top 5)
                            </h3>
                            <div className="flex-1 min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mergedAgents.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.2} />
                                        <XAxis type="number" axisLine={false} tickLine={false} />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={90} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Legend />
                                        <Bar dataKey="opportunities" name="Teklif" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="sales" name="Satış" fill="#10b981" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    {/* Trend Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Clock size={18} className="text-cyan-500" />
                                Saatlik Çağrı Dağılımı
                            </h3>
                            <div className="flex-1 min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                        <XAxis dataKey="Hour" axisLine={false} tickLine={false} tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                        <Tooltip cursor={{ fill: '#0a84ff10' }} contentStyle={{ borderRadius: '12px', border: 'none' }} labelFormatter={(h) => `${h}:00 - ${Number(h) + 1}:00`} />
                                        <Bar dataKey="CallCount" name="Çağrı Sayısı" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <TrendingUp size={18} className="text-indigo-500" />
                                Günlük Çağrı Trendi
                            </h3>
                            <div className="flex-1 min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                        <XAxis dataKey="Date" axisLine={false} tickLine={false} tickFormatter={(d) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} tick={{ fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} labelFormatter={(d) => new Date(d).toLocaleDateString('tr-TR')} />
                                        <Line type="monotone" dataKey="CallCount" name="Çağrı Sayısı" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
