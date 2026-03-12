'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

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

  const { agencies, forecastStats, monthlyData } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // Extract active future reservations
    const futureRes = reservations.filter(r => {
      if (r.status === 'Cancelled' || r.status === 'İptal') return false
      const checkInDate = (r.checkIn || r.reservationDate || '').slice(0, 10)
      return checkInDate >= todayStr
    })

    // Extract unique agencies
    const agencySet = new Set<string>()
    futureRes.forEach(r => {
      const ag = (r.agency || 'Direct').trim()
      if (ag) agencySet.add(ag)
    })
    const uniqueAgencies = Array.from(agencySet).sort()

    // Filter by selected agency
    const filteredRes = selectedAgency === 'all' 
      ? futureRes 
      : futureRes.filter(r => (r.agency || 'Direct').trim() === selectedAgency)

    let totalRevEur = 0
    let totalRoomNights = 0

    const usdRate = 1.05 // rough EUR/USD peg just for UI approximation if needed

    // Monthly Buckets
    const monthMap = new Map<string, { month: string, revenue: number, roomNights: number }>()

    filteredRes.forEach(r => {
      let valEur = 0
      if (r.currency === 'EUR') valEur = r.totalPrice
      else if (r.currency === 'TRY') valEur = exchangeRate > 0 ? r.totalPrice / exchangeRate : 0
      else if (r.currency === 'USD') valEur = r.totalPrice / usdRate
      else valEur = r.totalPrice // fallback

      totalRevEur += valEur
      const rn = (r.nights || 1) * (r.roomCount || 1)
      totalRoomNights += rn

      const checkInDate = (r.checkIn || r.reservationDate || '').slice(0, 10)
      if (checkInDate.length >= 7) {
        const monthKey = checkInDate.slice(0, 7) // YYYY-MM
        if (!monthMap.has(monthKey)) {
          monthMap.set(monthKey, { month: monthKey, revenue: 0, roomNights: 0 })
        }
        const m = monthMap.get(monthKey)!
        m.revenue += valEur
        m.roomNights += rn
      }
    })

    // Convert EUR totals back to chosen currency view
    let finalRev = 0
    let symbol = '€'
    if (currency === 'TRY') {
      finalRev = totalRevEur * exchangeRate
      symbol = '₺'
    } else if (currency === 'USD') {
      finalRev = totalRevEur * usdRate
      symbol = '$'
    } else {
      finalRev = totalRevEur
    }

    const mData = Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month)).map(m => {
      let mRev = 0
      if (currency === 'TRY') mRev = m.revenue * exchangeRate
      else if (currency === 'USD') mRev = m.revenue * usdRate
      else mRev = m.revenue

      return {
        ...m,
        revenueFormatted: Math.round(mRev),
      }
    })

    return {
      agencies: uniqueAgencies,
      forecastStats: {
        totalReservations: filteredRes.length,
        totalRevenue: finalRev,
        totalRoomNights,
        adr: totalRoomNights > 0 ? (finalRev / totalRoomNights) : 0,
        symbol
      },
      monthlyData: mData
    }
  }, [reservations, selectedAgency, currency, exchangeRate])

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sezon Öngörüsü (Forecast)</h3>
            <p className="text-sm text-slate-500">Bugünden sonraki onaylı rezervasyonlar</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedAgency}
            onChange={e => setSelectedAgency(e.target.value)}
            className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">Tüm Acenteler</option>
            {agencies.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 mb-1">Gelecek Rezervasyon</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{forecastStats.totalReservations.toLocaleString('tr-TR')}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 mb-1">Gelecek Oda Geceleme</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{forecastStats.totalRoomNights.toLocaleString('tr-TR')}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 mb-1">Beklenen Ciro</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {forecastStats.symbol}{Math.round(forecastStats.totalRevenue).toLocaleString('tr-TR')}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500 mb-1">Öngörülen ADR</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {forecastStats.symbol}{Math.round(forecastStats.adr).toLocaleString('tr-TR')}
          </p>
        </div>
      </div>

      {/* Chart */}
      {monthlyData.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickMargin={10} stroke="#64748b" />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `${val/1000}k`} stroke="#64748b" />
              <Tooltip
                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`${forecastStats.symbol}${value.toLocaleString('tr-TR')}`, 'Ciro']}
                labelFormatter={(label) => `Ay: ${label}`}
              />
              <Bar dataKey="revenueFormatted" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Beklenen Ciro" />
            </BarChart>
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
