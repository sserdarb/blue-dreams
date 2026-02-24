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
                <MenuEditorTab venues={venues} locale={locale} qrData={qrData} setQrData={setQrData} qrLoading={qrLoading} setQrLoading={setQrLoading} />
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
    const [selectedVenue, setSelectedVenue] = useState<string>(venues[0]?.id || '1')
    const [menus, setMenus] = useState<Record<string, MenuCategoryData[]>>(INITIAL_MENUS)
    const [editingItem, setEditingItem] = useState<{ catId: string; item: MenuItemData } | null>(null)
    const [editingCat, setEditingCat] = useState<MenuCategoryData | null>(null)
    const [newCatName, setNewCatName] = useState('')
    const [newCatIcon, setNewCatIcon] = useState('appetizer')
    const [showAddCat, setShowAddCat] = useState(false)
    const [showAddItem, setShowAddItem] = useState<string | null>(null)
    const [qrDarkColor, setQrDarkColor] = useState('#1e293b')
    const [qrLightColor, setQrLightColor] = useState('#ffffff')
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

    // QR scan stats (mock — will come from API)
    const scanStats: Record<string, { today: number; week: number; month: number; total: number }> = {
        '1': { today: 34, week: 218, month: 892, total: 4521 },
        '2': { today: 12, week: 87, month: 345, total: 1820 },
        '3': { today: 45, week: 312, month: 1203, total: 5672 },
    }

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
