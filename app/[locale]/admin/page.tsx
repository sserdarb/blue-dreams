import { Calendar, Users, TrendingUp, Eye, FileText, ArrowRight, Building2, BedDouble, DollarSign } from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/admin/StatCard'
import { ElektraService } from '@/lib/services/elektra'
import { SalesChart } from '@/components/admin/charts/SalesChart'
import { ChannelPieChart } from '@/components/admin/charts/ChannelPieChart'
import ModuleOffline from '@/components/admin/ModuleOffline'

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

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
          <span className="text-emerald-300 text-sm">Elektra PMS Tam Bağlantı — Tüm veriler canlı</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Blue Dreams Resort yönetim paneline hoş geldiniz</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm">Son güncelleme: şimdi</span>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">
              Yenile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Doluluk Oranı"
            value={stats.occupancyRate}
            subtitle={`${stats.occupancyAvailable} oda müsait / ${stats.occupancyTotal} toplam`}
            icon={<Building2 size={24} />}
            trend="neutral"
            trendValue="canlı veri"
            color="green"
          />
          <StatCard
            title="Bugünkü Rezervasyon"
            value={stats.todaySalesCount}
            subtitle={`Bugün: ${stats.todayRevenue}`}
            secondaryValue={stats.todayRevenueEUR}
            icon={<Calendar size={24} />}
            trend="neutral"
            trendValue="canlı"
            color="cyan"
          />
          <StatCard
            title="Aylık Gelir"
            value={stats.totalRevenue}
            secondaryValue={stats.totalRevenueEUR}
            subtitle={`${stats.monthlyReservationCount} rezervasyon`}
            icon={<TrendingUp size={24} />}
            trend="neutral"
            trendValue="canlı"
            color="purple"
          />
          <StatCard
            title="ADR (Ortalama)"
            value={stats.adr}
            secondaryValue={stats.adrEUR}
            subtitle="Oda/gece ortalaması"
            icon={<DollarSign size={24} />}
            trend="neutral"
            trendValue="canlı"
            color="orange"
          />
        </div>

        {/* Room Type Breakdown — Real Data */}
        {roomBreakdown.length > 0 && (
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BedDouble size={20} className="text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Oda Durumu</h2>
              <span className="ml-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">Canlı</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {roomBreakdown.map((room) => {
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
                    <p className="text-slate-500 text-xs mt-1">{occupied}/{room.total} dolu</p>
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rezervasyon Performansı (Son 14 Gün)</h2>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">Canlı</span>
            </div>
            <SalesChart data={salesData} />
          </div>
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kanal Dağılımı</h2>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">Canlı</span>
            </div>
            <ChannelPieChart data={channelData} />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reservations — REAL from Elektra */}
          <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Son Rezervasyonlar</h2>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">Canlı</span>
              </div>
              <Link
                href={`/${locale}/admin/reservations`}
                className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition-colors"
              >
                Tümünü Gör <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {recentRes.length > 0 ? recentRes.map((res) => {
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
                href={`/${locale}/admin/files`}
                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-500/20 transition-colors group border border-slate-100 dark:border-transparent"
              >
                <Users size={20} className="text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                <span className="text-slate-600 dark:text-slate-300 group-hover:text-cyan-700 dark:group-hover:text-white">Medya Yükle</span>
              </Link>

              <Link
                href={`/${locale}/admin/settings`}
                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-500/20 transition-colors group border border-slate-100 dark:border-transparent"
              >
                <TrendingUp size={20} className="text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                <span className="text-slate-600 dark:text-slate-300 group-hover:text-cyan-700 dark:group-hover:text-white">Site Ayarları</span>
              </Link>

              <Link
                href={`/${locale}/admin/analytics`}
                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-500/20 transition-colors group border border-slate-100 dark:border-transparent"
              >
                <Eye size={20} className="text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                <span className="text-slate-600 dark:text-slate-300 group-hover:text-cyan-700 dark:group-hover:text-white">Analytics Ayarları</span>
              </Link>
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
            <p className="text-slate-500 dark:text-slate-400 mt-1">Blue Dreams Resort yönetim paneline hoş geldiniz</p>
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
