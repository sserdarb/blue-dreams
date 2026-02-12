'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface ExperienceItem {
    title?: string
    description?: string
    imageUrl?: string
}

interface ExperienceData {
    title?: string
    subtitle?: string
    items?: ExperienceItem[]
}

export function ExperienceEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<ExperienceData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const items = data.items || []

    const updateItem = (index: number, field: keyof ExperienceItem, value: string) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setData({ ...data, items: newItems })
        setIsDirty(true)
    }

    const addItem = () => {
        setData({ ...data, items: [...items, { title: '', description: '', imageUrl: '' }] })
        setIsDirty(true)
    }

    const removeItem = (index: number) => {
        setData({ ...data, items: items.filter((_, i) => i !== index) })
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
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                <input type="text" value={data.title || ''} onChange={e => { setData({ ...data, title: e.target.value }); setIsDirty(true) }}
                    placeholder="Deneyimler" className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                <input type="text" value={data.subtitle || ''} onChange={e => { setData({ ...data, subtitle: e.target.value }); setIsDirty(true) }}
                    placeholder="Alt başlık" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Deneyim Öğeleri</label>
                <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                    <Plus size={14} /> Ekle
                </button>
            </div>
            {items.map((item, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex gap-2 items-center">
                        <input type="text" value={item.title || ''} onChange={e => updateItem(i, 'title', e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Deneyim başlığı" />
                        <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <input type="url" value={item.imageUrl || ''} onChange={e => updateItem(i, 'imageUrl', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm" placeholder="Görsel URL" />
                    <textarea value={item.description || ''} onChange={e => updateItem(i, 'description', e.target.value)}
                        rows={2} className="w-full border rounded px-2 py-1 text-sm" placeholder="Açıklama" />
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
