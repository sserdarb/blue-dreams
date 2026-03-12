'use client'

import { useState, useMemo, useCallback } from 'react'
import { TrendingUp, Calendar, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const TOTAL_ROOMS = 380 // Blue Dreams total room inventory

// Data series definition with colors matching the SalesChart style
// Each series now has its own yAxisId so large revenue values don't compress ADR/guests
const SERIES = [
  { key: 'occupancy', name: 'Doluluk %', color: '#3b82f6', yAxisId: 'left', unit: '%' },
  { key: 'adr', name: 'ADR', color: '#f59e0b', yAxisId: 'right', unit: '' },
  { key: 'revenue', name: 'Günlük Gelir', color: '#6366f1', yAxisId: 'revenue', unit: '' },
  { key: 'guests', name: 'Misafir Sayısı', color: '#10b981', yAxisId: 'guests', unit: '' },
] as const

export default function DashboardForecastWidget({
  reservations,
  currency = 'EUR',
  exchangeRate = 1
}: {
  reservations: any[]
  currency: 'TRY' | 'EUR' | 'USD'
  exchangeRate: number
}) {
  const [selectedAgency, setSelectedAgency] = useState<string>('all')
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all')
  // Toggle visibility of each data series — all visible by default
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(SERIES.map(s => s.key))
  )
  // Season: April 1 – October 31
  const currentYear = new Date().getFullYear()
  const SEASON_START = `${currentYear}-04-01`
  const SEASON_END = `${currentYear}-10-31`
  const SEASON_DAYS = Math.round((new Date(SEASON_END).getTime() - new Date(SEASON_START).getTime()) / 86400000) + 1
  const [zoomDays, setZoomDays] = useState(SEASON_DAYS) // full season = no zoom
  const [zoomOffset, setZoomOffset] = useState(0) // day offset from season start

  const handleZoomIn = () => {
    const newZoom = Math.max(14, Math.floor(zoomDays / 2))
    setZoomDays(newZoom)
  }
  const handleZoomOut = () => {
    const newZoom = Math.min(SEASON_DAYS, zoomDays * 2)
    setZoomDays(newZoom)
    setZoomOffset(Math.max(0, Math.min(zoomOffset, SEASON_DAYS - newZoom)))
  }
  const handlePanLeft = () => setZoomOffset(Math.max(0, zoomOffset - Math.floor(zoomDays / 3)))
  const handlePanRight = () => setZoomOffset(Math.min(SEASON_DAYS - zoomDays, zoomOffset + Math.floor(zoomDays / 3)))

  const toggleSeries = useCallback((key: string) => {
    setVisibleSeries(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        // Don't allow hiding all series
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const { agencies, roomTypes, dailyData, summaryStats, symbol } = useMemo(() => {
    const seasonStart = new Date(SEASON_START)
    const seasonEnd = new Date(SEASON_END)
    seasonEnd.setDate(seasonEnd.getDate() + 1) // inclusive end

    // Visible window
    const viewStart = new Date(seasonStart)
    viewStart.setDate(viewStart.getDate() + zoomOffset)
    const viewEnd = new Date(viewStart)
    viewEnd.setDate(viewEnd.getDate() + zoomDays)
    const viewStartStr = viewStart.toISOString().split('T')[0]
    const viewEndStr = viewEnd.toISOString().split('T')[0]

    // Extract future reservations
    const futureRes = reservations.filter(r => {
      if (r.status === 'Cancelled' || r.status === 'İptal') return false
      const checkIn = (r.checkIn || r.reservationDate || '').slice(0, 10)
      const checkOut = (r.checkOut || '').slice(0, 10)
      // Filter to season window only
      return checkIn < viewEndStr && checkOut > viewStartStr
    })

    // Extract unique agencies and room types
    const agencySet = new Set<string>()
    const roomTypeSet = new Set<string>()
    futureRes.forEach(r => {
      agencySet.add((r.agency || 'Direct').trim())
      roomTypeSet.add((r.roomType || r.roomTitle || 'Standart').trim())
    })

    // Filter by selected agency and room type
    const filtered = futureRes.filter(r => {
      const matchAgency = selectedAgency === 'all' || (r.agency || 'Direct').trim() === selectedAgency
      const matchRoom = selectedRoomType === 'all' || (r.roomType || r.roomTitle || 'Standart').trim() === selectedRoomType
      return matchAgency && matchRoom
    })

    // Currency helpers
    const usdRate = 1.05
    let sym = '€'
    if (currency === 'TRY') sym = '₺'
    else if (currency === 'USD') sym = '$'

    const toDisplayCurrency = (valEur: number) => {
      if (currency === 'TRY') return valEur * exchangeRate
      if (currency === 'USD') return valEur * usdRate
      return valEur
    }

    const toEur = (r: any) => {
      if (r.currency === 'EUR') return r.totalPrice
      if (r.currency === 'TRY') return exchangeRate > 0 ? r.totalPrice / exchangeRate : 0
      if (r.currency === 'USD') return r.totalPrice / usdRate
      return r.totalPrice
    }

    // Build daily map for visible window only
    const dayMap = new Map<string, { rooms: number; guests: number; revenue: number }>()

    for (let d = new Date(viewStart); d < viewEnd; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().split('T')[0]
      dayMap.set(ds, { rooms: 0, guests: 0, revenue: 0 })
    }

    // Populate from reservations
    filtered.forEach(r => {
      const checkIn = new Date((r.checkIn || r.reservationDate || '').slice(0, 10))
      const checkOut = new Date((r.checkOut || '').slice(0, 10))
      const nights = r.nights || Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000))
      const roomCount = r.roomCount || 1
      const paxCount = (r.adults || 2) + (r.children || 0)
      const totalEur = toEur(r)
      const perNightEur = nights > 0 ? totalEur / nights : totalEur

      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        const ds = d.toISOString().split('T')[0]
        if (dayMap.has(ds)) {
          const entry = dayMap.get(ds)!
          entry.rooms += roomCount
          entry.guests += paxCount
          entry.revenue += perNightEur * roomCount
        }
      }
    })

    // Convert to array
    const dailyArr = Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        const occupancy = Math.min(100, Math.round((data.rooms / TOTAL_ROOMS) * 100))
        const adr = data.rooms > 0 ? toDisplayCurrency(data.revenue / data.rooms) : 0
        const revenue = toDisplayCurrency(data.revenue)
        return {
          date,
          label: new Date(date + 'T12:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
          occupancy,
          adr: Math.round(adr),
          guests: data.guests,
          revenue: Math.round(revenue),
          rooms: data.rooms,
        }
      })

    // Summary stats
    const totalDays = dailyArr.length
    const totalRevenue = dailyArr.reduce((s, d) => s + d.revenue, 0)
    const totalRoomNights = dailyArr.reduce((s, d) => s + d.rooms, 0)
    const avgOccupancy = totalDays > 0 ? Math.round(dailyArr.reduce((s, d) => s + d.occupancy, 0) / totalDays) : 0
    const avgAdr = totalRoomNights > 0 ? Math.round(totalRevenue / totalRoomNights) : 0
    const avgGuests = totalDays > 0 ? Math.round(dailyArr.reduce((s, d) => s + d.guests, 0) / totalDays) : 0

    return {
      agencies: Array.from(agencySet).sort(),
      roomTypes: Array.from(roomTypeSet).sort(),
      dailyData: dailyArr,
      summaryStats: { totalRevenue, totalRoomNights, avgOccupancy, avgAdr, avgGuests, totalReservations: filtered.length },
      symbol: sym,
    }
  }, [reservations, selectedAgency, selectedRoomType, zoomDays, zoomOffset, currency, exchangeRate, SEASON_START, SEASON_END, SEASON_DAYS])

  const isFullSeason = zoomDays >= SEASON_DAYS

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    if (!d) return null
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg z-50">
        <p className="font-bold text-slate-900 dark:text-white mb-2">{d.label} ({d.date})</p>
        {payload.map((p: any, index: number) => {
          const isPercent = p.dataKey === 'occupancy'
          const isCount = p.dataKey === 'guests'
          return (
            <div key={index} className="flex items-center gap-2 text-xs mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke || p.color }} />
              <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
              <span className="font-bold text-slate-900 dark:text-white ml-auto">
                {isPercent ? `${p.value}%` : isCount ? p.value : `${symbol}${Number(p.value).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`}
              </span>
            </div>
          )
        })}
        <div className="border-t border-slate-200 dark:border-slate-600 mt-1.5 pt-1.5 text-xs text-slate-500">
          Dolu Oda: <span className="font-bold text-slate-700 dark:text-white">{d.rooms}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sezon Forecast (1 Nis – 31 Eki)</h3>
            <p className="text-sm text-slate-500">{isFullSeason ? 'Tam sezon görünümü' : `${zoomDays} günlük pencere`}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 gap-0.5">
            <button onClick={handlePanLeft} disabled={zoomOffset === 0 || isFullSeason} className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white transition disabled:opacity-30" title="Sola Kaydır">
              <ChevronLeft size={14} />
            </button>
            <button onClick={handleZoomIn} disabled={zoomDays <= 14} className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white transition disabled:opacity-30" title="Yakınlaştır">
              <ZoomIn size={14} />
            </button>
            <button onClick={handleZoomOut} disabled={isFullSeason} className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white transition disabled:opacity-30" title="Uzaklaştır">
              <ZoomOut size={14} />
            </button>
            <button onClick={handlePanRight} disabled={zoomOffset >= SEASON_DAYS - zoomDays || isFullSeason} className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white transition disabled:opacity-30" title="Sağa Kaydır">
              <ChevronRight size={14} />
            </button>
            {!isFullSeason && (
              <button onClick={() => { setZoomDays(SEASON_DAYS); setZoomOffset(0) }} className="px-2 py-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition" title="Tam Sezon">
                TÜM
              </button>
            )}
          </div>

          {/* Agency filter */}
          <select
            value={selectedAgency}
            onChange={e => setSelectedAgency(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">Tüm Acenteler</option>
            {agencies.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Room Type filter */}
          <select
            value={selectedRoomType}
            onChange={e => setSelectedRoomType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">Tüm Oda Tipleri</option>
            {roomTypes.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
          <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Ort. Doluluk</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{summaryStats.avgOccupancy}%</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-800">
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Ort. ADR</p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{symbol}{summaryStats.avgAdr.toLocaleString('tr-TR')}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Ort. Misafir/Gün</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{summaryStats.avgGuests}</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800">
          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Toplam Gelir</p>
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{symbol}{Math.round(summaryStats.totalRevenue).toLocaleString('tr-TR')}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Oda Geceleme</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{summaryStats.totalRoomNights.toLocaleString('tr-TR')}</p>
        </div>
      </div>

      {/* Series Toggle Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-slate-400 font-medium mr-1">Veri:</span>
        {SERIES.map(s => {
          const isActive = visibleSeries.has(s.key)
          return (
            <button
              key={s.key}
              onClick={() => toggleSeries(s.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                isActive
                  ? 'border-transparent shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-400 line-through'
              }`}
              style={isActive ? {
                backgroundColor: `${s.color}18`,
                color: s.color
              } : {}}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-opacity"
                style={{ backgroundColor: s.color, opacity: isActive ? 1 : 0.25 }}
              />
              {s.name}
            </button>
          )
        })}
      </div>

      {/* Chart */}
      {dailyData.length > 0 ? (() => {
        // Compute ADR domain from data with 20% padding so the line uses full height
        const adrValues = dailyData.map(d => d.adr).filter(v => v > 0)
        const adrMin = adrValues.length > 0 ? Math.max(0, Math.floor(Math.min(...adrValues) * 0.8)) : 0
        const adrMax = adrValues.length > 0 ? Math.ceil(Math.max(...adrValues) * 1.2) : 500

        return (
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                {SERIES.map(s => (
                  <linearGradient key={s.key} id={`fc-grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={Math.max(0, Math.floor(dailyData.length / 15))}
              />
              {/* Left axis — Doluluk % (0-100) */}
              <YAxis
                yAxisId="left"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${v}%`}
                domain={[0, 100]}
              />
              {/* Right axis — ADR with auto-scaled padded domain */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${symbol}${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                domain={[adrMin, adrMax]}
              />
              {/* Hidden axis — Revenue (auto domain, invisible) */}
              <YAxis yAxisId="revenue" hide domain={['auto', 'auto']} />
              {/* Hidden axis — Guests (auto domain, invisible) */}
              <YAxis yAxisId="guests" hide domain={['auto', 'auto']} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-700" />
              <Tooltip content={<CustomTooltip />} />
              {SERIES.map(s => (
                visibleSeries.has(s.key) && (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    yAxisId={s.yAxisId}
                    stroke={s.color}
                    strokeWidth={2}
                    fill={`url(#fc-grad-${s.key})`}
                    name={s.name}
                    animationDuration={600}
                  />
                )
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        )
      })() : (
        <div className="h-[300px] w-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <Calendar size={48} className="mb-4 opacity-50" />
          <p>Gelecek dönem için onaylı rezervasyon bulunamadı.</p>
        </div>
      )}
    </div>
  )
}
