'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Save, Search, AlertCircle } from 'lucide-react'
import { useParams } from 'next/navigation'

interface Room {
    id: string
    title: string
    description: string
    image: string
    locale: string
    size?: string
    view?: string
    capacity?: string
    priceStart?: string
    whyChoose?: string
    features: string // JSON string internally
    order: number
}

export default function RoomsPage() {
    const params = useParams()
    const locale = params.locale as string

    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState<Room | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        size: '',
        view: '',
        capacity: '',
        priceStart: '',
        whyChoose: '',
        features: '', // Comma separated for input
        order: 0
    })

    useEffect(() => {
        fetchRooms()
    }, [locale])

    const fetchRooms = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/content/rooms?locale=${locale}`)
            if (res.ok) {
                const data = await res.json()
                setRooms(data)
            }
        } catch (error) {
            console.error('Failed to fetch rooms:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (room: Room) => {
        setEditingRoom(room)

        // Parse features JSON to comma separated string
        let featuresStr = ''
        try {
            const parsed = JSON.parse(room.features)
            if (Array.isArray(parsed)) featuresStr = parsed.join(', ')
        } catch (e) {
            featuresStr = room.features
        }

        setFormData({
            title: room.title,
            description: room.description,
            image: room.image,
            size: room.size || '',
            view: room.view || '',
            capacity: room.capacity || '',
            priceStart: room.priceStart || '',
            whyChoose: room.whyChoose || '',
            features: featuresStr,
            order: room.order
        })
        setIsModalOpen(true)
    }

    const handleCreate = () => {
        setEditingRoom(null)
        setFormData({
            title: '',
            description: '',
            image: '',
            size: '',
            view: '',
            capacity: '',
            priceStart: '',
            whyChoose: '',
            features: '',
            order: 0
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bu odayı silmek istediğinize emin misiniz?')) return

        try {
            const res = await fetch(`/api/content/rooms?id=${id}`, { method: 'DELETE' })
            if (res.ok) fetchRooms()
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Convert features string back to array
        const featuresArray = formData.features.split(',').map(s => s.trim()).filter(Boolean)

        const payload = {
            ...formData,
            features: JSON.stringify(featuresArray),
            locale
        }

        if (editingRoom) {
            Object.assign(payload, { id: editingRoom.id })
        }

        try {
            const res = await fetch('/api/content/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setIsModalOpen(false)
                fetchRooms()
            }
        } catch (error) {
            console.error('Failed to save:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#1e293b] p-6 rounded-2xl border border-white/10">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Odalar</h1>
                    <p className="text-slate-400 text-sm">Oda içeriklerini ve AI detaylarını buradan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={18} />
                    Yeni Oda Ekle
                </button>
            </div>

            <div className="bg-[#1e293b] rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#0f172a] text-slate-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="p-4">Görsel</th>
                                <th className="p-4">Başlık</th>
                                <th className="p-4">Özellikler</th>
                                <th className="p-4 text-center">Sıra</th>
                                <th className="p-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Yükleniyor...</td>
                                </tr>
                            ) : rooms.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Henüz kayıt bulunmuyor.</td>
                                </tr>
                            ) : (
                                rooms.map(room => (
                                    <tr key={room.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="w-16 h-12 bg-slate-800 rounded overflow-hidden">
                                                <img src={room.image} alt={room.title} className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-white">{room.title}</div>
                                            <div className="text-xs text-slate-400 truncate max-w-xs">{room.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(() => {
                                                    try {
                                                        const feats = JSON.parse(room.features)
                                                        return Array.isArray(feats) ? feats.slice(0, 2).map((f: string, i: number) => (
                                                            <span key={i} className="text-[10px] bg-cyan-900/50 text-cyan-400 px-1.5 py-0.5 rounded">{f}</span>
                                                        )) : null
                                                    } catch (e) { return null }
                                                })()}
                                                <span className="text-[10px] text-slate-500">+</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-slate-400 font-mono text-sm">{room.order}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(room)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(room.id)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1e293b] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1e293b] z-10">
                                <h3 className="text-xl font-bold text-white">
                                    {editingRoom ? 'Odayı Düzenle' : 'Yeni Oda Ekle'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Başlık</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Görsel URL</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.image}
                                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Açıklama</label>
                                    <textarea
                                        rows={2}
                                        required
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Boyut</label>
                                        <input
                                            type="text"
                                            value={formData.size}
                                            onChange={e => setFormData({ ...formData, size: e.target.value })}
                                            placeholder="Örn: 35 m²"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kapasite</label>
                                        <input
                                            type="text"
                                            value={formData.capacity}
                                            onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                            placeholder="Örn: 2 Yetişkin"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Sıra No</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Manzara</label>
                                        <input
                                            type="text"
                                            value={formData.view}
                                            onChange={e => setFormData({ ...formData, view: e.target.value })}
                                            placeholder="Örn: Deniz Manzaralı"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Başlangıç Fiyatı</label>
                                        <input
                                            type="text"
                                            value={formData.priceStart}
                                            onChange={e => setFormData({ ...formData, priceStart: e.target.value })}
                                            placeholder="Örn: 250€"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Özellikler (Virgülle ayırın)</label>
                                    <input
                                        type="text"
                                        value={formData.features}
                                        onChange={e => setFormData({ ...formData, features: e.target.value })}
                                        placeholder="Klima, Wifi, Minibar..."
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 text-cyan-400">AI İpucu: Neden Seçilmeli?</label>
                                    <textarea
                                        rows={3}
                                        value={formData.whyChoose}
                                        onChange={e => setFormData({ ...formData, whyChoose: e.target.value })}
                                        placeholder="AI asistanı bu odayı önerirken buradaki metni kullanacak."
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                                    ></textarea>
                                </div>

                            </div>

                            <div className="p-6 border-t border-white/10 bg-[#1e293b] sticky bottom-0 rounded-b-2xl flex justify-end gap-3 z-10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
