'use client'
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { Share2, Instagram, Twitter, Facebook, Youtube, TrendingUp, TrendingDown, Users, Heart, MessageCircle, Eye, ExternalLink, Link2, Unlink, BarChart3, Calendar, ArrowUp, ArrowDown, Minus, Settings, Key, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'

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

// ─── Mock Data ─────────────────────────────────────────────────
const ACCOUNTS: SocialAccount[] = [
    {
        platform: 'Instagram', icon: <Instagram size={18} />, color: '#E4405F', bgColor: 'from-pink-600 to-purple-600',
        connected: true, handle: '@bluedreamsresort', followers: 24500, followersChange: 3.2, posts: 456, engagement: 4.8, engagementChange: 0.5, reach: 85000
    },
    {
        platform: 'Facebook', icon: <Facebook size={18} />, color: '#1877F2', bgColor: 'from-blue-600 to-blue-700',
        connected: true, handle: 'Blue Dreams Resort', followers: 18200, followersChange: 1.1, posts: 312, engagement: 2.3, engagementChange: -0.2, reach: 62000
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

export default function SocialMediaPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'schedule' | 'settings'>('overview')
    const [chartType, setChartType] = useState<'engagement' | 'growth'>('engagement')
    const [savedPosts, setSavedPosts] = useState<any[]>([])
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({
        instagram_token: '',
        facebook_token: '',
        twitter_key: '',
        twitter_secret: '',
    })

    // Load saved posts from localStorage on mount
    React.useEffect(() => {
        try {
            const stored = localStorage.getItem('bdr-social-posts')
            if (stored) setSavedPosts(JSON.parse(stored))
        } catch { }
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
                <div className="flex gap-2">
                    {(['overview', 'analytics', 'schedule', 'settings'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === tab ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                            {tab === 'overview' ? 'Genel Bakış' : tab === 'analytics' ? 'Analytics' : tab === 'schedule' ? 'Takvim' : 'API Ayarları'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Connected Accounts Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ACCOUNTS.map(account => (
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
                                                <span className={account.followersChange >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                    {account.followersChange >= 0 ? '+' : ''}{account.followersChange}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                                            <div className="text-lg font-bold text-slate-900 dark:text-white">{account.engagement}%</div>
                                            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                                                <Heart size={10} /> Etkileşim
                                                <span className={account.engagementChange >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                    {account.engagementChange >= 0 ? '+' : ''}{account.engagementChange}%
                                                </span>
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
                                    {ACCOUNTS.map(a => (
                                        <tr key={a.platform} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: a.color + '20', color: a.color }}>{a.icon}</div>
                                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{a.platform}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-slate-900 dark:text-white">{fmt(a.followers)}</td>
                                            <td className="p-4">
                                                <span className={`text-sm font-bold ${a.followersChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {a.followersChange >= 0 ? '+' : ''}{a.followersChange}%
                                                </span>
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
                </div>
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

                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">Otomatik Paylaşım — Yakında</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">API anahtarlarınızı ayarladıktan sonra zaman planlı içerikler otomatik olarak paylaşılacaktır. Bu özellik yakında aktif olacak.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
