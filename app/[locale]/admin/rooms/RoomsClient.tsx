'use client'

import { useState, useMemo, useCallback } from 'react'
import { BedDouble, Calendar, ExternalLink, TrendingUp, ArrowUpDown, Ban, Check, RefreshCw, Search } from 'lucide-react'

interface RoomDate {
    date: string
    available: number
    basePrice: number | null
    discountedPrice: number | null
    stopsell: boolean
}

interface RoomData {
    name: string
    roomTypeId: number
    todayAvailable?: number
    todayPrice?: number | null
    todayStopsell?: boolean
    avgPrice: number
    minPrice: number | null
    dates: RoomDate[]
}

interface Props {
    initialRooms: RoomData[]
    error: string | null
}

const ROOM_TOTALS: Record<string, number> = {
    'Club Room': 81, 'Club Room Sea View': 136, 'Club Family Room': 58,
    'Deluxe Room': 38, 'Deluxe Family Room': 28, 'Beach Side Room': 29,
}

const ROOM_COLORS: Record<string, string> = {
    'Club Room': '#0ea5e9',
    'Club Room Sea View': '#06b6d4',
    'Club Family Room': '#8b5cf6',
    'Deluxe Room': '#f59e0b',
    'Deluxe Family Room': '#ec4899',
    'Beach Side Room': '#10b981',
}

const BOOKING_ENGINE_URL = 'https://blue-dreams.rezervasyonal.com'

// Channels: Hotelweb & Call Center only
const AGENCY_CHANNELS = [
    { id: 'hotelweb', name: 'Hotelweb (Website)', color: '#ec4899', bg: 'from-pink-500/10 to-pink-600/5 border-pink-500/20' },
    { id: 'callcenter', name: 'Call Center', color: '#0ea5e9', bg: 'from-sky-500/10 to-sky-600/5 border-sky-500/20' },
]

function fmtDate(d: Date): string {
    return d.toISOString().split('T')[0]
}

function fmtMoney(n: number): string {
    return `₺${n.toLocaleString('tr-TR')}`
}

export default function RoomsClient({ initialRooms, error }: Props) {
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'available'>('name')
    const [rooms, setRooms] = useState(initialRooms)
    const [loading, setLoading] = useState(false)

    // Date range for queries  
    const today = new Date()
    const [fromDate, setFromDate] = useState(fmtDate(today))
    const [toDate, setToDate] = useState(fmtDate(new Date(today.getTime() + 30 * 86400000)))

    // Quick presets
    const [activePreset, setActivePreset] = useState<string>('30d')

    const fetchAvailability = useCallback(async (from: string, to: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/availability?from=${from}&to=${to}&currency=TRY`)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setRooms(data)
        } catch (err) {
            console.error('Error fetching availability:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    const applyPreset = (preset: string) => {
        setActivePreset(preset)
        const d = new Date()
        let from: string, to: string
        switch (preset) {
            case 'today':
                from = fmtDate(d)
                to = fmtDate(new Date(d.getTime() + 86400000))
                break
            case '7d':
                from = fmtDate(d)
                to = fmtDate(new Date(d.getTime() + 7 * 86400000))
                break
            case '30d':
                from = fmtDate(d)
                to = fmtDate(new Date(d.getTime() + 30 * 86400000))
                break
            case '60d':
                from = fmtDate(d)
                to = fmtDate(new Date(d.getTime() + 60 * 86400000))
                break
            case '90d':
                from = fmtDate(d)
                to = fmtDate(new Date(d.getTime() + 90 * 86400000))
                break
            default:
                return
        }
        setFromDate(from)
        setToDate(to)
        fetchAvailability(from, to)
    }

    const handleCustomSearch = () => {
        setActivePreset('custom')
        fetchAvailability(fromDate, toDate)
    }

    const sorted = useMemo(() => {
        return [...rooms].sort((a, b) => {
            if (sortBy === 'price') return (b.avgPrice || 0) - (a.avgPrice || 0)
            if (sortBy === 'available') {
                const aAvail = a.dates.reduce((s, d) => s + d.available, 0)
                const bAvail = b.dates.reduce((s, d) => s + d.available, 0)
                return bAvail - aAvail
            }
            return a.name.localeCompare(b.name)
        })
    }, [rooms, sortBy])

    // Global stats
    const globalStats = useMemo(() => {
        const allDates = rooms.flatMap(r => r.dates)
        const uniqueDates = [...new Set(allDates.map(d => d.date))]
        const avgPrice = allDates.length > 0
            ? Math.round(allDates.reduce((s, d) => s + (d.discountedPrice || d.basePrice || 0), 0) / allDates.filter(d => d.basePrice).length)
            : 0
        const stopsellCount = allDates.filter(d => d.stopsell).length
        const totalSlots = allDates.length || 1
        return { days: uniqueDates.length, avgPrice, stopsellPct: Math.round((stopsellCount / totalSlots) * 100) }
    }, [rooms])

    if (error) {
        return <div className="p-12 text-center"><p className="text-red-400 text-lg">{error}</p></div>
    }

    // All unique dates across all rooms for timeline
    const allDates = [...new Set(rooms.flatMap(r => r.dates.map(d => d.date)))].sort()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        Oda Fiyatları & Müsaitlik
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium">Canlı</span>
                    </h1>
                    <p className="text-slate-400 mt-1">Elektra PMS — Hotelweb & Call Center kanalları</p>
                </div>
                <a href={BOOKING_ENGINE_URL} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/40">
                    <ExternalLink size={16} /> Booking Engine
                </a>
            </div>

            {/* Date Range Selector */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Quick presets */}
                    <div className="flex bg-white/5 rounded-lg p-1">
                        {[
                            { id: 'today', label: 'Bugün' },
                            { id: '7d', label: '7 Gün' },
                            { id: '30d', label: '30 Gün' },
                            { id: '60d', label: '60 Gün' },
                            { id: '90d', label: '90 Gün' },
                        ].map(p => (
                            <button key={p.id} onClick={() => applyPreset(p.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                    ${activePreset === p.id ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom date range */}
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-500" />
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-cyan-500 outline-none" />
                        <span className="text-slate-500 text-sm">→</span>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-cyan-500 outline-none" />
                        <button onClick={handleCustomSearch}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                            <Search size={14} /> Sorgula
                        </button>
                    </div>

                    {loading && (
                        <div className="flex items-center gap-2 text-cyan-400 text-sm">
                            <RefreshCw size={14} className="animate-spin" /> Yükleniyor...
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-4">
                    <p className="text-slate-500 text-xs uppercase mb-1">Oda Tipleri</p>
                    <p className="text-2xl font-bold text-cyan-400">{rooms.length}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-slate-500 text-xs uppercase mb-1">Sorgu Aralığı</p>
                    <p className="text-2xl font-bold text-emerald-400">{globalStats.days} gün</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-slate-500 text-xs uppercase mb-1">Ort. Gecelik</p>
                    <p className="text-2xl font-bold text-amber-400">{fmtMoney(globalStats.avgPrice)}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4">
                    <p className="text-slate-500 text-xs uppercase mb-1">Stop Sale</p>
                    <p className="text-2xl font-bold text-red-400">%{globalStats.stopsellPct}</p>
                </div>
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Sırala:</span>
                {[
                    { val: 'name' as const, label: 'İsim' },
                    { val: 'price' as const, label: 'Fiyat' },
                    { val: 'available' as const, label: 'Müsaitlik' },
                ].map(s => (
                    <button key={s.val} onClick={() => setSortBy(s.val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                            ${sortBy === s.val ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* ═══════ PRICE TIMELINE ═══════ */}
            {allDates.length > 1 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-cyan-400" /> Fiyat Timeline — Oda Tipi Bazında
                    </h2>
                    <p className="text-slate-500 text-sm mb-4">Hotelweb & Call Center kanalları · {allDates[0]} → {allDates[allDates.length - 1]}</p>

                    {/* Timeline chart */}
                    <div className="overflow-x-auto">
                        <div style={{ minWidth: `${Math.max(allDates.length * 48, 600)}px` }}>
                            {/* Legend */}
                            <div className="flex flex-wrap gap-3 mb-4">
                                {sorted.map(room => (
                                    <div key={room.name} className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ROOM_COLORS[room.name] || '#64748b' }} />
                                        <span className="text-xs text-slate-400">{room.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Chart area */}
                            <div className="relative" style={{ height: '280px' }}>
                                {/* Y-axis labels */}
                                {(() => {
                                    const allPrices = rooms.flatMap(r => r.dates.map(d => d.discountedPrice || d.basePrice || 0)).filter(p => p > 0)
                                    const maxPrice = Math.max(...allPrices, 1)
                                    const minPriceVal = Math.min(...allPrices.filter(p => p > 0), maxPrice)
                                    const steps = [0, 0.25, 0.5, 0.75, 1]
                                    return steps.map(step => {
                                        const val = Math.round(minPriceVal + (maxPrice - minPriceVal) * (1 - step))
                                        return (
                                            <div key={step} className="absolute left-0 right-0 flex items-center" style={{ top: `${step * 100}%` }}>
                                                <span className="text-[10px] text-slate-600 w-16 text-right pr-2 shrink-0">{fmtMoney(val)}</span>
                                                <div className="flex-1 border-t border-white/5" />
                                            </div>
                                        )
                                    })
                                })()}

                                {/* SVG chart */}
                                <svg className="absolute inset-0 ml-16" width="100%" height="100%" preserveAspectRatio="none">
                                    {sorted.map(room => {
                                        const allPrices = rooms.flatMap(r => r.dates.map(d => d.discountedPrice || d.basePrice || 0)).filter(p => p > 0)
                                        const maxPrice = Math.max(...allPrices, 1)
                                        const minPriceVal = Math.min(...allPrices.filter(p => p > 0), maxPrice)
                                        const range = maxPrice - minPriceVal || 1
                                        const color = ROOM_COLORS[room.name] || '#64748b'

                                        const points = allDates.map((date, i) => {
                                            const dateData = room.dates.find(d => d.date === date)
                                            const price = dateData ? (dateData.discountedPrice || dateData.basePrice || 0) : 0
                                            if (price === 0) return null
                                            const x = (i / Math.max(allDates.length - 1, 1)) * 100
                                            const y = 100 - ((price - minPriceVal) / range) * 100
                                            return `${x},${y}`
                                        }).filter(Boolean)

                                        if (points.length < 2) return null

                                        return (
                                            <polyline
                                                key={room.name}
                                                points={points.join(' ')}
                                                fill="none"
                                                stroke={color}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                vectorEffect="non-scaling-stroke"
                                                opacity="0.8"
                                            />
                                        )
                                    })}
                                </svg>
                            </div>

                            {/* X-axis labels */}
                            <div className="flex ml-16 mt-2">
                                {allDates.map((date, i) => {
                                    // Show every nth label based on number of dates
                                    const step = Math.max(1, Math.floor(allDates.length / 10))
                                    if (i % step !== 0 && i !== allDates.length - 1) return null
                                    const d = new Date(date)
                                    return (
                                        <div key={date} className="text-[10px] text-slate-600 text-center"
                                            style={{ position: 'absolute', left: `calc(64px + ${(i / Math.max(allDates.length - 1, 1)) * (100 - 8)}%)` }}>
                                            {d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ PRICE TABLE (Detailed) ═══════ */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-violet-400" /> Günlük Fiyat Tablosu
                </h2>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-[#1e293b] z-10">
                            <tr className="border-b border-white/10">
                                <th className="text-left py-2 px-3 text-slate-500 text-xs font-medium uppercase sticky left-0 bg-[#1e293b]">Tarih</th>
                                {sorted.map(room => (
                                    <th key={room.name} className="text-right py-2 px-3 text-xs font-medium uppercase whitespace-nowrap"
                                        style={{ color: ROOM_COLORS[room.name] || '#94a3b8' }}>
                                        {room.name.replace('Room', 'R.').replace('Family', 'Fam.')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {allDates.map(date => {
                                const d = new Date(date)
                                const isWeekend = d.getDay() === 0 || d.getDay() === 6
                                return (
                                    <tr key={date} className={`border-b border-white/5 hover:bg-white/5 ${isWeekend ? 'bg-white/[0.02]' : ''}`}>
                                        <td className="py-2 px-3 text-white text-sm whitespace-nowrap sticky left-0 bg-[#1e293b]">
                                            {d.toLocaleDateString('tr-TR', { weekday: 'short', day: '2-digit', month: 'short' })}
                                        </td>
                                        {sorted.map(room => {
                                            const dateData = room.dates.find(dd => dd.date === date)
                                            if (!dateData) return <td key={room.name} className="py-2 px-3 text-right text-slate-600 text-sm">—</td>
                                            const price = dateData.discountedPrice || dateData.basePrice || 0
                                            return (
                                                <td key={room.name} className="py-2 px-3 text-right text-sm">
                                                    {dateData.stopsell ? (
                                                        <span className="text-red-400 font-medium flex items-center justify-end gap-1">
                                                            <Ban size={10} /> STOP
                                                        </span>
                                                    ) : (
                                                        <span className="text-white">
                                                            {price > 0 ? fmtMoney(price) : '—'}
                                                            {dateData.available > 0 && (
                                                                <span className="text-[10px] text-slate-500 ml-1">({dateData.available})</span>
                                                            )}
                                                        </span>
                                                    )}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ═══════ ROOM CARDS ═══════ */}
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BedDouble size={18} className="text-cyan-400" /> Oda Tipleri
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sorted.map(room => {
                    const total = ROOM_TOTALS[room.name] || 0
                    const todayData = room.dates[0]
                    const todayPrice = todayData?.discountedPrice || todayData?.basePrice || null
                    const todayAvailable = todayData?.available || 0
                    const occupancy = total > 0 ? Math.round(((total - todayAvailable) / total) * 100) : 0
                    const color = ROOM_COLORS[room.name] || '#64748b'
                    const maxPrice = Math.max(...room.dates.map(d => d.discountedPrice || d.basePrice || 0), 1)

                    return (
                        <div key={room.name} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                        <h3 className="text-lg font-bold text-white">{room.name}</h3>
                                        {todayData?.stopsell && (
                                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded font-medium flex items-center gap-1">
                                                <Ban size={10} /> Stop
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {todayPrice ? (
                                            <p className="text-2xl font-bold" style={{ color }}>{fmtMoney(todayPrice)}</p>
                                        ) : (
                                            <p className="text-sm text-slate-500">Fiyat yok</p>
                                        )}
                                        <p className="text-xs text-slate-500">başlangıç fiyatı</p>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="bg-white/5 rounded-lg p-2 text-center">
                                        <p className="text-xs text-slate-500">Müsait</p>
                                        <p className="text-sm font-bold text-emerald-400">{todayAvailable} / {total}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2 text-center">
                                        <p className="text-xs text-slate-500">Ort. Fiyat</p>
                                        <p className="text-sm font-bold text-amber-400">{fmtMoney(room.avgPrice)}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2 text-center">
                                        <p className="text-xs text-slate-500">Min. Fiyat</p>
                                        <p className="text-sm font-bold text-cyan-400">{room.minPrice ? fmtMoney(room.minPrice) : '—'}</p>
                                    </div>
                                </div>

                                {/* Mini price chart */}
                                <div className="flex items-end gap-[2px] h-[60px] bg-white/5 rounded-lg p-2">
                                    {room.dates.map(d => {
                                        const price = d.discountedPrice || d.basePrice || 0
                                        const h = Math.max(4, (price / maxPrice) * 100)
                                        return (
                                            <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative min-w-[3px]">
                                                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                                    {new Date(d.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}: {fmtMoney(price)}
                                                    {d.stopsell && ' · STOP'}
                                                </div>
                                                <div className={`w-full rounded-t transition-all ${d.stopsell ? 'bg-red-500/50' : ''}`}
                                                    style={{
                                                        height: `${h}%`,
                                                        backgroundColor: d.stopsell ? undefined : color,
                                                        opacity: d.stopsell ? 1 : 0.7,
                                                    }} />
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Occupancy bar */}
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs text-slate-500 w-16">Doluluk</span>
                                    <div className="flex-1 bg-white/5 rounded-full h-2">
                                        <div className={`h-full rounded-full transition-all ${occupancy > 80 ? 'bg-red-500' : occupancy > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${occupancy}%` }} />
                                    </div>
                                    <span className="text-xs text-slate-400 w-8">%{occupancy}</span>
                                </div>

                                {/* Booking link */}
                                <a href={`${BOOKING_ENGINE_URL}/?arrival=${fromDate}&departure=${toDate}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-cyan-600/20 text-cyan-400 text-xs rounded hover:bg-cyan-600/30 transition-colors">
                                    <ExternalLink size={12} /> Rezervasyon Yap
                                </a>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
