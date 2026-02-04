import { Calendar, Users, TrendingUp, Eye, FileText, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/admin/StatCard'

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  // Mock data - in production, this would come from the database
  const stats = {
    todayReservations: 12,
    totalRevenue: '₺245,890',
    activeVisitors: 34,
    totalPages: 9,
    pendingMessages: 3,
    monthlyGrowth: '+15%',
  }

  const recentReservations = [
    { id: 'RES-001', guest: 'Ahmet Yılmaz', room: 'Deluxe', checkIn: '15 Şub', status: 'confirmed' },
    { id: 'RES-002', guest: 'Maria Schmidt', room: 'Club', checkIn: '16 Şub', status: 'pending' },
    { id: 'RES-003', guest: 'John Smith', room: 'Aile Suite', checkIn: '18 Şub', status: 'confirmed' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Blue Dreams Resort yönetim paneline hoş geldiniz</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm">Son güncelleme: 5 dk önce</span>
          <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">
            Yenile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Bugünkü Rezervasyonlar"
          value={stats.todayReservations}
          subtitle="Yeni rezervasyon"
          icon={<Calendar size={24} />}
          trend="up"
          trendValue="+3"
          color="cyan"
        />
        <StatCard
          title="Aylık Gelir"
          value={stats.totalRevenue}
          subtitle="Bu ay"
          icon={<TrendingUp size={24} />}
          trend="up"
          trendValue={stats.monthlyGrowth}
          color="green"
        />
        <StatCard
          title="Aktif Ziyaretçi"
          value={stats.activeVisitors}
          subtitle="Şu an sitede"
          icon={<Eye size={24} />}
          trend="neutral"
          trendValue="canlı"
          color="purple"
        />
        <StatCard
          title="Bekleyen Mesaj"
          value={stats.pendingMessages}
          subtitle="Blue Concierge"
          icon={<MessageSquare size={24} />}
          color="orange"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reservations */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Son Rezervasyonlar</h2>
            <Link
              href={`/${locale}/admin/reservations`}
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition-colors"
            >
              Tümünü Gör <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentReservations.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-bold">
                    {res.guest.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{res.guest}</p>
                    <p className="text-slate-500 text-sm">{res.id} • {res.room}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">{res.checkIn}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${res.status === 'confirmed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-orange-500/20 text-orange-400'
                    }`}>
                    {res.status === 'confirmed' ? 'Onaylı' : 'Beklemede'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Hızlı Erişim</h2>

          <div className="space-y-3">
            <Link
              href={`/${locale}/admin/pages/new`}
              className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-cyan-500/20 transition-colors group"
            >
              <FileText size={20} className="text-slate-500 group-hover:text-cyan-400" />
              <span className="text-slate-300 group-hover:text-white">Yeni Sayfa Oluştur</span>
            </Link>

            <Link
              href={`/${locale}/admin/files`}
              className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-cyan-500/20 transition-colors group"
            >
              <Users size={20} className="text-slate-500 group-hover:text-cyan-400" />
              <span className="text-slate-300 group-hover:text-white">Medya Yükle</span>
            </Link>

            <Link
              href={`/${locale}/admin/settings`}
              className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-cyan-500/20 transition-colors group"
            >
              <TrendingUp size={20} className="text-slate-500 group-hover:text-cyan-400" />
              <span className="text-slate-300 group-hover:text-white">Site Ayarları</span>
            </Link>

            <Link
              href={`/${locale}/admin/analytics`}
              className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-cyan-500/20 transition-colors group"
            >
              <Eye size={20} className="text-slate-500 group-hover:text-cyan-400" />
              <span className="text-slate-300 group-hover:text-white">Analytics Ayarları</span>
            </Link>
          </div>

          {/* Mini Stats */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Bu Hafta</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-white">89</p>
                <p className="text-slate-500 text-xs">Rezervasyon</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-white">2.4K</p>
                <p className="text-slate-500 text-xs">Ziyaretçi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
