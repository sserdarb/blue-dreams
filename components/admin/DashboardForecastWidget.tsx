'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Calendar, Filter } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

const TOTAL_ROOMS = 380 // Blue Dreams total room inventory

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
  const [dateRange, setDateRange] = useState<'30' | '60' | '90' | '180'>('90')

  const { agencies, roomTypes, dailyData, summaryStats, symbol } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const rangeDays = parseInt(dateRange)
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + rangeDays)
    const endStr = endDate.toISOString().split('T')[0]

    // Extract future reservations
    const futureRes = reservations.filter(r => {
      if (r.status === 'Cancelled' || r.status === 'İptal') return false
      const checkIn = (r.checkIn || r.reservationDate || '').slice(0, 10)
      const checkOut = (r.checkOut || '').slice(0, 10)
      return checkIn < endStr && checkOut > todayStr
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

    // Build daily map
    const dayMap = new Map<string, { rooms: number; guests: number; revenue: number }>()

    // Initialize all days
    for (let d = new Date(today); d < endDate; d.setDate(d.getDate() + 1)) {
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
  }, [reservations, selectedAgency, selectedRoomType, dateRange, currency, exchangeRate])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    if (!d) return null
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-bold text-slate-900 dark:text-white mb-2">{d.label} ({d.date})</p>
        <div className="space-y-1">
          <p className="flex justify-between gap-4"><span className="text-slate-500">Doluluk:</span> <span className="font-bold text-blue-600">{d.occupancy}%</span></p>
          <p className="flex justify-between gap-4"><span className="text-slate-500">ADR:</span> <span className="font-bold text-amber-600">{symbol}{d.adr.toLocaleString('tr-TR')}</span></p>
          <p className="flex justify-between gap-4"><span className="text-slate-500">Misafir:</span> <span className="font-bold text-emerald-600">{d.guests}</span></p>
          <p className="flex justify-between gap-4"><span className="text-slate-500">Gelir:</span> <span className="font-bold text-indigo-600">{symbol}{d.revenue.toLocaleString('tr-TR')}</span></p>
          <p className="flex justify-between gap-4"><span className="text-slate-500">Dolu Oda:</span> <span className="font-bold">{d.rooms}</span></p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Günlük Doluluk & Gelir Forecast</h3>
            <p className="text-sm text-slate-500">Gelecek {dateRange} gün • Gün bazlı çizgi grafik</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range */}
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
            {(['30', '60', '90', '180'] as const).map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  dateRange === r
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r}G
              </button>
            ))}
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

      {/* Chart */}
      {dailyData.length > 0 ? (
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                tickMargin={8}
                stroke="#64748b"
                interval={Math.max(0, Math.floor(dailyData.length / 15))}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                stroke="#3b82f6"
                tickFormatter={v => `${v}%`}
                domain={[0, 100]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                stroke="#f59e0b"
                tickFormatter={v => `${symbol}${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="line"
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="occupancy" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Doluluk %" />
              <Line yAxisId="right" type="monotone" dataKey="adr" stroke="#f59e0b" strokeWidth={2} dot={false} name="ADR" strokeDasharray="5 5" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={1.5} dot={false} name="Günlük Gelir" opacity={0.6} />
              <Line yAxisId="left" type="monotone" dataKey="guests" stroke="#10b981" strokeWidth={1.5} dot={false} name="Misafir Sayısı" opacity={0.7} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[300px] w-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <Calendar size={48} className="mb-4 opacity-50" />
          <p>Gelecek dönem için onaylı rezervasyon bulunamadı.</p>
        </div>
      )}
    </div>
  )
}
