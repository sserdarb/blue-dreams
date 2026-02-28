export const dynamic = 'force-dynamic'

import { Calendar, TrendingUp, DollarSign, Activity } from 'lucide-react'
import { ElektraService } from '@/lib/services/elektra'
import { fetchDashboardStats } from '@/lib/services/pms-asisia'
import { SalesChart } from '@/components/admin/charts/SalesChart'
import { ChannelTrendChart } from '@/components/admin/charts/ChannelTrendChart'
import { ReviewTrendChart } from '@/components/admin/charts/ReviewTrendChart'
import DashboardFilter from '@/components/admin/DashboardFilter'
import ModuleOffline from '@/components/admin/ModuleOffline'
import LiveTrafficSocialWidget from '@/components/admin/LiveTrafficSocialWidget'
import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'

export default async function AdminDashboard({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>,
  searchParams: Promise<{ from?: string, to?: string }>
}) {
  const { locale } = await params
  const { from, to } = await searchParams
  const t = getAdminTranslations(locale as AdminLocale)

  // Determine dates
  let endDate = new Date()
  if (to) endDate = new Date(to)

  let startDate = new Date()
  startDate.setDate(endDate.getDate() - 30) // Default 30 days
  if (from) startDate = new Date(from)

  try {
    const [salesData, stats, , reviews, asisiaStats] = await Promise.all([
      ElektraService.getSalesData(startDate, endDate),
      ElektraService.getDailyStats(),
      ElektraService.getRecentReservations(5),
      ElektraService.getGuestReviews(startDate, endDate),
      fetchDashboardStats(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
    ])

    return (
      <div className="space-y-8">
        {/* Elektra Connection Banner — Fully Live */}
        <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-300 text-sm">{(t as any).connectionStatus || 'Asisia PMS Canlı MS SQL Bağlantısı Aktif'}</span>
        </div>

        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{(t as any).title || 'Dashboard'}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Veriler <strong>{startDate.toLocaleDateString('tr-TR')}</strong> - <strong>{endDate.toLocaleDateString('tr-TR')}</strong> aralığı için gösteriliyor.
            </p>
          </div>
          <DashboardFilter />
        </div>

        {/* PROMINENT METRICS (This Month focused) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-cyan-900/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <p className="text-cyan-100 font-medium">Bu Ay Toplam Rezervasyon</p>
                <p className="text-xs text-cyan-200">Asisia PMS üzerinden canlı veri</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-5xl font-black">{asisiaStats.totalReservations.toLocaleString('tr-TR')}</h2>
                <p className="text-cyan-100 mt-1">Adet Onaylı Rezervasyon</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">₺{asisiaStats.totalRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
                <p className="text-sm font-medium text-cyan-200">Toplam Misafir: {asisiaStats.totalGuests}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl shadow-orange-900/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-white" />
              </div>
              <div>
                <p className="text-orange-100 font-medium">Bu Ay Ortalama Günlük Ücret (ADR)</p>
                <p className="text-xs text-orange-200">Toplam Ciro / Toplam Geceleme</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-5xl font-black">{stats.adr}</h2>
                <p className="text-orange-100 mt-1">Gecelik Ortalama Kâr</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{stats.adrEUR}</p>
                <p className="text-sm font-medium text-orange-200">Güncel Kur: {stats.exchangeRate?.EUR_TO_TRY?.toFixed(2) || '38.00'} ₺</p>
              </div>
            </div>
          </div>
        </div>

        {/* TREND CHARTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Toplam Rezervasyon Hacmi */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={20} className="text-cyan-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Genel Rezervasyon Trendi</h2>
            </div>
            <SalesChart data={salesData} />
          </div>

          {/* Misafir Yorum Trendleri */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-pink-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Misafir Yorum Trendleri</h2>
            </div>
            <ReviewTrendChart data={reviews} />
          </div>

          {/* OTA Trendleri */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-purple-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">OTA Rezervasyon Trendleri</h2>
            </div>
            <ChannelTrendChart data={salesData} channel="ota" color="#a855f7" />
          </div>

          {/* Call Center Trendleri */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-orange-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Call Center Trendleri</h2>
            </div>
            <ChannelTrendChart data={salesData} channel="callCenter" color="#f97316" />
          </div>

          {/* Web Online Trendleri */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Online (Web) Rezervasyon Trendleri</h2>
            </div>
            <ChannelTrendChart data={salesData} channel="web" color="#10b981" />
          </div>
        </div>

        {/* Live Traffic and Social Media Data */}
        <LiveTrafficSocialWidget />
      </div>
    )
  } catch (error) {
    console.error('Dashboard Error:', error)
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Pma Gravity yönetim paneline hoş geldiniz</p>
          </div>
        </div>

        <ModuleOffline
          moduleName="Dashboard & Canlı Veriler"
          dataSource="elektra"
          offlineReason="Elektra PMS ana veri bağlantısı sağlanamadı. Lütfen ağ ayarlarınızı kontrol edin."
        />
      </div>
    )
  }
}
