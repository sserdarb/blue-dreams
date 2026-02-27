'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Save, Search, UtensilsCrossed, Clock, Star, Image as ImageIcon, Layout, QrCode, ExternalLink, Download } from 'lucide-react'
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
    const [qrData, setQrData] = useState<Record<string, { qrDataUrl: string; menuUrl: string } | null>>({})
    const [qrLoading, setQrLoading] = useState<string | null>(null)

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

    // Fetch Data
    const fetchVenues = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/dining?locale=${locale}`)
            if (res.ok) {
                const data = await res.json()
                // Map the DB 'title' to UI 'name'
                setVenues(data.map((d: any) => ({ ...d, name: d.title })))
            }
        } catch (error) {
            console.error('Failed to fetch venues:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVenues()
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const body = { ...formData, name: formData.name, title: formData.name, locale }
            if (editingVenue) {
                await fetch(`/api/admin/dining/${editingVenue.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            } else {
                await fetch('/api/admin/dining', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            }
            setIsModalOpen(false)
            fetchVenues()
        } catch (error) {
            console.error('Error saving:', error)
            alert('Kaydedilirken hata oluştu.')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return
        try {
            await fetch(`/api/admin/dining/${id}`, { method: 'DELETE' })
            fetchVenues()
        } catch (error) {
            console.error('Error deleting:', error)
        }
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
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(venue)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-white transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(venue.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
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
            )}

            {/* Menus Tab */}
            {activeTab === 'menus' && (
                <MenuEditorTab venues={venues} locale={locale} qrData={qrData} setQrData={setQrData} qrLoading={qrLoading} setQrLoading={setQrLoading} />
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
                <EventEditorTab venues={venues} locale={locale} />
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

// ─── Menu Editor Tab ──────────────────────────────────────────────

interface MenuItemData {
    id: string; name: string; description: string; price: string
    isVegetarian: boolean; isVegan: boolean; isGlutenFree: boolean
    allergens: string; order: number
}

interface MenuCategoryData {
    id: string; name: string; icon: string; order: number
    items: MenuItemData[]
}

interface MenuEditorTabProps {
    venues: DiningVenue[]
    locale: string
    qrData: Record<string, { qrDataUrl: string; menuUrl: string } | null>
    setQrData: React.Dispatch<React.SetStateAction<Record<string, { qrDataUrl: string; menuUrl: string } | null>>>
    qrLoading: string | null
    setQrLoading: React.Dispatch<React.SetStateAction<string | null>>
}

const ICON_OPTIONS = [
    { value: 'appetizer', label: 'Başlangıç' },
    { value: 'main', label: 'Ana Yemek' },
    { value: 'dessert', label: 'Tatlı' },
    { value: 'drink', label: 'İçecek' },
]

const INITIAL_MENUS: Record<string, MenuCategoryData[]> = {
    '1': [
        {
            id: 'c1', name: 'Başlangıçlar', icon: 'appetizer', order: 1, items: [
                { id: 'i1', name: 'Akdeniz Mezze Tabağı', description: 'Humus, babaganuş, atom, acılı ezme', price: 'All Inclusive', isVegetarian: true, isVegan: true, isGlutenFree: true, allergens: 'Susam', order: 1 },
                { id: 'i2', name: 'Deniz Mahsulleri Salatası', description: 'Karides, kalamar, ahtapot', price: 'All Inclusive', isVegetarian: false, isVegan: false, isGlutenFree: true, allergens: 'Balık', order: 2 },
            ]
        },
        {
            id: 'c2', name: 'Ana Yemekler', icon: 'main', order: 2, items: [
                { id: 'i3', name: 'Levrek Fileto', description: 'Izgara levrek, karamelize limon', price: 'All Inclusive', isVegetarian: false, isVegan: false, isGlutenFree: true, allergens: 'Balık', order: 1 },
                { id: 'i4', name: 'Kuzu Pirzola', description: 'Izgara kuzu, biberiyeli patates', price: 'All Inclusive', isVegetarian: false, isVegan: false, isGlutenFree: true, allergens: '', order: 2 },
            ]
        },
        {
            id: 'c3', name: 'Tatlılar', icon: 'dessert', order: 3, items: [
                { id: 'i5', name: 'Künefe', description: 'Hatay künefesi, kaymak, antep fıstığı', price: 'All Inclusive', isVegetarian: true, isVegan: false, isGlutenFree: false, allergens: 'Süt, Gluten, Fıstık', order: 1 },
            ]
        },
    ],
    '2': [
        {
            id: 'ac1', name: 'Başlangıçlar', icon: 'appetizer', order: 1, items: [
                { id: 'ac-i1', name: 'Ahtapot Carpaccio', description: 'İnce dilimlenmiş ahtapot, kapari', price: '€15', isVegetarian: false, isVegan: false, isGlutenFree: true, allergens: 'Balık', order: 1 },
            ]
        },
        {
            id: 'ac2', name: 'Ana Yemekler', icon: 'main', order: 2, items: [
                { id: 'ac-i2', name: 'Istakoz Thermidor', description: 'Fırında istakoz, kremalı sos', price: '€45', isVegetarian: false, isVegan: false, isGlutenFree: true, allergens: 'Balık, Süt', order: 1 },
            ]
        },
    ],
    '3': [
        {
            id: 'sb1', name: 'Atıştırmalıklar', icon: 'appetizer', order: 1, items: [
                { id: 'sb-i1', name: 'Klasik Hamburger', description: 'Dana köfte, cheddar, marul', price: 'All Inclusive', isVegetarian: false, isVegan: false, isGlutenFree: false, allergens: 'Gluten, Süt', order: 1 },
                { id: 'sb-i2', name: 'Margarita Pizza', description: 'İnce hamur, mozzarella, domates', price: 'All Inclusive', isVegetarian: true, isVegan: false, isGlutenFree: false, allergens: 'Gluten, Süt', order: 2 },
            ]
        },
        {
            id: 'sb2', name: 'İçecekler', icon: 'drink', order: 2, items: [
                { id: 'sb-i3', name: 'Taze Limonata', description: 'Ev yapımı nane limonata', price: 'All Inclusive', isVegetarian: true, isVegan: true, isGlutenFree: true, allergens: '', order: 1 },
            ]
        },
    ],
}

function MenuEditorTab({ venues, locale, qrData, setQrData, qrLoading, setQrLoading }: MenuEditorTabProps) {
    const [selectedVenue, setSelectedVenue] = useState<string>(venues[0]?.id || '')
    const [menus, setMenus] = useState<Record<string, MenuCategoryData[]>>({})
    const [editingItem, setEditingItem] = useState<{ catId: string; item: MenuItemData } | null>(null)
    const [editingCat, setEditingCat] = useState<MenuCategoryData | null>(null)
    const [newCatName, setNewCatName] = useState('')
    const [newCatIcon, setNewCatIcon] = useState('appetizer')
    const [showAddCat, setShowAddCat] = useState(false)
    const [showAddItem, setShowAddItem] = useState<string | null>(null)
    const [qrDarkColor, setQrDarkColor] = useState('#1e293b')
    const [qrLightColor, setQrLightColor] = useState('#ffffff')
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

    // Default empty scan stats until connected to a real analytics backend
    const [scanStats, setScanStats] = useState<Record<string, { today: number; week: number; month: number; total: number }>>({})

    useEffect(() => {
        // Set selected venue if venues load and none is selected
        if (venues.length > 0 && !selectedVenue) {
            setSelectedVenue(venues[0].id)
        }

        // Populate default menus for each venue if empty
        setMenus(prev => {
            const next = { ...prev }
            venues.forEach(v => {
                if (!next[v.id]) {
                    next[v.id] = []
                }
            })
            return next
        })

        // Populate default scan stats for each venue
        setScanStats(prev => {
            const next = { ...prev }
            venues.forEach(v => {
                if (!next[v.id]) {
                    next[v.id] = { today: 0, week: 0, month: 0, total: 0 }
                }
            })
            return next
        })
    }, [venues])

    const currentMenus = menus[selectedVenue] || []
    const currentVenue = venues.find(v => v.id === selectedVenue)

    const getSlug = (v: DiningVenue) => v.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/(^-|-$)/g, '') || v.id

    const addCategory = () => {
        if (!newCatName.trim()) return
        const newCat: MenuCategoryData = {
            id: `cat-${Date.now()}`, name: newCatName.trim(), icon: newCatIcon,
            order: currentMenus.length + 1, items: [],
        }
        setMenus(prev => ({ ...prev, [selectedVenue]: [...(prev[selectedVenue] || []), newCat] }))
        setNewCatName('')
        setShowAddCat(false)
    }

    const deleteCategory = (catId: string) => {
        if (!confirm('Bu kategoriyi ve tüm öğelerini silmek istediğinize emin misiniz?')) return
        setMenus(prev => ({ ...prev, [selectedVenue]: (prev[selectedVenue] || []).filter(c => c.id !== catId) }))
    }

    const addItem = (catId: string, item: MenuItemData) => {
        setMenus(prev => ({
            ...prev,
            [selectedVenue]: (prev[selectedVenue] || []).map(c =>
                c.id === catId ? { ...c, items: [...c.items, { ...item, id: `item-${Date.now()}`, order: c.items.length + 1 }] } : c
            ),
        }))
        setShowAddItem(null)
    }

    const updateItem = (catId: string, item: MenuItemData) => {
        setMenus(prev => ({
            ...prev,
            [selectedVenue]: (prev[selectedVenue] || []).map(c =>
                c.id === catId ? { ...c, items: c.items.map(i => i.id === item.id ? item : i) } : c
            ),
        }))
        setEditingItem(null)
    }

    const deleteItem = (catId: string, itemId: string) => {
        setMenus(prev => ({
            ...prev,
            [selectedVenue]: (prev[selectedVenue] || []).map(c =>
                c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
            ),
        }))
    }

    const saveMenu = async () => {
        setSaveStatus('saving')
        // TODO: Save to API when backend is ready
        await new Promise(r => setTimeout(r, 800))
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
    }

    const generateQR = async () => {
        if (!currentVenue) return
        setQrLoading(currentVenue.id)
        try {
            const res = await fetch('/api/admin/menu-qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId: getSlug(currentVenue),
                    darkColor: qrDarkColor,
                    lightColor: qrLightColor,
                }),
            })
            const data = await res.json()
            setQrData(prev => ({ ...prev, [currentVenue.id]: { qrDataUrl: data.qrDataUrl, menuUrl: data.menuUrl } }))
        } catch { alert('QR kod oluşturulamadı') }
        setQrLoading(null)
    }

    const stats = scanStats[selectedVenue] || { today: 0, week: 0, month: 0, total: 0 }
    const qr = qrData[selectedVenue]

    return (
        <div className="space-y-6">
            {/* Venue Selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {venues.map(v => (
                    <button key={v.id} onClick={() => setSelectedVenue(v.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedVenue === v.id
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                            : 'bg-white dark:bg-[#1e293b] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50'
                            }`}>
                        <UtensilsCrossed size={14} /> {v.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Menu Editor — Left 2/3 */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {currentVenue?.name} — Menü Düzenle
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => setShowAddCat(true)}
                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors">
                                <Plus size={14} /> Kategori Ekle
                            </button>
                            <button onClick={saveMenu}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${saveStatus === 'saved' ? 'bg-green-600 text-white' :
                                    saveStatus === 'saving' ? 'bg-blue-600 text-white animate-pulse' :
                                        'bg-cyan-600 hover:bg-cyan-500 text-white'
                                    }`}>
                                <Save size={14} />
                                {saveStatus === 'saving' ? 'Kaydediliyor...' : saveStatus === 'saved' ? '✓ Kaydedildi' : 'Menüyü Kaydet'}
                            </button>
                        </div>
                    </div>

                    {/* Add Category Form */}
                    {showAddCat && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-3">Yeni Kategori</h4>
                            <div className="flex gap-3">
                                <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Kategori adı..."
                                    className="flex-1 px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                <select value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-sm">
                                    {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <button onClick={addCategory} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-500">Ekle</button>
                                <button onClick={() => setShowAddCat(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white px-2"><X size={18} /></button>
                            </div>
                        </div>
                    )}

                    {/* Categories + Items */}
                    {currentMenus.length === 0 ? (
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-12 text-center">
                            <UtensilsCrossed className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
                            <p className="text-slate-500 font-medium">Henüz menü eklenmemiş</p>
                            <p className="text-slate-400 text-sm mt-1">Yukarıdaki &quot;Kategori Ekle&quot; butonunu kullanarak başlayın</p>
                        </div>
                    ) : (
                        currentMenus.map(cat => (
                            <div key={cat.id} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                                {/* Category Header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{cat.icon === 'appetizer' ? '🥗' : cat.icon === 'main' ? '🍖' : cat.icon === 'dessert' ? '🍰' : '🍹'}</span>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">{cat.name}</h4>
                                            <span className="text-xs text-slate-500">{cat.items.length} öğe</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setShowAddItem(showAddItem === cat.id ? null : cat.id)}
                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-xs font-medium hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors">
                                            <Plus size={12} /> Öğe Ekle
                                        </button>
                                        <button onClick={() => deleteCategory(cat.id)}
                                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Add Item Form */}
                                {showAddItem === cat.id && (
                                    <MenuItemForm
                                        onSave={(item) => addItem(cat.id, item)}
                                        onCancel={() => setShowAddItem(null)}
                                    />
                                )}

                                {/* Items */}
                                <div className="divide-y divide-slate-100 dark:divide-white/5">
                                    {cat.items.map(item => (
                                        editingItem?.catId === cat.id && editingItem.item.id === item.id ? (
                                            <MenuItemForm
                                                key={item.id}
                                                initialData={item}
                                                onSave={(updated) => updateItem(cat.id, updated)}
                                                onCancel={() => setEditingItem(null)}
                                            />
                                        ) : (
                                            <div key={item.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</span>
                                                        {item.isVegetarian && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-bold">V</span>}
                                                        {item.isVegan && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">VG</span>}
                                                        {item.isGlutenFree && <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold">GF</span>}
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                                                </div>
                                                <div className="flex items-center gap-3 ml-4">
                                                    <span className={`text-sm font-bold ${item.price === 'All Inclusive' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>{item.price}</span>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setEditingItem({ catId: cat.id, item })} className="p-1 rounded text-slate-400 hover:text-blue-600"><Edit2 size={13} /></button>
                                                        <button onClick={() => deleteItem(cat.id, item.id)} className="p-1 rounded text-slate-400 hover:text-red-600"><Trash2 size={13} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* QR Code & Stats — Right 1/3 */}
                <div className="space-y-4">
                    {/* QR Code */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <QrCode size={16} className="text-indigo-500" /> QR Kod
                        </h4>

                        {qr ? (
                            <div className="text-center space-y-3">
                                <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-slate-100">
                                    <img src={qr.qrDataUrl} alt="QR Code" className="w-44 h-44 mx-auto" />
                                </div>
                                <p className="text-[10px] text-slate-500 break-all">{qr.menuUrl}</p>
                                <div className="flex gap-2">
                                    <a href={qr.qrDataUrl} download={`${currentVenue?.name || 'menu'}-qr.png`}
                                        className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-2 rounded-lg text-xs font-bold transition-colors">
                                        <Download size={12} /> PNG
                                    </a>
                                    <button onClick={() => { navigator.clipboard.writeText(qr.menuUrl); alert('URL kopyalandı!') }}
                                        className="flex-1 flex items-center justify-center gap-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                        URL Kopyala
                                    </button>
                                </div>
                                <a href={qr.menuUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5 text-cyan-600 dark:text-cyan-400 text-xs font-medium hover:underline">
                                    <ExternalLink size={12} /> Menüyü Görüntüle
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold">QR Renk</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input type="color" value={qrDarkColor} onChange={e => setQrDarkColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                                            <span className="text-[10px] text-slate-400 font-mono">{qrDarkColor}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase font-bold">Arka Plan</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input type="color" value={qrLightColor} onChange={e => setQrLightColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                                            <span className="text-[10px] text-slate-400 font-mono">{qrLightColor}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={generateQR} disabled={qrLoading === selectedVenue}
                                    className="flex items-center gap-2 w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                                    <QrCode size={16} className={qrLoading === selectedVenue ? 'animate-pulse' : ''} />
                                    {qrLoading === selectedVenue ? 'Oluşturuluyor...' : 'QR Kod Oluştur'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Scan Statistics */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">📊 QR Tarama İstatistikleri</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 text-center">
                                <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{stats.today}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Bugün</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 text-center">
                                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.week}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Bu Hafta</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 text-center">
                                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats.month}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Bu Ay</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 text-center">
                                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.total.toLocaleString('tr-TR')}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Toplam</p>
                            </div>
                        </div>
                        {/* Mini trend bars */}
                        <div className="mt-4 space-y-2">
                            {[
                                { label: 'Pzt', val: 28 }, { label: 'Sal', val: 35 }, { label: 'Çar', val: 42 },
                                { label: 'Per', val: 38 }, { label: 'Cum', val: 55 }, { label: 'Cts', val: 71 }, { label: 'Paz', val: 62 },
                            ].map(d => (
                                <div key={d.label} className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 w-6 font-mono">{d.label}</span>
                                    <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${d.val}%` }} />
                                    </div>
                                    <span className="text-[10px] text-slate-400 w-5 text-right">{d.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Menu Link */}
                    {currentVenue && (
                        <a href={`/${locale}/menu/${getSlug(currentVenue)}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 w-full justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-cyan-600 dark:text-cyan-400 px-4 py-3 rounded-xl text-sm font-bold hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-colors">
                            <ExternalLink size={16} /> Menüyü Önizle
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Menu Item Form Component ──────────────────────────────────

function MenuItemForm({ initialData, onSave, onCancel }: {
    initialData?: MenuItemData
    onSave: (item: MenuItemData) => void
    onCancel: () => void
}) {
    const [form, setForm] = useState<MenuItemData>(initialData || {
        id: '', name: '', description: '', price: 'All Inclusive',
        isVegetarian: false, isVegan: false, isGlutenFree: false,
        allergens: '', order: 0,
    })

    return (
        <div className="px-5 py-4 bg-cyan-50 dark:bg-cyan-900/10 border-b border-cyan-200 dark:border-cyan-800">
            <div className="grid grid-cols-2 gap-3 mb-3">
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Yemek adı" className="col-span-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Açıklama" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                <input type="text" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="Fiyat (ör: €15 veya All Inclusive)" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            </div>
            <div className="flex items-center gap-4 mb-3 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={form.isVegetarian} onChange={e => setForm(f => ({ ...f, isVegetarian: e.target.checked }))} className="rounded border-slate-300" />
                    <span className="text-green-700 dark:text-green-400 font-bold">Vejetaryen</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={form.isVegan} onChange={e => setForm(f => ({ ...f, isVegan: e.target.checked }))} className="rounded border-slate-300" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Vegan</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={form.isGlutenFree} onChange={e => setForm(f => ({ ...f, isGlutenFree: e.target.checked }))} className="rounded border-slate-300" />
                    <span className="text-amber-700 dark:text-amber-400 font-bold">Glutensiz</span>
                </label>
                <input type="text" value={form.allergens} onChange={e => setForm(f => ({ ...f, allergens: e.target.value }))}
                    placeholder="Alerjenler (virgülle ayır)" className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-cyan-500 outline-none" />
            </div>
            <div className="flex gap-2 justify-end">
                <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors">İptal</button>
                <button onClick={() => { if (form.name.trim()) onSave(form) }}
                    className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">
                    <Save size={12} /> {initialData ? 'Güncelle' : 'Ekle'}
                </button>
            </div>
        </div>
    )

}

// ─── Event Editor Tab ──────────────────────────────────────────────

interface DiningEvent {
    id: string
    diningId: string
    locale: string
    title: string
    description?: string
    date?: string
    time?: string
    image?: string
    isActive: boolean
}

function EventEditorTab({ venues, locale }: { venues: DiningVenue[], locale: string }) {
    const [events, setEvents] = useState<DiningEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedVenue, setSelectedVenue] = useState<string>('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<DiningEvent | null>(null)
    const [formData, setFormData] = useState({
        diningId: venues[0]?.id || '',
        title: '',
        description: '',
        date: '',
        time: '',
        image: '',
        isActive: true
    })

    const fetchEvents = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/dining-events?locale=${locale}`)
            if (res.ok) {
                const data = await res.json()
                setEvents(data)
            }
        } catch (error) {
            console.error('Failed to fetch dining events:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [locale])

    const handleEdit = (event: DiningEvent) => {
        setEditingEvent(event)
        setFormData({
            diningId: event.diningId,
            title: event.title,
            description: event.description || '',
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
            time: event.time || '',
            image: event.image || '',
            isActive: event.isActive
        })
        setIsModalOpen(true)
    }

    const handleCreate = () => {
        setEditingEvent(null)
        setFormData({
            diningId: selectedVenue === 'all' ? (venues[0]?.id || '') : selectedVenue,
            title: '', description: '', date: '', time: '', image: '', isActive: true
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const body = { ...formData, locale }
            if (editingEvent) {
                await fetch(`/api/admin/dining-events/${editingEvent.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            } else {
                await fetch('/api/admin/dining-events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            }
            setIsModalOpen(false)
            fetchEvents()
        } catch (error) {
            console.error('Error saving event:', error)
            alert('Kaydedilirken hata oluştu.')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return
        try {
            await fetch(`/api/admin/dining-events/${id}`, { method: 'DELETE' })
            fetchEvents()
        } catch (error) {
            console.error('Error deleting event:', error)
        }
    }

    const filteredEvents = selectedVenue === 'all' ? events : events.filter(e => e.diningId === selectedVenue)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                    <button onClick={() => setSelectedVenue('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedVenue === 'all'
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                            : 'bg-white dark:bg-[#1e293b] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50'
                            }`}>
                        Tüm Etkinlikler
                    </button>
                    {venues.map(v => (
                        <button key={v.id} onClick={() => setSelectedVenue(v.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedVenue === v.id
                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                                : 'bg-white dark:bg-[#1e293b] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50'
                                }`}>
                            {v.name}
                        </button>
                    ))}
                </div>
                <button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors whitespace-nowrap">
                    <Plus size={18} /> Yeni Etkinlik
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full p-8 text-center text-slate-500">Yükleniyor...</div>
                ) : filteredEvents.length === 0 ? (
                    <div className="col-span-full bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-12 text-center">
                        <Star className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
                        <p className="text-slate-500 font-medium">Bu restorana ait etkinlik bulunamadı.</p>
                    </div>
                ) : (
                    filteredEvents.map(event => {
                        const venueName = venues.find(v => v.id === event.diningId)?.name || 'Bilinmeyen Restoran'
                        return (
                            <div key={event.id} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm flex flex-col group">
                                <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                                    {event.image ? (
                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-900 dark:text-white shadow-sm">
                                        {venueName}
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(event)} className="p-2 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-white shadow-sm transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(event.id)} className="p-2 bg-white/90 dark:bg-slate-900/90 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg text-red-600 shadow-sm transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{event.title}</h4>
                                        {!event.isActive && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">Pasif</span>}
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-3">{event.description}</p>
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
                                        {event.date && (
                                            <div className="flex items-center gap-1.5"><Star size={14} className="text-cyan-600" /> {new Date(event.date).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</div>
                                        )}
                                        {event.time && (
                                            <div className="flex items-center gap-1.5"><Clock size={14} className="text-cyan-600" /> {event.time}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e293b] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-[#1e293b] z-10">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingEvent ? 'Etkinlik Düzenle' : 'Yeni Etkinlik Ekle'}</h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Restoran Seçin</label>
                                    <select required value={formData.diningId} onChange={e => setFormData({ ...formData, diningId: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500">
                                        <option value="" disabled>Restoran seçin...</option>
                                        {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Etkinlik Başlığı</label>
                                    <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Örn: Geleneksel Türk Gecesi" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tarih (Opsiyonel)</label>
                                        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Saat (Opsiyonel)</label>
                                        <input type="text" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" placeholder="19:00 - 22:00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Görsel URL</label>
                                    <input type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Açıklama</label>
                                    <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500"></textarea>
                                </div>
                                <div className="flex items-center mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="rounded border-slate-300" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Aktif</span>
                                    </label>
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
