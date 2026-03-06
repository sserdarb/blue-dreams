'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import {
    Instagram, Facebook, TrendingUp, Users, Heart, MessageCircle,
    Eye, BarChart3, Image as ImageIcon, Video, Loader2, AlertCircle,
    ArrowUpRight, ArrowDownRight, Minus, Calendar, Award, Share2,
    Activity, Target, FileText, Download, RefreshCw, Clock
} from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart,
    Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────
interface MetricsData {
    success: boolean
    error?: string
    overview: {
        instagram: any
        facebook: any
    }
    engagement: {
        rate: number
        avgLikes: number
        avgComments: number
        totalEngagement: number
        bestPost: any
        byType: { type: string; count: number; avgEngagement: number }[]
    }
    recentPosts: any[]
    fbInsights?: any
    igInsights?: any
    fetchedAt: string
}

// ─── Constants ────────────────────────────────────────────────────────
const PERIOD_OPTIONS = [
    { value: '7d', label: 'Son 7 Gün' },
    { value: '30d', label: 'Son 30 Gün' },
    { value: '90d', label: 'Son 90 Gün' },
]

const TABS = [
    { id: 'dashboard', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'posts', label: 'Gönderi Analizi', icon: ImageIcon },
    { id: 'audience', label: 'Kitle Analizi', icon: Users },
    { id: 'benchmark', label: 'Karşılaştırma', icon: Target },
    { id: 'reports', label: 'Raporlar', icon: FileText },
]

const COLORS = {
    instagram: ['#E1306C', '#C13584', '#833AB4', '#5851DB', '#405DE6'],
    facebook: ['#1877F2', '#42A5F5', '#64B5F6'],
    chart: ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'],
}

const TYPE_ICONS: Record<string, any> = {
    IMAGE: ImageIcon,
    VIDEO: Video,
    CAROUSEL_ALBUM: Share2,
}

export default function SocialMetricsClient() {
    const [data, setData] = useState<MetricsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [refreshing, setRefreshing] = useState(false)
    const [period, setPeriod] = useState('30d')

    const fetchData = async (p?: string) => {
        try {
            setRefreshing(true)
            const activePeriod = p || period
            const res = await fetch(`/api/admin/social-metrics?period=${activePeriod}`)
            if (!res.ok) throw new Error(`API Hatası: ${res.status}`)
            const json = await res.json()
            if (!json.success && json.error) {
                setError(json.error)
            } else {
                setData(json)
                setError(null)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod)
        fetchData(newPeriod)
    }

    useEffect(() => { fetchData() }, [])

    // ─── Loading State ────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="animate-spin" size={40} />
                    <p className="text-lg font-medium">Sosyal Medya Verileri Yükleniyor…</p>
                </div>
            </div>
        )
    }

    // ─── Error State ──────────────────────────────────────────────────
    if (error && !data) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <Card className="p-8 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                    <div className="flex flex-col items-center text-center gap-4">
                        <AlertCircle className="text-red-500" size={48} />
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Veri Alınamadı</h2>
                        <p className="text-red-500/80">{error}</p>
                        <button onClick={() => fetchData()} className="mt-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                            Tekrar Dene
                        </button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* ─── Header ────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Activity className="text-cyan-500" size={28} />
                        Social Metrics Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Kapsamlı sosyal medya analiz ve raporlama
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Sprout Social style period selector */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                        <Clock size={14} className="text-slate-400 ml-2" />
                        {PERIOD_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handlePeriodChange(opt.value)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === opt.value
                                    ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {data?.fetchedAt && (
                        <span className="text-xs text-slate-400">
                            Son güncelleme: {new Date(data.fetchedAt).toLocaleTimeString('tr-TR')}
                        </span>
                    )}
                    <button
                        onClick={() => fetchData()}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        Yenile
                    </button>
                </div>
            </div>

            {/* ─── Tabs ──────────────────────────────────────────────── */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl overflow-x-auto">
                {TABS.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive
                                ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* ─── Tab Content ────────────────────────────────────────── */}
            {activeTab === 'dashboard' && data && <DashboardTab data={data} />}
            {activeTab === 'posts' && data && <PostsTab data={data} />}
            {activeTab === 'audience' && data && <AudienceTab data={data} />}
            {activeTab === 'benchmark' && data && <BenchmarkTab data={data} />}
            {activeTab === 'reports' && data && <ReportsTab data={data} />}
        </div>
    )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 1: Dashboard (Genel Bakış)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function DashboardTab({ data }: { data: MetricsData }) {
    const ig = data.overview.instagram
    const fb = data.overview.facebook

    const kpiCards = [
        {
            label: 'Instagram Takipçi',
            value: ig?.followers?.toLocaleString() || '—',
            icon: Instagram,
            gradient: 'from-pink-500 to-purple-600',
            sub: ig?.posts ? `${ig.posts} gönderi` : undefined,
            bgIcon: Instagram
        },
        {
            label: 'Facebook Takipçi',
            value: fb?.followers?.toLocaleString() || '—',
            icon: Facebook,
            gradient: 'from-blue-600 to-blue-800',
            sub: fb?.fans ? `${fb.fans.toLocaleString()} beğeni` : undefined,
            bgIcon: Facebook
        },
        {
            label: 'Etkileşim Oranı',
            value: data.engagement.rate ? `%${data.engagement.rate}` : '—',
            icon: TrendingUp,
            gradient: 'from-emerald-500 to-teal-600',
            sub: `Ort. ${data.engagement.avgLikes || 0} beğeni/gönderi`,
            bgIcon: Heart
        },
        {
            label: 'Ort. Yorum',
            value: data.engagement.avgComments?.toString() || '—',
            icon: MessageCircle,
            gradient: 'from-amber-500 to-orange-600',
            sub: `Toplam ${data.engagement.totalEngagement || 0} etkileşim`,
            bgIcon: MessageCircle
        },
    ]

    // Engagement by type chart data
    const typeData = (data.engagement.byType || []).map(t => ({
        name: t.type === 'IMAGE' ? 'Görsel' : t.type === 'VIDEO' ? 'Video' : t.type === 'CAROUSEL_ALBUM' ? 'Carousel' : t.type,
        value: t.avgEngagement,
        count: t.count
    }))

    // Platform comparison radar
    const radarData = [
        { metric: 'Takipçi', instagram: ig?.followers ? Math.min(ig.followers / 100, 100) : 0, facebook: fb?.followers ? Math.min(fb.followers / 100, 100) : 0 },
        { metric: 'Erişim', instagram: 75, facebook: fb?.talkingAbout ? Math.min(fb.talkingAbout / 10, 100) : 30 },
        { metric: 'Etkileşim', instagram: data.engagement.rate * 10 || 0, facebook: 25 },
        { metric: 'İçerik', instagram: ig?.posts ? Math.min(ig.posts / 5, 100) : 0, facebook: 40 },
        { metric: 'Büyüme', instagram: 60, facebook: 45 },
    ]

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, i) => {
                    const BgIcon = card.bgIcon
                    return (
                        <Card key={i} className={`p-5 bg-gradient-to-br ${card.gradient} border-none text-white shadow-lg relative overflow-hidden`}>
                            <div className="absolute -right-4 -top-4 opacity-15"><BgIcon size={90} /></div>
                            <div className="relative z-10">
                                <p className="text-sm font-medium opacity-90 flex items-center gap-2">
                                    <card.icon size={16} /> {card.label}
                                </p>
                                <p className="text-3xl font-black mt-2">{card.value}</p>
                                {card.sub && <p className="text-xs opacity-75 mt-1">{card.sub}</p>}
                            </div>
                        </Card>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement by Content Type */}
                <Card className="p-5 bg-white dark:bg-slate-800/50 border-none shadow-lg">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <ImageIcon size={20} className="text-purple-500" /> İçerik Türüne Göre Etkileşim
                    </h3>
                    {typeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={typeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: any, name: any) => [value, name === 'value' ? 'Ort. Etkileşim' : 'Gönderi Sayısı']}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Ort. Etkileşim" />
                                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Gönderi Sayısı" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-slate-400">Veri bulunamadı</div>
                    )}
                </Card>

                {/* Platform Comparison Radar */}
                <Card className="p-5 bg-white dark:bg-slate-800/50 border-none shadow-lg">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Target size={20} className="text-cyan-500" /> Platform Karşılaştırma
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <PolarRadiusAxis tick={false} axisLine={false} />
                            <Radar name="Instagram" dataKey="instagram" stroke="#E1306C" fill="#E1306C" fillOpacity={0.3} />
                            <Radar name="Facebook" dataKey="facebook" stroke="#1877F2" fill="#1877F2" fillOpacity={0.3} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Best Post Highlight */}
            {data.engagement.bestPost && (
                <Card className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800/30 shadow-lg">
                    <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                        <Award size={20} /> En İyi Performans Gösteren Gönderi
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4">
                        {data.engagement.bestPost.mediaUrl && (
                            <img src={data.engagement.bestPost.mediaUrl} alt="Best post" className="w-32 h-32 object-cover rounded-lg shadow" />
                        )}
                        <div className="flex-1">
                            <p className="text-sm text-slate-700 dark:text-slate-300">{data.engagement.bestPost.caption}</p>
                            <div className="flex gap-4 mt-3">
                                <span className="flex items-center gap-1 text-sm font-bold text-pink-600">
                                    <Heart size={14} /> {data.engagement.bestPost.likes}
                                </span>
                                <span className="flex items-center gap-1 text-sm font-bold text-blue-600">
                                    <MessageCircle size={14} /> {data.engagement.bestPost.comments}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar size={12} /> {new Date(data.engagement.bestPost.timestamp).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 2: Post Performance (Gönderi Analizi)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function PostsTab({ data }: { data: MetricsData }) {
    const [sort, setSort] = useState<'engagement' | 'likes' | 'comments' | 'date'>('engagement')
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyText, setReplyText] = useState('')
    const [sending, setSending] = useState(false)

    const sorted = useMemo(() => {
        return [...data.recentPosts].sort((a, b) => {
            if (sort === 'date') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            return b[sort] - a[sort]
        })
    }, [data.recentPosts, sort])

    // Engagement timeline
    const timeline = useMemo(() => {
        return [...data.recentPosts]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map(p => ({
                date: new Date(p.timestamp).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
                likes: p.likes,
                comments: p.comments,
                engagement: p.engagement
            }))
    }, [data.recentPosts])

    const handleReply = async (postId: string) => {
        if (!replyText.trim()) return
        setSending(true)
        try {
            const res = await fetch('/api/admin/analytics/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reply-comment', postId, message: replyText })
            })
            if (res.ok) {
                setReplyText('')
                setReplyingTo(null)
            }
        } catch (err) {
            console.error('Reply failed:', err)
        }
        setSending(false)
    }

    return (
        <div className="space-y-6">
            {/* Engagement Timeline */}
            <Card className="p-5 bg-white dark:bg-slate-800/50 border-none shadow-lg">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-cyan-500" /> Etkileşim Zaman Çizelgesi
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={timeline}>
                        <defs>
                            <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#E1306C" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#E1306C" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Area type="monotone" dataKey="likes" stroke="#E1306C" fill="url(#colorLikes)" name="Beğeni" />
                        <Area type="monotone" dataKey="comments" stroke="#06b6d4" fill="url(#colorComments)" name="Yorum" />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            {/* Posts Grid Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <ImageIcon size={20} className="text-purple-500" /> Gönderiler ({sorted.length})
                </h3>
                <div className="flex gap-1">
                    {([
                        { key: 'engagement', label: 'Etkileşim' },
                        { key: 'likes', label: 'Beğeni' },
                        { key: 'comments', label: 'Yorum' },
                        { key: 'date', label: 'Tarih' },
                    ] as const).map(s => (
                        <button
                            key={s.key}
                            onClick={() => setSort(s.key)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${sort === s.key ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sorted.map((post) => {
                    const TypeIcon = TYPE_ICONS[post.type] || ImageIcon
                    const isVideo = post.type === 'VIDEO' || post.type === 'REELS'
                    return (
                        <Card key={post.id} className="bg-white dark:bg-slate-800/50 border-none shadow-lg overflow-hidden group">
                            {/* Media Preview */}
                            <div className="relative aspect-square bg-slate-100 dark:bg-slate-900">
                                {post.mediaUrl ? (
                                    isVideo ? (
                                        <video
                                            src={post.mediaUrl}
                                            className="w-full h-full object-cover"
                                            muted
                                            playsInline
                                            onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => { })}
                                            onMouseLeave={(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0 }}
                                            poster={post.thumbnailUrl || ''}
                                        />
                                    ) : (
                                        <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <TypeIcon size={48} />
                                    </div>
                                )}
                                {/* Type Badge */}
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
                                    <TypeIcon size={12} className="text-white" />
                                    <span className="text-[10px] text-white font-medium">
                                        {post.type === 'IMAGE' ? 'Görsel' : post.type === 'VIDEO' ? 'Video' : post.type === 'CAROUSEL_ALBUM' ? 'Carousel' : post.type}
                                    </span>
                                </div>
                                {/* Hover Overlay with Stats */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                                    <span className="flex items-center gap-1 text-white font-bold">
                                        <Heart size={18} /> {post.likes?.toLocaleString() || 0}
                                    </span>
                                    <span className="flex items-center gap-1 text-white font-bold">
                                        <MessageCircle size={18} /> {post.comments?.toLocaleString() || 0}
                                    </span>
                                </div>
                            </div>
                            {/* Info */}
                            <div className="p-3">
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2rem]">
                                    {post.caption || '—'}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="flex items-center gap-0.5 text-pink-500 font-semibold">
                                            <Heart size={12} /> {post.likes || 0}
                                        </span>
                                        <span className="flex items-center gap-0.5 text-blue-500 font-semibold">
                                            <MessageCircle size={12} /> {post.comments || 0}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(post.timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                {/* Comment Reply */}
                                {post.comments > 0 && (
                                    <button
                                        onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                                        className="mt-2 text-xs text-cyan-600 hover:text-cyan-500 font-medium"
                                    >
                                        {replyingTo === post.id ? 'Kapat' : 'Yanıtla'}
                                    </button>
                                )}
                                {replyingTo === post.id && (
                                    <div className="mt-2 flex gap-1">
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Yanıt yaz..."
                                            className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                        />
                                        <button
                                            onClick={() => handleReply(post.id)}
                                            disabled={sending}
                                            className="px-2 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50"
                                        >
                                            {sending ? '...' : 'Gönder'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )
                })}
            </div>
            {sorted.length === 0 && (
                <div className="text-center py-12 text-slate-400">Gönderi verisi bulunamadı</div>
            )}
        </div>
    )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 3: Audience (Kitle Analizi)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function AudienceTab({ data }: { data: MetricsData }) {
    const ig = data.overview.instagram
    const fb = data.overview.facebook

    const followRatio = ig ? (ig.followers / Math.max(ig.following || 1, 1)).toFixed(1) : '—'

    const platformSplit = [
        { name: 'Instagram', value: ig?.followers || 0, color: '#E1306C' },
        { name: 'Facebook', value: fb?.followers || 0, color: '#1877F2' },
    ].filter(p => p.value > 0)

    const totalFollowers = platformSplit.reduce((s, p) => s + p.value, 0)

    return (
        <div className="space-y-6">
            {/* Audience KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 bg-white dark:bg-slate-800/50 border-none shadow-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Toplam Takipçi</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">{totalFollowers.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">{platformSplit.length} platform</p>
                </Card>
                <Card className="p-5 bg-white dark:bg-slate-800/50 border-none shadow-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Takipçi/Takip Oranı</p>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{followRatio}x</p>
                    <p className="text-xs text-slate-400 mt-1">{ig?.following || 0} takip edilen</p>
                </Card>
                <Card className="p-5 bg-white dark:bg-slate-800/50 border-none shadow-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Toplam Gönderi</p>
                    <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">{ig?.posts?.toLocaleString() || '—'}</p>
                    <p className="text-xs text-slate-400 mt-1">Instagram</p>
                </Card>
                <Card className="p-5 bg-white dark:bg-slate-800/50 border-none shadow-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Etkileşim Oranı</p>
                    <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-2">%{data.engagement.rate}</p>
                    <p className="text-xs text-slate-400 mt-1">Son 25 gönderi ort.</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Distribution Pie */}
                <Card className="p-5 bg-white dark:bg-slate-800/50 border-none shadow-lg">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Users size={20} className="text-cyan-500" /> Platform Dağılımı
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={platformSplit}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={100}
                                dataKey="value"
                                label={({ name, percent }: any) => `${name} %${((percent || 0) * 100).toFixed(0)}`}
                            >
                                {platformSplit.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => [value.toLocaleString(), 'Takipçi']}
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                {/* Account Info Cards */}
                <div className="space-y-4">
                    {ig && !ig.error && (
                        <Card className="p-5 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800/30">
                            <div className="flex items-center gap-4">
                                {ig.profilePicture && (
                                    <img src={ig.profilePicture} alt={ig.name} className="w-16 h-16 rounded-full border-2 border-pink-300" />
                                )}
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <Instagram size={16} className="text-pink-500" /> {ig.name}
                                    </h4>
                                    {ig.username && <p className="text-sm text-slate-500">@{ig.username}</p>}
                                    {ig.bio && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ig.bio}</p>}
                                </div>
                            </div>
                        </Card>
                    )}
                    {fb && !fb.error && (
                        <Card className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800/30">
                            <div className="flex items-center gap-4">
                                {fb.picture && (
                                    <img src={fb.picture} alt={fb.name} className="w-16 h-16 rounded-full border-2 border-blue-300" />
                                )}
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <Facebook size={16} className="text-blue-600" /> {fb.name}
                                    </h4>
                                    <p className="text-sm text-slate-500">{fb.fans?.toLocaleString()} beğeni · {fb.followers?.toLocaleString()} takipçi</p>
                                    {fb.talkingAbout > 0 && <p className="text-xs text-slate-400 mt-1">{fb.talkingAbout} kişi bundan bahsediyor</p>}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 4: Benchmark (Karşılaştırma)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function BenchmarkTab({ data }: { data: MetricsData }) {
    const ig = data.overview.instagram
    const fb = data.overview.facebook

    // Simulated competitor data for comparison
    const competitors = [
        { name: 'Blue Dreams', ig: ig?.followers || 0, fb: fb?.followers || 0, engRate: data.engagement.rate, posts: ig?.posts || 0, isUs: true },
        { name: 'Ort. Rakip (5★ Bodrum)', ig: 28000, fb: 15000, engRate: 2.1, posts: 850, isUs: false },
        { name: 'Sektör Ortalaması', ig: 22000, fb: 12000, engRate: 1.8, posts: 600, isUs: false },
    ]

    const comparisonData = competitors.map(c => ({
        name: c.name,
        'Instagram': c.ig,
        'Facebook': c.fb,
    }))

    return (
        <div className="space-y-6">
            <Card className="p-5 bg-white dark:bg-slate-800/50 border-none shadow-lg">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Target size={20} className="text-cyan-500" /> Takipçi Karşılaştırması
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                        <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="Instagram" fill="#E1306C" radius={[0, 6, 6, 0]} />
                        <Bar dataKey="Facebook" fill="#1877F2" radius={[0, 6, 6, 0]} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Competitor Table */}
            <Card className="p-5 bg-white dark:bg-slate-800/50 border-none shadow-lg">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-purple-500" /> Detaylı Karşılaştırma
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-3 text-slate-500 font-medium">Otel</th>
                                <th className="text-right py-3 px-3 text-slate-500 font-medium">IG Takipçi</th>
                                <th className="text-right py-3 px-3 text-slate-500 font-medium">FB Takipçi</th>
                                <th className="text-right py-3 px-3 text-slate-500 font-medium">Etk. Oranı</th>
                                <th className="text-right py-3 px-3 text-slate-500 font-medium">Gönderi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {competitors.map((c, i) => (
                                <tr key={i} className={`border-b border-slate-100 dark:border-slate-700/50 ${c.isUs ? 'bg-cyan-50 dark:bg-cyan-950/20' : ''}`}>
                                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                        {c.isUs && <span className="w-2 h-2 rounded-full bg-cyan-500" />}
                                        {c.name}
                                    </td>
                                    <td className="py-3 px-3 text-right text-pink-600 font-semibold">{c.ig.toLocaleString()}</td>
                                    <td className="py-3 px-3 text-right text-blue-600 font-semibold">{c.fb.toLocaleString()}</td>
                                    <td className="py-3 px-3 text-right text-emerald-600 font-semibold">%{c.engRate}</td>
                                    <td className="py-3 px-3 text-right text-slate-500">{c.posts.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-slate-400 mt-4 italic">
                    * Rakip verileri sektör ortalamaları baz alınarak simüle edilmiştir. Gerçek rakip verilerini Rakip Analizi modülünden tanımlayabilirsiniz.
                </p>
            </Card>
        </div>
    )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 5: Reports (Raporlar)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ReportsTab({ data }: { data: MetricsData }) {
    const ig = data.overview.instagram
    const fb = data.overview.facebook

    const reportCards = [
        {
            title: 'Haftalık Performans Özeti',
            period: 'Bu hafta',
            metrics: [
                { label: 'Toplam Etkileşim', value: data.engagement.totalEngagement },
                { label: 'Ort. Beğeni/Gönderi', value: data.engagement.avgLikes },
                { label: 'Ort. Yorum/Gönderi', value: data.engagement.avgComments },
                { label: 'Etkileşim Oranı', value: `%${data.engagement.rate}` },
            ],
            color: 'from-cyan-500 to-blue-600'
        },
        {
            title: 'Instagram Raporu',
            period: 'Güncel',
            metrics: [
                { label: 'Takipçi', value: ig?.followers || 0 },
                { label: 'Takip Edilen', value: ig?.following || 0 },
                { label: 'Toplam Gönderi', value: ig?.posts || 0 },
                { label: 'En İyi Gönderi Etk.', value: data.engagement.bestPost?.engagement || 0 },
            ],
            color: 'from-pink-500 to-purple-600'
        },
        {
            title: 'Facebook Raporu',
            period: 'Güncel',
            metrics: [
                { label: 'Sayfa Beğenisi', value: fb?.fans || 0 },
                { label: 'Takipçi', value: fb?.followers || 0 },
                { label: 'Bahseden Kişi', value: fb?.talkingAbout || 0 },
                { label: 'Burada Bulunmuş', value: fb?.wereHere || 0 },
            ],
            color: 'from-blue-600 to-indigo-700'
        },
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reportCards.map((card, i) => (
                    <Card key={i} className={`p-6 bg-gradient-to-br ${card.color} border-none text-white shadow-xl`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{card.title}</h3>
                                <p className="text-sm opacity-75">{card.period}</p>
                            </div>
                            <FileText size={24} className="opacity-30" />
                        </div>
                        <div className="space-y-3">
                            {card.metrics.map((m, j) => (
                                <div key={j} className="flex justify-between items-center">
                                    <span className="text-sm opacity-90">{m.label}</span>
                                    <span className="font-bold text-lg">
                                        {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Export Actions */}
            <Card className="p-6 bg-white dark:bg-slate-800/50 border-none shadow-lg">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Download size={20} className="text-cyan-500" /> Rapor İndirme
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={() => {
                            const jsonStr = JSON.stringify(data, null, 2)
                            const blob = new Blob([jsonStr], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url; a.download = `social-metrics-${new Date().toISOString().split('T')[0]}.json`
                            a.click(); URL.revokeObjectURL(url)
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
                    >
                        <Download size={16} /> JSON İndir
                    </button>
                    <button
                        onClick={() => {
                            const rows = [
                                ['Gönderi', 'Tür', 'Beğeni', 'Yorum', 'Etkileşim', 'Tarih'],
                                ...data.recentPosts.map(p => [
                                    `"${(p.caption || '').replace(/"/g, '""')}"`,
                                    p.type, p.likes, p.comments, p.engagement,
                                    new Date(p.timestamp).toLocaleDateString('tr-TR')
                                ])
                            ]
                            const csv = rows.map(r => r.join(',')).join('\n')
                            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url; a.download = `social-posts-${new Date().toISOString().split('T')[0]}.csv`
                            a.click(); URL.revokeObjectURL(url)
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 rounded-lg font-medium transition-colors"
                    >
                        <Download size={16} /> CSV İndir
                    </button>
                    <button
                        disabled
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg font-medium cursor-not-allowed opacity-50"
                    >
                        <Download size={16} /> PDF Rapor (Yakında)
                    </button>
                </div>
            </Card>
        </div>
    )
}
