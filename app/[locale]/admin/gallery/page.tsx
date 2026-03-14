'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Image, Upload, Trash2, Search, Plus, FolderOpen, Eye,
    Loader2, Grid, List, X, Check, Tag, Download, Copy
} from 'lucide-react'

interface GalleryImage {
    id: string; url: string; alt: string; category: string
    width: number; height: number; size: string; uploadDate: string
    tags: string[]; usageCount: number
}

const DEMO_CATEGORIES = ['Genel', 'Odalar', 'Havuz', 'Restaurant', 'Spa', 'Plaj', 'Aktiviteler', 'Etkinlikler']

function getDemoImages(): GalleryImage[] {
    const images: GalleryImage[] = []
    const categoryImages: Record<string, string[]> = {
        'Odalar': ['Standart Oda', 'Suite Oda', 'Aile Odası', 'Deniz Manzaralı', 'Balkonlu Oda'],
        'Havuz': ['Ana Havuz', 'Çocuk Havuzu', 'Infinity Havuz', 'Havuz Bar'],
        'Restaurant': ['Ana Restaurant', 'A La Carte', 'Beach Bar', 'Kahvaltı Büfe'],
        'Spa': ['Spa Merkezi', 'Hamam', 'Masaj Odası', 'Sauna'],
        'Plaj': ['Özel Plaj', 'Plaj Şezlong', 'İskele', 'Gün Batımı'],
        'Aktiviteler': ['Su Sporları', 'Tenis Kortu', 'Fitness', 'Mini Golf'],
        'Etkinlikler': ['Düğün Salonu', 'Konferans', 'Gala Gecesi'],
        'Genel': ['Otel Dış Görünüm', 'Lobi', 'Bahçe', 'Resepsiyon']
    }
    let idx = 0
    for (const [cat, names] of Object.entries(categoryImages)) {
        for (const name of names) {
            const d = new Date()
            d.setDate(d.getDate() - Math.floor(Math.random() * 365))
            images.push({
                id: `img-${idx}`,
                url: `https://placehold.co/800x600/1e3a5f/ffffff?text=${encodeURIComponent(name)}`,
                alt: name,
                category: cat,
                width: 800 + Math.floor(Math.random() * 400),
                height: 600 + Math.floor(Math.random() * 300),
                size: `${(0.5 + Math.random() * 3).toFixed(1)} MB`,
                uploadDate: d.toISOString().split('T')[0],
                tags: [cat.toLowerCase(), name.split(' ')[0].toLowerCase()],
                usageCount: Math.floor(Math.random() * 10)
            })
            idx++
        }
    }
    return images
}

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

    useEffect(() => {
        setTimeout(() => { setImages(getDemoImages()); setLoading(false) }, 400)
    }, [])

    const filtered = images.filter(img => {
        if (search && !img.alt.toLowerCase().includes(search.toLowerCase()) && !img.tags.some(t => t.includes(search.toLowerCase()))) return false
        if (categoryFilter && img.category !== categoryFilter) return false
        return true
    })

    const categoryCounts = DEMO_CATEGORIES.map(c => ({ name: c, count: images.filter(img => img.category === c).length }))

    if (loading) return <div className="p-12 flex justify-center items-center text-muted-foreground"><Loader2 className="animate-spin mr-2" /> Galeri yükleniyor...</div>

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Image size={24} className="text-purple-500" /> Medya Galerisi</h1>
                    <p className="text-sm text-muted-foreground mt-1">Otel fotoğrafları ve medya dosyalarını yönetin</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
                    <Upload size={14} /> Yeni Yükle
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/20 rounded-lg text-purple-500"><Image size={20} /></div>
                        <div><p className="text-2xl font-bold">{images.length}</p><p className="text-xs text-muted-foreground">Toplam Medya</p></div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/20 rounded-lg text-blue-500"><FolderOpen size={20} /></div>
                        <div><p className="text-2xl font-bold">{DEMO_CATEGORIES.length}</p><p className="text-xs text-muted-foreground">Kategori</p></div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/20 rounded-lg text-emerald-500"><Eye size={20} /></div>
                        <div><p className="text-2xl font-bold">{images.reduce((a, i) => a + i.usageCount, 0)}</p><p className="text-xs text-muted-foreground">Toplam Kullanım</p></div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-500/20 rounded-lg text-orange-500"><Download size={20} /></div>
                        <div><p className="text-2xl font-bold">{(images.reduce((a, i) => a + parseFloat(i.size), 0)).toFixed(0)} MB</p><p className="text-xs text-muted-foreground">Toplam Boyut</p></div>
                    </div>
                </Card>
            </div>

            {/* Category chips */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                <button onClick={() => setCategoryFilter('')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${!categoryFilter ? 'bg-primary text-primary-foreground' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    Tümü ({images.length})
                </button>
                {categoryCounts.filter(c => c.count > 0).map(c => (
                    <button key={c.name} onClick={() => setCategoryFilter(c.name)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${categoryFilter === c.name ? 'bg-primary text-primary-foreground' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        {c.name} ({c.count})
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input className="w-full pl-9 pr-3 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                        placeholder="Dosya adı veya etiket ara..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex border dark:border-slate-700 rounded-lg overflow-hidden">
                    <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-slate-900 text-muted-foreground'}`}><Grid size={16} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-slate-900 text-muted-foreground'}`}><List size={16} /></button>
                </div>
            </div>

            {/* Grid / List View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filtered.map(img => (
                        <Card key={img.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition"
                            onClick={() => setSelectedImage(img)}>
                            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                                    <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition" />
                                </div>
                                <Badge variant="secondary" className="absolute top-2 left-2 text-xs">{img.category}</Badge>
                            </div>
                            <div className="p-2.5">
                                <p className="text-sm font-medium truncate">{img.alt}</p>
                                <p className="text-xs text-muted-foreground">{img.size} · {img.width}×{img.height}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800/50 border-b">
                            <tr>
                                <th className="p-3 text-left">Önizleme</th>
                                <th className="p-3 text-left">Dosya Adı</th>
                                <th className="p-3 text-left">Kategori</th>
                                <th className="p-3 text-left">Boyut</th>
                                <th className="p-3 text-left">Çözünürlük</th>
                                <th className="p-3 text-left">Tarih</th>
                                <th className="p-3 text-center">Kullanım</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(img => (
                                <tr key={img.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/30 transition cursor-pointer"
                                    onClick={() => setSelectedImage(img)}>
                                    <td className="p-2"><img src={img.url} alt={img.alt} className="w-12 h-9 object-cover rounded" /></td>
                                    <td className="p-3 font-medium">{img.alt}</td>
                                    <td className="p-3"><Badge variant="outline" className="text-xs">{img.category}</Badge></td>
                                    <td className="p-3 text-xs">{img.size}</td>
                                    <td className="p-3 text-xs">{img.width}×{img.height}</td>
                                    <td className="p-3 text-xs">{new Date(img.uploadDate).toLocaleDateString('tr')}</td>
                                    <td className="p-3 text-center"><Badge variant="secondary">{img.usageCount}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* Image Detail Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                    <div className="bg-background rounded-xl shadow-2xl max-w-[900px] w-full max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold">{selectedImage.alt}</h3>
                            <button onClick={() => setSelectedImage(null)}><X size={18} /></button>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <img src={selectedImage.url} alt={selectedImage.alt} className="w-full rounded-lg" />
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                                    <Badge className="mt-1">{selectedImage.category}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Çözünürlük</p>
                                    <p className="text-sm">{selectedImage.width} × {selectedImage.height}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Dosya Boyutu</p>
                                    <p className="text-sm">{selectedImage.size}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Yükleme Tarihi</p>
                                    <p className="text-sm">{new Date(selectedImage.uploadDate).toLocaleDateString('tr')}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Etiketler</p>
                                    <div className="flex gap-1 mt-1 flex-wrap">{selectedImage.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Sayfa Kullanımı</p>
                                    <p className="text-sm">{selectedImage.usageCount} sayfada kullanılıyor</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <p className="text-xs text-center text-muted-foreground">
                📌 Medya yönetimi şu anda demo veriler ile çalışmaktadır. Gerçek dosya yükleme sistemi entegre edilecektir.
            </p>
        </div>
    )
}
