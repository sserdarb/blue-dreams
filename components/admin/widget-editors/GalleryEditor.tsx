'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface GalleryImage {
    src: string
    title?: string
    category?: string
}

interface GalleryData {
    images?: GalleryImage[]
}

export function GalleryEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<GalleryData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return { images: [] } }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const images = data.images || []

    const updateImage = (i: number, field: keyof GalleryImage, value: string) => {
        const ni = [...images]; ni[i] = { ...ni[i], [field]: value }
        setData({ ...data, images: ni })
        setIsDirty(true)
    }

    const addImage = () => {
        setData({ ...data, images: [...images, { src: '', title: '', category: '' }] })
        setIsDirty(true)
    }

    const removeImage = (i: number) => {
        setData({ ...data, images: images.filter((_, idx) => idx !== i) })
        setIsDirty(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try { await updateWidget(id, data); setIsDirty(false) }
        catch (e) { console.error('Save failed:', e) }
        setSaving(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Görseller ({images.length})</label>
                <button type="button" onClick={addImage} className="flex items-center gap-1 text-xs text-blue-600">
                    <Plus size={14} /> Görsel Ekle
                </button>
            </div>
            {images.map((img, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                        <input type="text" value={img.title || ''} onChange={e => updateImage(i, 'title', e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Görsel başlığı" />
                        <input type="text" value={img.category || ''} onChange={e => updateImage(i, 'category', e.target.value)}
                            className="w-32 border rounded px-2 py-1 text-sm" placeholder="Kategori" />
                        <button type="button" onClick={() => removeImage(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <input type="url" value={img.src} onChange={e => updateImage(i, 'src', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm" placeholder="https://... (src)" />
                    {img.src && <img src={img.src} alt={img.title} className="h-20 w-full object-cover rounded" />}
                </div>
            ))}
            {isDirty && (
                <button onClick={handleSave} disabled={saving}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            )}
        </div>
    )
}
