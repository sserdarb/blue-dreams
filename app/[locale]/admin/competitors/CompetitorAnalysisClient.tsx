'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Crosshair, Sparkles, Loader2, ArrowUpRight, ArrowDownRight,
    Star, RefreshCw, BarChart2, TrendingUp, Presentation, Clock, Building2
} from 'lucide-react'
import { AdminTranslations } from '@/lib/admin-translations'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts'

interface Props {
    locale: string
    t: AdminTranslations
}

interface CompetitorData {
    name: string;
    rating: number;
    reviews: number;
    priceEstimation?: number;
    priceDescription?: string;
    competitorType?: string;
    thumbnail?: string;
    strengths?: string[];
    weaknesses?: string[];
}

interface AIAnalysis {
    executiveSummary: string;
    priceStrategy: string;
    marketingInsights: string;
    recommendations: string[];
}

export default function CompetitorAnalysisClient({ locale, t }: Props) {
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [competitors, setCompetitors] = useState<CompetitorData[]>([])
    const [aiInsights, setAiInsights] = useState<AIAnalysis | null>(null)
    const [lastSync, setLastSync] = useState<string | null>(null)

    const fetchAnalysisData = useCallback(async (forceRefresh = false) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/competitor-analysis${forceRefresh ? '?refresh=true' : ''}`)
            if (res.ok) {
                const data = await res.json()
                setCompetitors(data.competitors || [])
                setAiInsights(data.analysis || null)
                setLastSync(new Date().toLocaleString('tr-TR'))
            }
        } catch (error) {
            console.error('Failed to fetch competitor data:', error)
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchAnalysisData()
    }, [fetchAnalysisData])

    // Sort competitors by rating for the chart
    const chartData = [...competitors].sort((a, b) => b.rating - a.rating)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                            <Crosshair className="text-cyan-600 dark:text-cyan-400" size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Rakip Analizi</h1>
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                <Clock size={12} /> Son Güncelleme: {lastSync || 'Bekleniyor...'} (API + AI Destekli)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchAnalysisData(true)}
                        disabled={loading}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Verileri Senkronize Et
                    </button>
                </div>
            </div>

            {loading && competitors.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 size={32} className="animate-spin text-cyan-500" />
                </div>
            ) : (
                <>
                    {/* Insights from AI */}
                    {aiInsights && (
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 shadow-lg text-white">
                            <div className="flex items-start gap-4 mb-4">
                                <Sparkles size={24} className="text-yellow-300 mt-1 shrink-0" />
                                <div>
                                    <h3 className="text-lg font-bold">AI Stratejik Sentez</h3>
                                    <p className="text-sm text-purple-100 leading-relaxed mt-1">
                                        {aiInsights.executiveSummary}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <h4 className="font-bold flex items-center gap-2 mb-2">
                                        <TrendingUp size={16} /> Fiyat Stratejisi
                                    </h4>
                                    <p className="text-sm text-purple-50 leading-relaxed font-light">
                                        {aiInsights.priceStrategy}
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <h4 className="font-bold flex items-center gap-2 mb-2">
                                        <Presentation size={16} /> Pazarlama ve İletişim
                                    </h4>
                                    <p className="text-sm text-purple-50 leading-relaxed font-light">
                                        {aiInsights.marketingInsights}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 bg-black/20 rounded-xl p-4">
                                <h4 className="font-bold mb-3 flex items-center gap-2">Aksiyon Önerileri</h4>
                                <ul className="space-y-2">
                                    {aiInsights.recommendations.map((rec, idx) => (
                                        <li key={idx} className="text-sm flex items-start gap-2">
                                            <div className="w-5 h-5 bg-purple-500/50 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">{idx + 1}</div>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Star size={18} className="text-yellow-500" />
                                Değerlendirme Puanları
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <YAxis domain={[0, 5]} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="rating" name="Google Puanı" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <BarChart2 size={18} className="text-cyan-500" />
                                Toplam Yorum Sayısı (Hacim)
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Bar dataKey="reviews" name="Yorum Sayısı" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Competitor Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {competitors.map((comp) => (
                            <div key={comp.name} className={`bg-white dark:bg-slate-800 rounded-2xl border ${comp.name === 'Blue Dreams Resort' ? 'border-cyan-500 shadow-md shadow-cyan-500/10' : 'border-slate-200 dark:border-slate-700'} p-5 flex flex-col`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                                            {comp.thumbnail ? <img src={comp.thumbnail} alt={comp.name} className="w-full h-full object-cover" /> : <Building2 size={20} className="text-slate-400" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{comp.name}</h3>
                                            <span className="text-xs text-slate-500">{comp.competitorType || 'Rakip Otel'}</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded text-sm font-bold flex items-center gap-1 shadow-sm">
                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                        {comp.rating.toFixed(1)}
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">Yorum Skoru</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{comp.reviews.toLocaleString('tr-TR')} yorum</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(comp.rating / 5) * 100}%` }} />
                                        </div>
                                    </div>

                                    {comp.priceEstimation && (
                                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                                            <p className="text-xs text-slate-500 mb-1">Gecelik Fiyat Tahmini</p>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white flex items-end gap-2">
                                                ₺{comp.priceEstimation.toLocaleString('tr-TR')}
                                                <span className="text-xs font-normal text-slate-500 pb-1">{comp.priceDescription}</span>
                                            </p>
                                        </div>
                                    )}

                                    {comp.strengths && comp.strengths.length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1"><ArrowUpRight size={12} /> Güçlü Yönler</p>
                                            <div className="flex flex-wrap gap-1">
                                                {comp.strengths.map((str, i) => (
                                                    <span key={i} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] rounded-md font-medium border border-emerald-100 dark:border-emerald-800/50">{str}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {comp.weaknesses && comp.weaknesses.length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-rose-600 mb-2 flex items-center gap-1"><ArrowDownRight size={12} /> Zayıf Yönler</p>
                                            <div className="flex flex-wrap gap-1">
                                                {comp.weaknesses.map((wk, i) => (
                                                    <span key={i} className="px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-[10px] rounded-md font-medium border border-rose-100 dark:border-rose-800/50">{wk}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
