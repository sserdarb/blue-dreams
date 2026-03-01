'use client'

import React, { useState, useEffect } from 'react'
import { AdminTranslations } from '@/lib/admin-translations'
import {
    Users,
    Search,
    Calendar,
    Mail,
    Building,
    Phone,
    Filter,
    CheckCircle2,
    Clock,
    XCircle,
    Eye
} from 'lucide-react'

// Simple date formatter
const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function MeetingsClient({ locale, t }: { locale: string; t: AdminTranslations }) {
    const [meetings, setMeetings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    // Optional modal state for detailed view
    const [selectedMeeting, setSelectedMeeting] = useState<any>(null)

    useEffect(() => {
        fetchMeetings()
    }, [])

    const fetchMeetings = async () => {
        try {
            const res = await fetch('/api/meetings')
            const data = await res.json()
            if (data.success) {
                setMeetings(data.data)
            }
        } catch (err) {
            console.error('Error fetching meetings', err)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="text-amber-500 w-4 h-4" />
            case 'contacted': return <Eye className="text-blue-500 w-4 h-4" />
            case 'closed': return <CheckCircle2 className="text-emerald-500 w-4 h-4" />
            default: return <Clock className="text-slate-400 w-4 h-4" />
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Bekliyor'
            case 'contacted': return 'İletişime Geçildi'
            case 'closed': return 'Kapatıldı'
            default: return status
        }
    }

    const filteredMeetings = meetings.filter((m: any) => {
        const matchesSearch =
            (m.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.email || '').toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || m.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div className="p-4 max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="text-cyan-500" />
                        Toplantı & Etkinlik Talepleri (MICE)
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Blue Concierge ve web sitesi üzerinden gelen tüm kongre, seminer ve organizasyon talepleri.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="İsim, e-posta veya firma ara..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:text-white"
                    />
                </div>
                <div className="w-full sm:w-48 relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:text-white appearance-none"
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="pending">Bekliyor</option>
                        <option value="contacted">İletişime Geçildi</option>
                        <option value="closed">Kapatıldı</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-4">Tarih</th>
                                <th className="px-6 py-4">Müşteri / Kurum</th>
                                <th className="px-6 py-4">İletişim</th>
                                <th className="px-6 py-4">Etkinlik</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-center">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center mb-2">
                                            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : filteredMeetings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Kayıt bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredMeetings.map((m: any) => (
                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                                            {formatDate(m.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {m.contactName}
                                            </div>
                                            {m.companyName && (
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                    <Building className="w-3 h-3" /> {m.companyName}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                <Mail className="w-3 h-3 text-slate-400" />
                                                <a href={`mailto:${m.email}`} className="hover:text-cyan-500 hover:underline">{m.email}</a>
                                            </div>
                                            {m.phone && (
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    <a href={`tel:${m.phone}`} className="hover:text-cyan-500 hover:underline">{m.phone}</a>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {m.eventDate && (
                                                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                                        <Calendar className="w-3 h-3 text-cyan-500" />
                                                        {formatDate(m.eventDate)}
                                                    </span>
                                                )}
                                                {m.attendees && (
                                                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                                        <Users className="w-3 h-3 text-emerald-500" />
                                                        {m.attendees} Kişi
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                                ${m.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400' : ''}
                                                ${m.status === 'contacted' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                                                ${m.status === 'closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400' : ''}
                                            `}>
                                                {getStatusIcon(m.status)}
                                                {getStatusLabel(m.status)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedMeeting(m)}
                                                className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                                                title="Görüntüle"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {selectedMeeting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Users className="text-cyan-500 w-5 h-5" />
                                Talep Detayı
                            </h3>
                            <button
                                onClick={() => setSelectedMeeting(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Müşteri / İletişim</label>
                                    <div className="font-medium text-slate-900 dark:text-white">{selectedMeeting.contactName}</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-300">{selectedMeeting.email}</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-300">{selectedMeeting.phone || '-'}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Firma / Kurum</label>
                                    <div className="font-medium text-slate-900 dark:text-white">{selectedMeeting.companyName || '-'}</div>
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Planlanan Tarih</label>
                                    <div className="font-medium text-slate-900 dark:text-white">{formatDate(selectedMeeting.eventDate)}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Kişi Sayısı</label>
                                    <div className="font-medium text-slate-900 dark:text-white">{selectedMeeting.attendees ? `${selectedMeeting.attendees} Kişi` : '-'}</div>
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Açıklama / Detaylar</label>
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {selectedMeeting.description || 'Açıklama girilmemiş.'}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setSelectedMeeting(null)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
