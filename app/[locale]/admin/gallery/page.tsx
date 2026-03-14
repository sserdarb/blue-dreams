'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Image, Upload, Trash2, Search, Plus, FolderOpen, Eye,
    Loader2, Grid, List, X, Check, Tag, Download, Copy, RefreshCw, AlertCircle
} from 'lucide-react'

interface GalleryImage {
    id: string; url: string; alt: string; category: string
    size: string; sizeBytes: number; modifiedAt: string; fileName: string
}

interface CategoryInfo {
    name: string; count: number
}

interface GalleryStats {
    totalImages: number; totalCategories: number
    totalSize: string; totalSizeBytes: number
}

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [categories, setCategories] = useState<CategoryInfo[]>([])
    const [stats, setStats] = useState<GalleryStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchGallery = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/admin/gallery')
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            setImages(data.images || [])
            setCategories(data.categories || [])
            setStats(data.stats || null)
        } catch (err: any) {
            console.error('[Gallery] Fetch error:', err)
            setError('Galeri yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchGallery() }, [fetchGallery])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Yükleme başarısız')
            }
            // Refresh gallery after upload
            await fetchGallery()
        } catch (err: any) {
            alert(err.message || 'Dosya yüklenirken hata oluştu')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const filtered = images.filter(img => {
        if (search && !img.alt.toLowerCase().includes(search.toLowerCase()) && !img.fileName.toLowerCase().includes(search.toLowerCase())) return false
        if (categoryFilter && img.category !== categoryFilter) return false
        return true
    })

    if (loading) return <div className="p-12 flex justify-center items-center text-muted-foreground"><Loader2 className="animate-spin mr-2" /> Galeri yükleniyor...</div>

    if (error) return (
        <div className="p-12 flex flex-col items-center gap-4 text-muted-foreground">
            <AlertCircle size={32} className="text-red-400" />
            <p>{error}</p>
            <button onClick={fetchGallery} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
                <RefreshCw size={14} /> Tekrar Dene
            </button>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Image size={24} className="text-purple-500" /> Medya Galerisi</h1>
                    <p className="text-sm text-muted-foreground mt-1">Otel fotoğrafları ve medya dosyalarını yönetin</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchGallery} className="flex items-center gap-2 px-3 py-2 rounded-lg border dark:border-slate-700 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <RefreshCw size={14} /> Yenile
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={handleUpload} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50">
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {uploading ? 'Yükleniyor...' : 'Yeni Yükle'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-500/20 rounded-lg text-purple-500"><Image size={20} /></div>
                            <div><p className="text-2xl font-bold">{stats.totalImages}</p><p className="text-xs text-muted-foreground">Toplam Medya</p></div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/20 rounded-lg text-blue-500"><FolderOpen size={20} /></div>
                            <div><p className="text-2xl font-bold">{stats.totalCategories}</p><p className="text-xs text-muted-foreground">Kategori</p></div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/20 rounded-lg text-emerald-500"><Eye size={20} /></div>
                            <div><p className="text-2xl font-bold">{filtered.length}</p><p className="text-xs text-muted-foreground">Görüntülenen</p></div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-orange-500/20 rounded-lg text-orange-500"><Download size={20} /></div>
                            <div><p className="text-2xl font-bold">{stats.totalSize}</p><p className="text-xs text-muted-foreground">Toplam Boyut</p></div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Category chips */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                <button onClick={() => setCategoryFilter('')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${!categoryFilter ? 'bg-primary text-primary-foreground' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    Tümü ({images.length})
                </button>
                {categories.map(c => (
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

            {/* Empty state */}
            {filtered.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                    <Image size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Görsel bulunamadı</p>
                    <p className="text-sm mt-1">{search ? 'Arama kriterlerinizi değiştirmeyi deneyin' : 'Henüz yüklenmiş görsel yok'}</p>
                </div>
            )}

            {/* Grid / List View */}
            {filtered.length > 0 && viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filtered.map(img => (
                        <Card key={img.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition"
                            onClick={() => setSelectedImage(img)}>
                            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                                    <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition" />
                                </div>
                                <Badge variant="secondary" className="absolute top-2 left-2 text-xs">{img.category}</Badge>
                            </div>
                            <div className="p-2.5">
                                <p className="text-sm font-medium truncate">{img.alt}</p>
                                <p className="text-xs text-muted-foreground">{img.size}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : filtered.length > 0 && (
                <Card className="overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800/50 border-b">
                            <tr>
                                <th className="p-3 text-left">Önizleme</th>
                                <th className="p-3 text-left">Dosya Adı</th>
                                <th className="p-3 text-left">Kategori</th>
                                <th className="p-3 text-left">Boyut</th>
                                <th className="p-3 text-left">Tarih</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(img => (
                                <tr key={img.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/30 transition cursor-pointer"
                                    onClick={() => setSelectedImage(img)}>
                                    <td className="p-2"><img src={img.url} alt={img.alt} className="w-12 h-9 object-cover rounded" loading="lazy" /></td>
                                    <td className="p-3 font-medium">{img.fileName}</td>
                                    <td className="p-3"><Badge variant="outline" className="text-xs">{img.category}</Badge></td>
                                    <td className="p-3 text-xs">{img.size}</td>
                                    <td className="p-3 text-xs">{new Date(img.modifiedAt).toLocaleDateString('tr')}</td>
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
                                    <p className="text-sm font-medium text-muted-foreground">Dosya Adı</p>
                                    <p className="text-sm">{selectedImage.fileName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                                    <Badge className="mt-1">{selectedImage.category}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Dosya Boyutu</p>
                                    <p className="text-sm">{selectedImage.size}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Son Düzenleme</p>
                                    <p className="text-sm">{new Date(selectedImage.modifiedAt).toLocaleDateString('tr', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">URL</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex-1 truncate">{selectedImage.url}</code>
                                        <button onClick={() => navigator.clipboard.writeText(selectedImage.url)}
                                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" title="URL kopyala">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
