'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Eye, Users, MousePointer, Activity, TrendingUp, RefreshCw, BarChart3, Heart, MessageCircle, Share2, Image, Calendar } from 'lucide-react'

interface LiveTrafficSocialWidgetProps {
    from?: string // YYYY-MM-DD
    to?: string   // YYYY-MM-DD
}

// Fetch live traffic and social data from our APIs — date-aware
export default function LiveTrafficSocialWidget({ from, to }: LiveTrafficSocialWidgetProps) {
    const [traffic, setTraffic] = useState<any>(null)
    const [social, setSocial] = useState<any>(null)
    const [igInsights, setIgInsights] = useState<any>(null)
    const [fbInsights, setFbInsights] = useState<any>(null)
    const [followerGrowth, setFollowerGrowth] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [source, setSource] = useState<'ga4' | 'internal' | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            // Build date query params for traffic API
            const trafficParams = new URLSearchParams()
            if (from) trafficParams.set('startDate', from)
            if (to) trafficParams.set('endDate', to)
            const trafficQs = trafficParams.toString() ? `?${trafficParams.toString()}` : ''

            let trafficData = null

            // First try GA4
            try {
                const gaRes = await fetch(`/api/admin/analytics/traffic${trafficQs}`)
                if (gaRes.ok) {
                    const gData = await gaRes.json()
                    if (gData.success && gData.totals) {
                        trafficData = gData.totals
                        setSource('ga4')
                    }
                }
            } catch { /* GA4 not configured */ }

            // Fallback to internal PageView data
            if (!trafficData) {
                try {
                    // Calculate period as number of days
                    let period = '1' // "today" default
                    if (from && to) {
                        const diffMs = new Date(to).getTime() - new Date(from).getTime()
                        period = String(Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24))))
                    }
                    const intRes = await fetch(`/api/admin/analytics/internal?period=${period}`)
                    if (intRes.ok) {
                        const iData = await intRes.json()
                        if (iData.success) {
                            trafficData = iData.totals
                            setSource('internal')
                        }
                    }
                } catch { /* Internal also failed */ }
            }

            if (trafficData) {
                setTraffic(trafficData)
            }

            // Social media — overview + insights + follower growth
            try {
                const [socialRes, igInsRes, fbInsRes, growthRes] = await Promise.all([
                    fetch('/api/admin/analytics/social?action=overview'),
                    fetch('/api/admin/analytics/social?action=instagram-insights&period=day'),
                    fetch('/api/admin/analytics/social?action=facebook-insights&period=day'),
                    fetch('/api/admin/analytics/social?action=follower-growth'),
                ])

                const sData = await socialRes.json()
                if (socialRes.ok && sData.success) {
                    setSocial(sData.data)
                } else if (sData.error) {
                    setSocial({ error: sData.error })
                }

                if (igInsRes.ok) {
                    const igData = await igInsRes.json()
                    if (igData.success) setIgInsights(igData.insights)
                }

                if (fbInsRes.ok) {
                    const fbData = await fbInsRes.json()
                    if (fbData.success) setFbInsights(fbData.insights)
                }

                if (growthRes.ok) {
                    const gData = await growthRes.json()
                    if (gData.success) setFollowerGrowth(gData.growth)
                }
            } catch (err: any) {
                setSocial({ error: err?.message || 'API Hatası' })
            }

        } catch (error) {
            console.error('Error fetching live widgets', error)
        } finally {
            setLoading(false)
        }
    }, [from, to])

    useEffect(() => {
        fetchData()
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [fetchData])

    // Format date range for display
    const dateRangeLabel = from && to
        ? from === to
            ? new Date(from).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
            : `${new Date(from).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} – ${new Date(to).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : 'Bugün'

    // Extract recent FB posts
    const recentPosts = social?.facebook?.recentPosts || []

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Traffic Widget */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Activity className="text-blue-500" size={20} />
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Web Trafiği</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar size={10} /> {dateRangeLabel}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {loading ? <RefreshCw size={14} className="animate-spin text-slate-400" /> : (
                            traffic ? (
                                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    {source === 'ga4' ? 'GA4 Canlı' : 'Dahili Canlı'}
                                </span>
                            ) : (
                                <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">Kurulum Bekliyor</span>
                            )
                        )}
                        <button onClick={fetchData} disabled={loading} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                            <RefreshCw size={14} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-slate-500 text-xs mb-1">Ziyaretçiler</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {loading ? '...' : (traffic?.visitors?.toLocaleString() || traffic?.users?.toLocaleString() || '—')}
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-slate-500 text-xs mb-1">Sayfa Görüntüleme</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {loading ? '...' : (traffic?.pageViews?.toLocaleString() || '—')}
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-slate-500 text-xs mb-1">
                            {source === 'internal' ? 'Bugün' : 'Oturumlar'}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {loading ? '...' : (source === 'internal' ? (traffic?.todayViews?.toLocaleString() || '—') : (traffic?.sessions?.toLocaleString() || '—'))}
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-slate-500 text-xs mb-1">
                            {source === 'internal' ? 'Şu An Aktif' : 'Ort. Bounce Rate'}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {loading ? '...' : (source === 'internal' ? (traffic?.activeNow || '—') : `%${traffic?.averageBounceRate || '—'}`)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Social Media Widget — Enhanced */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="text-pink-500" size={20} />
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sosyal Medya</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar size={10} /> {dateRangeLabel}
                            </p>
                        </div>
                    </div>
                    {loading ? <RefreshCw size={14} className="animate-spin text-slate-400" /> : (
                        social?.error ? (
                            <span title={social.error} className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full truncate max-w-[200px] cursor-help">
                                Hata: {social.error}
                            </span>
                        ) : social?.instagram || social?.facebook ? (
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Meta Canlı
                            </span>
                        ) : (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">API Bekleniyor</span>
                        )
                    )}
                </div>

                <div className="space-y-3">
                    {/* Instagram Profile */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center text-white">
                                <Eye size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Instagram</p>
                                <p className="text-xs text-slate-500">
                                    {loading ? '...' : (social?.instagram?.username || '@bluedreamsresort')}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {loading ? '...' : (social?.instagram?.followers?.toLocaleString() || '—')}
                            </p>
                            <p className="text-xs text-slate-500">Takipçi</p>
                        </div>
                    </div>

                    {/* Instagram Insights (engagement for selected date) */}
                    {igInsights && !loading && (
                        <div className="grid grid-cols-3 gap-2">
                            {(igInsights.impressions || igInsights.reach || igInsights.profile_views) && (
                                <>
                                    <div className="bg-pink-50 dark:bg-pink-900/20 p-2 rounded-lg text-center">
                                        <p className="text-[10px] text-pink-500 mb-0.5">Gösterim</p>
                                        <p className="text-sm font-bold text-pink-700 dark:text-pink-300">{igInsights.impressions?.toLocaleString() || '—'}</p>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-center">
                                        <p className="text-[10px] text-purple-500 mb-0.5">Erişim</p>
                                        <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{igInsights.reach?.toLocaleString() || '—'}</p>
                                    </div>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg text-center">
                                        <p className="text-[10px] text-indigo-500 mb-0.5">Profil Ziyareti</p>
                                        <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{igInsights.profile_views?.toLocaleString() || '—'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Facebook Page */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white">
                                <Users size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Facebook</p>
                                <p className="text-xs text-slate-500">Sayfa Beğenileri</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {loading ? '...' : (social?.facebook?.followers?.toLocaleString() || social?.facebook?.likes?.toLocaleString() || '—')}
                            </p>
                            <p className="text-xs text-slate-500">Beğeni</p>
                        </div>
                    </div>

                    {/* Facebook Insights (engagement for selected date) */}
                    {fbInsights && !loading && (
                        <div className="grid grid-cols-3 gap-2">
                            {(fbInsights.page_impressions || fbInsights.page_engaged_users || fbInsights.page_post_engagements) && (
                                <>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
                                        <p className="text-[10px] text-blue-500 mb-0.5">Gösterim</p>
                                        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{fbInsights.page_impressions?.toLocaleString() || '—'}</p>
                                    </div>
                                    <div className="bg-sky-50 dark:bg-sky-900/20 p-2 rounded-lg text-center">
                                        <p className="text-[10px] text-sky-500 mb-0.5">Etkileşim</p>
                                        <p className="text-sm font-bold text-sky-700 dark:text-sky-300">{fbInsights.page_post_engagements?.toLocaleString() || '—'}</p>
                                    </div>
                                    <div className="bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded-lg text-center">
                                        <p className="text-[10px] text-cyan-500 mb-0.5">Aktif Kullanıcı</p>
                                        <p className="text-sm font-bold text-cyan-700 dark:text-cyan-300">{fbInsights.page_engaged_users?.toLocaleString() || '—'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Follower Growth */}
                    {followerGrowth && !loading && (
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <TrendingUp size={14} className="text-emerald-600" />
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                                Takipçi Artışı: {typeof followerGrowth === 'object' ? (
                                    <>
                                        {followerGrowth.instagram != null && <span className="mr-2">IG +{followerGrowth.instagram}</span>}
                                        {followerGrowth.facebook != null && <span>FB +{followerGrowth.facebook}</span>}
                                    </>
                                ) : '—'}
                            </p>
                        </div>
                    )}

                    {/* Recent Posts from Facebook */}
                    {recentPosts.length > 0 && !loading && (
                        <div className="mt-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                <Image size={12} /> Seçili Tarihte Gönderiler
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {recentPosts.slice(0, 3).map((post: any, idx: number) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-xs">
                                        <p className="text-slate-700 dark:text-slate-300 line-clamp-2 mb-1">
                                            {post.message || 'Gönderi (metin yok)'}
                                        </p>
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <span className="flex items-center gap-1"><Heart size={10} /> {post.likes || 0}</span>
                                            <span className="flex items-center gap-1"><MessageCircle size={10} /> {post.comments || 0}</span>
                                            <span className="flex items-center gap-1"><Share2 size={10} /> {post.shares || 0}</span>
                                            <span className="ml-auto text-[10px]">
                                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR') : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
