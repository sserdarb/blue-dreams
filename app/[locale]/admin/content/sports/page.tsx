'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from 'lucide-react'
import { useParams } from 'next/navigation'

// Types
interface SportItem {
    id: string
    title: string
    description: string
    image: string
    icon?: string
    images?: string
    order: number
    isActive: boolean
}

export default function SportsPage() {
    const params = useParams()
    const locale = params.locale as string

    // State
    const [sports, setSports] = useState<SportItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSport, setEditingSport] = useState<SportItem | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        icon: '',
        order: 0,
        isActive: true
    })

    // Fetch Data
    const fetchSports = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/sports?locale=${locale}`)
            if (res.ok) {
                const data = await res.json()
                setSports(data)
            }
        } catch (error) {
            console.error('Failed to fetch sports:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSports()
    }, [locale])

    const handleEdit = (sport: SportItem) => {
        setEditingSport(sport)
        setFormData({
            title: sport.title,
            description: sport.description || '',
            image: sport.image,
            icon: sport.icon || '',
            order: sport.order,
            isActive: sport.isActive
        })
        setIsModalOpen(true)
    }

    const handleCreate = () => {
        setEditingSport(null)
        setFormData({
            title: '', description: '', image: '', icon: '', order: (sports.length + 1), isActive: true
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const body = { ...formData, locale }
            if (editingSport) {
                await fetch(`/api/admin/sports/${editingSport.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            } else {
                await fetch('/api/admin/sports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            }
            setIsModalOpen(false)
            fetchSports()
        } catch (error) {
            console.error('Error saving:', error)
            alert('Kaydedilirken hata oluştu.')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return
        try {
            await fetch(`/api/admin/sports/${id}`, { method: 'DELETE' })
            fetchSports()
        } catch (error) {
            console.error('Error deleting:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Spor & Aktiviteler Yönetimi</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Oteldeki spor ve aktivite seçeneklerini yönetin.</p>
                </div>
            </div>

            {/* List Tab */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-end">
                    <button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                        <Plus size={18} /> Yeni Aktivite Ekle
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="p-4">Aktivite</th>
                                <th className="p-4">Açıklama</th>
                                <th className="p-4 text-center">Durum</th>
                                <th className="p-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Yükleniyor...</td></tr>
                            ) : sports.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Kayıt yok.</td></tr>
                            ) : (
                                sports.map(sport => (
                                    <tr key={sport.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                                    {sport.image ? (
                                                        <img src={sport.image} alt={sport.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-medium text-slate-900 dark:text-white">{sport.title}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-slate-500 dark:text-slate-400 text-sm max-w-xs truncate">
                                                {sport.description}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                                                ${sport.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                {sport.isActive ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(sport)} className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(sport.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-[#1e293b] z-10">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingSport ? 'Aktivite Düzenle' : 'Yeni Aktivite Ekle'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Başlık (İsim)</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sıra</label>
                                    <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Görsel URL</label>
                                    <input required type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Açıklama</label>
                                    <textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div className="col-span-2 flex items-center gap-3 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sitede Göster (Aktif)</label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                    İptal
                                </button>
                                <button type="submit" className="px-6 py-2.5 rounded-xl font-medium bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 transition-colors">
                                    <Save size={18} /> {editingSport ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
