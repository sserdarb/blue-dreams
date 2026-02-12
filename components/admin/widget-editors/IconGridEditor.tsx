'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface IconItem { icon: string; title: string; description: string }

interface IconGridData {
    label?: string
    heading?: string
    backgroundColor?: string
    items?: IconItem[]
    columns?: number
}

export function IconGridEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<IconGridData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof IconGridData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const items = data.items || []

    const updateItem = (i: number, field: keyof IconItem, value: string) => {
        const ni = [...items]; ni[i] = { ...ni[i], [field]: value }; set('items', ni)
    }

    const addItem = () => set('items', [...items, { icon: '⭐', title: '', description: '' }])
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
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Değerlerimiz" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={data.heading || ''} onChange={e => set('heading', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Temel İlkelerimiz" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arka Plan</label>
                    <select value={data.backgroundColor || 'white'} onChange={e => set('backgroundColor', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm">
                        <option value="white">Beyaz</option>
                        <option value="dark">Koyu</option>
                        <option value="sand">Kum</option>
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
                <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs text-blue-600">
                    <Plus size={14} /> Öğe Ekle
                </button>
            </div>
            {items.map((item, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex gap-2 items-center">
                        <input type="text" value={item.icon} onChange={e => updateItem(i, 'icon', e.target.value)}
                            className="w-16 border rounded px-2 py-1 text-lg text-center" placeholder="🌊" />
                        <input type="text" value={item.title} onChange={e => updateItem(i, 'title', e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-sm font-medium" placeholder="Başlık" />
                        <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <input type="text" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm" placeholder="Açıklama" />
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
