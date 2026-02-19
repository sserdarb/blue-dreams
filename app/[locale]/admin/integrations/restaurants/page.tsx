'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useRef } from 'react'
import { Plus, Edit2, Trash2, X, Save, GripVertical, UtensilsCrossed, Wine, Coffee, IceCream, ChevronDown, ChevronUp, Image as ImageIcon, QrCode, Printer, Download, Eye, ExternalLink } from 'lucide-react'
import { useParams } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────
interface MenuItem {
    id: string
    name: string
    description: string
    price: string
    image: string
    allergens: string[]
    isVegetarian: boolean
    isVegan: boolean
    isGlutenFree: boolean
    order: number
}

interface MenuCategory {
    id: string
    name: string
    icon: string
    items: MenuItem[]
    order: number
}

interface Restaurant {
    id: string
    name: string
    description: string
    image: string
    categories: MenuCategory[]
}

// ─── Mock Data ─────────────────────────────────────────────────
const ALLERGEN_LIST = ['Gluten', 'Süt', 'Yumurta', 'Fıstık', 'Balık', 'Soya', 'Kereviz', 'Susam']

const INITIAL_RESTAURANTS: Restaurant[] = [
    {
        id: '1',
        name: 'Aqua Restaurant',
        description: 'Ana restoran — açık büfe international cuisine',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/aqua.jpg',
        categories: [
            {
                id: 'c1', name: 'Başlangıçlar', icon: 'appetizer', order: 1,
                items: [
                    { id: 'i1', name: 'Mevsim Salatası', description: 'Taze mevsim yeşillikleri, cherry domates, salatalık', price: 'A/I', image: '', allergens: [], isVegetarian: true, isVegan: true, isGlutenFree: true, order: 1 },
                    { id: 'i2', name: 'Hummus', description: 'Geleneksel nohut ezmesi, zeytinyağı ve baharatlar', price: 'A/I', image: '', allergens: ['Susam'], isVegetarian: true, isVegan: true, isGlutenFree: true, order: 2 },
                    { id: 'i3', name: 'Deniz Mahsulleri Kokteyl', description: 'Karides, kalamar, midye ile özel sos', price: 'A/I', image: '', allergens: ['Balık'], isVegetarian: false, isVegan: false, isGlutenFree: true, order: 3 },
                ]
            },
            {
                id: 'c2', name: 'Ana Yemekler', icon: 'main', order: 2,
                items: [
                    { id: 'i4', name: 'Izgara Levrek', description: 'Taze Ege levreği, sebze garnitürü ile', price: 'A/I', image: '', allergens: ['Balık'], isVegetarian: false, isVegan: false, isGlutenFree: true, order: 1 },
                    { id: 'i5', name: 'Kuzu Tandır', description: 'Yavaş pişirilmiş kuzu, pilav ve yoğurt', price: 'A/I', image: '', allergens: ['Süt'], isVegetarian: false, isVegan: false, isGlutenFree: false, order: 2 },
                    { id: 'i6', name: 'Mantarlı Risotto', description: 'Porcini ve kuzu kulağı mantarı ile kremalı risotto', price: 'A/I', image: '', allergens: ['Süt'], isVegetarian: true, isVegan: false, isGlutenFree: true, order: 3 },
                ]
            },
            {
                id: 'c3', name: 'Tatlılar', icon: 'dessert', order: 3,
                items: [
                    { id: 'i7', name: 'Künefe', description: 'Geleneksel Antep künefesi, kaymak ile', price: 'A/I', image: '', allergens: ['Süt', 'Gluten', 'Fıstık'], isVegetarian: true, isVegan: false, isGlutenFree: false, order: 1 },
                    { id: 'i8', name: 'Çikolatalı Sufle', description: 'Sıcak çikolatalı sufle, vanilya dondurma', price: 'A/I', image: '', allergens: ['Süt', 'Yumurta', 'Gluten'], isVegetarian: true, isVegan: false, isGlutenFree: false, order: 2 },
                ]
            },
            {
                id: 'c4', name: 'İçecekler', icon: 'drink', order: 4,
                items: [
                    { id: 'i9', name: 'Türk Çayı', description: 'Geleneksel demli çay', price: 'A/I', image: '', allergens: [], isVegetarian: true, isVegan: true, isGlutenFree: true, order: 1 },
                    { id: 'i10', name: 'Türk Kahvesi', description: 'Geleneksel Türk kahvesi', price: 'A/I', image: '', allergens: [], isVegetarian: true, isVegan: true, isGlutenFree: true, order: 2 },
                    { id: 'i11', name: 'Taze Sıkılmış Portakal Suyu', description: 'Günlük taze sıkım', price: 'A/I', image: '', allergens: [], isVegetarian: true, isVegan: true, isGlutenFree: true, order: 3 },
                ]
            }
        ]
    },
    {
        id: '2',
        name: 'Blue A La Carte',
        description: 'Akdeniz mutfağı — à la carte restoran',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/alacarte.jpg',
        categories: [
            {
                id: 'c5', name: 'Meze', icon: 'appetizer', order: 1,
                items: [
                    { id: 'i12', name: 'Ahtapot Izgara', description: 'Acılı zeytinyağı ve limonlu ızgara ahtapot', price: '€18', image: '', allergens: ['Balık'], isVegetarian: false, isVegan: false, isGlutenFree: true, order: 1 },
                ]
            }
        ]
    }
]

// ─── Component ─────────────────────────────────────────────────
export default function RestaurantMenuPage() {
    const params = useParams()
    const locale = params.locale as string

    const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS)
    const [selectedRestaurant, setSelectedRestaurant] = useState<string>(INITIAL_RESTAURANTS[0].id)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategoryId, setEditingCategoryId] = useState<string>('')
    const [showQrPanel, setShowQrPanel] = useState(false)
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['c1', 'c2', 'c3', 'c4']))

    const currentRestaurant = restaurants.find(r => r.id === selectedRestaurant) || restaurants[0]

    // Form State
    const [itemForm, setItemForm] = useState({
        name: '', description: '', price: 'A/I', image: '', allergens: [] as string[],
        isVegetarian: false, isVegan: false, isGlutenFree: false
    })

    const toggleCategory = (id: string) => {
        const next = new Set(expandedCategories)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setExpandedCategories(next)
    }

    const handleEditItem = (item: MenuItem, categoryId: string) => {
        setEditingItem(item)
        setEditingCategoryId(categoryId)
        setItemForm({
            name: item.name, description: item.description, price: item.price,
            image: item.image, allergens: item.allergens,
            isVegetarian: item.isVegetarian, isVegan: item.isVegan, isGlutenFree: item.isGlutenFree
        })
        setIsModalOpen(true)
    }

    const handleAddItem = (categoryId: string) => {
        setEditingItem(null)
        setEditingCategoryId(categoryId)
        setItemForm({ name: '', description: '', price: 'A/I', image: '', allergens: [], isVegetarian: false, isVegan: false, isGlutenFree: false })
        setIsModalOpen(true)
    }

    const handleSubmitItem = (e: React.FormEvent) => {
        e.preventDefault()
        setRestaurants(prev => prev.map(r => {
            if (r.id !== selectedRestaurant) return r
            return {
                ...r,
                categories: r.categories.map(c => {
                    if (c.id !== editingCategoryId) return c
                    if (editingItem) {
                        return { ...c, items: c.items.map(item => item.id === editingItem.id ? { ...item, ...itemForm } : item) }
                    } else {
                        return { ...c, items: [...c.items, { ...itemForm, id: Date.now().toString(), order: c.items.length + 1 }] }
                    }
                })
            }
        }))
        setIsModalOpen(false)
    }

    const handleDeleteItem = (categoryId: string, itemId: string) => {
        setRestaurants(prev => prev.map(r => {
            if (r.id !== selectedRestaurant) return r
            return { ...r, categories: r.categories.map(c => c.id === categoryId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c) }
        }))
    }

    const qrMenuUrl = `https://new.bluedreamsresort.com/${locale}/menu/${currentRestaurant.id}`

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Restoran & QR Menüler</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Restoran menülerini yönetin ve QR menü oluşturun.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {restaurants.map(r => (
                        <button key={r.id} onClick={() => setSelectedRestaurant(r.id)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedRestaurant === r.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                            {r.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Restaurant Info & QR Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                            <UtensilsCrossed size={28} className="text-cyan-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentRestaurant.name}</h2>
                            <p className="text-sm text-slate-500">{currentRestaurant.description}</p>
                        </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg">
                            <span className="text-slate-500">Kategori:</span> <span className="font-bold text-slate-900 dark:text-white">{currentRestaurant.categories.length}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg">
                            <span className="text-slate-500">Ürün:</span> <span className="font-bold text-slate-900 dark:text-white">{currentRestaurant.categories.reduce((a, c) => a + c.items.length, 0)}</span>
                        </div>
                    </div>
                </div>

                {/* QR Code Panel */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-white/10 shadow-sm text-white">
                    <div className="text-center">
                        <QrCode size={32} className="mx-auto mb-3 text-cyan-400" />
                        <h3 className="font-bold mb-1">QR Menü</h3>
                        <p className="text-xs text-slate-400 mb-4">Masalarda gösterilecek QR kod</p>

                        {/* Mock QR Code */}
                        <div className="bg-white p-4 rounded-xl inline-block mb-4">
                            <div className="w-32 h-32 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                                {/* Simple QR pattern mock */}
                                <div className="grid grid-cols-8 gap-0.5 w-24 h-24">
                                    {Array.from({ length: 64 }, (_, i) => (
                                        <div key={i} className={`w-full aspect-square rounded-[1px] ${Math.random() > 0.4 ? 'bg-slate-900' : 'bg-white'}`} />
                                    ))}
                                </div>
                                {/* Center logo */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                                        <span className="text-white text-[8px] font-black">BD</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-slate-400 mb-3 break-all">{qrMenuUrl}</div>

                        <div className="flex gap-2 justify-center">
                            <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
                                <Download size={14} /> PDF Afiş
                            </button>
                            <a href={qrMenuUrl} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
                                <Eye size={14} /> Önizle
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Categories & Items */}
            <div className="space-y-4">
                {currentRestaurant.categories.map(category => (
                    <div key={category.id} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                        {/* Category Header */}
                        <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                    {category.icon === 'appetizer' && <UtensilsCrossed size={18} className="text-cyan-500" />}
                                    {category.icon === 'main' && <UtensilsCrossed size={18} className="text-orange-500" />}
                                    {category.icon === 'dessert' && <IceCream size={18} className="text-pink-500" />}
                                    {category.icon === 'drink' && <Coffee size={18} className="text-amber-500" />}
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-slate-900 dark:text-white">{category.name}</h3>
                                    <span className="text-xs text-slate-500">{category.items.length} ürün</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleAddItem(category.id) }}
                                    className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors">
                                    <Plus size={16} />
                                </button>
                                {expandedCategories.has(category.id) ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                            </div>
                        </button>

                        {/* Items */}
                        {expandedCategories.has(category.id) && (
                            <div className="border-t border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5">
                                {category.items.map(item => (
                                    <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <GripVertical size={16} className="text-slate-300 dark:text-slate-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UtensilsCrossed size={16} className="text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                                                {item.isVegetarian && <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded font-bold">V</span>}
                                                {item.isGlutenFree && <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">GF</span>}
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">{item.description}</p>
                                            {item.allergens.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {item.allergens.map(a => (
                                                        <span key={a} className="text-[9px] bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-1.5 py-0.5 rounded">{a}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="font-bold text-slate-900 dark:text-white">{item.price}</span>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditItem(item, category.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-cyan-600 transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDeleteItem(category.id, item.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* robots.txt Note */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <QrCode size={16} className="text-white" />
                </div>
                <div className="text-sm">
                    <p className="font-bold text-amber-800 dark:text-amber-300">robots.txt Koruma</p>
                    <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">QR menü sayfaları <code className="bg-amber-100 dark:bg-amber-800/30 px-1 rounded">robots.txt</code> ile arama motorlarından gizlenmiştir. Sadece QR kod taraması ile erişilebilir.</p>
                </div>
            </div>

            {/* Edit Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e293b] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl">
                        <form onSubmit={handleSubmitItem}>
                            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-[#1e293b] z-10">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingItem ? 'Ürün Düzenle' : 'Yeni Ürün'}</h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ürün Adı</label>
                                        <input type="text" required value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fiyat</label>
                                        <input type="text" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" placeholder="A/I veya €15" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Açıklama</label>
                                    <textarea rows={2} value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Görsel URL</label>
                                    <input type="text" value={itemForm.image} onChange={e => setItemForm({ ...itemForm, image: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alerjenler</label>
                                    <div className="flex flex-wrap gap-2">
                                        {ALLERGEN_LIST.map(a => (
                                            <button key={a} type="button"
                                                onClick={() => setItemForm({ ...itemForm, allergens: itemForm.allergens.includes(a) ? itemForm.allergens.filter(x => x !== a) : [...itemForm.allergens, a] })}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${itemForm.allergens.includes(a) ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                                {a}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    {[
                                        { key: 'isVegetarian', label: 'Vejetaryen' },
                                        { key: 'isVegan', label: 'Vegan' },
                                        { key: 'isGlutenFree', label: 'Glutensiz' }
                                    ].map(opt => (
                                        <label key={opt.key} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <input type="checkbox" checked={(itemForm as any)[opt.key]} onChange={e => setItemForm({ ...itemForm, [opt.key]: e.target.checked })}
                                                className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1e293b] sticky bottom-0 rounded-b-2xl flex justify-end gap-3 z-10">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors">İptal</button>
                                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2"><Save size={18} /> Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
