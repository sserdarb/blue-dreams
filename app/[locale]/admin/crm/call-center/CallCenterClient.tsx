'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    PhoneCall, Users, Clock, Loader2, ArrowUpRight, BarChart2, CheckCircle2, XCircle, TrendingUp, Settings2,
    PhoneMissed, DollarSign, PieChart as PieChartIcon, Target
} from 'lucide-react'
import { AdminTranslations } from '@/lib/admin-translations'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import DashboardFilter from '@/components/admin/DashboardFilter'
import { useSearchParams } from 'next/navigation'
import FormulaEditorModal, { FormulaData } from '@/components/admin/reports/FormulaEditorModal'
import { evaluateFormula } from '@/lib/utils/formula'

interface Props {
    locale: string
    t: AdminTranslations
}

interface CallStat {
    AgentName: string
    AgentExtension: string
    TotalCalls: number
    TotalSeconds: number
    AvgDuration: number
    MissedCalls: number
    AnsweredCalls: number
}

interface ConversionStat {
    AgentName: string
    TotalQuotes: number
    ConvertedSales: number
    CancelledRequests: number
}

interface AgentRevenue {
    AgentName: string
    TotalRevenue: number
    ReservationCount: number
    AvgDealValue: number
}

interface HourlyTrend {
    Hour: number
    CallCount: number
    MissedCount: number
}

interface DailyTrend {
    Date: string
    CallCount: number
    MissedCount: number
    AnsweredCount: number
}

interface SourceAttribution {
    Source: string
    ReservationCount: number
    Revenue: number
}

interface CallSummary {
    totalCalls: number
    answeredCalls: number
    missedCalls: number
    missedRate: string
    avgDurationSeconds: number
}

const TAB_OPTIONS = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart2 },
    { id: 'agents', label: 'Agent Performansı', icon: Users },
    { id: 'quality', label: 'Çağrı Kalitesi', icon: PhoneCall },
    { id: 'attribution', label: 'Kaynak Analizi', icon: PieChartIcon },
]

const SOURCE_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#3b82f6', '#f97316']

export default function CallCenterClient({ locale, t }: Props) {
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')
    const [callStats, setCallStats] = useState<CallStat[]>([])
    const [conversionStats, setConversionStats] = useState<ConversionStat[]>([])
    const [agentRevenue, setAgentRevenue] = useState<AgentRevenue[]>([])
    const [hourlyTrend, setHourlyTrend] = useState<HourlyTrend[]>([])
    const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([])
    const [sourceAttribution, setSourceAttribution] = useState<SourceAttribution[]>([])
    const [summary, setSummary] = useState<CallSummary>({ totalCalls: 0, answeredCalls: 0, missedCalls: 0, missedRate: '0', avgDurationSeconds: 0 })

    // Formula State
    const [isFormulaEditorOpen, setIsFormulaEditorOpen] = useState(false)
    const [formulas, setFormulas] = useState<Record<string, FormulaData>>({})

    const searchParams = useSearchParams()
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    const fetchAnalysisData = useCallback(async () => {
        setLoading(true)
        try {
            let url = `/api/admin/asisia/call-center`
            const params = new URLSearchParams()

            if (fromDate) {
                params.append('start', fromDate)
            } else {
                const d = new Date()
                d.setDate(d.getDate() - 7)
                params.append('start', d.toISOString().split('T')[0])
            }

            if (toDate) {
                params.append('end', toDate)
            } else {
                params.append('end', new Date().toISOString().split('T')[0])
            }

            if (params.toString()) url += `?${params.toString()}`

            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setCallStats(data.callStats || [])
                setConversionStats(data.conversionStats || [])
                setAgentRevenue(data.agentRevenue || [])
                setHourlyTrend(data.hourlyTrend || [])
                setDailyTrend(data.dailyTrend || [])
                setSourceAttribution(data.sourceAttribution || [])
                setSummary(data.summary || { totalCalls: 0, answeredCalls: 0, missedCalls: 0, missedRate: '0', avgDurationSeconds: 0 })
            }
        } catch (error) {
            console.error('Failed to fetch call center data:', error)
        }
        setLoading(false)
    }, [fromDate, toDate])

    useEffect(() => {
        fetchAnalysisData()

        fetch('/api/admin/formulas?reportId=call-center')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.formulas) {
                    const map: Record<string, FormulaData> = {}
                    data.formulas.forEach((f: FormulaData) => { map[f.metricName] = f })
                    setFormulas(map)
                }
            })
            .catch(err => console.error("Error fetching formulas", err))
    }, [fetchAnalysisData])

    // Derive Merged Agent View
    const mergedAgents = React.useMemo(() => {
        const names = Array.from(new Set([
            ...callStats.map(s => s.AgentName),
            ...conversionStats.map(s => s.AgentName)
        ]));

        return names.map(name => {
            const calls = callStats.find(c => c.AgentName === name)
            const convs = conversionStats.find(c => c.AgentName === name)
            const rev = agentRevenue.find(r => r.AgentName === name)

            const quotes = convs?.TotalQuotes || 0
            const sales = convs?.ConvertedSales || 0
            const cancelled = convs?.CancelledRequests || 0
            const totalCalls = calls?.TotalCalls || 0
            const totalSeconds = calls?.TotalSeconds || 0
            const missedCalls = calls?.MissedCalls || 0
            const answeredCalls = calls?.AnsweredCalls || 0

            const variables = {
                opportunities: quotes,
                sales: sales,
                total_calls: totalCalls,
                total_seconds: totalSeconds,
            }

            let finalConvRate = quotes > 0 ? ((sales / quotes) * 100) : 0
            if (formulas["Conversion Rate"]?.expression) {
                finalConvRate = evaluateFormula(formulas["Conversion Rate"].expression, variables)
            }

            let finalAht = answeredCalls > 0 ? (totalSeconds / answeredCalls) : 0
            if (formulas["AHT"]?.expression) {
                finalAht = evaluateFormula(formulas["AHT"].expression, variables)
            }

            return {
                name,
                extension: calls?.AgentExtension || '-',
                totalCalls,
                answeredCalls,
                missedCalls,
                totalMinutes: Math.round(totalSeconds / 60),
                aht: Math.round(finalAht),
                quotes,
                sales,
                cancelled,
                conversionRate: parseFloat(finalConvRate.toFixed(1)),
                missedRate: totalCalls > 0 ? parseFloat(((missedCalls / totalCalls) * 100).toFixed(1)) : 0,
                revenue: rev?.TotalRevenue || 0,
                reservationCount: rev?.ReservationCount || 0,
                avgDealValue: rev?.AvgDealValue || 0,
            }
        }).sort((a, b) => b.totalCalls - a.totalCalls)
    }, [callStats, conversionStats, agentRevenue, formulas]);

    const fmtDuration = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                        <PhoneCall className="text-cyan-600 dark:text-cyan-400" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Çağrı Merkezi & Agent Performansı</h1>
                        <p className="text-sm text-slate-500">Asisia PMS üzerinden canlı çağrı hacmi, ciro ve dönüşüm oranları</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFormulaEditorOpen(true)}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Settings2 size={16} />
                        Formül Düzenle
                    </button>
                    <DashboardFilter />
                </div>
            </div>

            <FormulaEditorModal
                reportId="call-center"
                isOpen={isFormulaEditorOpen}
                onClose={() => setIsFormulaEditorOpen(false)}
                currentFormulas={formulas}
                onSave={(newFormulas) => setFormulas(newFormulas)}
                availableVariables={['opportunities', 'sales', 'total_calls', 'total_seconds']}
            />

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                {TAB_OPTIONS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-cyan-500" size={32} />
                </div>
            ) : (
                <>
                    {/* ─── TAB: OVERVIEW ─── */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Top KPI row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                <KpiCard icon={PhoneCall} color="blue" label="Toplam Çağrı" value={summary.totalCalls.toLocaleString('tr-TR')} />
                                <KpiCard icon={CheckCircle2} color="emerald" label="Cevaplanan" value={summary.answeredCalls.toLocaleString('tr-TR')} />
                                <KpiCard icon={PhoneMissed} color="red" label="Cevapsız" value={`${summary.missedCalls} (%${summary.missedRate})`} />
                                <KpiCard icon={Clock} color="purple" label="Ort. Süre" value={fmtDuration(summary.avgDurationSeconds)} />
                                <KpiCard icon={Target} color="amber" label="Teklif Sayısı" value={mergedAgents.reduce((s, a) => s + a.quotes, 0).toLocaleString('tr-TR')} />
                                <KpiCard icon={ArrowUpRight} color="cyan" label="Satış (CR)" value={mergedAgents.reduce((s, a) => s + a.sales, 0).toLocaleString('tr-TR')} />
                                <KpiCard icon={DollarSign} color="emerald" label="Çağrı Başı Gelir" value={`₺${summary.totalCalls > 0 ? Math.round(mergedAgents.reduce((s, a) => s + a.revenue, 0) / summary.totalCalls).toLocaleString('tr-TR') : 0}`} />
                            </div>

                            {/* Agent Table */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Users size={18} className="text-cyan-500" />
                                        Agent Performans Tablosu
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                                            <tr>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Temsilci</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Dahili</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Çağrı</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Cevaplanan</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Cevapsız</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">AHT</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Teklif</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Satış</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">CR%</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {mergedAgents.length === 0 ? (
                                                <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-500">Seçili tarihlerde veri bulunamadı.</td></tr>
                                            ) : mergedAgents.map((agent, i) => (
                                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{agent.name}</td>
                                                    <td className="px-5 py-3 text-slate-500"><code>{agent.extension}</code></td>
                                                    <td className="px-5 py-3">{agent.totalCalls.toLocaleString('tr-TR')}</td>
                                                    <td className="px-5 py-3 text-emerald-600">{agent.answeredCalls}</td>
                                                    <td className="px-5 py-3 text-red-500">{agent.missedCalls}</td>
                                                    <td className="px-5 py-3">
                                                        <span className="inline-flex items-center py-1 px-2 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                            {fmtDuration(agent.aht)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-amber-600 font-medium">{agent.quotes}</td>
                                                    <td className="px-5 py-3 text-emerald-600 font-medium">{agent.sales}</td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-14 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${agent.conversionRate > 20 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(agent.conversionRate, 100)}%` }} />
                                                            </div>
                                                            <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">%{agent.conversionRate}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Trend Charts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Clock size={18} className="text-cyan-500" />
                                        Saatlik Çağrı Dağılımı
                                    </h3>
                                    <div className="h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={hourlyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                                <XAxis dataKey="Hour" axisLine={false} tickLine={false} tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 11 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} labelFormatter={(h) => `${h}:00 - ${Number(h) + 1}:00`} />
                                                <Legend />
                                                <Bar dataKey="CallCount" name="Cevaplanan" fill="#0ea5e9" radius={[4, 4, 0, 0]} stackId="a" />
                                                <Bar dataKey="MissedCount" name="Cevapsız" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <TrendingUp size={18} className="text-indigo-500" />
                                        Günlük Çağrı Trendi
                                    </h3>
                                    <div className="h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                                <XAxis dataKey="Date" axisLine={false} tickLine={false} tickFormatter={(d) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} tick={{ fontSize: 11 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} labelFormatter={(d) => new Date(d).toLocaleDateString('tr-TR')} />
                                                <Legend />
                                                <Area type="monotone" dataKey="AnsweredCount" name="Cevaplanan" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
                                                <Area type="monotone" dataKey="MissedCount" name="Cevapsız" stroke="#ef4444" fill="#ef444420" strokeWidth={2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ─── TAB: AGENTS (Performans) ─── */}
                    {activeTab === 'agents' && (
                        <>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Agent Revenue Table */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                    <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <DollarSign size={18} className="text-emerald-500" />
                                            Agent Ciro Performansı
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                                                <tr>
                                                    <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Agent</th>
                                                    <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Toplam Ciro</th>
                                                    <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Rez. Sayısı</th>
                                                    <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Ort. Deal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                {mergedAgents.filter(a => a.revenue > 0).sort((a, b) => b.revenue - a.revenue).map((agent, i) => (
                                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                                        <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{agent.name}</td>
                                                        <td className="px-5 py-3 text-emerald-600 font-bold">₺{agent.revenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
                                                        <td className="px-5 py-3">{agent.reservationCount}</td>
                                                        <td className="px-5 py-3">₺{agent.avgDealValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
                                                    </tr>
                                                ))}
                                                {mergedAgents.filter(a => a.revenue > 0).length === 0 && (
                                                    <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">Ciro verisi bulunamadı.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Conversions Chart */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <BarChart2 size={18} className="text-purple-500" />
                                        Agent Teklif → Satış Dönüşümü (Top 8)
                                    </h3>
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={mergedAgents.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.2} />
                                                <XAxis type="number" axisLine={false} tickLine={false} />
                                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={100} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                                <Legend />
                                                <Bar dataKey="quotes" name="Teklif" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                                <Bar dataKey="sales" name="Satış" fill="#10b981" radius={[0, 4, 4, 0]} />
                                                <Bar dataKey="cancelled" name="İptal" fill="#ef4444" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ─── TAB: QUALITY (Çağrı Kalitesi) ─── */}
                    {activeTab === 'quality' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <KpiCard icon={PhoneCall} color="blue" label="Cevaplama Oranı" value={`%${summary.totalCalls > 0 ? ((summary.answeredCalls / summary.totalCalls) * 100).toFixed(1) : '0'}`} />
                                <KpiCard icon={PhoneMissed} color="red" label="Cevapsız Oranı" value={`%${summary.missedRate}`} />
                                <KpiCard icon={Clock} color="purple" label="Ort. Yanıt Süresi" value={fmtDuration(summary.avgDurationSeconds)} />
                                <KpiCard icon={TrendingUp} color="cyan" label="En Yoğun Saat" value={hourlyTrend.length > 0 ? `${hourlyTrend.reduce((max, h) => h.CallCount > max.CallCount ? h : max, hourlyTrend[0]).Hour}:00` : '—'} />
                            </div>

                            {/* Missed Call Heatmap by Agent */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <PhoneMissed size={18} className="text-red-500" />
                                        Agent Cevapsız Çağrı Analizi
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                                            <tr>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Agent</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Toplam</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Cevaplanan</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Cevapsız</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Cevapsız %</th>
                                                <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Toplam Konuşma</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {mergedAgents.sort((a, b) => b.missedRate - a.missedRate).map((agent, i) => (
                                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{agent.name}</td>
                                                    <td className="px-5 py-3">{agent.totalCalls}</td>
                                                    <td className="px-5 py-3 text-emerald-600">{agent.answeredCalls}</td>
                                                    <td className="px-5 py-3 text-red-500 font-bold">{agent.missedCalls}</td>
                                                    <td className="px-5 py-3">
                                                        <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-bold ${agent.missedRate > 30 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : agent.missedRate > 15 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                                            %{agent.missedRate}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">{agent.totalMinutes} dk</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ─── TAB: ATTRIBUTION (Kaynak Analizi) ─── */}
                    {activeTab === 'attribution' && (
                        <>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Source Pie Chart */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <PieChartIcon size={18} className="text-cyan-500" />
                                        Rezervasyon Kaynağı Dağılımı
                                    </h3>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={sourceAttribution.map(s => ({ name: s.Source, value: s.ReservationCount }))}
                                                    cx="50%" cy="50%"
                                                    innerRadius={60} outerRadius={110}
                                                    dataKey="value"
                                                    label={({ name, percent }: any) => `${name} %${((percent || 0) * 100).toFixed(0)}`}
                                                >
                                                    {sourceAttribution.map((_, i) => (
                                                        <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value: any) => [value, 'Rezervasyon']} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Source Revenue Table */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                    <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Target size={18} className="text-purple-500" />
                                            Kaynak Bazlı Ciro
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                                                <tr>
                                                    <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Kaynak</th>
                                                    <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Rezervasyon</th>
                                                    <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Ciro</th>
                                                    <th className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Pay %</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                {sourceAttribution.length === 0 ? (
                                                    <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">Kaynak verisi bulunamadı.</td></tr>
                                                ) : sourceAttribution.map((src, i) => {
                                                    const totalRez = sourceAttribution.reduce((s, r) => s + r.ReservationCount, 0)
                                                    return (
                                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                                            <td className="px-5 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                                                                {src.Source}
                                                            </td>
                                                            <td className="px-5 py-3">{src.ReservationCount}</td>
                                                            <td className="px-5 py-3 text-emerald-600 font-bold">₺{src.Revenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</td>
                                                            <td className="px-5 py-3">%{totalRez > 0 ? ((src.ReservationCount / totalRez) * 100).toFixed(1) : '0'}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

// ─── Reusable KPI Card ───
function KpiCard({ icon: Icon, color, label, value }: { icon: any; color: string; label: string; value: string }) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    }
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{value}</h3>
                </div>
            </div>
        </div>
    )
}
