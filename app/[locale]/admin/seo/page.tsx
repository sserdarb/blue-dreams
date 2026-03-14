'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Search, Globe, TrendingUp, FileText, Link2, BarChart3,
    Loader2, AlertTriangle, CheckCircle, XCircle, ExternalLink,
    Info, Eye, MousePointer, Clock, ArrowUp, ArrowDown, Minus
} from 'lucide-react'

interface PageSEO {
    path: string; title: string; description: string; score: number
    indexed: boolean; issues: string[]; clicks: number; impressions: number
    position: number; ctr: number
}

function getDemoSEOData(): { pages: PageSEO[], overview: Record<string, number> } {
    const pages: PageSEO[] = [
        { path: '/', title: 'Blue Dreams Resort - Bodrum All Inclusive', description: 'Bodrum luxury all-inclusive resort', score: 92, indexed: true, issues: [], clicks: 4520, impressions: 32400, position: 3.2, ctr: 13.9 },
        { path: '/rooms', title: 'Odalar & Süitler - Blue Dreams', description: 'Luxury rooms and suites', score: 85, indexed: true, issues: ['Meta description 160 karakteri aşıyor'], clicks: 1820, impressions: 12300, position: 5.1, ctr: 14.8 },
        { path: '/spa', title: 'Spa & Wellness - Blue Dreams Resort', description: 'Spa and wellness center', score: 78, indexed: true, issues: ['Eksik alt etiketleri (3 resim)', 'H2 başlık eksik'], clicks: 890, impressions: 8200, position: 8.4, ctr: 10.8 },
        { path: '/restaurant', title: 'Restoranlar - Blue Dreams', description: 'A la carte and buffet restaurants', score: 88, indexed: true, issues: [], clicks: 1340, impressions: 9800, position: 4.7, ctr: 13.7 },
        { path: '/activities', title: 'Aktiviteler - Blue Dreams Resort', description: '', score: 52, indexed: true, issues: ['Meta description eksik', 'Düşük kelime sayısı (< 300 kelime)'], clicks: 420, impressions: 5600, position: 15.2, ctr: 7.5 },
        { path: '/contact', title: 'İletişim - Blue Dreams Resort', description: 'Contact information', score: 72, indexed: true, issues: ['Schema markup eksik', 'Canonical URL eksik'], clicks: 680, impressions: 4200, position: 6.3, ctr: 16.2 },
        { path: '/gallery', title: 'Galeri', description: '', score: 45, indexed: false, issues: ['Başlık çok kısa', 'Meta description eksik', 'Alt etiketleri eksik', 'Index engeli mevcut'], clicks: 0, impressions: 0, position: 0, ctr: 0 },
        { path: '/offers', title: 'Özel Teklifler - Blue Dreams Resort Bodrum', description: 'Special offers and packages', score: 81, indexed: true, issues: ['Başlık 60 karakteri aşıyor'], clicks: 2100, impressions: 14500, position: 4.2, ctr: 14.5 },
        { path: '/wedding', title: 'Düğün & Etkinlikler', description: 'Bodrum wedding venue', score: 68, indexed: true, issues: ['İç bağlantı yetersiz', 'H1 çift kullanım'], clicks: 520, impressions: 3800, position: 9.7, ctr: 13.7 },
        { path: '/blog', title: 'Blog - Blue Dreams Resort', description: 'Travel tips and news', score: 75, indexed: true, issues: ['Tarih yapılandırılmış veri eksik'], clicks: 1150, impressions: 11200, position: 7.8, ctr: 10.3 },
    ]
    const totalClicks = pages.reduce((a, p) => a + p.clicks, 0)
    const totalImpressions = pages.reduce((a, p) => a + p.impressions, 0)
    const avgPosition = pages.filter(p => p.position > 0).reduce((a, p) => a + p.position, 0) / pages.filter(p => p.position > 0).length
    const avgCTR = totalClicks / totalImpressions * 100
    return {
        pages,
        overview: { totalClicks, totalImpressions, avgPosition: parseFloat(avgPosition.toFixed(1)), avgCTR: parseFloat(avgCTR.toFixed(1)), indexedPages: pages.filter(p => p.indexed).length, totalIssues: pages.reduce((a, p) => a + p.issues.length, 0) }
    }
}

export default function SEOPage() {
    const [data, setData] = useState<ReturnType<typeof getDemoSEOData> | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<'score' | 'clicks' | 'position'>('score')

    useEffect(() => {
        setTimeout(() => { setData(getDemoSEOData()); setLoading(false) }, 400)
    }, [])

    if (loading || !data) return <div className="p-12 flex justify-center items-center text-muted-foreground"><Loader2 className="animate-spin mr-2" /> SEO verileri yükleniyor...</div>

    const filtered = data.pages
        .filter(p => !search || p.path.includes(search.toLowerCase()) || p.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => sortBy === 'score' ? b.score - a.score : sortBy === 'clicks' ? b.clicks - a.clicks : a.position - b.position)

    const scoreColor = (s: number) => s >= 80 ? 'text-emerald-500' : s >= 60 ? 'text-yellow-500' : 'text-red-500'
    const scoreBg = (s: number) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-yellow-500' : 'bg-red-500'

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Globe size={24} className="text-green-500" /> SEO & Arama Motoru Optimizasyonu</h1>
                <p className="text-sm text-muted-foreground mt-1">Sayfa performansı, dizin durumu ve optimizasyon önerileri</p>
            </div>

            {/* Overview KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: 'Toplam Tıklama', value: data.overview.totalClicks.toLocaleString('tr'), Icon: MousePointer, color: 'blue' },
                    { label: 'Gösterim', value: data.overview.totalImpressions.toLocaleString('tr'), Icon: Eye, color: 'purple' },
                    { label: 'Ort. Pozisyon', value: String(data.overview.avgPosition), Icon: TrendingUp, color: 'emerald' },
                    { label: 'Ort. CTR', value: `%${data.overview.avgCTR}`, Icon: BarChart3, color: 'blue' },
                    { label: 'İndexlenen', value: `${data.overview.indexedPages}/${data.pages.length}`, Icon: CheckCircle, color: 'emerald' },
                    { label: 'Toplam Sorun', value: String(data.overview.totalIssues), Icon: AlertTriangle, color: 'orange' },
                ].map((kpi, i) => {
                    const Icon = kpi.Icon
                    return (
                        <Card key={i} className="p-3">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 bg-${kpi.color}-500/20 rounded-lg text-${kpi.color}-500`}><Icon size={16} /></div>
                                <div>
                                    <p className="text-lg font-bold">{kpi.value}</p>
                                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input className="w-full pl-9 pr-3 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                        placeholder="Sayfa URL veya başlık ara..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    value={sortBy} onChange={e => setSortBy(e.target.value as 'score' | 'clicks' | 'position')}>
                    <option value="score">SEO Puanı</option>
                    <option value="clicks">Tıklama</option>
                    <option value="position">Pozisyon</option>
                </select>
            </div>

            {/* Pages Table */}
            <div className="space-y-3">
                {filtered.map(p => (
                    <Card key={p.path} className={`p-4 hover:shadow-md transition ${p.issues.length > 2 ? 'border-red-300 dark:border-red-800' : ''}`}>
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Score badge */}
                            <div className="flex items-center gap-3 min-w-[120px]">
                                <div className={`w-12 h-12 rounded-xl ${scoreBg(p.score)} flex items-center justify-center text-white font-bold text-lg`}>
                                    {p.score}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold truncate max-w-[200px]">{p.title}</p>
                                    <p className="text-xs text-muted-foreground">{p.path}</p>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="text-center">
                                    <p className="text-lg font-bold">{p.clicks.toLocaleString('tr')}</p>
                                    <p className="text-xs text-muted-foreground">Tıklama</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold">{p.impressions.toLocaleString('tr')}</p>
                                    <p className="text-xs text-muted-foreground">Gösterim</p>
                                </div>
                                <div className="text-center">
                                    <p className={`text-lg font-bold ${p.position <= 5 ? 'text-emerald-500' : p.position <= 10 ? 'text-yellow-500' : 'text-red-500'}`}>
                                        {p.position > 0 ? p.position.toFixed(1) : '-'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Pozisyon</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold">%{p.ctr.toFixed(1)}</p>
                                    <p className="text-xs text-muted-foreground">CTR</p>
                                </div>
                            </div>

                            {/* Status & Issues */}
                            <div className="flex items-center gap-2 min-w-[150px] justify-end">
                                {p.indexed ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
                                        <CheckCircle size={10} className="mr-1" /> İndexli
                                    </Badge>
                                ) : (
                                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs">
                                        <XCircle size={10} className="mr-1" /> İndex Dışı
                                    </Badge>
                                )}
                                {p.issues.length > 0 && (
                                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                                        <AlertTriangle size={10} className="mr-1" /> {p.issues.length} sorun
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Issues detail */}
                        {p.issues.length > 0 && (
                            <div className="mt-3 pl-16 space-y-1">
                                {p.issues.map((issue, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                                        <AlertTriangle size={10} /> {issue}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Technical SEO checklist */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Info size={20} className="text-blue-500" /> Teknik SEO Kontrol Listesi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        { label: 'SSL Sertifikası', status: 'ok', detail: 'Geçerli (Let\'s Encrypt)' },
                        { label: 'Robots.txt', status: 'ok', detail: 'Mevcut ve doğru' },
                        { label: 'XML Sitemap', status: 'ok', detail: 'sitemap.xml mevcut' },
                        { label: 'Mobil Uyumluluk', status: 'ok', detail: 'Responsive tasarım' },
                        { label: 'Sayfa Hızı (Mobile)', status: 'warn', detail: 'LCP: 3.2s (Hedef: <2.5s)' },
                        { label: 'Sayfa Hızı (Desktop)', status: 'ok', detail: 'LCP: 1.8s' },
                        { label: 'Yapılandırılmış Veri', status: 'warn', detail: 'Kısmi - Hotel ve FAQ schema mevcut' },
                        { label: 'Hreflang Etiketleri', status: 'ok', detail: 'TR, EN, DE, RU aktif' },
                        { label: 'Core Web Vitals', status: 'warn', detail: 'CLS: 0.12 (Hedef: <0.1)' },
                        { label: 'Canonical URL\'ler', status: 'ok', detail: 'Tüm sayfalarda mevcut' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border dark:border-slate-800">
                            <div className="flex items-center gap-2 text-sm">
                                {item.status === 'ok' ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-yellow-500" />}
                                {item.label}
                            </div>
                            <span className="text-xs text-muted-foreground text-right">{item.detail}</span>
                        </div>
                    ))}
                </div>
            </Card>

            <p className="text-xs text-center text-muted-foreground">
                📌 Bu sayfa şu anda demo veriler ile çalışmaktadır. Google Search Console API entegrasyonu aktifleştirildiğinde gerçek veriler görüntülenecektir.
            </p>
        </div>
    )
}
