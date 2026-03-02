'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Users, Target, MessageSquare, Mail, Send, Search, RefreshCw, Plus,
    ChevronDown, CheckSquare, Globe, Calendar, TrendingUp, Phone, BarChart3,
    FileText, Inbox, Reply, Tag, Eye, Trash2, X, Check,
    MessageCircle, UserCheck, Layers, Loader2
} from 'lucide-react'

// ——— Types ———
interface GuestProfile {
    id: string; name: string; surname: string; email: string | null; phone: string | null;
    country: string | null; totalStays: number; totalRevenue: number;
    lastCheckIn: string | null; firstCheckIn: string | null; tags: string | null;
    source: string; segments: { segment: { id: string; name: string; color: string } }[];
    _count: { socialMessages: number };
}
interface Segment { id: string; name: string; description: string | null; color: string; icon: string; guestCount: number; isAutomatic: boolean; _count: { members: number; campaigns: number } }
interface Campaign { id: string; name: string; type: string; status: string; content: string | null; totalSent: number; totalDelivered: number; totalFailed: number; sentAt: string | null; createdAt: string; segment: { id: string; name: string; color: string; guestCount: number } | null }
interface WaMessage { id: string; phone: string | null; socialId: string | null; platform: string; direction: string; type: string; content: string; status: string; isFromGuest: boolean; translated: string | null; createdAt: string; guest: { id: string; name: string; surname: string; country: string | null; totalStays: number } | null }
interface WaConversation { identifier: string; platform: string; messageCount: number; lastMessageAt: string; guest: { id: string; name: string; surname: string; country: string | null; totalStays: number } | null; lastMessage: { content: string; direction: string; createdAt: string } | null }
interface WaTemplate { id: string; name: string; content: string; category: string; language: string; useCount: number }
interface EmailTpl { id: string; name: string; subject: string; htmlContent: string; category: string; isActive: boolean; createdAt: string }

import GoogleAdsTab from './GoogleAdsTab'

type Tab = 'overview' | 'guests' | 'segments' | 'campaigns' | 'emailTemplates' | 'inbox' | 'ads'

export default function CrmClient() {
    const [tab, setTab] = useState<Tab>('overview')

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'overview', label: 'Dashboard', icon: <BarChart3 size={16} /> },
        { key: 'guests', label: 'Misafir Veritabanı', icon: <Users size={16} /> },
        { key: 'segments', label: 'Segmentler', icon: <Target size={16} /> },
        { key: 'campaigns', label: 'Kampanyalar', icon: <Send size={16} /> },
        { key: 'emailTemplates', label: 'E-posta Şablonları', icon: <Mail size={16} /> },
        { key: 'inbox', label: 'Merkezi Inbox', icon: <MessageSquare size={16} /> },
        { key: 'ads', label: 'Google Ads', icon: <BarChart3 size={16} /> },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Layers size={24} /> CRM & Pazarlama</h1>
                    <p className="text-sm text-muted-foreground mt-1">Misafir yönetimi, segmentasyon, reklam performansı ve mesajlaşma</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg overflow-x-auto">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:bg-slate-800/50'}`}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {tab === 'overview' && <OverviewTab />}
            {tab === 'guests' && <GuestsTab />}
            {tab === 'segments' && <SegmentsTab />}
            {tab === 'campaigns' && <CampaignsTab />}
            {tab === 'emailTemplates' && <EmailTemplatesTab />}
            {tab === 'inbox' && <UnifiedInboxTab />}
            {tab === 'ads' && <GoogleAdsTab />}
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// ██ OVERVIEW / DASHBOARD TAB
// ═══════════════════════════════════════════════════════
function OverviewTab() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/crm/overview')
            .then(res => res.json())
            .then(d => {
                setData(d)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return <div className="p-12 flex justify-center items-center text-muted-foreground"><Loader2 className="animate-spin mr-2" /> Analiz Hesaplanıyor...</div>
    if (!data) return <div className="p-12 text-center text-red-500">Veri alınamadı.</div>

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Toplam Misafir</p>
                            <h3 className="text-3xl font-bold mt-2">{data.stats.totalGuests.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500"><Users size={24} /></div>
                    </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">LTV (Ort. Harcama)</p>
                            <h3 className="text-3xl font-bold mt-2">€{Number(data.stats.avgRevenuePerGuest).toLocaleString('tr-TR')}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-500"><TrendingUp size={24} /></div>
                    </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Toplam Konaklama</p>
                            <h3 className="text-3xl font-bold mt-2">{data.stats.totalStays.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500"><Globe size={24} /></div>
                    </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Sadık Misafir (3+)</p>
                            <h3 className="text-3xl font-bold mt-2">{data.segments.loyalGuests.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-orange-500/20 rounded-lg text-orange-500"><Target size={24} /></div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart3 size={20} className="text-blue-500" /> Kampanya ROI & Dönüşüm Hunisi</h3>
                    <div className="space-y-4">
                        {data.funnel.map((item: any, i: number) => {
                            const maxVal = data.funnel[0].count || 1;
                            const percentage = Math.round((item.count / maxVal) * 100);
                            return (
                                <div key={i} className="relative">
                                    <div className="flex justify-between text-sm mb-1 font-medium">
                                        <span>{item.step}</span>
                                        <span>{item.count.toLocaleString()} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                                        <div className={`h-3 rounded-full ${i === 3 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Layers size={20} className="text-purple-500" /> Tahmini RFM Segmentleri</h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl border dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-emerald-600 dark:text-emerald-400">Şampiyonlar</p>
                                <p className="text-xs text-muted-foreground">3+ Kez gelen + Yüksek harcama</p>
                            </div>
                            <span className="text-lg font-bold">{data.segments.loyalGuests}</span>
                        </div>
                        <div className="p-4 rounded-xl border dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-orange-600 dark:text-orange-400">Uyuyan Devler</p>
                                <p className="text-xs text-muted-foreground">Eski gelenler (Churn Riski)</p>
                            </div>
                            <span className="text-lg font-bold">{data.segments.churnRisk}</span>
                        </div>
                        <div className="p-4 rounded-xl border dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-blue-600 dark:text-blue-400">Yüksek Harcayanlar</p>
                                <p className="text-xs text-muted-foreground">€5K+ toplam gelir</p>
                            </div>
                            <span className="text-lg font-bold">{data.segments.highSpenders}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// ██ GUESTS TAB
// ═══════════════════════════════════════════════════════
function GuestsTab() {
    const [guests, setGuests] = useState<GuestProfile[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [search, setSearch] = useState('')
    const [country, setNationality] = useState('')
    const [countries, setNationalities] = useState<{ country: string | null; _count: number }[]>([])
    const [minStays, setMinStays] = useState('0')
    const [page, setPage] = useState(1)
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [segments, setSegments] = useState<Segment[]>([])
    const [showSegmentPicker, setShowSegmentPicker] = useState(false)

    const fetchGuests = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: '30', search, country, minStays, sortBy: 'lastCheckIn', sortDir: 'desc' })
            const res = await fetch(`/api/admin/crm/guests?${params}`)
            const data = await res.json()
            setGuests(data.guests || [])
            setTotal(data.total || 0)
            setNationalities(data.countries || [])
        } catch { /* ignore */ }
        setLoading(false)
    }, [page, search, country, minStays])

    useEffect(() => { fetchGuests() }, [fetchGuests])
    useEffect(() => { fetch('/api/admin/crm/segments').then(r => r.json()).then(setSegments).catch(() => { }) }, [])

    const syncFromElektra = async () => {
        setSyncing(true)
        try {
            const res = await fetch('/api/admin/crm/guests', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sync', fromDate: '2024-01-01', toDate: new Date().toISOString().split('T')[0] })
            })
            const data = await res.json()
            alert(`Senkronizasyon tamamlandı: ${data.created} yeni, ${data.updated} güncellendi`)
            fetchGuests()
        } catch { alert('Senkronizasyon hatası') }
        setSyncing(false)
    }

    const addToSegment = async (segmentId: string) => {
        await fetch('/api/admin/crm/guests', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addToSegment', guestIds: [...selected], segmentId })
        })
        setSelected(new Set())
        setShowSegmentPicker(false)
        fetchGuests()
    }

    const toggleSelect = (id: string) => {
        const s = new Set(selected)
        if (s.has(id)) { s.delete(id) } else { s.add(id) }
        setSelected(s)
    }
    const selectAll = () => setSelected(guests.length === selected.size ? new Set() : new Set(guests.map(g => g.id)))

    const parseTags = (t: string | null): string[] => { try { return t ? JSON.parse(t) : [] } catch { return [] } }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input className="w-full pl-9 pr-3 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" placeholder="Ad, soyad, email veya telefon ara..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
                </div>
                <select className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value={country} onChange={e => { setNationality(e.target.value); setPage(1) }}>
                    <option value="">Tüm Uyruklar</option>
                    {countries.map(n => <option key={n.country} value={n.country || ''}>{n.country || 'Bilinmiyor'} ({n._count})</option>)}
                </select>
                <select className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value={minStays} onChange={e => { setMinStays(e.target.value); setPage(1) }}>
                    <option value="0">Tüm Ziyaretler</option>
                    <option value="2">2+ Konaklama</option>
                    <option value="3">3+ Konaklama</option>
                    <option value="5">5+ Konaklama (VIP)</option>
                </select>
                <button onClick={syncFromElektra} disabled={syncing} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50">
                    <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Senkronize...' : 'Elektra Senkronize'}
                </button>
            </div>

            {/* Selection actions */}
            {selected.size > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <CheckSquare size={16} className="text-blue-600" />
                    <span className="text-sm font-medium">{selected.size} misafir seçildi</span>
                    <div className="relative">
                        <button onClick={() => setShowSegmentPicker(!showSegmentPicker)} className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600 text-white text-xs hover:bg-blue-700">
                            <Target size={12} /> Segmente Ekle <ChevronDown size={12} />
                        </button>
                        {showSegmentPicker && (
                            <div className="absolute top-full mt-1 left-0 bg-popover border rounded-lg shadow-lg z-50 min-w-[200px] p-2">
                                {segments.map(s => (
                                    <button key={s.id} onClick={() => addToSegment(s.id)} className="w-full text-left px-3 py-2 rounded text-sm hover:bg-slate-200 dark:bg-slate-800 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} /> {s.name}
                                    </button>
                                ))}
                                {segments.length === 0 && <p className="text-xs text-muted-foreground p-2">Önce bir segment oluşturun</p>}
                            </div>
                        )}
                    </div>
                    <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Seçimi Temizle</button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Toplam Misafir', value: total, icon: <Users size={16} /> },
                    { label: 'Telefonu Var', value: guests.filter(g => g.phone).length, icon: <Phone size={16} /> },
                    { label: 'Tekrar Gelen', value: guests.filter(g => g.totalStays > 1).length, icon: <TrendingUp size={16} /> },
                    { label: 'Bu Ay Giriş', value: guests.filter(g => g.lastCheckIn && new Date(g.lastCheckIn).getMonth() === new Date().getMonth()).length, icon: <Calendar size={16} /> },
                ].map((s, i) => (
                    <Card key={i} className="p-3 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">{s.icon}</div>
                        <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800/50 border-b">
                            <tr>
                                <th className="p-3 text-left"><input type="checkbox" onChange={selectAll} checked={guests.length > 0 && selected.size === guests.length} /></th>
                                <th className="p-3 text-left">Misafir</th>
                                <th className="p-3 text-left">Uyruk</th>
                                <th className="p-3 text-left">İletişim</th>
                                <th className="p-3 text-center">Konaklama</th>
                                <th className="p-3 text-right">Gelir</th>
                                <th className="p-3 text-left">Son Giriş</th>
                                <th className="p-3 text-left">Segmentler</th>
                                <th className="p-3 text-left">Etiketler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Yükleniyor...</td></tr>
                            ) : guests.length === 0 ? (
                                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Misafir bulunamadı. Elektra Senkronize butonuna tıklayarak verileri çekin.</td></tr>
                            ) : guests.map(g => (
                                <tr key={g.id} className={`border-b hover:bg-slate-100 dark:bg-slate-800/50 transition ${selected.has(g.id) ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                                    <td className="p-3"><input type="checkbox" checked={selected.has(g.id)} onChange={() => toggleSelect(g.id)} /></td>
                                    <td className="p-3 font-medium">{g.name} {g.surname}</td>
                                    <td className="p-3"><span className="flex items-center gap-1"><Globe size={12} /> {g.country || '—'}</span></td>
                                    <td className="p-3 text-xs">
                                        {g.email && <div className="truncate max-w-[150px]">{g.email}</div>}
                                        {g.phone && <div className="text-muted-foreground">{g.phone}</div>}
                                        {!g.email && !g.phone && <span className="text-muted-foreground">—</span>}
                                    </td>
                                    <td className="p-3 text-center"><Badge variant={g.totalStays > 1 ? 'default' : 'secondary'}>{g.totalStays}x</Badge></td>
                                    <td className="p-3 text-right font-mono text-xs">{g.totalRevenue > 0 ? `₺${g.totalRevenue.toLocaleString('tr')}` : '—'}</td>
                                    <td className="p-3 text-xs">{g.lastCheckIn ? new Date(g.lastCheckIn).toLocaleDateString('tr') : '—'}</td>
                                    <td className="p-3"><div className="flex gap-1 flex-wrap">{g.segments.map(s => <span key={s.segment.id} className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: s.segment.color }}>{s.segment.name}</span>)}</div></td>
                                    <td className="p-3"><div className="flex gap-1 flex-wrap">{parseTags(g.tags).map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 p-3 border-t bg-slate-200 dark:bg-slate-800/20">
                    <span className="text-xs text-muted-foreground">Toplam {total} misafir</span>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded border text-xs disabled:opacity-30">Önceki</button>
                        <span className="px-3 py-1 text-xs">Sayfa {page}</span>
                        <button onClick={() => setPage(p => p + 1)} disabled={guests.length < 30} className="px-3 py-1 rounded border text-xs disabled:opacity-30">Sonraki</button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// ██ SEGMENTS TAB
// ═══════════════════════════════════════════════════════
function SegmentsTab() {
    const [segments, setSegments] = useState<Segment[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [color, setColor] = useState('#3b82f6')

    const fetch_ = async () => { setLoading(true); const r = await fetch('/api/admin/crm/segments'); setSegments(await r.json()); setLoading(false) }
    useEffect(() => { fetch_() }, [])

    const create = async () => {
        if (!name.trim()) return
        await fetch('/api/admin/crm/segments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description: desc, color }) })
        setName(''); setDesc(''); setColor('#3b82f6'); setShowCreate(false); fetch_()
    }

    const remove = async (id: string) => {
        if (!confirm('Bu segmenti silmek istediğinize emin misiniz?')) return
        await fetch('/api/admin/crm/segments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
        fetch_()
    }

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Target size={20} /> Pazarlama Segmentleri</h2>
                <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"><Plus size={14} /> Yeni Segment</button>
            </div>

            {showCreate && (
                <Card className="p-4 space-y-3 border-primary/30">
                    <input className="w-full border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Segment adı..." value={name} onChange={e => setName(e.target.value)} />
                    <input className="w-full border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Açıklama (opsiyonel)..." value={desc} onChange={e => setDesc(e.target.value)} />
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Renk:</span>
                        {colors.map(c => <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={create} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"><Check size={14} className="inline mr-1" />Oluştur</button>
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg text-sm">İptal</button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? <p className="text-muted-foreground col-span-3 text-center py-8">Yükleniyor...</p> :
                    segments.length === 0 ? <p className="text-muted-foreground col-span-3 text-center py-8">Henüz segment oluşturulmadı</p> :
                        segments.map(s => (
                            <Card key={s.id} className="p-4 hover:shadow-md transition relative group">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: s.color }}><Target size={18} /></div>
                                        <div>
                                            <h3 className="font-semibold">{s.name}</h3>
                                            {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                                        </div>
                                    </div>
                                    <button onClick={() => remove(s.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 p-1 rounded transition"><Trash2 size={14} /></button>
                                </div>
                                <div className="flex gap-4 mt-4 text-sm">
                                    <div className="flex items-center gap-1 text-muted-foreground"><Users size={14} /> <span className="font-medium text-foreground">{s._count.members}</span> misafir</div>
                                    <div className="flex items-center gap-1 text-muted-foreground"><Send size={14} /> <span className="font-medium text-foreground">{s._count.campaigns}</span> kampanya</div>
                                </div>
                            </Card>
                        ))}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// ██ CAMPAIGNS TAB
// ═══════════════════════════════════════════════════════
function CampaignsTab() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [segments, setSegments] = useState<Segment[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState({ name: '', type: 'whatsapp', segmentId: '', content: '' })

    const fetch_ = async () => { setLoading(true); const [c, s] = await Promise.all([fetch('/api/admin/crm/campaigns').then(r => r.json()), fetch('/api/admin/crm/segments').then(r => r.json())]); setCampaigns(c); setSegments(s); setLoading(false) }
    useEffect(() => { fetch_() }, [])

    const create = async () => {
        if (!form.name || !form.content) return
        await fetch('/api/admin/crm/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', ...form }) })
        setForm({ name: '', type: 'whatsapp', segmentId: '', content: '' }); setShowCreate(false); fetch_()
    }

    const sendCampaign = async (id: string) => {
        if (!confirm('Bu kampanyayı göndermek istediğinize emin misiniz?')) return
        const res = await fetch('/api/admin/crm/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send', campaignId: id }) })
        const data = await res.json()
        alert(`Gönderildi: ${data.sent || 0}, Başarısız: ${data.failed || 0}`)
        fetch_()
    }

    const statusColors: Record<string, string> = { draft: 'bg-gray-500', scheduled: 'bg-yellow-500', sending: 'bg-blue-500', sent: 'bg-green-500', cancelled: 'bg-red-500' }
    const statusLabels: Record<string, string> = { draft: 'Taslak', scheduled: 'Planlandı', sending: 'Gönderiliyor', sent: 'Gönderildi', cancelled: 'İptal' }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Send size={20} /> Kampanyalar</h2>
                <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"><Plus size={14} /> Yeni Kampanya</button>
            </div>

            {showCreate && (
                <Card className="p-4 space-y-3 border-primary/30">
                    <input className="w-full border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Kampanya adı..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex-1" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">E-posta</option>
                        </select>
                        <select className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex-1" value={form.segmentId} onChange={e => setForm({ ...form, segmentId: e.target.value })}>
                            <option value="">Segment Seçin...</option>
                            {segments.map(s => <option key={s.id} value={s.id}>{s.name} ({s._count?.members || 0} kişi)</option>)}
                        </select>
                    </div>
                    <textarea className="w-full border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white min-h-[100px]" placeholder="Mesaj içeriği... ({{name}} değişkeni kullanabilirsiniz)" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                    <div className="flex gap-2">
                        <button onClick={create} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Oluştur</button>
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg text-sm">İptal</button>
                    </div>
                </Card>
            )}

            <div className="space-y-3">
                {loading ? <p className="text-center py-8 text-muted-foreground">Yükleniyor...</p> :
                    campaigns.length === 0 ? <p className="text-center py-8 text-muted-foreground">Henüz kampanya oluşturulmadı</p> :
                        campaigns.map(c => (
                            <Card key={c.id} className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${statusColors[c.status] || 'bg-gray-400'}`} />
                                        <div>
                                            <h3 className="font-semibold">{c.name}</h3>
                                            <div className="flex gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">{c.type === 'whatsapp' ? '📱 WhatsApp' : '📧 E-posta'}</Badge>
                                                <Badge variant="secondary" className="text-xs">{statusLabels[c.status] || c.status}</Badge>
                                                {c.segment && <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: c.segment.color }}>{c.segment.name}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {c.status === 'sent' && (
                                            <div className="text-right text-xs">
                                                <div className="text-green-600">✓ {c.totalSent} gönderildi</div>
                                                {c.totalFailed > 0 && <div className="text-red-500">✗ {c.totalFailed} başarısız</div>}
                                            </div>
                                        )}
                                        {c.status === 'draft' && (
                                            <button onClick={() => sendCampaign(c.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 flex items-center gap-1"><Send size={12} /> Gönder</button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// ██ EMAIL TEMPLATES TAB
// ═══════════════════════════════════════════════════════
function EmailTemplatesTab() {
    const [templates, setTemplates] = useState<EmailTpl[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState({ name: '', subject: '', htmlContent: '', category: 'general' })
    const [previewHtml, setPreviewHtml] = useState<string | null>(null)

    const fetch_ = async () => { setLoading(true); const r = await fetch('/api/admin/crm/templates'); setTemplates(await r.json()); setLoading(false) }
    useEffect(() => { fetch_() }, [])

    const create = async () => {
        if (!form.name || !form.subject) return
        // Auto-generate basic HTML if empty
        const html = form.htmlContent || `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;padding:20px;"><h1 style="color:#2563eb;">${form.subject}</h1><p>Merhaba {{name}},</p><p>İçeriğinizi buraya yazın...</p><hr/><p style="font-size:12px;color:#888;">Blue Dreams Resort — Torba/Bodrum</p></div>`
        await fetch('/api/admin/crm/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, htmlContent: html }) })
        setForm({ name: '', subject: '', htmlContent: '', category: 'general' }); setShowCreate(false); fetch_()
    }

    const remove = async (id: string) => {
        if (!confirm('Şablonu silmek istediğinize emin misiniz?')) return
        await fetch('/api/admin/crm/templates', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
        fetch_()
    }

    const categoryLabels: Record<string, string> = { general: 'Genel', welcome: 'Hoşgeldin', promo: 'Promosyon', seasonal: 'Sezon', event: 'Etkinlik', feedback: 'Geri Bildirim' }
    const categoryIcons: Record<string, React.ReactNode> = { general: <Mail size={14} />, welcome: <UserCheck size={14} />, promo: <Tag size={14} />, seasonal: <Calendar size={14} />, event: <BarChart3 size={14} />, feedback: <MessageCircle size={14} /> }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2"><FileText size={20} /> E-posta Şablonları</h2>
                <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"><Plus size={14} /> Yeni Şablon</button>
            </div>

            {showCreate && (
                <Card className="p-4 space-y-3 border-primary/30">
                    <div className="grid grid-cols-2 gap-3">
                        <input className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Şablon adı..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        <select className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                            {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                    <input className="w-full border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="E-posta konusu..." value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                    <textarea className="w-full border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white min-h-[200px] font-mono" placeholder="HTML içerik (boş bırakırsanız otomatik şablon oluşturulur)..." value={form.htmlContent} onChange={e => setForm({ ...form, htmlContent: e.target.value })} />
                    <p className="text-xs text-muted-foreground">Değişkenler: {'{{name}}'}, {'{{surname}}'}, {'{{checkIn}}'}, {'{{checkOut}}'}</p>
                    <div className="flex gap-2">
                        <button onClick={create} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Oluştur</button>
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg text-sm">İptal</button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? <p className="text-muted-foreground col-span-3 text-center py-8">Yükleniyor...</p> :
                    templates.length === 0 ? <p className="text-muted-foreground col-span-3 text-center py-8">Henüz şablon oluşturulmadı</p> :
                        templates.map(t => (
                            <Card key={t.id} className="p-4 group hover:shadow-md transition">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {categoryIcons[t.category] || <Mail size={14} />}
                                        <Badge variant="outline" className="text-xs">{categoryLabels[t.category] || t.category}</Badge>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                        <button onClick={() => setPreviewHtml(t.htmlContent)} className="p-1 rounded hover:bg-slate-200 dark:bg-slate-800"><Eye size={14} /></button>
                                        <button onClick={() => remove(t.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <h3 className="font-semibold mt-2">{t.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{t.subject}</p>
                                <p className="text-xs text-muted-foreground mt-2">{new Date(t.createdAt).toLocaleDateString('tr')}</p>
                            </Card>
                        ))}
            </div>

            {/* Preview Modal */}
            {previewHtml && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreviewHtml(null)}>
                    <div className="bg-background rounded-xl shadow-2xl max-w-[700px] w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 p-4 border-b">
                            <h3 className="font-semibold">Şablon Önizleme</h3>
                            <button onClick={() => setPreviewHtml(null)}><X size={18} /></button>
                        </div>
                        <div className="p-4" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    </div>
                </div>
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// ██ UNIFIED INBOX TAB
// ═══════════════════════════════════════════════════════
function UnifiedInboxTab() {
    const [view, setView] = useState<'conversations' | 'messages' | 'templates'>('conversations')
    const [conversations, setConversations] = useState<WaConversation[]>([])
    const [messages, setMessages] = useState<WaMessage[]>([])
    const [templates, setTemplates] = useState<WaTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [direction, setDirection] = useState('')
    const [platform, setPlatform] = useState('')
    const [isFromGuest, setIsFromGuest] = useState('')
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
    const [selectedPlatform, setSelectedPlatform] = useState<string>('whatsapp')
    const [replyText, setReplyText] = useState('')
    const [isTranslating, setIsTranslating] = useState(false)
    const [chatMessages, setChatMessages] = useState<WaMessage[]>([])
    const [showNewTemplate, setShowNewTemplate] = useState(false)
    const [newTpl, setNewTpl] = useState({ name: '', content: '', category: 'general' })

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ view, search, direction, platform, isFromGuest })
            const res = await fetch(`/api/admin/crm/social?${params}`)
            const data = await res.json()
            if (view === 'conversations') setConversations(data.conversations || [])
            else if (view === 'templates') setTemplates(data.templates || [])
            else setMessages(data.messages || [])
        } catch { /* ignore */ }
        setLoading(false)
    }, [view, search, direction, platform, isFromGuest])

    useEffect(() => { fetchData() }, [fetchData])

    const openConversation = async (identifier: string, pfm: string) => {
        setSelectedPhone(identifier)
        setSelectedPlatform(pfm)
        const res = await fetch(`/api/admin/crm/social?view=messages&phone=${encodeURIComponent(identifier)}&limit=100`)
        const data = await res.json()
        setChatMessages(data.messages || [])
    }

    const sendReply = async () => {
        if (!replyText.trim() || !selectedPhone) return
        await fetch('/api/admin/crm/social', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reply', phone: selectedPhone, platform: selectedPlatform, content: replyText }) })
        setReplyText('')
        openConversation(selectedPhone, selectedPlatform)
    }

    const translateMessageOutbound = async () => {
        if (!replyText.trim()) return
        setIsTranslating(true)
        try {
            const res = await fetch('/api/admin/crm/social/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: replyText, targetLang: 'en' }) })
            const data = await res.json()
            if (data.translatedText) setReplyText(data.translatedText)
        } catch { }
        setIsTranslating(false)
    }

    const useTemplate = (content: string) => { setReplyText(content) }

    const createTemplate = async () => {
        if (!newTpl.name || !newTpl.content) return
        await fetch('/api/admin/crm/social', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'createTemplate', ...newTpl }) })
        setNewTpl({ name: '', content: '', category: 'general' }); setShowNewTemplate(false); setView('templates'); fetchData()
    }

    const deleteTemplate = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return
        await fetch('/api/admin/crm/social', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deleteTemplate', id }) })
        fetchData()
    }

    return (
        <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex gap-2">
                    {[
                        { key: 'conversations' as const, label: 'Konuşmalar', icon: <MessageCircle size={14} /> },
                        { key: 'messages' as const, label: 'Tüm Mesajlar', icon: <Inbox size={14} /> },
                        { key: 'templates' as const, label: 'Hızlı Yanıtlar', icon: <Reply size={14} /> },
                    ].map(t => (
                        <button key={t.key} onClick={() => { setView(t.key); setSelectedPhone(null) }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm ${view === t.key ? 'bg-primary text-primary-foreground' : 'bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:bg-slate-800'}`}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>
                {view === 'templates' && (
                    <button onClick={() => setShowNewTemplate(!showNewTemplate)} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm"><Plus size={14} /> Yeni Şablon</button>
                )}
            </div>

            {/* Filters for messages */}
            {view === 'messages' && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input className="w-full pl-8 pr-3 py-2 rounded-lg border bg-background text-sm" placeholder="Mesaj içeriği ara..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value={direction} onChange={e => setDirection(e.target.value)}>
                        <option value="">Tümü</option><option value="inbound">Gelen</option><option value="outbound">Giden</option>
                    </select>
                    <select className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value={platform} onChange={e => setPlatform(e.target.value)}>
                        <option value="">Platformlar</option><option value="whatsapp">WhatsApp</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option>
                    </select>
                    <select className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" value={isFromGuest} onChange={e => setIsFromGuest(e.target.value)}>
                        <option value="">Tüm Kişiler</option><option value="true">Eski Misafir</option><option value="false">Yeni Kişi</option>
                    </select>
                </div>
            )}

            {/* Content */}
            {loading && <p className="text-center py-8 text-muted-foreground">Yükleniyor...</p>}

            {/* CONVERSATIONS VIEW */}
            {!loading && view === 'conversations' && !selectedPhone && (
                <div className="space-y-2">
                    {conversations.length === 0 ? <p className="text-center py-8 text-muted-foreground">Henüz mesaj alınmadı</p> :
                        conversations.map(c => (
                            <Card key={c.identifier} className="p-3 hover:bg-slate-100 dark:bg-slate-800/50 cursor-pointer transition" onClick={() => openConversation(c.identifier, c.platform)}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${c.platform === 'whatsapp' ? 'bg-green-600' : c.platform === 'facebook' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                                            {c.platform === 'whatsapp' ? 'WA' : c.platform === 'facebook' ? 'FB' : 'IG'}
                                        </div>
                                        <div>
                                            <div className="font-medium">{c.guest ? `${c.guest.name} ${c.guest.surname}` : c.identifier}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                {c.guest && <Badge variant="outline" className="text-xs"><UserCheck size={10} className="mr-1" /> Eski Misafir ({c.guest.totalStays}x)</Badge>}
                                                {c.guest?.country && <span><Globe size={10} className="inline mr-1" />{c.guest.country}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="secondary" className="text-xs">{c.messageCount} mesaj</Badge>
                                        <p className="text-xs text-muted-foreground mt-1">{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString('tr') : ''}</p>
                                    </div>
                                </div>
                                {c.lastMessage && <p className="text-xs text-muted-foreground mt-2 truncate">{c.lastMessage.direction === 'inbound' ? '← ' : '→ '}{c.lastMessage.content}</p>}
                            </Card>
                        ))}
                </div>
            )}

            {/* CONVERSATION DETAIL */}
            {view === 'conversations' && selectedPhone && (
                <div className="space-y-3">
                    <button onClick={() => setSelectedPhone(null)} className="text-sm text-primary hover:underline flex items-center gap-1">← Konuşmalara Dön</button>
                    <Card className="p-4">
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {chatMessages.slice().reverse().map(m => (
                                <div key={m.id} className={`flex flex-col ${m.direction === 'outbound' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${m.direction === 'outbound' ? 'bg-primary text-primary-foreground' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                        <p>{m.content}</p>
                                        <p className={`text-xs mt-1 ${m.direction === 'outbound' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                            {new Date(m.createdAt).toLocaleString('tr')}
                                        </p>
                                    </div>
                                    {m.direction === 'inbound' && m.translated && (
                                        <div className="mt-1 max-w-[70%] px-3 py-2 rounded-lg text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                                            <p className="text-xs font-semibold mb-1 opacity-70">Çeviri:</p>
                                            <p>{m.translated}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {chatMessages.length === 0 && <p className="text-center text-muted-foreground text-sm">Mesaj bulunamadı</p>}
                        </div>
                        <div className="flex gap-2 mt-4 pt-3 border-t">
                            <input className="flex-1 border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Yanıt yazın..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} />
                            <button onClick={translateMessageOutbound} disabled={!replyText.trim() || isTranslating} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800" title="İngilizceye Çevir">
                                {isTranslating ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />} Çevir
                            </button>
                            <button onClick={sendReply} disabled={!replyText.trim()} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"><Send size={14} /> Gönder</button>
                        </div>
                    </Card>
                </div>
            )}

            {/* MESSAGES VIEW */}
            {!loading && view === 'messages' && (
                <Card className="overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800/50 border-b"><tr>
                            <th className="p-3 text-left">Yön</th><th className="p-3 text-left">Telefon</th><th className="p-3 text-left">Misafir</th>
                            <th className="p-3 text-left">Mesaj</th><th className="p-3 text-left">Tarih</th>
                        </tr></thead>
                        <tbody>
                            {messages.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Mesaj bulunamadı</td></tr> :
                                messages.map(m => (
                                    <tr key={m.id} className="border-b hover:bg-slate-100 dark:bg-slate-800/50">
                                        <td className="p-3">
                                            {m.direction === 'inbound' ? <Badge variant="default" className="text-xs bg-blue-600">Gelen</Badge> : <Badge variant="secondary" className="text-xs">Giden</Badge>}
                                            <Badge variant="outline" className="text-xs ml-1 uppercase">{m.platform.slice(0, 2)}</Badge>
                                        </td>
                                        <td className="p-3 font-mono text-xs">{m.phone || m.socialId}</td>
                                        <td className="p-3">{m.guest ? <span className="flex items-center gap-1"><UserCheck size={12} className="text-green-600" /> {m.guest.name} {m.guest.surname}</span> : <span className="text-muted-foreground">Bilinmiyor</span>}</td>
                                        <td className="p-3 max-w-[300px] truncate">{m.content}</td>
                                        <td className="p-3 text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString('tr')}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* TEMPLATES VIEW */}
            {!loading && view === 'templates' && (
                <div className="space-y-3">
                    {showNewTemplate && (
                        <Card className="p-4 space-y-3 border-primary/30">
                            <input className="w-full border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Şablon adı..." value={newTpl.name} onChange={e => setNewTpl({ ...newTpl, name: e.target.value })} />
                            <textarea className="w-full border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white min-h-[80px]" placeholder="Şablon metni... ({{name}} değişkeni kullanabilirsiniz)" value={newTpl.content} onChange={e => setNewTpl({ ...newTpl, content: e.target.value })} />
                            <div className="flex gap-2">
                                <button onClick={createTemplate} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Kaydet</button>
                                <button onClick={() => setShowNewTemplate(false)} className="px-4 py-2 border rounded-lg text-sm">İptal</button>
                            </div>
                        </Card>
                    )}
                    {templates.length === 0 ? <p className="text-center py-8 text-muted-foreground">Henüz şablon oluşturulmadı</p> :
                        templates.map(t => (
                            <Card key={t.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 group">
                                <div>
                                    <div className="flex items-center gap-2"><h4 className="font-medium text-sm">{t.name}</h4><Badge variant="outline" className="text-xs">{t.category}</Badge></div>
                                    <p className="text-xs text-muted-foreground mt-1">{t.content}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Kullanım: {t.useCount}x</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    {selectedPhone && <button onClick={() => useTemplate(t.content)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Kullan</button>}
                                    <button onClick={() => deleteTemplate(t.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                                </div>
                            </Card>
                        ))}
                </div>
            )}
        </div>
    )
}
