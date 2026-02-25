export const dynamic = 'force-dynamic'

import { Calendar, Users, TrendingUp, Eye, FileText, ArrowRight, Building2, BedDouble, DollarSign } from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/admin/StatCard'
import { ElektraService } from '@/lib/services/elektra'
import { SalesChart } from '@/components/admin/charts/SalesChart'
import { ChannelPieChart } from '@/components/admin/charts/ChannelPieChart'
import ModuleOffline from '@/components/admin/ModuleOffline'
import LiveTrafficSocialWidget from '@/components/admin/LiveTrafficSocialWidget'
import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = getAdminTranslations(locale as AdminLocale)

  // Fetch ALL data from Elektra PMS — fully live, sales grouped by BOOKING DATE
  const today = new Date()
  const twoWeeksAgo = new Date(today)
  twoWeeksAgo.setDate(today.getDate() - 14)

  try {
    const [salesData, channelData, stats, roomBreakdown, recentRes] = await Promise.all([
      ElektraService.getSalesData(twoWeeksAgo, today),
      ElektraService.getChannelDistribution(),
      ElektraService.getDailyStats(),
      ElektraService.getRoomTypeBreakdown(),
      ElektraService.getRecentReservations(5),
    ])

    return (
      <div className="space-y-8">
        {/* Elektra Connection Banner — Fully Live */}
        <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-300 text-sm">{(t as any).connectionStatus}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{(t as any).title}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{(t as any).subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm">{(t as any).lastUpdate}</span>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">
              {(t as any).refresh}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={(t as any).occupancyRate}
            value={stats.occupancyRate}
            subtitle={`${stats.occupancyAvailable} ${(t as any).availableRooms} / ${stats.occupancyTotal} ${(t as any).totalRooms}`}
            icon={<Building2 size={24} />}
            trend="neutral"
            trendValue={(t as any).liveData}
            color="green"
          />
          <StatCard
            title={(t as any).todayReservation}
            value={stats.todaySalesCount}
            subtitle={`${(t as any).todayRevenue}: ${stats.todayRevenue}`}
            secondaryValue={stats.todayRevenueEUR}
            icon={<Calendar size={24} />}
            trend="neutral"
            trendValue={(t as any).live}
            color="cyan"
          />
          <StatCard
            title={(t as any).monthlyRevenue}
            value={stats.totalRevenue}
            secondaryValue={stats.totalRevenueEUR}
            subtitle={`${stats.monthlyReservationCount} ${(t as any).reservationCount}`}
            icon={<TrendingUp size={24} />}
            trend="neutral"
            trendValue={(t as any).live}
            color="purple"
          />
          <StatCard
            title={(t as any).adr}
            value={stats.adr}
            secondaryValue={stats.adrEUR}
            subtitle={(t as any).adrSubtitle}
            icon={<DollarSign size={24} />}
            trend="neutral"
            trendValue={(t as any).live}
            color="orange"
          />
        </div>

        {/* Room Type Breakdown — Real Data */}
        {roomBreakdown.length > 0 && (
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BedDouble size={20} className="text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{(t as any).roomStatus}</h2>
              <span className="ml-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">{(t as any).live}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {roomBreakdown.map((room: any) => {
                const occupied = room.total - room.available
                const pct = Math.round((occupied / room.total) * 100)
                return (
                  <div key={room.name} className="bg-slate-50 dark:bg-white/5 rounded-lg p-4 border border-slate-100 dark:border-transparent">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate" title={room.name}>{room.name}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{pct}%</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-slate-500 text-xs mt-1">{occupied}/{room.total} {(t as any).occupied}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{(t as any).reservationPerformance}</h2>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">{(t as any).live}</span>
            </div>
            <SalesChart data={salesData} />
          </div>
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{(t as any).channelDistribution}</h2>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">{(t as any).live}</span>
            </div>
            <ChannelPieChart data={channelData} />
          </div>
        </div>

        {/* Live Traffic and Social Media Data */}
        <LiveTrafficSocialWidget />


        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reservations — REAL from Elektra */}
          <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{(t as any).recentReservations}</h2>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">{(t as any).live}</span>
              </div>
              <Link
                href={`/${locale}/admin/reservations`}
                className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition-colors"
              >
                {(t as any).viewAll} <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {recentRes.length > 0 ? recentRes.map((res: any) => {
                const guestName = res.guests.length > 0
                  ? `${res.guests[0].name} ${res.guests[0].surname}`
                  : (res.contactName || 'Misafir')
                const initial = guestName.charAt(0).toUpperCase()

                return (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-100 dark:border-transparent"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-bold">
                        {initial}
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-medium">{guestName}</p>
                        <p className="text-slate-500 text-sm">{res.voucherNo} • {res.roomType} • {res.agency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900 dark:text-white font-medium text-sm">
                        {res.currency === 'TRY' ? '₺' : res.currency === 'EUR' ? '€' : '$'}
                        {res.totalPrice.toLocaleString('tr-TR')}
                      </p>
                      <p className="text-slate-500 text-xs">{res.checkIn} → {res.checkOut}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${res.status === 'Reservation' ? 'bg-green-500/20 text-green-400' :
                        res.status === 'Waiting' ? 'bg-orange-500/20 text-orange-400' :
                          res.status === 'InHouse' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-500/20 text-slate-400'
                        }`}>
                        {res.status === 'Reservation' ? 'Onaylı' :
                          res.status === 'Waiting' ? 'Beklemede' :
                            res.status === 'InHouse' ? 'Konaklıyor' : res.status}
                      </span>
                    </div>
                  </div>
                )
              }) : (
                <p className="text-slate-500 text-sm p-4">Yaklaşan rezervasyon bulunamadı</p>
              )}
            </div>
          </div>

          {/* Quick Links + Mini Stats */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Modül Hub</h2>

            <div className="space-y-2">
              {[
                { href: `/${locale}/admin/reservations`, label: 'Rezervasyonlar', desc: 'Filtre, sıralama, YoY', icon: Calendar, color: 'cyan' },
                { href: `/${locale}/admin/yield`, label: 'Yield Management', desc: 'ADR uyarıları, fiyat matrisi', icon: TrendingUp, color: 'emerald' },
                { href: `/${locale}/admin/reports`, label: 'Yönetim Raporları', desc: 'S26, Pace, kanal, milliyet', icon: FileText, color: 'purple' },
                { href: `/${locale}/admin/extras`, label: 'Ekstra Satışlar', desc: 'SPA, minibar, restoran', icon: DollarSign, color: 'amber' },
                { href: `/${locale}/admin/social`, label: 'Sosyal Medya', desc: 'İçerik üretici, takvim', icon: Eye, color: 'pink' },
                { href: `/${locale}/admin/purchasing`, label: 'Satın Alma', desc: 'Stok, tedarik, trendler', icon: Users, color: 'orange' },
                { href: `/${locale}/admin/social/content`, label: 'AI İçerik Üretici', desc: '4 platform × 4 dil', icon: Building2, color: 'indigo' },
                { href: `/${locale}/admin/files`, label: 'Dosya Yöneticisi', desc: 'AI + Pexels, stok foto', icon: Eye, color: 'teal' },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-500/20 transition-colors group border border-slate-100 dark:border-transparent"
                >
                  <div className={`w-8 h-8 rounded-lg bg-${item.color}-500/20 flex items-center justify-center`}>
                    <item.icon size={16} className={`text-${item.color}-500`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-slate-200 text-sm font-medium group-hover:text-cyan-700 dark:group-hover:text-white">{item.label}</p>
                    <p className="text-slate-400 text-[10px] truncate">{item.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-cyan-500 flex-shrink-0" />
                </Link>
              ))}
            </div>

            {/* Mini Stats — Real data */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Bu Ay</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-center border border-slate-100 dark:border-transparent">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.monthlyReservationCount}</p>
                  <p className="text-slate-500 text-xs">Rezervasyon</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-center border border-slate-100 dark:border-transparent">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.adr}</p>
                  <p className="text-slate-500 text-xs">ADR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          offlineReason="Elektra PMS ana veri bağlantısı sağlanamadı. Lütfen VPN bağlantınızı veya ağ ayarlarınızı kontrol edin."
        />

        {/* Fallback to just Quick Links if dashboard fails */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Hızlı Erişim</h2>
            <div className="space-y-3">
              <Link
                href={`/${locale}/admin/pages/new`}
                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-500/20 transition-colors group border border-slate-100 dark:border-transparent"
              >
                <FileText size={20} className="text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                <span className="text-slate-600 dark:text-slate-300 group-hover:text-cyan-700 dark:group-hover:text-white">Yeni Sayfa Oluştur</span>
              </Link>
              <Link
                href={`/${locale}/admin/settings`}
                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-500/20 transition-colors group border border-slate-100 dark:border-transparent"
              >
                <TrendingUp size={20} className="text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                <span className="text-slate-600 dark:text-slate-300 group-hover:text-cyan-700 dark:group-hover:text-white">Site Ayarları</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
