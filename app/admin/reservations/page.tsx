'use client'

import { useState } from 'react'
import { Calendar, Search, Filter, ChevronLeft, ChevronRight, Eye, Check, X, Clock, MoreVertical } from 'lucide-react'

// Mock reservation data
const mockReservations = [
    { id: 'RES-2024-001', guest: 'Ahmet Yılmaz', email: 'ahmet@email.com', phone: '+90 532 111 2233', room: 'Deluxe 204', type: 'Deluxe', checkIn: '2024-02-05', checkOut: '2024-02-09', nights: 4, adults: 2, children: 0, total: '₺12,800', status: 'confirmed', source: 'Website' },
    { id: 'RES-2024-002', guest: 'Maria Schmidt', email: 'maria.s@gmail.com', phone: '+49 151 2345678', room: 'Club 112', type: 'Club', checkIn: '2024-02-05', checkOut: '2024-02-12', nights: 7, adults: 2, children: 1, total: '₺18,900', status: 'confirmed', source: 'Booking.com' },
    { id: 'RES-2024-003', guest: 'John Smith', email: 'j.smith@yahoo.com', phone: '+1 555 123 4567', room: 'Aile Suite 301', type: 'Family', checkIn: '2024-02-06', checkOut: '2024-02-11', nights: 5, adults: 2, children: 2, total: '₺22,500', status: 'pending', source: 'Website' },
    { id: 'RES-2024-004', guest: 'Elif Demir', email: 'elif.d@hotmail.com', phone: '+90 544 222 3344', room: 'Deluxe 208', type: 'Deluxe', checkIn: '2024-02-06', checkOut: '2024-02-10', nights: 4, adults: 2, children: 0, total: '₺12,800', status: 'confirmed', source: 'Phone' },
    { id: 'RES-2024-005', guest: 'Ivan Petrov', email: 'ivan.p@mail.ru', phone: '+7 912 345 6789', room: 'Club 115', type: 'Club', checkIn: '2024-02-07', checkOut: '2024-02-17', nights: 10, adults: 1, children: 0, total: '₺27,000', status: 'confirmed', source: 'Website' },
    { id: 'RES-2024-006', guest: 'Hans Weber', email: 'h.weber@web.de', phone: '+49 160 9876543', room: 'Deluxe 210', type: 'Deluxe', checkIn: '2024-02-08', checkOut: '2024-02-15', nights: 7, adults: 2, children: 0, total: '₺22,400', status: 'pending', source: 'Booking.com' },
    { id: 'RES-2024-007', guest: 'Ayşe Kaya', email: 'a.kaya@gmail.com', phone: '+90 555 333 4455', room: 'Club 118', type: 'Club', checkIn: '2024-02-09', checkOut: '2024-02-12', nights: 3, adults: 2, children: 0, total: '₺8,100', status: 'cancelled', source: 'Website' },
    { id: 'RES-2024-008', guest: 'Emma Wilson', email: 'emma.w@outlook.com', phone: '+44 7911 123456', room: 'Aile Suite 303', type: 'Family', checkIn: '2024-02-10', checkOut: '2024-02-17', nights: 7, adults: 2, children: 2, total: '₺31,500', status: 'confirmed', source: 'Website' },
]

export default function ReservationsPage() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedRes, setSelectedRes] = useState<typeof mockReservations[0] | null>(null)

    const filteredReservations = mockReservations.filter(res => {
        const matchesSearch = res.guest.toLowerCase().includes(search.toLowerCase()) ||
            res.id.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' || res.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded"><Check size={12} /> Onaylı</span>
            case 'pending':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded"><Clock size={12} /> Beklemede</span>
            case 'cancelled':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded"><X size={12} /> İptal</span>
            default:
                return null
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Rezervasyonlar</h1>
                    <p className="text-slate-400 mt-1">Elektra PMS üzerinden gelen tüm rezervasyonlar</p>
                </div>
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Calendar size={16} />
                    Senkronize Et
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[250px] relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Misafir adı veya rezervasyon no..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="confirmed">Onaylı</option>
                        <option value="pending">Beklemede</option>
                        <option value="cancelled">İptal</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-6 text-slate-500 text-xs font-medium uppercase tracking-widest">Rezervasyon</th>
                            <th className="text-left py-4 px-6 text-slate-500 text-xs font-medium uppercase tracking-widest">Misafir</th>
                            <th className="text-left py-4 px-6 text-slate-500 text-xs font-medium uppercase tracking-widest">Oda</th>
                            <th className="text-left py-4 px-6 text-slate-500 text-xs font-medium uppercase tracking-widest">Tarih</th>
                            <th className="text-left py-4 px-6 text-slate-500 text-xs font-medium uppercase tracking-widest">Tutar</th>
                            <th className="text-left py-4 px-6 text-slate-500 text-xs font-medium uppercase tracking-widest">Durum</th>
                            <th className="text-right py-4 px-6 text-slate-500 text-xs font-medium uppercase tracking-widest">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReservations.map((res) => (
                            <tr
                                key={res.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                                <td className="py-4 px-6">
                                    <p className="text-white font-medium">{res.id}</p>
                                    <p className="text-slate-500 text-xs">{res.source}</p>
                                </td>
                                <td className="py-4 px-6">
                                    <p className="text-white">{res.guest}</p>
                                    <p className="text-slate-500 text-xs">{res.adults} Y + {res.children} Ç</p>
                                </td>
                                <td className="py-4 px-6">
                                    <p className="text-white">{res.room}</p>
                                    <p className="text-slate-500 text-xs">{res.type}</p>
                                </td>
                                <td className="py-4 px-6">
                                    <p className="text-white">{res.checkIn}</p>
                                    <p className="text-slate-500 text-xs">{res.nights} gece</p>
                                </td>
                                <td className="py-4 px-6">
                                    <p className="text-white font-medium">{res.total}</p>
                                </td>
                                <td className="py-4 px-6">
                                    {getStatusBadge(res.status)}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button
                                        onClick={() => setSelectedRes(res)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm">
                    {filteredReservations.length} kayıttan {filteredReservations.length} gösteriliyor
                </p>
                <div className="flex items-center gap-2">
                    <button className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">1</span>
                    <button className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRes && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedRes(null)}>
                    <div
                        className="bg-[#1e293b] border border-white/10 rounded-xl max-w-lg w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">{selectedRes.id}</h3>
                            <button onClick={() => setSelectedRes(null)} className="text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Misafir</p>
                                    <p className="text-white">{selectedRes.guest}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Durum</p>
                                    {getStatusBadge(selectedRes.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">E-posta</p>
                                    <p className="text-white text-sm">{selectedRes.email}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Telefon</p>
                                    <p className="text-white text-sm">{selectedRes.phone}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Giriş</p>
                                    <p className="text-white">{selectedRes.checkIn}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Çıkış</p>
                                    <p className="text-white">{selectedRes.checkOut}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Oda</p>
                                    <p className="text-white">{selectedRes.room}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Misafir Sayısı</p>
                                    <p className="text-white">{selectedRes.adults} Yetişkin, {selectedRes.children} Çocuk</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-500">Toplam Tutar</p>
                                    <p className="text-2xl font-bold text-white">{selectedRes.total}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
