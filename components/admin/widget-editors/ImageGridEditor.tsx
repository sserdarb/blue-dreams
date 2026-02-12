'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface GridItem {
    image?: string
    title?: string
    description?: string
    badge?: string
    meta?: string
    meta2?: string
}

interface ImageGridData {
    label?: string
    heading?: string
    items?: GridItem[]
    variant?: string
    columns?: number
}

export function ImageGridEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<ImageGridData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof ImageGridData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const items = data.items || []

    const updateItem = (i: number, field: keyof GridItem, value: string) => {
        const newItems = [...items]
        newItems[i] = { ...newItems[i], [field]: value }
        set('items', newItems)
    }

    const addItem = () => set('items', [...items, { image: '', title: '', description: '' }])
    const removeItem = (i: number) => set('items', items.filter((_, idx) => idx !== i))

    const handleSave = async () => {
        setSaving(true)
        try { await updateWidget(id, data); setIsDirty(false) }
        catch (e) { console.error('Save failed:', e) }
        setSaving(false)
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Etiket (Label)</label>
                    <input type="text" value={data.label || ''} onChange={e => set('label', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Bodrum" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={data.heading || ''} onChange={e => set('heading', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Keşfedilecek Yerler" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Görünüm</label>
                    <select value={data.variant || 'card'} onChange={e => set('variant', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm">
                        <option value="card">Kart</option>
                        <option value="overlay">Overlay</option>
                        <option value="simple">Basit</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sütun Sayısı</label>
                    <select value={data.columns || 3} onChange={e => set('columns', parseInt(e.target.value))}
                        className="w-full border rounded-lg px-3 py-2 text-sm">
                        <option value={2}>2 Sütun</option>
                        <option value={3}>3 Sütun</option>
                        <option value={4}>4 Sütun</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Öğeler ({items.length})</label>
                <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                    <Plus size={14} /> Öğe Ekle
                </button>
            </div>
            {items.map((item, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                        <input type="text" value={item.title || ''} onChange={e => updateItem(i, 'title', e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-sm font-medium" placeholder="Başlık" />
                        <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <input type="url" value={item.image || ''} onChange={e => updateItem(i, 'image', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm" placeholder="Görsel URL" />
                    {item.image && <img src={item.image} alt={item.title} className="h-16 w-full object-cover rounded" />}
                    <textarea value={item.description || ''} onChange={e => updateItem(i, 'description', e.target.value)}
                        rows={2} className="w-full border rounded px-2 py-1 text-sm" placeholder="Açıklama" />
                    <div className="grid grid-cols-3 gap-2">
                        <input type="text" value={item.badge || ''} onChange={e => updateItem(i, 'badge', e.target.value)}
                            className="border rounded px-2 py-1 text-xs" placeholder="Badge" />
                        <input type="text" value={item.meta || ''} onChange={e => updateItem(i, 'meta', e.target.value)}
                            className="border rounded px-2 py-1 text-xs" placeholder="Meta (saat vb.)" />
                        <input type="text" value={item.meta2 || ''} onChange={e => updateItem(i, 'meta2', e.target.value)}
                            className="border rounded px-2 py-1 text-xs" placeholder="Meta 2" />
                    </div>
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
