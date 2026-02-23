'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    MapPin, Star, ExternalLink, Check, X, RefreshCw, Search,
    Calendar, Globe, Loader2, CheckCircle, XCircle, Eye, Filter
} from 'lucide-react'

interface Attraction {
    id: string
    title: string
    address?: string
    rating?: number
    reviews?: number
    type?: string
    thumbnail?: string
    description?: string
    distance?: string
    link?: string
    approved: boolean
}

interface SerpEvent {
    id: string
    title: string
    date?: string
    time?: string
    venue?: string
    address?: string
    thumbnail?: string
    description?: string
    link?: string
    source?: string
    approved: boolean
}

export default function LocalGuidePage() {
    const [attractions, setAttractions] = useState<Attraction[]>([])
    const [events, setEvents] = useState<SerpEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [tab, setTab] = useState<'attractions' | 'events'>('attractions')
    const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchData = useCallback(async (refresh = false) => {
        try {
            if (refresh) setRefreshing(true)
            else setLoading(true)

            const res = await fetch(`/api/admin/local-guide?type=all${refresh ? '&refresh=true' : ''}`)
            const data = await res.json()
            setAttractions(data.attractions || [])
            setEvents(data.events || [])
        } catch (err) {
            console.error('Fetch error:', err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    async function toggleApproval(itemId: string, itemType: 'attraction' | 'event', currentlyApproved: boolean) {
        setActionLoading(itemId)
        try {
            const res = await fetch('/api/admin/local-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: currentlyApproved ? 'reject' : 'approve',
                    itemId,
                    itemType,
                }),
            })
            if (res.ok) {
                if (itemType === 'attraction') {
                    setAttractions(prev => prev.map(a =>
                        a.id === itemId ? { ...a, approved: !currentlyApproved } : a
                    ))
                } else {
                    setEvents(prev => prev.map(e =>
                        e.id === itemId ? { ...e, approved: !currentlyApproved } : e
                    ))
                }
            }
        } catch (err) {
            console.error('Toggle error:', err)
        } finally {
            setActionLoading(null)
        }
    }

    const filteredAttractions = attractions.filter(a =>
        filter === 'all' ? true : filter === 'approved' ? a.approved : !a.approved
    )
    const filteredEvents = events.filter(e =>
        filter === 'all' ? true : filter === 'approved' ? e.approved : !e.approved
    )

    const approvedCount = tab === 'attractions'
        ? attractions.filter(a => a.approved).length
        : events.filter(e => e.approved).length

    const totalCount = tab === 'attractions' ? attractions.length : events.length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Çevre Rehberi</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        SerpAPI ile Bodrum gezilecek yerler ve etkinlikler — Onaylananlar sitede gösterilir
                    </p>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Çekiliyor...' : 'SerpAPI\'den Yenile'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                        <MapPin size={20} className="text-cyan-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{attractions.length}</p>
                        <p className="text-slate-500 text-xs">Toplam Yer</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        <CheckCircle size={20} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{attractions.filter(a => a.approved).length}</p>
                        <p className="text-slate-500 text-xs">Onaylı Yer</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Calendar size={20} className="text-purple-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{events.length}</p>
                        <p className="text-slate-500 text-xs">Toplam Etkinlik</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                        <Globe size={20} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{events.filter(e => e.approved).length}</p>
                        <p className="text-slate-500 text-xs">Onaylı Etkinlik</p>
                    </div>
                </div>
            </div>

            {/* Tabs + Filter */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
                    <button
                        onClick={() => setTab('attractions')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'attractions' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <MapPin size={14} className="inline mr-1.5" />
                        Gezilecek Yerler ({attractions.length})
                    </button>
                    <button
                        onClick={() => setTab('events')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'events' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <Calendar size={14} className="inline mr-1.5" />
                        Etkinlikler ({events.length})
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-400" />
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value as any)}
                        className="text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300"
                    >
                        <option value="all">Tümü</option>
                        <option value="approved">Onaylı</option>
                        <option value="pending">Bekleyen</option>
                    </select>
                    <span className="text-xs text-slate-500">
                        {approvedCount}/{totalCount} onaylı
                    </span>
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-cyan-500" />
                    <span className="ml-3 text-slate-500">SerpAPI verisi çekiliyor...</span>
                </div>
            ) : (
                <>
                    {/* Attractions Tab */}
                    {tab === 'attractions' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredAttractions.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    <MapPin size={40} className="mx-auto mb-3 opacity-30" />
                                    <p>Henüz gezilecek yer bulunamadı</p>
                                    <button onClick={() => fetchData(true)} className="mt-2 text-cyan-500 text-sm hover:underline">
                                        SerpAPI'den çek
                                    </button>
                                </div>
                            ) : filteredAttractions.map(attraction => (
                                <div key={attraction.id} className={`bg-white dark:bg-white/5 border rounded-xl overflow-hidden transition-all hover:shadow-lg ${attraction.approved ? 'border-emerald-300 dark:border-emerald-500/30' : 'border-slate-200 dark:border-white/10'}`}>
                                    {/* Thumbnail */}
                                    {attraction.thumbnail && (
                                        <div className="relative h-40 overflow-hidden">
                                            <img
                                                src={attraction.thumbnail}
                                                alt={attraction.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {attraction.approved && (
                                                <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Check size={10} /> Onaylı
                                                </div>
                                            )}
                                            {attraction.type && (
                                                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
                                                    {attraction.type}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="p-4">
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{attraction.title}</h3>
                                        {attraction.address && (
                                            <p className="text-slate-500 text-xs flex items-center gap-1 mb-2">
                                                <MapPin size={12} /> {attraction.address}
                                            </p>
                                        )}
                                        {attraction.description && (
                                            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">{attraction.description}</p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {attraction.rating ? (
                                                    <span className="flex items-center gap-1 text-amber-500 text-sm font-medium">
                                                        <Star size={14} fill="currentColor" /> {attraction.rating}
                                                        {attraction.reviews && <span className="text-slate-400 text-xs">({attraction.reviews})</span>}
                                                    </span>
                                                ) : null}
                                                {attraction.link && (
                                                    <a href={attraction.link} target="_blank" rel="noopener" className="text-slate-400 hover:text-cyan-500 transition-colors">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => toggleApproval(attraction.id, 'attraction', attraction.approved)}
                                                disabled={actionLoading === attraction.id}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${attraction.approved
                                                        ? 'bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20'
                                                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                                                    }`}
                                            >
                                                {actionLoading === attraction.id ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : attraction.approved ? (
                                                    <><XCircle size={12} /> Kaldır</>
                                                ) : (
                                                    <><CheckCircle size={12} /> Onayla</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Events Tab */}
                    {tab === 'events' && (
                        <div className="space-y-3">
                            {filteredEvents.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                                    <p>Henüz etkinlik bulunamadı</p>
                                    <button onClick={() => fetchData(true)} className="mt-2 text-cyan-500 text-sm hover:underline">
                                        SerpAPI'den çek
                                    </button>
                                </div>
                            ) : filteredEvents.map(event => (
                                <div key={event.id} className={`bg-white dark:bg-white/5 border rounded-xl p-4 flex gap-4 transition-all hover:shadow-md ${event.approved ? 'border-emerald-300 dark:border-emerald-500/30' : 'border-slate-200 dark:border-white/10'}`}>
                                    {/* Thumbnail */}
                                    {event.thumbnail && (
                                        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                                            <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{event.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                                                    {event.date && <span className="flex items-center gap-1"><Calendar size={12} /> {event.date}</span>}
                                                    {event.venue && <span className="flex items-center gap-1"><MapPin size={12} /> {event.venue}</span>}
                                                    {event.source && (
                                                        <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded text-[10px] font-medium">
                                                            {event.source === 'tripadvisor' ? 'TripAdvisor' : 'Google Events'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {event.approved && (
                                                <span className="flex-shrink-0 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                                                    <Check size={10} /> Onaylı
                                                </span>
                                            )}
                                        </div>
                                        {event.description && (
                                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 line-clamp-2">{event.description}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => toggleApproval(event.id, 'event', event.approved)}
                                            disabled={actionLoading === event.id}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${event.approved
                                                    ? 'bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100'
                                                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100'
                                                }`}
                                        >
                                            {actionLoading === event.id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : event.approved ? (
                                                <><XCircle size={12} /> Kaldır</>
                                            ) : (
                                                <><CheckCircle size={12} /> Onayla</>
                                            )}
                                        </button>
                                        {event.link && (
                                            <a href={event.link} target="_blank" rel="noopener" className="text-slate-400 hover:text-cyan-500 transition-colors">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
