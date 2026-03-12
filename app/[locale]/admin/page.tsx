export const dynamic = 'force-dynamic'

import { Calendar, TrendingUp, DollarSign, Activity, XCircle, Info } from 'lucide-react'
import { ElektraService } from '@/lib/services/elektra'
import { fetchDashboardStats, fetchPickupStats } from '@/lib/services/pms-asisia'
import { SalesChart } from '@/components/admin/charts/SalesChart'
import { ChannelTrendChart } from '@/components/admin/charts/ChannelTrendChart'
import { ReviewTrendChart } from '@/components/admin/charts/ReviewTrendChart'
import DashboardFilter from '@/components/admin/DashboardFilter'
import DashboardPickupWidget from '@/components/admin/DashboardPickupWidget'
import DashboardAgencyPerformanceWidget from '@/components/admin/DashboardAgencyPerformanceWidget'
import DashboardForecastWidget from '@/components/admin/DashboardForecastWidget'
import ModuleOffline from '@/components/admin/ModuleOffline'
import LiveTrafficSocialWidget from '@/components/admin/LiveTrafficSocialWidget'
import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'

export default async function AdminDashboard({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>,
  searchParams: Promise<{ from?: string, to?: string, currency?: string }>
}) {
  const { locale } = await params
  const { from, to, currency = 'TRY' } = await searchParams
  const t = getAdminTranslations(locale as AdminLocale)

  // Determine dates — default: Bugün (today) in Turkey timezone (UTC+3)
  const turkeyNowStr = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })
  const turkeyNow = new Date(turkeyNowStr)
  const turkeyToday = `${turkeyNow.getFullYear()}-${String(turkeyNow.getMonth() + 1).padStart(2, '0')}-${String(turkeyNow.getDate()).padStart(2, '0')}`

  let endDate = to ? new Date(to) : new Date(turkeyToday + 'T00:00:00+03:00')
  let startDate = from ? new Date(from) : new Date(turkeyToday + 'T00:00:00+03:00')

  const dateLabel = `${startDate.toLocaleDateString('tr-TR')} – ${endDate.toLocaleDateString('tr-TR')}`

  try {
    const [salesData, stats, recentReservations, reviews, allReservations, pickupStats] = await Promise.all([
      ElektraService.getSalesData(startDate, endDate),
      ElektraService.getDailyStats(),
      ElektraService.getRecentReservations(10),
      ElektraService.getGuestReviews(startDate, endDate),
      ElektraService.getAllSeasonReservations(),
      fetchPickupStats(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
    ])

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Calculate dashboard stats manually using the booking date (lastUpdate/reservationDate)
    const periodReservations = allReservations.filter((r: any) => {
      const d = (r.reservationDate || r.lastUpdate || r.checkIn).slice(0, 10);
      return d >= startStr && d <= endStr;
    });

    const activePeriod = periodReservations.filter((r: any) => r.status !== 'Cancelled' && r.status !== 'İptal');
    const cancelledPeriod = periodReservations.filter((r: any) => r.status === 'Cancelled' || r.status === 'İptal');

    // Aggregate with fallback to TRY rate map if not in TRY
    const tryRate = stats.exchangeRate?.EUR_TO_TRY || 38.5; // fallback
    const usdRate = 35.7; // Hardcoded fallback
    const divisor = currency === 'TRY' ? 1 : (currency === 'EUR' ? tryRate : usdRate);
    const symbol = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : '₺');

    const calcRev = (rsvs: any[]) => rsvs.reduce((sum, r) => sum + (r.currency === 'EUR' ? r.totalPrice * tryRate : (r.currency === 'USD' ? r.totalPrice * usdRate : r.totalPrice)), 0) / divisor;

    const calcRevTry = (rsvs: any[]) => rsvs.reduce((sum, r) => sum + (r.currency === 'EUR' ? r.totalPrice * tryRate : (r.currency === 'USD' ? r.totalPrice * usdRate : r.totalPrice)), 0);
    const calcRevEur = (rsvs: any[]) => rsvs.reduce((sum, r) => sum + (r.currency === 'EUR' ? r.totalPrice : (r.currency === 'TRY' ? (tryRate > 0 ? r.totalPrice / tryRate : 0) : r.totalPrice * (usdRate / tryRate))), 0);

    const asisiaStats = {
      totalReservations: activePeriod.length,
      totalRevenue: calcRev(activePeriod),
      averageStay: activePeriod.length ? activePeriod.reduce((s, r) => s + r.nights, 0) / activePeriod.length : 0,
      totalGuests: activePeriod.reduce((sum, r) => sum + (r.guests?.length || 2), 0),
      cancelledReservations: cancelledPeriod.length,
      cancelledRevenue: calcRev(cancelledPeriod)
    };

    const totalRoomNights = activePeriod.reduce((sum, r) => sum + (r.nights * (r.roomCount || 1)), 0);
    const primaryAdr = totalRoomNights > 0 ? asisiaStats.totalRevenue / totalRoomNights : 0;

    let secondaryAdr = 0;
    let secondaryAdrSymbol = '€';

    if (currency === 'EUR') {
      secondaryAdrSymbol = '₺';
      secondaryAdr = totalRoomNights > 0 ? calcRevTry(activePeriod) / totalRoomNights : 0;
    } else {
      secondaryAdrSymbol = '€';
      secondaryAdr = totalRoomNights > 0 ? calcRevEur(activePeriod) / totalRoomNights : 0;
    }

    const primaryAdrString = `${symbol}${Math.round(primaryAdr).toLocaleString('tr-TR')}`;
    const secondaryAdrString = `${secondaryAdrSymbol}${Math.round(secondaryAdr).toLocaleString('tr-TR')}`;

    // --- PMS Pickup Calculation ---
    const fromStr = startDate.toISOString().split('T')[0];
    const toStr = endDate.toISOString().split('T')[0];

    // Pickups based on last update date being within the selected range
    const pickupsInPeriod = allReservations.filter((r: any) => {
      const lastUpdateDate = r.lastUpdate ? r.lastUpdate.slice(0, 10) : '';
      return lastUpdateDate >= fromStr && lastUpdateDate <= toStr;
    });
    const cancelledInPeriod = pickupsInPeriod.filter((r: any) => r.status === 'Cancelled' || r.status === 'İptal');
    const newInPeriod = pickupsInPeriod.filter((r: any) => r.status !== 'Cancelled' && r.status !== 'İptal');

    // Agency impacts for pickups
    const agencyPickupMap = new Map<string, number>();
    pickupsInPeriod.forEach((r: any) => {
      const agencyName = (r.agency || 'Bilinmeyen Acente').trim().toUpperCase();
      const price = calcRev([r]);
      const isCancelled = r.status === 'Cancelled' || r.status === 'İptal';
      const impact = isCancelled ? -price : price;

      if (!agencyPickupMap.has(agencyName)) {
        agencyPickupMap.set(agencyName, 0);
      }
      agencyPickupMap.set(agencyName, agencyPickupMap.get(agencyName)! + impact);
    });

    const agencyImpacts = Array.from(agencyPickupMap.entries()).map(([name, pickupRevenue]) => ({
      name,
      pickupRevenue
    }));

    const pickupData = {
      newReservations: newInPeriod.length,
      cancelledReservations: cancelledInPeriod.length,
      netPickup: newInPeriod.length - cancelledInPeriod.length,
      revenue: calcRev(newInPeriod) - calcRev(cancelledInPeriod),
      dailyTrend: Array.from(
        pickupsInPeriod.reduce((acc, r) => {
          const d = r.lastUpdate.slice(0, 10);
          if (!acc.has(d)) acc.set(d, { date: d, new: 0, cancelled: 0 });
          if (r.status === 'Cancelled' || r.status === 'İptal') {
            acc.get(d)!.cancelled += 1;
          } else {
            acc.get(d)!.new += 1;
          }
          return acc;
        }, new Map<string, { date: string, new: number, cancelled: number }>()).values()
      ).sort((a, b) => a.date.localeCompare(b.date)),
      recentPickups: [], // legacy
      majorImpacts: [], // legacy
      agencyImpacts
    };

    return (
      <div className="space-y-6">
        {/* Elektra Connection Banner — Fully Live */}
        <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-300 text-sm">{(t as any).connectionStatus || 'Asisia PMS Canlı MS SQL Bağlantısı Aktif'}</span>
        </div>

        {/* Header & Filter */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{(t as any).title || 'Dashboard'}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Seçili Dönem: <strong>{dateLabel}</strong>
              </p>
            </div>
          </div>
          <DashboardFilter />
        </div>

        {/* PROMINENT METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-cyan-900/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <p className="text-cyan-100 font-medium">Toplam Rezervasyon</p>
                <p className="text-xs text-cyan-200">Seçili Dönem: {dateLabel}</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-5xl font-black">{asisiaStats.totalReservations.toLocaleString('tr-TR')}</h2>
                <p className="text-cyan-100 mt-1">Adet Onaylı Rezervasyon</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{symbol}{asisiaStats.totalRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
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
                <p className="text-orange-100 font-medium">ADR (Ort. Günlük Ücret)</p>
                <p className="text-xs text-orange-200">{dateLabel} · Ciro / Oda Geceleme</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-5xl font-black">{primaryAdrString}</h2>
                <p className="text-orange-100 mt-1">Gecelik Ortalama Kâr</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{secondaryAdrString}</p>
                <p className="text-sm font-medium text-orange-200">Güncel Kur: {tryRate.toFixed(2)} ₺</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-6 text-white shadow-xl shadow-red-900/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <XCircle size={24} className="text-white" />
              </div>
              <div>
                <p className="text-red-100 font-medium">İptal Edilen Rezervasyonlar</p>
                <p className="text-xs text-red-200">Seçili Dönem: {dateLabel}</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-5xl font-black">{asisiaStats.cancelledReservations?.toLocaleString('tr-TR') || 0}</h2>
                <p className="text-red-100 mt-1">Adet İptal</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{symbol}{(asisiaStats.cancelledRevenue || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
                <p className="text-sm font-medium text-red-200">Kaybedilen Ciro</p>
              </div>
            </div>
          </div>
        </div>

        {/* PICKUP WIDGET */}
        <DashboardPickupWidget data={pickupData} currency={currency as 'TRY' | 'EUR' | 'USD'} exchangeRate={tryRate} />

        {/* ACENTE PERFORMANS ANALİZİ */}
        <DashboardAgencyPerformanceWidget reservations={periodReservations} currency={currency as 'TRY' | 'EUR' | 'USD'} exchangeRate={tryRate} />

        {/* SEZON ÖNGÖRÜSÜ (FORECAST) */}
        <DashboardForecastWidget reservations={allReservations} currency={currency as 'TRY' | 'EUR' | 'USD'} exchangeRate={tryRate} />

        {/* TREND CHARTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Toplam Rezervasyon Hacmi */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 relative group">
              <Activity size={20} className="text-cyan-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Genel Rezervasyon Trendi</h2>
              <div className="ml-auto cursor-help text-slate-400 hover:text-cyan-500 transition-colors">
                <Info size={16} />
              </div>
              {/* Tooltip on hover */}
              <div className="absolute right-0 top-8 w-64 bg-slate-800 dark:bg-slate-700 text-white p-3 rounded-xl shadow-xl border border-slate-700 dark:border-slate-600 z-50 hidden group-hover:block transition-all text-xs space-y-2 pointer-events-none">
                <p className="font-semibold border-b border-slate-600 pb-1 mb-2">Grafik Bilgisi</p>
                <div className="text-slate-300">Bu grafik, seçilen tarih aralığında rezervasyonların kanallara göre dağılımını (ciro olarak) ve toplam rezervasyon adetini (çizgi ile) göstermektedir. Seçili aralıktaki rezervasyon oluşturulma/güncelleme tarihleri (pickup) baz alınır.</div>
              </div>
            </div>
            <SalesChart data={salesData} currency={currency as 'TRY' | 'EUR' | 'USD'} exchangeRate={tryRate} />
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
            <ChannelTrendChart data={salesData} channel="ota" color="#a855f7" currency={currency as 'TRY' | 'EUR' | 'USD'} exchangeRate={tryRate} />
          </div>

          {/* Call Center Trendleri */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-orange-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Call Center Trendleri</h2>
            </div>
            <ChannelTrendChart data={salesData} channel="callCenter" color="#f97316" currency={currency as 'TRY' | 'EUR' | 'USD'} exchangeRate={tryRate} />
          </div>

          {/* Web Online Trendleri */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Online (Web) Rez. Trendi</h2>
            </div>
            <ChannelTrendChart data={salesData} channel="web" color="#10b981" currency={currency as 'TRY' | 'EUR' | 'USD'} exchangeRate={tryRate} />
          </div>
        </div>

        {/* Live Traffic and Social Media Data */}
        <LiveTrafficSocialWidget from={startDate.toISOString().split('T')[0]} to={endDate.toISOString().split('T')[0]} />
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
