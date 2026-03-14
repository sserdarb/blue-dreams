'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit, Save, X, RefreshCw, Image as ImageIcon, UtensilsCrossed, Wine, Coffee, ListOrdered, Clock, MapPin, Users, Tag, Eye, EyeOff } from 'lucide-react'
import ImageUrlField from '@/components/admin/ImageUrlField'
import { useParams } from 'next/navigation'

interface Dining {
    id: string
    locale: string
    title: string
    type: string
    description: string | null
    image: string
    images: string[] | null
    cuisine: string | null
    hours: string | null
    capacity: string | null
    location: string | null
    features: string | null
    menuUrl: string | null
    isActive: boolean
    order: number
}

const TYPE_OPTIONS = [
    { value: 'restaurant', label: 'Restoran', icon: UtensilsCrossed, color: 'text-orange-500' },
    { value: 'bar', label: 'Bar', icon: Wine, color: 'text-purple-500' },
    { value: 'cafe', label: 'Kafe / Snack', icon: Coffee, color: 'text-amber-600' },
]

export default function DiningManagementPage() {
    const params = useParams()
    const locale = (params?.locale as string) || 'tr'

    const [entries, setEntries] = useState<Dining[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({
        title: '', type: 'restaurant', description: '', image: '', images: [] as string[],
        cuisine: '', hours: '', capacity: '', location: '', features: '',
        menuUrl: '', isActive: true, order: 0
    })

    const fetchEntries = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/dining?locale=${locale}`)
            if (!res.ok) throw new Error('Veriler yüklenemedi')
            const data = await res.json()
            setEntries(data)
            setError(null)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [locale])

    useEffect(() => { fetchEntries() }, [fetchEntries])

    const handleSave = async () => {
        if (!form.title || !form.image) {
            setError('Başlık ve ana görsel zorunludur.')
            return
        }

        setSaving(true)
        setError(null)

        try {
            let res
            if (editingId) {
                res = await fetch(`/api/admin/dining/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                })
            } else {
                res = await fetch('/api/admin/dining', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...form, locale }),
                })
            }

            if (!res.ok) throw new Error('Kaydedilemedi')

            await fetchEntries()
            setShowForm(false)
            setEditingId(null)
            setForm({ title: '', type: 'restaurant', description: '', image: '', images: [], cuisine: '', hours: '', capacity: '', location: '', features: '', menuUrl: '', isActive: true, order: 0 })
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (entry: Dining) => {
        setForm({
            title: entry.title,
            type: entry.type || 'restaurant',
            description: entry.description || '',
            image: entry.image,
            images: entry.images || [],
            cuisine: entry.cuisine || '',
            hours: entry.hours || '',
            capacity: entry.capacity || '',
            location: entry.location || '',
            features: entry.features || '',
            menuUrl: entry.menuUrl || '',
            isActive: entry.isActive ?? true,
            order: entry.order || 0
        })
        setEditingId(entry.id)
        setShowForm(true)
        setError(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`"${title}" silinecek. Emin misiniz?`)) return
        try {
            const res = await fetch(`/api/admin/dining/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Silinemedi')
            await fetchEntries()
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <UtensilsCrossed size={28} className="text-orange-500" /> Yeme &amp; İçme Yönetimi
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Restoran, bar ve kafeleri düzenleyin ({locale.toUpperCase()})</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchEntries} disabled={loading} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {!showForm && (
                        <button onClick={() => {
                            setForm({ title: '', type: 'restaurant', description: '', image: '', images: [], cuisine: '', hours: '', capacity: '', location: '', features: '', menuUrl: '', isActive: true, order: entries.length });
                            setShowForm(true); setEditingId(null); setError(null)
                        }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                            <Plus size={18} /> Yeni Mekan Ekle
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X size={16} /></button>
                </div>
            )}

            {showForm && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{editingId ? 'Mekanı Düzenle' : 'Yeni Mekan Ekle'}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Başlık *</label>
                                <input value={form.title} autoFocus onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-orange-500 outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mekan Türü</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-orange-500 outline-none">
                                        {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                        <ListOrdered size={14} /> Sıra
                                    </label>
                                    <input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-orange-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Açıklama</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-orange-500 outline-none" />
                            </div>

                            <ImageUrlField
                                value={form.menuUrl}
                                onChange={(v) => setForm({ ...form, menuUrl: v })}
                                label="Menü URL / PDF"
                                accept="application/pdf,image/*"
                                placeholder="/tr/menu/x veya PDF yükleyin..."
                            />

                            {/* Active toggle */}
                            <div className="flex items-center gap-3 pt-2">
                                <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        form.isActive
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                    {form.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                    {form.isActive ? 'Aktif (Sitede Görünür)' : 'Pasif (Sitede Gizli)'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ImageUrlField
                                value={form.image}
                                onChange={(v) => setForm({ ...form, image: v })}
                                label="Ana Görsel *"
                            />

                            {/* Cuisine */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                    <Tag size={14} /> Mutfak Türü
                                </label>
                                <input value={form.cuisine} onChange={e => setForm({ ...form, cuisine: e.target.value })} placeholder="Uluslararası & Türk Mutfağı"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-orange-500 outline-none" />
                            </div>

                            {/* Hours */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                    <Clock size={14} /> Çalışma Saatleri
                                </label>
                                <input value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="Kahvaltı 07:00-10:00 | Öğle 12:30-14:00"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-orange-500 outline-none" />
                            </div>

                            {/* Capacity + Location row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                        <Users size={14} /> Kapasite
                                    </label>
                                    <input value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="350"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-orange-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                        <MapPin size={14} /> Konum
                                    </label>
                                    <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ana Bina"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-orange-500 outline-none" />
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Özellikler (virgülle ayırın)</label>
                                <input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="Açık Büfe,Deniz Manzarası,Türk Mutfağı"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-orange-500 outline-none" />
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Galeri Görselleri (İsteğe bağlı)</label>
                                <div className="space-y-3">
                                    {(form.images || []).map((img, idx) => (
                                        <div key={idx} className="flex gap-2 items-start">
                                            <div className="flex-1">
                                                <ImageUrlField
                                                    value={img}
                                                    onChange={(v) => {
                                                        const newImages = [...form.images];
                                                        newImages[idx] = v;
                                                        setForm({ ...form, images: newImages })
                                                    }}
                                                    label={`Galeri Görseli ${idx + 1}`}
                                                />
                                            </div>
                                            <button onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })} className="mt-6 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setForm({ ...form, images: [...(form.images || []), ''] })} className="text-sm text-orange-600 dark:text-orange-400 font-medium hover:underline">+ Yeni Galeri Görseli Ekle</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">İptal</button>
                        <button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />} {editingId ? 'Güncelle' : 'Kaydet'}
                        </button>
                    </div>
                </div>
            )}

            {!loading && entries.length === 0 && !showForm && (
                <div className="text-center py-20 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <UtensilsCrossed size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Mekan Bulunamadı</h3>
                    <p className="text-slate-500 mb-4">Henüz {locale.toUpperCase()} dili için yeme içme mekanı eklenmemiş.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entries.map(entry => {
                    const typeInfo = TYPE_OPTIONS.find(t => t.value === entry.type) || TYPE_OPTIONS[0]
                    const Icon = typeInfo.icon

                    return (
                        <div key={entry.id} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm group hover:-translate-y-1 transition-all duration-300">
                            <div className="h-48 bg-slate-200 dark:bg-slate-800 relative bg-cover bg-center" style={{ backgroundImage: `url(${entry.image})` }}>
                                <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold">
                                    <Icon size={14} className={typeInfo.color} />
                                    <span className="text-slate-900 dark:text-white">{typeInfo.label}</span>
                                </div>
                                {(entry.images && entry.images.length > 0) && (
                                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold">
                                        <ImageIcon size={12} /> +{entry.images.length}
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{entry.title}</h3>
                                    <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-medium">Sıra: {entry.order}</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 min-h-[60px]">
                                    {entry.description || 'Açıklama girilmemiş.'}
                                </p>
                                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button onClick={() => handleEdit(entry)} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                        <Edit size={16} /> Düzenle
                                    </button>
                                    <button onClick={() => handleDelete(entry.id, entry.title)} className="px-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors flex items-center justify-center">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
