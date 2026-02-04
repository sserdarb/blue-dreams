import { Calendar, DollarSign, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Bed } from 'lucide-react'
import StatCard from '@/components/admin/StatCard'

export default async function StatisticsPage() {
    // Mock data - in production, this would come from Elektra PMS API
    const stats = {
        totalReservations: 1247,
        totalRevenue: '₺2,845,670',
        averageStay: '4.2 gece',
        occupancyRate: '78%',
    }

    const monthlyData = [
        { month: 'Oca', value: 45 },
        { month: 'Şub', value: 52 },
        { month: 'Mar', value: 68 },
        { month: 'Nis', value: 89 },
        { month: 'May', value: 124 },
        { month: 'Haz', value: 187 },
        { month: 'Tem', value: 245 },
        { month: 'Ağu', value: 258 },
        { month: 'Eyl', value: 142 },
        { month: 'Eki', value: 78 },
        { month: 'Kas', value: 34 },
        { month: 'Ara', value: 25 },
    ]

    const maxValue = Math.max(...monthlyData.map(d => d.value))

    const roomTypeData = [
        { type: 'Club Odalar', count: 523, percentage: 42 },
        { type: 'Deluxe Odalar', count: 456, percentage: 37 },
        { type: 'Aile Suitleri', count: 268, percentage: 21 },
    ]

    const sourceData = [
        { source: 'Website', count: 687, percentage: 55, color: 'bg-cyan-500' },
        { source: 'Booking.com', count: 312, percentage: 25, color: 'bg-orange-500' },
        { source: 'Telefon', count: 186, percentage: 15, color: 'bg-purple-500' },
        { source: 'Walk-in', count: 62, percentage: 5, color: 'bg-green-500' },
    ]

    const upcomingArrivals = [
        { name: 'Mehmet Öz', room: 'Deluxe 204', date: '05 Şub', nights: 3, guests: 2 },
        { name: 'Anna Mueller', room: 'Club 112', date: '05 Şub', nights: 7, guests: 2 },
        { name: 'Smith Family', room: 'Aile Suite 301', date: '06 Şub', nights: 5, guests: 4 },
        { name: 'Yılmaz Çifti', room: 'Deluxe 208', date: '06 Şub', nights: 4, guests: 2 },
        { name: 'Ivan Petrov', room: 'Club 115', date: '07 Şub', nights: 10, guests: 1 },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">İstatistikler</h1>
                <p className="text-slate-400 mt-1">Elektra PMS entegrasyonu ile rezervasyon ve gelir verileri</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Toplam Rezervasyon"
                    value={stats.totalReservations}
                    subtitle="Bu yıl"
                    icon={<Calendar size={24} />}
                    trend="up"
                    trendValue="+18%"
                    color="cyan"
                />
                <StatCard
                    title="Toplam Gelir"
                    value={stats.totalRevenue}
                    subtitle="Bu yıl"
                    icon={<DollarSign size={24} />}
                    trend="up"
                    trendValue="+24%"
                    color="green"
                />
                <StatCard
                    title="Ortalama Konaklama"
                    value={stats.averageStay}
                    subtitle="Kişi başı"
                    icon={<Users size={24} />}
                    trend="neutral"
                    trendValue="sabit"
                    color="purple"
                />
                <StatCard
                    title="Doluluk Oranı"
                    value={stats.occupancyRate}
                    subtitle="Bu ay"
                    icon={<TrendingUp size={24} />}
                    trend="up"
                    trendValue="+5%"
                    color="orange"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Reservations Chart */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Aylık Rezervasyonlar</h2>

                    <div className="flex items-end justify-between h-48 gap-2">
                        {monthlyData.map((data) => (
                            <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t"
                                    style={{ height: `${(data.value / maxValue) * 100}%` }}
                                ></div>
                                <span className="text-slate-500 text-xs">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Room Type Distribution */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Oda Tipi Dağılımı</h2>

                    <div className="space-y-4">
                        {roomTypeData.map((room) => (
                            <div key={room.type}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-300">{room.type}</span>
                                    <span className="text-slate-500">{room.count} ({room.percentage}%)</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                                        style={{ width: `${room.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Sources */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Rezervasyon Kaynakları</h2>

                    <div className="grid grid-cols-2 gap-4">
                        {sourceData.map((source) => (
                            <div
                                key={source.source}
                                className="bg-white/5 rounded-lg p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                                    <span className="text-slate-400 text-sm">{source.source}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{source.count}</p>
                                <p className="text-slate-500 text-xs">{source.percentage}%</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Arrivals */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Yaklaşan Varışlar</h2>

                    <div className="space-y-3">
                        {upcomingArrivals.map((arrival, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                                        <Bed size={18} className="text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{arrival.name}</p>
                                        <p className="text-slate-500 text-xs">{arrival.room}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-sm">{arrival.date}</p>
                                    <p className="text-slate-500 text-xs">{arrival.nights} gece • {arrival.guests} kişi</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Elektra Sync Info */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-medium">Elektra PMS Bağlantısı Aktif</span>
                    </div>
                    <span className="text-slate-500 text-sm">Son senkronizasyon: 2 dakika önce</span>
                </div>
            </div>
        </div>
    )
}
