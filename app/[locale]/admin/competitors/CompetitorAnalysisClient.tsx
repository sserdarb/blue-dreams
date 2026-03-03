'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Crosshair, Sparkles, Loader2, ArrowUpRight, ArrowDownRight,
    Star, RefreshCw, BarChart2, TrendingUp, Presentation, Clock, Building2, X
} from 'lucide-react'
import { AdminTranslations } from '@/lib/admin-translations'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ScatterChart, Scatter, ZAxis
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
    const [activeTab, setActiveTab] = useState<'overview' | 'strategies' | 'reviews' | 'pricing' | 'brand'>('overview')
    const [trends, setTrends] = useState<{ pricingTrends: any[], reviewsTrends: any[], brandInterestTrends: any[] } | null>(null)
    const [market, setMarket] = useState<'domestic' | 'international'>('domestic')
    const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>(['Blue Dreams Resort', 'Duja Bodrum'])
    const [dbCompetitors, setDbCompetitors] = useState<{ id: string, name: string }[]>([])
    const [newCompName, setNewCompName] = useState('')

    // Dates for booking sync
    const defaultCheckIn = new Date().toISOString().split('T')[0]
    const defaultCheckOut = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const [checkIn, setCheckIn] = useState(defaultCheckIn)
    const [checkOut, setCheckOut] = useState(defaultCheckOut)

    const [apifyLoading, setApifyLoading] = useState(false)
    const [apifyData, setApifyData] = useState<any[] | null>(null)
    const [apifySyncTime, setApifySyncTime] = useState<string | null>(null)

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

            // Fetch dynamic competitors from DB
            const dbRes = await fetch('/api/admin/competitors/list')
            if (dbRes.ok) {
                const list = await dbRes.json()
                if (Array.isArray(list) && list.length > 0) {
                    setDbCompetitors(list)
                    setSelectedCompetitors(list.map(c => c.name))
                }
            }

            // Also fetch trends
            const trendRes = await fetch(`/api/admin/competitors/trends?market=${market}`)
            if (trendRes.ok) {
                const trendData = await trendRes.json()
                if (trendData.success) {
                    setTrends({ pricingTrends: trendData.pricingTrends, reviewsTrends: trendData.reviewsTrends, brandInterestTrends: trendData.brandInterestTrends })
                }
            }
        } catch (error) {
            console.error('Failed to fetch competitor data:', error)
        }
        setLoading(false)
    }, [market])

    const fetchApify = async () => {
        setApifyLoading(true);
        try {
            const res = await fetch('/api/admin/competitors/apify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currency: market === 'domestic' ? 'TRY' : 'EUR',
                    checkIn,
                    checkOut,
                    competitors: selectedCompetitors
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.liveData) {
                    setApifyData(data.liveData);
                    setApifySyncTime(new Date().toLocaleString('tr-TR'));
                }
            }
        } catch (e) {
            console.error("Failed to fetch Apify data:", e);
        }
        setApifyLoading(false);
    };

    useEffect(() => {
        fetchAnalysisData()
    }, [fetchAnalysisData])

    // Sort competitors by rating for the rank overview
    const filteredCompetitors = competitors.filter(c => selectedCompetitors.includes(c.name))
    const chartData = [...filteredCompetitors].sort((a, b) => b.rating - a.rating)

    // Compute dynamic pricing chart data to blend in live Apify prices
    const pricingChartData = React.useMemo(() => {
        if (!trends) return [];
        const base = [...trends.pricingTrends];
        if (apifyData) {
            const livePoint: any = { name: 'Bugün (Apify)' };
            apifyData.forEach(d => {
                if (d.livePrice > 0) livePoint[d.name] = d.livePrice;
            });
            base.push(livePoint);
        }
        return base;
    }, [trends, apifyData]);

    // Compute scatter chart data (Price vs Rating)
    const scatterData = React.useMemo(() => {
        return filteredCompetitors.map(comp => {
            let price = comp.priceEstimation || 0;
            if (apifyData) {
                const live = apifyData.find(a => a.name === comp.name);
                if (live && live.livePrice > 0) price = live.livePrice;
            }
            return {
                name: comp.name,
                rating: comp.rating,
                price: price,
                reviews: comp.reviews
            }
        }).filter(d => d.price > 0);
    }, [filteredCompetitors, apifyData]);

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
                    <div className="flex gap-2">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex gap-2 items-center">
                                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900" />
                                <span className="text-muted-foreground">-</span>
                                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900" />
                            </div>
                            <button
                                onClick={fetchApify}
                                disabled={apifyLoading || loading}
                                className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {apifyLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                Apify Canlı Sorgu
                            </button>
                            <button
                                onClick={() => fetchAnalysisData(true)}
                                disabled={loading || apifyLoading}
                                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                Tarihsel Verileri Senkronize Et
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {loading && competitors.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 size={32} className="animate-spin text-cyan-500" />
                </div>
            ) : (
                <>
                    {/* Filters and Tabs */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
                        <div className="flex flex-col gap-2">
                            {/* Dynamic Competitor Management */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newCompName}
                                    onChange={e => setNewCompName(e.target.value)}
                                    placeholder="Yeni otel/rakip ekle..."
                                    className="border dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm w-48 bg-white dark:bg-slate-900"
                                />
                                <button
                                    onClick={async () => {
                                        if (!newCompName) return;
                                        await fetch('/api/admin/competitors/list', { method: 'POST', body: JSON.stringify({ name: newCompName }) });
                                        setNewCompName('');
                                        fetchAnalysisData(true);
                                    }}
                                    className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90"
                                >
                                    Ekle
                                </button>
                            </div>

                            <div className="flex gap-2 flex-wrap mt-2">
                                {dbCompetitors.map(c => (
                                    <div key={c.id} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-medium">
                                        {c.name}
                                        <button
                                            onClick={async () => {
                                                await fetch(`/api/admin/competitors/list?id=${c.id}`, { method: 'DELETE' });
                                                fetchAnalysisData(true);
                                            }}
                                            className="text-red-500 hover:text-red-700 ml-1 bg-white dark:bg-slate-900 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mt-4 md:mt-0">
                            {(['overview', 'strategies', 'reviews', 'pricing', 'brand'] as const).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700'}`}>
                                    {tab === 'overview' ? 'Genel Bakış' : tab === 'strategies' ? 'AI Strateji' : tab === 'reviews' ? 'Gelişmiş Yorum Trendi' : tab === 'pricing' ? 'Fiyatlandırma Trendi' : 'Marka İlgisi (Brand Interest)'}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={market}
                                onChange={(e) => setMarket(e.target.value as 'domestic' | 'international')}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-700 dark:text-slate-300"
                            >
                                <option value="domestic">İç Pazar (TRY)</option>
                                <option value="international">Dış Pazar (EUR)</option>
                            </select>
                        </div>
                    </div>

                    {/* Competitor Multi-Select Filter */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {competitors.map(c => (
                            <button
                                key={c.name}
                                onClick={() => {
                                    if (selectedCompetitors.includes(c.name)) {
                                        if (selectedCompetitors.length > 1) setSelectedCompetitors(prev => prev.filter(n => n !== c.name))
                                    } else {
                                        setSelectedCompetitors(prev => [...prev, c.name])
                                    }
                                }}
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedCompetitors.includes(c.name) ? 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 text-cyan-800 dark:text-cyan-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>

                    {/* Insights from AI */}
                    {activeTab === 'strategies' && aiInsights && (
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

                    {/* Chart Overview */}
                    {activeTab === 'overview' && (
                        <>
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
                                {filteredCompetitors.map((comp) => (
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
                                                    <p className="text-xs text-slate-500 mb-1">Gecelik Tahmini Fiyat (Geçmiş)</p>
                                                    <p className="text-lg font-bold text-slate-900 dark:text-white flex items-end gap-2">
                                                        ₺{comp.priceEstimation.toLocaleString('tr-TR')}
                                                        <span className="text-xs font-normal text-slate-500 pb-1">{comp.priceDescription}</span>
                                                    </p>
                                                    {apifyData && (
                                                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                                            <p className="text-xs text-indigo-500 mb-1 flex items-center gap-1"><Sparkles size={10} /> Booking.com (Canlı)</p>
                                                            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                                                                {apifyData.find(a => a.name === comp.name)?.livePrice ? `${apifyData.find(a => a.name === comp.name)?.livePrice} ${market === 'domestic' ? 'TRY' : 'EUR'}` : 'Alınamadı'}
                                                            </p>
                                                        </div>
                                                    )}
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

                    {/* Reviews Trend specific tab */}
                    {activeTab === 'reviews' && trends && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm min-h-[400px]">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <BarChart2 size={18} className="text-cyan-500" />
                                Aylık Kümülatif Yorum Hacmi
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trends.reviewsTrends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Legend />
                                        {selectedCompetitors.includes('Blue Dreams Resort') && <Line type="monotone" dataKey="Blue Dreams" stroke="#06b6d4" strokeWidth={3} dot={false} />}
                                        {selectedCompetitors.includes('Duja Bodrum') && <Line type="monotone" dataKey="Duja Bodrum" stroke="#8b5cf6" strokeWidth={2} dot={false} />}
                                        {selectedCompetitors.includes('La Blanche Resort') && <Line type="monotone" dataKey="La Blanche" stroke="#f59e0b" strokeWidth={2} dot={false} />}
                                        {selectedCompetitors.includes('Samara Hotel Bodrum') && <Line type="monotone" dataKey="Samara Bodrum" stroke="#ef4444" strokeWidth={2} dot={false} />}
                                        {selectedCompetitors.includes('Kefaluka Resort') && <Line type="monotone" dataKey="Kefaluka" stroke="#3b82f6" strokeWidth={2} dot={false} />}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Pricing Trend specific tab */}
                    {activeTab === 'pricing' && (
                        <div className="space-y-6">
                            {trends && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm min-h-[400px]">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                        <TrendingUp size={18} className="text-emerald-500" />
                                        Gecelik Fiyat Trendi ({market === 'domestic' ? 'İç Pazar - TRY' : 'Dış Pazar - EUR'}) - <span className="text-xs text-slate-500 ml-1">Konaklama: {new Date(checkIn).toLocaleDateString('tr-TR')} - {new Date(checkOut).toLocaleDateString('tr-TR')}</span>
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={pricingChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                                <YAxis axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                                <Legend />
                                                {selectedCompetitors.includes('Blue Dreams Resort') && <Line type="monotone" dataKey="Blue Dreams" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />}
                                                {selectedCompetitors.includes('Duja Bodrum') && <Line type="monotone" dataKey="Duja Bodrum" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />}
                                                {selectedCompetitors.includes('La Blanche Resort') && <Line type="monotone" dataKey="La Blanche" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />}
                                                {selectedCompetitors.includes('Kefaluka Resort') && <Line type="monotone" dataKey="Kefaluka" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />}
                                                {selectedCompetitors.includes('Samara Hotel Bodrum') && <Line type="monotone" dataKey="Samara Bodrum" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm min-h-[400px]">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Crosshair size={18} className="text-orange-500" />
                                    Fiyat / Değer Analizi (Scatter Map)
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                            <XAxis type="number" dataKey="price" name="Fiyat" unit={market === 'domestic' ? ' ₺' : ' €'} stroke="#8884d8" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                                            <YAxis type="number" dataKey="rating" name="Puan" stroke="#8884d8" domain={['dataMin - 0.5', 5]} tick={{ fontSize: 11 }} />
                                            <ZAxis type="number" dataKey="reviews" range={[100, 1000]} name="Yorum Sayısı" />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                            <Legend />
                                            {scatterData.map((entry, index) => (
                                                <Scatter key={`scatter-${index}`} name={entry.name} data={[entry]} fill={['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#f43f5e'][index % 7]} />
                                            ))}
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-xs text-muted-foreground mt-4 text-center">Dikkat: Sol üst köşedekiler (Ucuz + Yüksek Puan) en tehlikeli fiyat/performans rakiplerini gösterir.</p>
                            </div>

                            {/* Price Volatility Table */}
                            {trends && trends.pricingTrends.length > 1 && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <BarChart2 size={18} className="text-rose-500" />
                                        Fiyat Volatilitesi (Geçmiş Dönem Analizi)
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-4">Rakiplerin fiyatlarını ne sıklıkla ve ne kadar değiştirdiğini gösteren analiz tablosu.</p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                                                    <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Otel</th>
                                                    <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">Min Fiyat</th>
                                                    <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">Max Fiyat</th>
                                                    <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">Ortalama</th>
                                                    <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">Değişim Oranı</th>
                                                    <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-500 uppercase">Volatilite</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                {(() => {
                                                    const competitorKeys = ['Blue Dreams', 'Duja Bodrum', 'La Blanche', 'Samara Bodrum', 'Kefaluka']
                                                    const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6']
                                                    return competitorKeys.map((key, ci) => {
                                                        const prices = trends.pricingTrends
                                                            .map(t => t[key])
                                                            .filter((v): v is number => typeof v === 'number' && v > 0)
                                                        if (prices.length < 2) return null

                                                        const min = Math.min(...prices)
                                                        const max = Math.max(...prices)
                                                        const avg = prices.reduce((s, v) => s + v, 0) / prices.length
                                                        const range = max - min
                                                        const changePct = ((range / avg) * 100).toFixed(1)
                                                        const volatility = range / avg
                                                        const volLabel = volatility > 0.3 ? 'Yüksek' : volatility > 0.15 ? 'Orta' : 'Düşük'
                                                        const volColor = volatility > 0.3 ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : volatility > 0.15 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                                        const currency = market === 'domestic' ? '₺' : '€'

                                                        return (
                                                            <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[ci] }} />
                                                                        <span className="font-medium text-slate-900 dark:text-white">{key}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">{currency}{min.toLocaleString('tr-TR')}</td>
                                                                <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">{currency}{max.toLocaleString('tr-TR')}</td>
                                                                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">{currency}{Math.round(avg).toLocaleString('tr-TR')}</td>
                                                                <td className="px-4 py-3 text-right font-mono">
                                                                    <span className={volatility > 0.15 ? 'text-rose-600 font-bold' : 'text-slate-500'}>±{changePct}%</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${volColor}`}>
                                                                        {volLabel}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        )
                                                    }).filter(Boolean)
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-3">Volatilite = (Max - Min) / Ortalama. Yüksek volatilite, rakibin fiyat stratejisini sıkça değiştirdiğine işaret eder.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Brand Interest Trend specific tab */}
                    {activeTab === 'brand' && trends && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm min-h-[400px]">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Sparkles size={18} className="text-purple-500" />
                                Marka İlgisi Arama Trendi (Arz/Talep)
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trends.brandInterestTrends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Legend />
                                        {selectedCompetitors.includes('Blue Dreams Resort') && <Line type="monotone" dataKey="Blue Dreams" stroke="#06b6d4" strokeWidth={3} dot={false} />}
                                        {selectedCompetitors.includes('Duja Bodrum') && <Line type="monotone" dataKey="Duja Bodrum" stroke="#8b5cf6" strokeWidth={2} dot={false} />}
                                        {selectedCompetitors.includes('La Blanche Resort') && <Line type="monotone" dataKey="La Blanche" stroke="#f59e0b" strokeWidth={2} dot={false} />}
                                        {selectedCompetitors.includes('Kefaluka Resort') && <Line type="monotone" dataKey="Kefaluka" stroke="#3b82f6" strokeWidth={2} dot={false} />}
                                        {selectedCompetitors.includes('Samara Hotel Bodrum') && <Line type="monotone" dataKey="Samara Bodrum" stroke="#ef4444" strokeWidth={2} dot={false} />}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
