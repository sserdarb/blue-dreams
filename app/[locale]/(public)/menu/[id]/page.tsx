'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { Leaf, Wheat, GlassWater, Search, ChevronDown, ChevronUp, UtensilsCrossed, Coffee, IceCream, AlertTriangle, Wine } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────
interface MenuItem {
    id: string; name: string; description: string; price: string
    image: string; allergens: string[]
    isVegetarian: boolean; isVegan: boolean; isGlutenFree: boolean
    order: number
}

interface MenuCategory {
    id: string; name: string; icon: string; items: MenuItem[]
    order: number
}

interface Restaurant {
    id: string; name: string; description: string; image: string
    categories: MenuCategory[]
}

// ─── Mock Data (will be replaced by DB fetch) ──────────────────
const RESTAURANTS: Record<string, Restaurant> = {
    '1': {
        id: '1', name: 'Aqua Restaurant',
        description: 'Ana restoran — açık büfe international cuisine',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/aqua.jpg',
        categories: [
            {
                id: 'c1', name: 'Başlangıçlar', icon: 'appetizer', order: 1,
                items: [
                    { id: 'i1', name: 'Akdeniz Mezze Tabağı', description: 'Humus, babaganuş, atom, acılı ezme, tahinli havuç', price: 'All Inclusive', image: '', allergens: ['Susam'], isVegetarian: true, isVegan: true, isGlutenFree: true, order: 1 },
                    { id: 'i2', name: 'Deniz Mahsulleri Salatası', description: 'Karides, kalamar, ahtapot, limonlu sos', price: 'All Inclusive', image: '', allergens: ['Balık'], isVegetarian: false, isVegan: false, isGlutenFree: true, order: 2 },
                    { id: 'i3', name: 'Feta Peynirli Karpuz Salatası', description: 'Taze karpuz, feta, nane, zeytinyağı', price: 'All Inclusive', image: '', allergens: ['Süt'], isVegetarian: true, isVegan: false, isGlutenFree: true, order: 3 },
                ]
            },
            {
                id: 'c2', name: 'Ana Yemekler', icon: 'main', order: 2,
                items: [
                    { id: 'i4', name: 'Levrek Fileto', description: 'Izgara levrek, karamelize limon, roka salatası', price: 'All Inclusive', image: '', allergens: ['Balık'], isVegetarian: false, isVegan: false, isGlutenFree: true, order: 1 },
                    { id: 'i5', name: 'Kuzu Pirzola', description: 'Izgara kuzu pirzola, biberiyeli patates, mevsim sebzeleri', price: 'All Inclusive', image: '', allergens: [], isVegetarian: false, isVegan: false, isGlutenFree: true, order: 2 },
                    { id: 'i6', name: 'Mantarlı Risotto', description: 'Arborio pirinç, porcini mantarı, parmesan, trüf yağı', price: 'All Inclusive', image: '', allergens: ['Süt'], isVegetarian: true, isVegan: false, isGlutenFree: true, order: 3 },
                ]
            },
            {
                id: 'c3', name: 'Tatlılar', icon: 'dessert', order: 3,
                items: [
                    { id: 'i7', name: 'Künefe', description: 'Geleneksel Hatay künefesi, kaymak, antep fıstığı', price: 'All Inclusive', image: '', allergens: ['Süt', 'Gluten', 'Fıstık'], isVegetarian: true, isVegan: false, isGlutenFree: false, order: 1 },
                    { id: 'i8', name: 'Çikolatalı Sufle', description: 'Sıcak çikolatalı sufle, vanilyalı dondurma', price: 'All Inclusive', image: '', allergens: ['Süt', 'Gluten', 'Yumurta'], isVegetarian: true, isVegan: false, isGlutenFree: false, order: 2 },
                ]
            },
            {
                id: 'c4', name: 'İçecekler', icon: 'drink', order: 4,
                items: [
                    { id: 'i9', name: 'Taze Sıkılmış Portakal Suyu', description: 'Günlük taze sıkım', price: 'All Inclusive', image: '', allergens: [], isVegetarian: true, isVegan: true, isGlutenFree: true, order: 1 },
                    { id: 'i10', name: 'Türk Çayı', description: 'Geleneksel demlik çay', price: 'All Inclusive', image: '', allergens: [], isVegetarian: true, isVegan: true, isGlutenFree: true, order: 2 },
                    { id: 'i11', name: 'Türk Kahvesi', description: 'Geleneksel Türk kahvesi', price: 'All Inclusive', image: '', allergens: [], isVegetarian: true, isVegan: true, isGlutenFree: true, order: 3 },
                ]
            },
        ]
    },
    '2': {
        id: '2', name: 'Blue A La Carte',
        description: 'Akdeniz mutfağı — à la carte restoran',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/alacarte.jpg',
        categories: [
            {
                id: 'ac1', name: 'Başlangıçlar', icon: 'appetizer', order: 1,
                items: [
                    { id: 'ac-i1', name: 'Ahtapot Carpaccio', description: 'İnce dilimlenmiş ahtapot, kapari, limon sosu', price: '€15', image: '', allergens: ['Balık'], isVegetarian: false, isVegan: false, isGlutenFree: true, order: 1 },
                    { id: 'ac-i2', name: 'Burrata & Domates', description: 'Taze burrata, kiraz domates, fesleğen pesto', price: '€12', image: '', allergens: ['Süt'], isVegetarian: true, isVegan: false, isGlutenFree: true, order: 2 },
                ]
            },
            {
                id: 'ac2', name: 'Ana Yemekler', icon: 'main', order: 2,
                items: [
                    { id: 'ac-i3', name: 'Istakoz Thermidor', description: 'Fırında istakoz, kremalı sos, parmesan', price: '€45', image: '', allergens: ['Balık', 'Süt'], isVegetarian: false, isVegan: false, isGlutenFree: true, order: 1 },
                    { id: 'ac-i4', name: 'Wagyu Steak', description: '250g wagyu bonfile, trüf püresi, mevsim sebze', price: '€55', image: '', allergens: [], isVegetarian: false, isVegan: false, isGlutenFree: true, order: 2 },
                ]
            },
        ]
    },
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'appetizer': <UtensilsCrossed size={20} className="text-cyan-400" />,
    'main': <UtensilsCrossed size={20} className="text-orange-400" />,
    'dessert': <IceCream size={20} className="text-pink-400" />,
    'drink': <Coffee size={20} className="text-amber-400" />,
}

const CATEGORY_COLORS: Record<string, string> = {
    'appetizer': 'from-cyan-500/20 to-cyan-600/5',
    'main': 'from-orange-500/20 to-orange-600/5',
    'dessert': 'from-pink-500/20 to-pink-600/5',
    'drink': 'from-amber-500/20 to-amber-600/5',
}

// ─── Component ─────────────────────────────────────────────────
export default function PublicMenuPage() {
    const params = useParams()
    const restaurantId = (params?.id as string) || '1'
    const restaurant = RESTAURANTS[restaurantId] || RESTAURANTS['1']

    const [searchTerm, setSearchTerm] = useState('')
    const [expandedCategories, setExpandedCategories] = useState<string[]>(() =>
        restaurant ? restaurant.categories.map(c => c.id) : []
    )
    const [dietFilter, setDietFilter] = useState<'all' | 'vegetarian' | 'vegan' | 'glutenFree'>('all')

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <UtensilsCrossed className="mx-auto mb-4 text-slate-600" size={64} />
                    <h1 className="text-2xl font-bold text-white">Menü bulunamadı</h1>
                    <p className="text-slate-400 mt-2">Bu restoran menüsü henüz hazırlanmamıştır.</p>
                </div>
            </div>
        )
    }

    const toggleCategory = (id: string) => {
        setExpandedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    const filterItems = (items: MenuItem[]) => {
        let filtered = items
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(i => i.name.toLowerCase().includes(term) || i.description.toLowerCase().includes(term))
        }
        if (dietFilter === 'vegetarian') filtered = filtered.filter(i => i.isVegetarian)
        if (dietFilter === 'vegan') filtered = filtered.filter(i => i.isVegan)
        if (dietFilter === 'glutenFree') filtered = filtered.filter(i => i.isGlutenFree)
        return filtered.sort((a, b) => a.order - b.order)
    }

    const sortedCategories = [...restaurant.categories].sort((a, b) => a.order - b.order)

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            {/* Hero Header */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/30 to-slate-900" />
                <div className="relative px-6 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <span className="font-black text-xl text-white">BD</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-wider mb-1" style={{ fontFamily: `'Playfair Display', serif` }}>
                        BLUE DREAMS
                    </h1>
                    <p className="text-cyan-400 text-xs uppercase tracking-[0.3em]">Resort & Spa • Torba / Bodrum</p>
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <UtensilsCrossed size={16} className="text-cyan-400" />
                        <h2 className="text-lg font-medium">{restaurant.name}</h2>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{restaurant.description}</p>
                </div>
            </header>

            {/* Sticky Search + Filters */}
            <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
                <div className="max-w-lg mx-auto space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text" placeholder="Menüde ara..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {[
                            { key: 'all' as const, label: 'Tümü', icon: null },
                            { key: 'vegetarian' as const, label: 'Vejetaryen', icon: <Leaf size={14} /> },
                            { key: 'vegan' as const, label: 'Vegan', icon: <Leaf size={14} /> },
                            { key: 'glutenFree' as const, label: 'Glutensiz', icon: <Wheat size={14} /> },
                        ].map(f => (
                            <button key={f.key} onClick={() => setDietFilter(f.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${dietFilter === f.key
                                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                                    }`}>
                                {f.icon} {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu Content */}
            <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
                {sortedCategories.map(category => {
                    const items = filterItems(category.items)
                    if (items.length === 0 && (searchTerm || dietFilter !== 'all')) return null
                    const isExpanded = expandedCategories.includes(category.id)

                    return (
                        <section key={category.id} id={category.id}>
                            {/* Category Header */}
                            <button onClick={() => toggleCategory(category.id)}
                                className={`w-full bg-gradient-to-r ${CATEGORY_COLORS[category.icon] || CATEGORY_COLORS['appetizer']} rounded-2xl p-4 mb-3 flex items-center justify-between hover:opacity-90 transition-opacity`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                        {CATEGORY_ICONS[category.icon] || <UtensilsCrossed size={20} className="text-cyan-400" />}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg font-bold">{category.name}</h3>
                                        <span className="text-xs text-slate-400">{items.length} çeşit</span>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                            </button>

                            {/* Items */}
                            {isExpanded && (
                                <div className="space-y-3">
                                    {items.map(item => (
                                        <div key={item.id} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h4 className="font-bold text-white">{item.name}</h4>
                                                        {item.isVegetarian && (
                                                            <span className="inline-flex items-center gap-0.5 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold border border-green-500/30">
                                                                <Leaf size={10} /> V
                                                            </span>
                                                        )}
                                                        {item.isVegan && (
                                                            <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                                                                VG
                                                            </span>
                                                        )}
                                                        {item.isGlutenFree && (
                                                            <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold border border-amber-500/30">
                                                                <Wheat size={10} /> GF
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                                                    {item.allergens.length > 0 && (
                                                        <div className="flex items-center gap-1.5 mt-2">
                                                            <AlertTriangle size={12} className="text-red-400" />
                                                            <span className="text-[10px] text-red-400/80">{item.allergens.join(', ')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <span className={`text-sm font-bold ${item.price === 'All Inclusive' ? 'text-cyan-400' : 'text-white'}`}>
                                                        {item.price}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )
                })}
            </main>

            {/* Footer */}
            <footer className="px-6 py-10 text-center border-t border-white/5">
                <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
                    <span className="font-black text-xs text-white">BD</span>
                </div>
                <p className="text-xs text-slate-500 mb-1">Blue Dreams Resort & Spa</p>
                <p className="text-[10px] text-slate-600">Torba Mah. Torba Cad. No:4/1 Torba / Bodrum • Tel: +90 252 367 1515</p>
                <div className="flex items-center justify-center gap-2 mt-4 text-slate-500">
                    <GlassWater size={14} />
                    <span className="text-[10px]">A/I = All Inclusive</span>
                </div>
                <p className="text-[10px] text-slate-700 mt-2">Fiyatlar KDV dahildir. Alerjen bilgileri için lütfen personelinize danışınız.</p>
            </footer>
        </div>
    )
}
