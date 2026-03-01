'use client'
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { Share2, Instagram, Twitter, Facebook, Youtube, TrendingUp, TrendingDown, Users, Heart, MessageCircle, Eye, ExternalLink, Link2, Unlink, BarChart3, Calendar, ArrowUp, ArrowDown, Minus, Settings, Key, Clock, CheckCircle2, AlertCircle, FileText, BrainCircuit, Lightbulb, Target, Zap } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import UnifiedInbox from '@/components/admin/social/UnifiedInbox'

// ─── Types ─────────────────────────────────────────────────────
interface SocialAccount {
    platform: string
    icon: React.ReactNode
    color: string
    bgColor: string
    connected: boolean
    handle: string
    followers: number
    followersChange: number
    posts: number
    engagement: number
    engagementChange: number
    reach: number
}

// ─── Constants ─────────────────────────────────────────────────
const BASE_ACCOUNTS: SocialAccount[] = [
    {
        platform: 'Instagram', icon: <Instagram size={18} />, color: '#E4405F', bgColor: 'from-pink-600 to-purple-600',
        connected: false, handle: '', followers: 0, followersChange: 0, posts: 0, engagement: 0, engagementChange: 0, reach: 0
    },
    {
        platform: 'Facebook', icon: <Facebook size={18} />, color: '#1877F2', bgColor: 'from-blue-600 to-blue-700',
        connected: false, handle: '', followers: 0, followersChange: 0, posts: 0, engagement: 0, engagementChange: 0, reach: 0
    },
    {
        platform: 'Twitter', icon: <Twitter size={18} />, color: '#1DA1F2', bgColor: 'from-sky-500 to-sky-600',
        connected: false, handle: '', followers: 0, followersChange: 0, posts: 0, engagement: 0, engagementChange: 0, reach: 0
    },
    {
        platform: 'YouTube', icon: <Youtube size={18} />, color: '#FF0000', bgColor: 'from-red-600 to-red-700',
        connected: false, handle: '', followers: 0, followersChange: 0, posts: 0, engagement: 0, engagementChange: 0, reach: 0
    }
]

const ENGAGEMENT_DATA = [
    { name: 'Oca', instagram: 320, facebook: 180 },
    { name: 'Şub', instagram: 450, facebook: 210 },
    { name: 'Mar', instagram: 680, facebook: 280 },
    { name: 'Nis', instagram: 920, facebook: 350 },
    { name: 'May', instagram: 1450, facebook: 480 },
    { name: 'Haz', instagram: 2100, facebook: 640 },
    { name: 'Tem', instagram: 2800, facebook: 820 },
    { name: 'Ağu', instagram: 3100, facebook: 950 },
    { name: 'Eyl', instagram: 1900, facebook: 550 },
    { name: 'Eki', instagram: 1200, facebook: 380 },
]

const FOLLOWER_GROWTH = [
    { name: 'Oca', followers: 20100 },
    { name: 'Şub', followers: 20600 },
    { name: 'Mar', followers: 21200 },
    { name: 'Nis', followers: 21900 },
    { name: 'May', followers: 22800 },
    { name: 'Haz', followers: 23500 },
    { name: 'Tem', followers: 24100 },
    { name: 'Ağu', followers: 24500 },
]

const CONTENT_PERFORMANCE = [
    { type: 'Reels', engagement: 5.2, reach: 35000, color: '#E4405F' },
    { type: 'Carousel', engagement: 3.8, reach: 22000, color: '#F59E0B' },
    { type: 'Photo', engagement: 2.1, reach: 12000, color: '#06B6D4' },
    { type: 'Story', engagement: 1.5, reach: 18000, color: '#8B5CF6' },
]

const RECENT_POSTS = [
    { id: 1, platform: 'Instagram', type: 'Reel', content: 'Sunset views from our infinity pool 🌅', likes: 342, comments: 28, shares: 15, date: '2 saat önce' },
    { id: 2, platform: 'Instagram', type: 'Carousel', content: 'Room tour: Our newly renovated suites ✨', likes: 218, comments: 14, shares: 8, date: '1 gün önce' },
    { id: 3, platform: 'Facebook', type: 'Photo', content: 'Aqua Restaurant yeni menüsü ile hizmetinizde 🍽️', likes: 156, comments: 22, shares: 11, date: '2 gün önce' },
    { id: 4, platform: 'Instagram', type: 'Story', content: 'Behind the scenes: Breakfast preparation 🥐', likes: 89, comments: 0, shares: 0, date: '3 gün önce' },
]

const AUDIENCE_DEMOGRAPHICS = [
    { name: '18-24', value: 15, color: '#0ea5e9' },
    { name: '25-34', value: 45, color: '#3b82f6' },
    { name: '35-44', value: 25, color: '#6366f1' },
    { name: '45-54', value: 10, color: '#8b5cf6' },
    { name: '55+', value: 5, color: '#a855f7' },
]

const COMPETITOR_BENCHMARKING = [
    { subject: 'Etkileşim Oranı', A: 5.2, B: 3.8, fullMark: 10 },
    { subject: 'Takipçi Büyümesi', A: 4.1, B: 2.5, fullMark: 10 },
    { subject: 'İçerik Kalitesi', A: 8.5, B: 7.0, fullMark: 10 },
    { subject: 'Yanıt Hızı', A: 9.0, B: 6.5, fullMark: 10 },
    { subject: 'Video (Reels)', A: 7.5, B: 4.2, fullMark: 10 },
    { subject: 'Influencer', A: 6.0, B: 8.5, fullMark: 10 },
]

const STRATEGIC_INSIGHTS = [
    { type: 'opportunity', title: 'Reels İçeriklerinde Yüksek Potansiyel', desc: 'Son 30 gündeki Reels içerikleriniz, fotoğraflara göre %145 daha fazla erişim elde etti. Özellikle akşam üstü 17:00 paylaşımlarında algoritma sizi öne çıkarıyor. Video içeriği üretimini haftada en az 4\'e çıkarmalısınız.', impact: 'Yüksek Etki', action: 'Video Prodüksiyonu Artırılmalı' },
    { type: 'warning', title: 'Hafta Sonu Etkileşim Düşüşü', desc: 'Facebook sayfanızdaki hafta sonu etkileşimleri %22 oranında düştü. Aile odaklı pazar kahvaltısı veya etkinlik postları hafta sonu algırtimasına daha uygundur.', impact: 'Orta Etki', action: 'İçerik Takvimini Revize Et' },
    { type: 'success', title: 'Uluslararası Kitle Büyümesi', desc: 'İngiltere (UK) ve Almanya lokasyonlu takipçi sayınızda organik olarak %8\'lik bir artış tespit edildi. Bu kitleye özel İngilizce/Almanca çift dilli hikaye (Story) serileri başlatabilirsiniz.', impact: 'Yüksek Etki', action: 'Hedefli Dil Kullanımı' }
]

export default function SocialMediaPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'insights' | 'inbox' | 'schedule' | 'settings'>('overview')
    const [chartType, setChartType] = useState<'engagement' | 'growth'>('engagement')
    const [savedPosts, setSavedPosts] = useState<any[]>([])
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({
        instagram_token: '',
        facebook_token: '',
        twitter_key: '',
        twitter_secret: '',
    })
    const [autoPostEnabled, setAutoPostEnabled] = useState(false)
    const [autoPostFrequency, setAutoPostFrequency] = useState<'daily' | 'every2days' | 'weekly'>('every2days')
    const [autoPostTime, setAutoPostTime] = useState('10:00')
    const [autoPostPlatforms, setAutoPostPlatforms] = useState<Record<string, boolean>>({
        instagram: true, facebook: true, twitter: false
    })

    const [accounts, setAccounts] = useState<SocialAccount[]>(BASE_ACCOUNTS)
    const [loading, setLoading] = useState(true)

    // Load saved posts from localStorage on mount and fetch real API data
    React.useEffect(() => {
        try {
            const stored = localStorage.getItem('bdr-social-posts')
            if (stored) setSavedPosts(JSON.parse(stored))
        } catch { }

        const loadSocialData = async () => {
            try {
                const res = await fetch('/api/admin/analytics/social')
                const result = await res.json()

                if (result.success && result.data) {
                    setAccounts(prev => prev.map(acc => {
                        if (acc.platform === 'Facebook' && result.data.facebook) {
                            return {
                                ...acc,
                                connected: true,
                                handle: result.data.facebook?.name || 'Facebook Page',
                                followers: result.data.facebook.followers || 0,
                                engagement: result.data.facebook.engagement || 0
                            }
                        }
                        if (acc.platform === 'Instagram' && result.data.instagram) {
                            return {
                                ...acc,
                                connected: true,
                                handle: result.data.instagram.username || '@instagram',
                                followers: result.data.instagram.followers || 0,
                                posts: result.data.instagram.posts || 0,
                            }
                        }
                        return acc
                    }))
                }
            } catch (err) {
                console.error('Failed to fetch social media data', err)
            } finally {
                setLoading(false)
            }
        }

        loadSocialData()
    }, [])

    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <Share2 size={28} className="text-cyan-500" />
                        Sosyal Medya
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Sosyal medya hesaplarınızı bağlayın ve performansınızı takip edin.</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    {(['overview', 'analytics', 'insights', 'inbox', 'schedule', 'settings'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === tab ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                            {tab === 'overview' ? 'Genel Bakış' : tab === 'analytics' ? 'Büyük Veri & Demografi' : tab === 'insights' ? 'Yapay Zeka & Strateji' : tab === 'inbox' ? 'Gelen Kutusu' : tab === 'schedule' ? 'Takvim' : 'Bağlantılar'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Connected Accounts Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {accounts.map(account => (
                    <div key={account.platform}
                        className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${account.connected
                            ? 'bg-white dark:bg-[#1e293b] border-slate-200 dark:border-white/10'
                            : 'bg-slate-50 dark:bg-[#0f172a] border-dashed border-slate-300 dark:border-slate-700 opacity-70'
                            }`}
                    >
                        <div className={`h-1.5 bg-gradient-to-r ${account.bgColor}`} />
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: account.color + '20', color: account.color }}>
                                        {account.icon}
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{account.platform}</span>
                                </div>
                                {account.connected ? (
                                    <button className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1">
                                        <Unlink size={12} /> Ayır
                                    </button>
                                ) : (
                                    <button className="text-xs px-2 py-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors flex items-center gap-1">
                                        <Link2 size={12} /> Bağla
                                    </button>
                                )}
                            </div>
                            {account.connected ? (
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-500">{account.handle}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                                            <div className="text-lg font-bold text-slate-900 dark:text-white">{fmt(account.followers)}</div>
                                            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                                                <Users size={10} /> Takipçi
                                                {account.followersChange !== 0 && (
                                                    <span className={account.followersChange > 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                        {account.followersChange > 0 ? '+' : ''}{account.followersChange}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                                            <div className="text-lg font-bold text-slate-900 dark:text-white">{account.engagement}%</div>
                                            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                                                <Heart size={10} /> Etkileşim
                                                {account.engagementChange !== 0 && (
                                                    <span className={account.engagementChange > 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                        {account.engagementChange > 0 ? '+' : ''}{account.engagementChange}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic mt-2">Henüz bağlanmadı. Bağla butonuna tıklayarak hesabınızı ekleyin.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Engagement Chart */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-white">Etkileşim Trendi</h3>
                                <div className="flex gap-1">
                                    <div className="flex items-center gap-1 text-xs text-pink-500"><div className="w-2 h-2 bg-pink-500 rounded-full" /> Instagram</div>
                                    <div className="flex items-center gap-1 text-xs text-blue-500 ml-2"><div className="w-2 h-2 bg-blue-500 rounded-full" /> Facebook</div>
                                </div>
                            </div>
                            <div className="p-4 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={ENGAGEMENT_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                        <Tooltip content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                                                        {payload.map((p: any) => (
                                                            <p key={p.dataKey} className="font-bold text-slate-900 dark:text-white text-sm" style={{ color: p.stroke }}>{p.dataKey}: {p.value}</p>
                                                        ))}
                                                    </div>
                                                )
                                            }
                                            return null
                                        }} />
                                        <Area type="monotone" dataKey="instagram" stroke="#E4405F" fill="#E4405F" fillOpacity={0.2} />
                                        <Area type="monotone" dataKey="facebook" stroke="#1877F2" fill="#1877F2" fillOpacity={0.2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Follower Growth */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="p-4 border-b border-slate-200 dark:border-white/10">
                                <h3 className="font-bold text-slate-900 dark:text-white">Takipçi Büyümesi (Instagram)</h3>
                            </div>
                            <div className="p-4 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={FOLLOWER_GROWTH}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                        <Tooltip content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                                                        <p className="font-bold text-slate-900 dark:text-white">{payload[0].value?.toLocaleString()} takipçi</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }} />
                                        <Line type="monotone" dataKey="followers" stroke="#E4405F" strokeWidth={3} dot={{ r: 5, fill: '#E4405F' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Content Performance */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="font-bold text-slate-900 dark:text-white">İçerik Tipi Performansı</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200 dark:divide-white/5">
                            {CONTENT_PERFORMANCE.map(cp => (
                                <div key={cp.type} className="p-4 text-center">
                                    <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: cp.color + '15' }}>
                                        <BarChart3 size={20} style={{ color: cp.color }} />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{cp.type}</h4>
                                    <div className="text-xs text-slate-500 mb-2">Etkileşim: <span className="font-bold text-slate-900 dark:text-white">{cp.engagement}%</span></div>
                                    <div className="text-xs text-slate-500">Erişim: <span className="font-bold text-slate-900 dark:text-white">{fmt(cp.reach)}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Posts */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="font-bold text-slate-900 dark:text-white">Son Paylaşımlar</h3>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-white/5">
                            {RECENT_POSTS.map(post => (
                                <div key={post.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: (post.platform === 'Instagram' ? '#E4405F' : '#1877F2') + '15', color: post.platform === 'Instagram' ? '#E4405F' : '#1877F2' }}>
                                        {post.platform === 'Instagram' ? <Instagram size={18} /> : <Facebook size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-900 dark:text-white font-medium truncate">{post.content}</p>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold">{post.type}</span>
                                            <span>{post.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
                                        <span className="flex items-center gap-1"><Heart size={12} className="text-red-400" /> {post.likes}</span>
                                        <span className="flex items-center gap-1"><MessageCircle size={12} className="text-blue-400" /> {post.comments}</span>
                                        <span className="flex items-center gap-1"><Share2 size={12} className="text-cyan-400" /> {post.shares}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    {/* Platform Comparison */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="font-bold text-slate-900 dark:text-white">Platform Karşılaştırması</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-[#0f172a] text-slate-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4">Platform</th>
                                        <th className="p-4">Takipçi</th>
                                        <th className="p-4">Büyüme</th>
                                        <th className="p-4">Post</th>
                                        <th className="p-4">Etkileşim</th>
                                        <th className="p-4">Erişim</th>
                                        <th className="p-4">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {accounts.map(a => (
                                        <tr key={a.platform} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: a.color + '20', color: a.color }}>{a.icon}</div>
                                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{a.platform}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-slate-900 dark:text-white">{fmt(a.followers)}</td>
                                            <td className="p-4">
                                                {a.followersChange !== 0 ? (
                                                    <span className={`text-sm font-bold ${a.followersChange > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {a.followersChange > 0 ? '+' : ''}{a.followersChange}%
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{a.posts}</td>
                                            <td className="p-4 font-bold text-slate-900 dark:text-white">{a.engagement}%</td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{fmt(a.reach)}</td>
                                            <td className="p-4">
                                                {a.connected ? (
                                                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 text-xs rounded-lg font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Bağlı</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs rounded-lg font-bold flex items-center gap-1 w-fit"><AlertCircle size={12} /> Bağlı Değil</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Content Type Performance Detail */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="p-4 border-b border-slate-200 dark:border-white/10">
                                <h3 className="font-bold text-slate-900 dark:text-white">İçerik Türü Performansı</h3>
                            </div>
                            <div className="p-4 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={CONTENT_PERFORMANCE}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
                                        <XAxis dataKey="type" tick={{ fontSize: 11 }} stroke="currentColor" className="text-slate-500" />
                                        <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-slate-500" />
                                        <Tooltip content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
                                                        <p className="text-xs text-slate-500 mb-1">{label}</p>
                                                        <p className="font-bold text-slate-900 dark:text-white">Etkileşim: {payload[0].value}%</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }} />
                                        <Bar dataKey="engagement" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="p-4 border-b border-slate-200 dark:border-white/10">
                                <h3 className="font-bold text-slate-900 dark:text-white">En İyi Paylaşım Saatleri</h3>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { time: '09:00 - 11:00', label: 'Sabah', engagement: '5.2%', best: true },
                                        { time: '12:00 - 14:00', label: 'Öğle', engagement: '3.8%', best: false },
                                        { time: '17:00 - 19:00', label: 'Akşam', engagement: '6.1%', best: true },
                                        { time: '21:00 - 23:00', label: 'Gece', engagement: '4.5%', best: false },
                                    ].map(slot => (
                                        <div key={slot.time} className={`p-3 rounded-xl border ${slot.best ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock size={14} className={slot.best ? 'text-emerald-500' : 'text-slate-400'} />
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">{slot.label}</span>
                                            </div>
                                            <p className="text-xs text-slate-500">{slot.time}</p>
                                            <p className={`text-sm font-bold mt-1 ${slot.best ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-300'}`}>{slot.engagement}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Advanced Analytics (Consulting Grade) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                        {/* Demographics Pie */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="p-4 border-b border-slate-200 dark:border-white/10">
                                <h3 className="font-bold text-slate-900 dark:text-white">Yaş Dağılımı (Demografi)</h3>
                            </div>
                            <div className="p-4 h-64 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={AUDIENCE_DEMOGRAPHICS}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {AUDIENCE_DEMOGRAPHICS.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', borderColor: '#334155', backgroundColor: '#1e293b', color: '#fff' }}
                                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                            formatter={(value) => [`%${value}`, 'Oran']}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Audience Locations */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="p-4 border-b border-slate-200 dark:border-white/10">
                                <h3 className="font-bold text-slate-900 dark:text-white">En İyi Lokasyonlar</h3>
                            </div>
                            <div className="p-4">
                                <div className="space-y-4">
                                    {[
                                        { city: 'Istanbul, TR', percent: 38, color: 'bg-blue-500' },
                                        { city: 'London, UK', percent: 18, color: 'bg-indigo-500' },
                                        { city: 'Berlin, DE', percent: 14, color: 'bg-purple-500' },
                                        { city: 'Bodrum, TR', percent: 12, color: 'bg-pink-500' },
                                        { city: 'Moscow, RU', percent: 8, color: 'bg-rose-500' },
                                    ].map(loc => (
                                        <div key={loc.city}>
                                            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                <span>{loc.city}</span>
                                                <span>{loc.percent}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                                <div className={`${loc.color} h-2 rounded-full`} style={{ width: `${loc.percent}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'insights' && (
                <div className="space-y-6">
                    {/* Insights Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl border border-indigo-500/30 shadow-lg overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <BrainCircuit size={120} />
                            </div>
                            <div className="p-6 relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg"><BrainCircuit size={20} /></div>
                                    <h3 className="text-xl font-bold text-white">Yapay Zeka Strateji Danışmanı</h3>
                                </div>
                                <p className="text-indigo-200 text-sm mb-6 max-w-xl">
                                    Mevcut sosyal medya verileriniz, reklam harcamalarınız ve dönüşüm oranlarınız AI tarafından analiz edildi. Aşağıdaki stratejik içgörüler markanızın dijital varlığını güçlendirmek için oluşturulmuştur.
                                </p>

                                <div className="space-y-4">
                                    {STRATEGIC_INSIGHTS.map((insight, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 p-2 rounded-full ${insight.type === 'opportunity' ? 'bg-cyan-500/20 text-cyan-400' : insight.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                    {insight.type === 'opportunity' ? <Target size={16} /> : insight.type === 'warning' ? <AlertCircle size={16} /> : <Zap size={16} />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-bold text-sm mb-1">{insight.title}</h4>
                                                    <p className="text-indigo-200/80 text-xs leading-relaxed mb-3">{insight.desc}</p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-white/10 px-2 py-1 rounded">{insight.action}</span>
                                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${insight.impact === 'Yüksek Etki' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'}`}>{insight.impact}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Competitor Radar Chart */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col">
                            <div className="p-4 border-b border-slate-200 dark:border-white/10">
                                <h3 className="font-bold text-slate-900 dark:text-white">Rakip Kıyaslama Analizi</h3>
                                <p className="text-[10px] text-slate-500 mt-1">Siz (Mavi) vs. Sektör Ortalaması (Gri)</p>
                            </div>
                            <div className="p-4 flex-1 flex items-center justify-center min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={COMPETITOR_BENCHMARKING}>
                                        <PolarGrid stroke="#334155" opacity={0.3} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                        <Radar name="Blue Dreams" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
                                        <Radar name="Sektör Ortalaması" dataKey="B" stroke="#64748b" fill="#64748b" fillOpacity={0.2} />
                                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'inbox' && (
                <UnifiedInbox />
            )}

            {activeTab === 'schedule' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Calendar size={18} className="text-cyan-500" /> İçerik Takvimi</h3>
                            <a href="social/content" className="text-xs px-3 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors font-medium">+ Yeni İçerik Oluştur</a>
                        </div>

                        {savedPosts.length === 0 ? (
                            <div className="p-12 text-center">
                                <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Henüz kaydedilmiş içerik yok</h4>
                                <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">İçerik Üretici sayfasından AI ile içerik oluşturun, taslak olarak kaydedin veya tarih belirleyerek zamanlang.</p>
                                <a href="social/content" className="inline-block px-6 py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors">İçerik Üretici&apos;ye Git</a>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-white/5">
                                {savedPosts.map(post => (
                                    <div key={post.id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${post.status === 'scheduled' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600'
                                                }`}>
                                                {post.status === 'scheduled' ? <Clock size={18} /> : <FileText size={18} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{post.topic}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${post.status === 'scheduled' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                                                        }`}>
                                                        {post.status === 'scheduled' ? 'Zamanlı' : 'Taslak'}
                                                    </span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 font-bold">{post.platform}</span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {post.scheduledDate ? `${post.scheduledDate} ${post.scheduledTime || ''}` : new Date(post.createdAt).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-colors">Şimdi Paylaş</button>
                                            <button onClick={() => {
                                                const updated = savedPosts.filter(p => p.id !== post.id)
                                                setSavedPosts(updated)
                                                localStorage.setItem('bdr-social-posts', JSON.stringify(updated))
                                            }} className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold rounded-lg transition-colors">Sil</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Settings size={18} className="text-cyan-500" /> API Bağlantı Ayarları</h3>
                            <p className="text-xs text-slate-500 mt-1">Otomatik paylaşım için platform API anahtarlarınızı yapılandırın.</p>
                        </div>
                        <div className="p-6 space-y-6">
                            {[
                                { platform: 'Instagram', icon: <Instagram size={18} />, color: '#E4405F', fields: [{ key: 'instagram_token', label: 'Access Token', placeholder: 'Instagram Graph API token' }] },
                                { platform: 'Facebook', icon: <Facebook size={18} />, color: '#1877F2', fields: [{ key: 'facebook_token', label: 'Page Access Token', placeholder: 'Facebook page token' }] },
                                { platform: 'Twitter / X', icon: <Twitter size={18} />, color: '#1DA1F2', fields: [{ key: 'twitter_key', label: 'API Key', placeholder: 'Consumer API key' }, { key: 'twitter_secret', label: 'API Secret', placeholder: 'Consumer API secret' }] },
                            ].map(p => (
                                <div key={p.platform} className="bg-slate-50 dark:bg-[#0f172a] rounded-xl p-4 border border-slate-200 dark:border-white/10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + '15', color: p.color }}>
                                            {p.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{p.platform}</h4>
                                            <p className="text-[10px] text-slate-500">Otomatik paylaşım için kimlik bilgileri</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {p.fields.map(f => (
                                            <div key={f.key}>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{f.label}</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="password"
                                                        value={apiKeys[f.key] || ''}
                                                        onChange={(e) => setApiKeys(prev => ({ ...prev, [f.key]: e.target.value }))}
                                                        placeholder={f.placeholder}
                                                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-cyan-500"
                                                    />
                                                    <button className="px-3 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-500 transition-colors flex items-center gap-1">
                                                        <Key size={12} /> Kaydet
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 border border-cyan-200 dark:border-cyan-800 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-bold text-cyan-800 dark:text-cyan-300">Otomatik Paylaşım</p>
                                        <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">Zamanlı içerikler belirlenen saatte otomatik paylaşılır</p>
                                    </div>
                                    <button
                                        onClick={() => setAutoPostEnabled(!autoPostEnabled)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${autoPostEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                    >
                                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoPostEnabled ? 'left-[26px]' : 'left-0.5'}`} />
                                    </button>
                                </div>

                                {autoPostEnabled && (
                                    <div className="space-y-4 pt-3 border-t border-cyan-200 dark:border-cyan-800">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sıklık</label>
                                                <select value={autoPostFrequency} onChange={e => setAutoPostFrequency(e.target.value as any)}
                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none">
                                                    <option value="daily">Her Gün</option>
                                                    <option value="every2days">2 Günde Bir</option>
                                                    <option value="weekly">Haftada Bir</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Paylaşım Saati</label>
                                                <input type="time" value={autoPostTime} onChange={e => setAutoPostTime(e.target.value)}
                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Platformlar</label>
                                            <div className="flex gap-3">
                                                {(['instagram', 'facebook', 'twitter'] as const).map(p => (
                                                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" checked={autoPostPlatforms[p]} onChange={e => setAutoPostPlatforms(prev => ({ ...prev, [p]: e.target.checked }))}
                                                            className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">{p}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                                                ✅ Aktif — Zamanlı içerikler {autoPostFrequency === 'daily' ? 'her gün' : autoPostFrequency === 'every2days' ? '2 günde bir' : 'haftada bir'} saat {autoPostTime}&apos;de
                                                {' '}{Object.entries(autoPostPlatforms).filter(([, v]) => v).map(([k]) => k).join(', ')} üzerinden otomatik paylaşılacak.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
