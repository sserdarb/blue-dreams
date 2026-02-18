'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Save, Search, AlertCircle, Users, FileText, MessageSquare, Layout } from 'lucide-react'
import { useParams } from 'next/navigation'

// Types
interface MeetingRoom {
    id: string
    name: string
    description: string
    image: string
    area?: string
    dimensions?: string // WxLxH
    height?: string
    capacityTheater?: string
    capacityClass?: string
    capacityBanquet?: string
    capacityCocktail?: string
    order: number
    features: string
}

export default function MeetingPage() {
    const params = useParams()
    const locale = params.locale as string
    const [activeTab, setActiveTab] = useState<'halls' | 'marketing' | 'inquiries'>('halls')

    // Halls State
    const [halls, setHalls] = useState<MeetingRoom[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingHall, setEditingHall] = useState<MeetingRoom | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        area: '',
        dimensions: '', // WxLxH
        height: '',
        capacityTheater: '',
        capacityClass: '',
        capacityBanquet: '',
        capacityCocktail: '',
        order: 0,
        features: ''
    })

    // Mock Data for now as API might not exist
    useEffect(() => {
        // In a real scenario, fetch from /api/content/meeting-rooms
        // For now, mock it to "Activate" the panel visually
        setHalls([
            { id: '1', name: 'Grand Ballroom', description: 'En büyük salonumuz.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/meeting1.jpg', area: '450', height: '4.5', capacityTheater: '400', capacityClass: '250', capacityBanquet: '300', capacityCocktail: '500', order: 1, features: 'Sahne, Ses Sistemi, Projeksiyon' }
        ])
        setLoading(false)
    }, [locale])

    const handleEdit = (hall: MeetingRoom) => {
        setEditingHall(hall)
        setFormData({
            name: hall.name,
            description: hall.description,
            image: hall.image,
            area: hall.area || '',
            dimensions: hall.dimensions || '',
            height: hall.height || '',
            capacityTheater: hall.capacityTheater || '',
            capacityClass: hall.capacityClass || '',
            capacityBanquet: hall.capacityBanquet || '',
            capacityCocktail: hall.capacityCocktail || '',
            order: hall.order,
            features: hall.features
        })
        setIsModalOpen(true)
    }

    const handleCreate = () => {
        setEditingHall(null)
        setFormData({
            name: '', description: '', image: '', area: '', dimensions: '', height: '',
            capacityTheater: '', capacityClass: '', capacityBanquet: '', capacityCocktail: '',
            order: (halls.length + 1), features: ''
        })
        setIsModalOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Mock Save
        if (editingHall) {
            setHalls(halls.map(h => h.id === editingHall.id ? { ...h, ...formData } : h))
        } else {
            setHalls([...halls, { ...formData, id: Date.now().toString() }])
        }
        setIsModalOpen(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">MICE & Toplantı Yönetimi</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Toplantı salonları, kapasiteler ve MICE pazarlama içerikleri.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('halls')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'halls' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>Salonlar</button>
                    <button onClick={() => setActiveTab('marketing')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'marketing' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>Pazarlama</button>
                    <button onClick={() => setActiveTab('inquiries')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'inquiries' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>Talepler (CRM)</button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'halls' && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-end">
                        <button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                            <Plus size={18} /> Yeni Salon Ekle
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-4">Salon</th>
                                    <th className="p-4">Boyutlar</th>
                                    <th className="p-4">Kapasiteler (T/S/B/C)</th>
                                    <th className="p-4 text-center">Sıra</th>
                                    <th className="p-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">Yükleniyor...</td></tr>
                                ) : halls.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">Kayıt yok.</td></tr>
                                ) : (
                                    halls.map(hall => (
                                        <tr key={hall.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{hall.name}</div>
                                                <div className="text-xs text-slate-500">{hall.description}</div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                                <div>{hall.area} m²</div>
                                                <div className="text-xs text-slate-400">Yük: {hall.height}m</div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-mono">
                                                {hall.capacityTheater || '-'}/{hall.capacityClass || '-'}/{hall.capacityBanquet || '-'}/{hall.capacityCocktail || '-'}
                                            </td>
                                            <td className="p-4 text-center text-slate-500">{hall.order}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleEdit(hall)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'marketing' && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">MICE Pazarlama İçeriği</h3>
                    <p className="text-slate-500 mb-6">MICE sayfalarında görünecek genel tanıtım metinleri ve görselleri.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">MICE Hero Başlığı</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" defaultValue="Unutulmaz Etkinlikler" />

                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tanıtım Metni</label>
                            <textarea rows={5} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500" defaultValue="Blue Dreams Resort, modern toplantı salonları ve eşsiz konumu ile..." />

                            <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium self-start">Kaydet</button>
                        </div>
                        <div className="bg-slate-50 dark:bg-[#0f172a] rounded-xl border border-dashed border-slate-300 dark:border-white/20 flex flex-col items-center justify-center p-8 text-slate-400">
                            <Layout size={48} className="mb-2" />
                            <span>Görsel Yükle (Sürükle Bırak)</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'inquiries' && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">MICE Talepleri</h3>
                            <p className="text-slate-500 text-sm">Web sitesi ve Blue Concierge üzerinden gelen toplantı talepleri.</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Dışa Aktar</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-4">Tarih</th>
                                    <th className="p-4">Firma / Kişi</th>
                                    <th className="p-4">Etkinlik Tipi</th>
                                    <th className="p-4">Kişi / Tarih</th>
                                    <th className="p-4">Kaynak</th>
                                    <th className="p-4">Durum</th>
                                    <th className="p-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                {[
                                    { id: 1, date: '2025-05-15', created: '2024-10-20', company: 'Tech Solutions A.Ş.', contact: 'Ahmet Yılmaz', type: 'Bayi Toplantısı', pax: 150, source: 'Blue Concierge AI', status: 'new' },
                                    { id: 2, date: '2025-06-10', created: '2024-10-18', company: 'Global Pharma', contact: 'Ayşe Demir', type: 'Lansman', pax: 80, source: 'Website Form', status: 'contacted' },
                                    { id: 3, date: '2025-09-05', created: '2024-10-15', company: 'Wedding Planner', contact: 'Selin Kaya', type: 'Düğün', pax: 300, source: 'Blue Concierge AI', status: 'proposal' },
                                ].map(inq => (
                                    <tr key={inq.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="text-slate-900 dark:text-white font-medium">{inq.created}</div>
                                            <div className="text-xs text-slate-500">Talep Tarihi</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900 dark:text-white">{inq.company}</div>
                                            <div className="text-xs text-slate-500">{inq.contact}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{inq.type}</td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-900 dark:text-white">{inq.pax} Kişi</div>
                                            <div className="text-xs text-slate-500">{inq.date}</div>
                                        </td>
                                        <td className="p-4">
                                            {inq.source === 'Blue Concierge AI' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-500/20">
                                                    <MessageSquare size={12} /> AI Asistan
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-500/20">
                                                    <Layout size={12} /> Web Form
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {inq.status === 'new' && <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs rounded font-medium">Yeni</span>}
                                            {inq.status === 'contacted' && <span className="px-2 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs rounded font-medium">Görüşülüyor</span>}
                                            {inq.status === 'proposal' && <span className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs rounded font-medium">Teklif Gönderildi</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors">
                                                <Search size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-[#1e293b] z-10">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingHall ? 'Salonu Düzenle' : 'Yeni Salon Ekle'}</h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Salon Adı</label>
                                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Görsel URL</label>
                                        <input type="text" required value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Alan (m²)</label><input type="text" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                                    <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Yükseklik (m)</label><input type="text" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                                    <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Sıra</label><input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <div><label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tiyatro</label><input type="text" value={formData.capacityTheater} onChange={e => setFormData({ ...formData, capacityTheater: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                                    <div><label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Sınıf</label><input type="text" value={formData.capacityClass} onChange={e => setFormData({ ...formData, capacityClass: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                                    <div><label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Balo</label><input type="text" value={formData.capacityBanquet} onChange={e => setFormData({ ...formData, capacityBanquet: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                                    <div><label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Kokteyl</label><input type="text" value={formData.capacityCocktail} onChange={e => setFormData({ ...formData, capacityCocktail: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" /></div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Açıklama</label>
                                    <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500"></textarea>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1e293b] sticky bottom-0 rounded-b-2xl flex justify-end gap-3 z-10">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-colors">İptal</button>
                                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2"><Save size={18} /> Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
