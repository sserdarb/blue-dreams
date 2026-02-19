export const dynamic = 'force-dynamic'

'use client'

import React, { useState } from 'react'
import { UtensilsCrossed, Wine, Coffee, IceCream, ChevronDown, AlertTriangle, Leaf, Wheat } from 'lucide-react'

// ─── Types (mirrored from admin) ──────────────────────────────
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
}

interface MenuCategory {
    id: string
    name: string
    icon: string
    items: MenuItem[]
}

// ─── Mock Data (same as admin for now) ─────────────────────────
const MENU_DATA: MenuCategory[] = [
    {
        id: 'c1', name: 'Başlangıçlar', icon: 'appetizer',
        items: [
            { id: 'i1', name: 'Mevsim Salatası', description: 'Taze mevsim yeşillikleri, cherry domates, salatalık, havuç', price: 'All Inclusive', image: '', allergens: [], isVegetarian: true, isVegan: true, isGlutenFree: true },
            { id: 'i2', name: 'Hummus', description: 'Geleneksel nohut ezmesi, zeytinyağı ve baharatlar ile', price: 'All Inclusive', image: '', allergens: ['Susam'], isVegetarian: true, isVegan: true, isGlutenFree: true },
            { id: 'i3', name: 'Deniz Mahsulleri Kokteyl', description: 'Karides, kalamar, midye ile özel Ege sosu', price: 'All Inclusive', image: '', allergens: ['Balık'], isVegetarian: false, isVegan: false, isGlutenFree: true },
        ]
    },
    {
        id: 'c2', name: 'Ana Yemekler', icon: 'main',
        items: [
            { id: 'i4', name: 'Izgara Levrek', description: 'Taze Ege levreği, ızgara sebzeler ve zeytinyağı', price: 'All Inclusive', image: '', allergens: ['Balık'], isVegetarian: false, isVegan: false, isGlutenFree: true },
            { id: 'i5', name: 'Kuzu Tandır', description: 'Geleneksel yavaş pişirilmiş kuzu, pirinç pilavı ve yoğurt', price: 'All Inclusive', image: '', allergens: ['Süt'], isVegetarian: false, isVegan: false, isGlutenFree: false },
            { id: 'i6', name: 'Mantarlı Risotto', description: 'Porcini ve kuzu kulağı mantarı ile İtalyan risotto', price: 'All Inclusive', image: '', allergens: ['Süt'], isVegetarian: true, isVegan: false, isGlutenFree: true },
        ]
    },
    {
        id: 'c3', name: 'Tatlılar', icon: 'dessert',
        items: [
            { id: 'i7', name: 'Künefe', description: 'Antep fıstıklı geleneksel künefe, kaymaklı', price: 'All Inclusive', image: '', allergens: ['Süt', 'Gluten', 'Fıstık'], isVegetarian: true, isVegan: false, isGlutenFree: false },
            { id: 'i8', name: 'Çikolatalı Sufle', description: 'Sıcak Belçika çikolatası sufle, vanilya dondurma ile', price: 'All Inclusive', image: '', allergens: ['Süt', 'Yumurta', 'Gluten'], isVegetarian: true, isVegan: false, isGlutenFree: false },
        ]
    },
    {
        id: 'c4', name: 'İçecekler', icon: 'drink',
        items: [
            { id: 'i9', name: 'Türk Çayı', description: 'Taze demlenmiş geleneksel çay', price: 'All Inclusive', image: '', allergens: [], isVegetarian: true, isVegan: true, isGlutenFree: true },
            { id: 'i10', name: 'Türk Kahvesi', description: 'Orta pişirilmiş geleneksel Türk kahvesi', price: 'All Inclusive', image: '', allergens: [], isVegetarian: true, isVegan: true, isGlutenFree: true },
            { id: 'i11', name: 'Taze Sıkılmış Portakal Suyu', description: 'Günlük taze sıkım doğal portakal suyu', price: 'All Inclusive', image: '', allergens: [], isVegetarian: true, isVegan: true, isGlutenFree: true },
        ]
    }
]

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

export default function PublicMenuPage() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            {/* Header */}
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
                        <h2 className="text-lg font-medium">Aqua Restaurant</h2>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">Dijital Menü</p>
                </div>
            </header>

            {/* Category Quick Nav */}
            <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-white/5">
                <div className="overflow-x-auto px-4 py-3">
                    <div className="flex gap-2 min-w-max">
                        {MENU_DATA.map(cat => (
                            <a key={cat.id}
                                href={`#${cat.id}`}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id
                                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                                    }`}
                            >
                                {CATEGORY_ICONS[cat.icon]}
                                {cat.name}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu Content */}
            <main className="px-4 py-6 max-w-lg mx-auto space-y-8">
                {MENU_DATA.map(cat => (
                    <section key={cat.id} id={cat.id}>
                        {/* Category Header */}
                        <div className={`bg-gradient-to-r ${CATEGORY_COLORS[cat.icon]} rounded-2xl p-4 mb-4 flex items-center gap-3`}>
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                {CATEGORY_ICONS[cat.icon]}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">{cat.name}</h3>
                                <span className="text-xs text-slate-400">{cat.items.length} çeşit</span>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-3">
                            {cat.items.map(item => (
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
                    </section>
                ))}
            </main>

            {/* Footer */}
            <footer className="px-6 py-10 text-center border-t border-white/5">
                <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
                    <span className="font-black text-xs text-white">BD</span>
                </div>
                <p className="text-xs text-slate-500 mb-1">Blue Dreams Resort & Spa</p>
                <p className="text-[10px] text-slate-600">Torba Mah. Torba Cad. No:4/1 Torba / Bodrum • Tel: +90 252 367 1515</p>
                <p className="text-[10px] text-slate-700 mt-4">Fiyatlar KDV dahildir. Alerjen bilgileri için lütfen personelinize danışınız.</p>
            </footer>
        </div>
    )
}
