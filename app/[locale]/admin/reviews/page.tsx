'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Star, MessageSquare, TrendingUp, Globe, Search, RefreshCw,
    ThumbsUp, ThumbsDown, ExternalLink, Filter, BarChart3,
    Loader2, AlertTriangle, CheckCircle, Clock, Eye
} from 'lucide-react'

interface Review {
    id: string
    platform: string
    author: string
    rating: number
    title: string
    content: string
    date: string
    reply: string | null
    sentiment: 'positive' | 'neutral' | 'negative'
    language: string
}

// ── Demo reviews data ──
function getDemoReviews(): Review[] {
    const platforms = ['Google', 'TripAdvisor', 'Booking.com', 'HolidayCheck', 'Trivago']
    const languages = ['TR', 'DE', 'EN', 'RU', 'NL']
    const names = [
        'Mehmet Y.', 'Hans M.', 'John S.', 'Olga P.', 'Jan V.',
        'Ayşe K.', 'Franz W.', 'Sarah L.', 'Dmitri K.', 'Pieter D.',
        'Fatma Ö.', 'Klaus B.', 'Emma T.', 'Anna S.', 'Willem R.'
    ]
    const positiveComments = [
        'Mükemmel bir tatil deneyimi yaşadık. Personel çok ilgili ve yardımsever.',
        'Amazing resort with stunning views. Staff was incredibly friendly.',
        'Wunderschönes Hotel mit tollem Service. Werden wiederkommen!',
        'Прекрасный отель, отличный сервис и еда.',
        'Prachtig resort, geweldig personeel. Zeker een aanrader!'
    ]
    const neutralComments = [
        'Genel olarak iyi bir otel. Havuz biraz kalabalık olabilir.',
        'Nice hotel, but the food could have more variety.',
        'Gutes Hotel. Einige Details könnten verbessert werden.'
    ]
    const negativeComments = [
        'Oda temizliği biraz daha iyi olabilirdi.',
        'Noise levels at night were a bit high. Room could use updating.',
        'Die Klimaanlage hat nicht richtig funktioniert.'
    ]

    const reviews: Review[] = []
    for (let i = 0; i < 20; i++) {
        const rating = [5, 5, 5, 4, 4, 4, 4, 3, 3, 2][Math.floor(Math.random() * 10)]
        const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative'
        const comments = sentiment === 'positive' ? positiveComments : sentiment === 'neutral' ? neutralComments : negativeComments
        const d = new Date()
        d.setDate(d.getDate() - Math.floor(Math.random() * 90))
        reviews.push({
            id: `rev-${i}`,
            platform: platforms[Math.floor(Math.random() * platforms.length)],
            author: names[i % names.length],
            rating,
            title: rating >= 4 ? 'Harika Tatil' : rating === 3 ? 'Ortalama' : 'Geliştirilebilir',
            content: comments[Math.floor(Math.random() * comments.length)],
            date: d.toISOString().split('T')[0],
            reply: Math.random() > 0.4 ? 'Değerli misafirimiz, güzel yorumunuz için teşekkür ederiz.' : null,
            sentiment,
            language: languages[Math.floor(Math.random() * languages.length)]
        })
    }
    return reviews.sort((a, b) => b.date.localeCompare(a.date))
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [platformFilter, setPlatformFilter] = useState('')
    const [sentimentFilter, setSentimentFilter] = useState('')
    const [replyDraft, setReplyDraft] = useState<Record<string, string>>({})

    useEffect(() => {
        setTimeout(() => {
            setReviews(getDemoReviews())
            setLoading(false)
        }, 500)
    }, [])

    const filtered = reviews.filter(r => {
        if (search && !r.content.toLowerCase().includes(search.toLowerCase()) && !r.author.toLowerCase().includes(search.toLowerCase())) return false
        if (platformFilter && r.platform !== platformFilter) return false
        if (sentimentFilter && r.sentiment !== sentimentFilter) return false
        return true
    })

    const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '0'
    const positive = reviews.filter(r => r.sentiment === 'positive').length
    const neutral = reviews.filter(r => r.sentiment === 'neutral').length
    const negative = reviews.filter(r => r.sentiment === 'negative').length
    const unanswered = reviews.filter(r => !r.reply).length
    const platforms = [...new Set(reviews.map(r => r.platform))]

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={14} className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'} />
            ))}
        </div>
    )

    const sentimentIcon = (s: string) => {
        if (s === 'positive') return <ThumbsUp size={14} className="text-emerald-500" />
        if (s === 'negative') return <ThumbsDown size={14} className="text-red-500" />
        return <AlertTriangle size={14} className="text-yellow-500" />
    }

    if (loading) return <div className="p-12 flex justify-center items-center text-muted-foreground"><Loader2 className="animate-spin mr-2" /> Yorumlar yükleniyor...</div>

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Star size={24} className="text-yellow-500" /> Misafir Yorumları</h1>
                <p className="text-sm text-muted-foreground mt-1">Tüm platformlardan toplanan misafir değerlendirmeleri ve yanıt yönetimi</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-yellow-500/20 rounded-lg text-yellow-500"><Star size={20} /></div>
                        <div><p className="text-2xl font-bold">{avgRating}</p><p className="text-xs text-muted-foreground">Ort. Puan</p></div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/20 rounded-lg text-emerald-500"><ThumbsUp size={20} /></div>
                        <div><p className="text-2xl font-bold">{positive}</p><p className="text-xs text-muted-foreground">Olumlu</p></div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-yellow-500/20 rounded-lg text-yellow-500"><AlertTriangle size={20} /></div>
                        <div><p className="text-2xl font-bold">{neutral}</p><p className="text-xs text-muted-foreground">Nötr</p></div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-500/20 rounded-lg text-red-500"><ThumbsDown size={20} /></div>
                        <div><p className="text-2xl font-bold">{negative}</p><p className="text-xs text-muted-foreground">Olumsuz</p></div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/20 rounded-lg text-blue-500"><Clock size={20} /></div>
                        <div><p className="text-2xl font-bold">{unanswered}</p><p className="text-xs text-muted-foreground">Yanıtsız</p></div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input className="w-full pl-9 pr-3 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                        placeholder="Yorum veya yazar ara..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
                    <option value="">Tüm Platformlar</option>
                    {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)}>
                    <option value="">Tüm Duygular</option>
                    <option value="positive">Olumlu</option>
                    <option value="neutral">Nötr</option>
                    <option value="negative">Olumsuz</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">Filtrelerinize uygun yorum bulunamadı.</Card>
                ) : filtered.map(r => (
                    <Card key={r.id} className={`p-4 hover:shadow-md transition ${r.sentiment === 'negative' && !r.reply ? 'border-red-300 dark:border-red-800' : ''}`}>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    {renderStars(r.rating)}
                                    <Badge variant="outline" className="text-xs">{r.platform}</Badge>
                                    <Badge variant="secondary" className="text-xs flex items-center gap-1">{sentimentIcon(r.sentiment)} {r.sentiment === 'positive' ? 'Olumlu' : r.sentiment === 'neutral' ? 'Nötr' : 'Olumsuz'}</Badge>
                                    <span className="text-xs text-muted-foreground">{r.language}</span>
                                    {r.reply ? <CheckCircle size={14} className="text-emerald-500" /> : <Clock size={14} className="text-orange-500" />}
                                </div>
                                <div>
                                    <span className="font-semibold text-sm">{r.author}</span>
                                    <span className="text-xs text-muted-foreground ml-2">{new Date(r.date).toLocaleDateString('tr')}</span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{r.content}</p>
                                {r.reply && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border-l-2 border-blue-500 mt-2">
                                        <p className="text-xs text-muted-foreground mb-1">Yanıtınız:</p>
                                        <p className="text-sm">{r.reply}</p>
                                    </div>
                                )}
                                {!r.reply && (
                                    <div className="mt-2 flex gap-2">
                                        <input className="flex-1 border dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                            placeholder="Yanıt yazın..."
                                            value={replyDraft[r.id] || ''}
                                            onChange={e => setReplyDraft(prev => ({ ...prev, [r.id]: e.target.value }))} />
                                        <button
                                            onClick={() => {
                                                if (!replyDraft[r.id]?.trim()) return
                                                setReviews(prev => prev.map(rv => rv.id === r.id ? { ...rv, reply: replyDraft[r.id] } : rv))
                                                setReplyDraft(prev => { const n = { ...prev }; delete n[r.id]; return n })
                                            }}
                                            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs whitespace-nowrap">
                                            Yanıtla
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Data source note */}
            <p className="text-xs text-center text-muted-foreground">
                📌 Bu sayfa şu anda demo veriler ile çalışmaktadır. Google, TripAdvisor vb. API entegrasyonları aktifleştirildiğinde gerçek yorumlar görüntülenecektir.
            </p>
        </div>
    )
}
