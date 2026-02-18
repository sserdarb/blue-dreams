'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Save, Search, UtensilsCrossed, Clock, Star, Image as ImageIcon, Layout } from 'lucide-react'
import { useParams } from 'next/navigation'

// Types
interface DiningVenue {
    id: string
    name: string
    description: string
    image: string
    cuisine: string
    hours: string
    capacity?: string
    location?: string
    order: number
    features: string
    isActive: boolean
}

export default function DiningPage() {
    const params = useParams()
    const locale = params.locale as string
    const [activeTab, setActiveTab] = useState<'venues' | 'menus' | 'events'>('venues')

    // Venues State
    const [venues, setVenues] = useState<DiningVenue[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingVenue, setEditingVenue] = useState<DiningVenue | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        cuisine: '',
        hours: '',
        capacity: '',
        location: '',
        order: 0,
        features: '',
        isActive: true
    })

    // Mock Data
    useEffect(() => {
        setVenues([
            { id: '1', name: 'Ana Restoran', description: 'Açık büfe kahvaltı, öğle ve akşam yemeği.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/restaurant1.jpg', cuisine: 'Uluslararası', hours: '07:00 - 22:00', capacity: '350', location: 'Ana Bina', order: 1, features: 'Açık Büfe, Deniz Manzarası, Canlı Mutfak', isActive: true },
            { id: '2', name: 'A La Carte Restoran', description: 'Özel menü ile fine dining deneyimi.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/restaurant2.jpg', cuisine: 'Akdeniz', hours: '19:00 - 23:00', capacity: '80', location: 'Havuz Başı', order: 2, features: 'Rezervasyon Gerekli, Özel Menü, Şarap Listesi', isActive: true },
            { id: '3', name: 'Snack Bar', description: 'Havuz başı atıştırmalık ve içecekler.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/bar1.jpg', cuisine: 'Fast Food', hours: '10:00 - 18:00', capacity: '60', location: 'Havuz', order: 3, features: 'Hamburger, Pizza, İçecekler', isActive: true },
        ])
        setLoading(false)
    }, [locale])

    const handleEdit = (venue: DiningVenue) => {
        setEditingVenue(venue)
        setFormData({
            name: venue.name,
            description: venue.description,
            image: venue.image,
            cuisine: venue.cuisine,
            hours: venue.hours,
            capacity: venue.capacity || '',
            location: venue.location || '',
            order: venue.order,
            features: venue.features,
            isActive: venue.isActive
        })
        setIsModalOpen(true)
    }

    const handleCreate = () => {
        setEditingVenue(null)
        setFormData({
            name: '', description: '', image: '', cuisine: '', hours: '',
            capacity: '', location: '', order: (venues.length + 1), features: '', isActive: true
        })
        setIsModalOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingVenue) {
            setVenues(venues.map(v => v.id === editingVenue.id ? { ...v, ...formData } : v))
        } else {
            setVenues([...venues, { ...formData, id: Date.now().toString() }])
        }
        setIsModalOpen(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Restoran & Yeme-İçme Yönetimi</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Restoranlar, menüler ve özel etkinlik organizasyonları.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('venues')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'venues' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>Restoranlar</button>
                    <button onClick={() => setActiveTab('menus')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'menus' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>Menüler</button>
                    <button onClick={() => setActiveTab('events')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'events' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>Özel Geceler</button>
                </div>
            </div>

            {/* Venues Tab */}
            {activeTab === 'venues' && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-end">
                        <button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                            <Plus size={18} /> Yeni Restoran Ekle
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-4">Restoran</th>
                                    <th className="p-4">Mutfak</th>
                                    <th className="p-4">Saatler</th>
                                    <th className="p-4">Kapasite</th>
                                    <th className="p-4 text-center">Durum</th>
                                    <th className="p-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Yükleniyor...</td></tr>
                                ) : venues.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Kayıt yok.</td></tr>
                                ) : (
                                    venues.map(venue => (
                                        <tr key={venue.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                                        <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white">{venue.name}</div>
                                                        <div className="text-xs text-slate-500">{venue.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{venue.cuisine}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                                                    <Clock size={14} className="text-slate-400" />
                                                    {venue.hours}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{venue.capacity} kişi</td>
                                            <td className="p-4 text-center">
                                                {venue.isActive ? (
                                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs rounded font-medium">Aktif</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 text-xs rounded font-medium">Pasif</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleEdit(venue)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors">
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

            {/* Menus Tab */}
            {activeTab === 'menus' && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Menü Yönetimi</h3>
                    <p className="text-slate-500 mb-6">Her restoran için menü kartları ve fiyat listeleri.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {venues.map(v => (
                            <div key={v.id} className="bg-slate-50 dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <UtensilsCrossed size={20} className="text-cyan-500" />
                                    <div className="font-bold text-slate-900 dark:text-white">{v.name}</div>
                                </div>
                                <p className="text-xs text-slate-500 mb-3">{v.cuisine} mutfağı</p>
                                <button className="w-full bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-cyan-600/20 transition-colors">
                                    Menüyü Düzenle
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Özel Geceler & Tema Akşamları</h3>
                    <p className="text-slate-500 mb-6">Haftalık tema geceleri ve özel etkinlik programı.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { day: 'Pazartesi', theme: 'Türk Gecesi', desc: 'Geleneksel Türk mutfağı ve eğlence' },
                            { day: 'Çarşamba', theme: 'Deniz Ürünleri', desc: 'Taze deniz ürünleri büfesi' },
                            { day: 'Cuma', theme: 'BBQ Gecesi', desc: 'Açık havada mangal partisi' },
                            { day: 'Cumartesi', theme: 'Gala Yemeği', desc: 'Fine dining gala akşam yemeği' },
                        ].map((event, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                <div className="text-xs font-bold text-cyan-500 uppercase mb-1">{event.day}</div>
                                <div className="font-bold text-slate-900 dark:text-white mb-1">{event.theme}</div>
                                <p className="text-xs text-slate-500">{event.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-[#1e293b] z-10">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingVenue ? 'Restoranı Düzenle' : 'Yeni Restoran Ekle'}</h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Restoran Adı</label>
                                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Görsel URL</label>
                                        <input type="text" required value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Mutfak Türü</label>
                                        <input type="text" value={formData.cuisine} onChange={e => setFormData({ ...formData, cuisine: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Çalışma Saatleri</label>
                                        <input type="text" value={formData.hours} onChange={e => setFormData({ ...formData, hours: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" placeholder="ör: 07:00 - 22:00" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Kapasite</label>
                                        <input type="text" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Konum</label>
                                        <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Sıra</label>
                                        <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Açıklama</label>
                                    <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500"></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Özellikler (virgülle ayırın)</label>
                                    <input type="text" value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" placeholder="ör: Açık Büfe, Deniz Manzarası" />
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
