'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface StatItem { icon: string; value: string; label: string }

interface StatsData {
    items?: StatItem[]
}

export function StatsEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<StatsData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const items = data.items || []

    const set = (value: any) => {
        setData({ items: value })
        setIsDirty(true)
    }

    const updateItem = (i: number, field: keyof StatItem, value: string) => {
        const ni = [...items]; ni[i] = { ...ni[i], [field]: value }; set(ni)
    }

    const addItem = () => set([...items, { icon: 'star', value: '', label: '' }])
    const removeItem = (i: number) => set(items.filter((_: any, idx: number) => idx !== i))

    const handleSave = async () => {
        setSaving(true)
        try { await updateWidget(id, data); setIsDirty(false) }
        catch (e) { console.error('Save failed:', e) }
        setSaving(false)
    }

    const iconOptions = ['award', 'users', 'calendar', 'mappin', 'star', 'heart', 'globe', 'building', 'bed', 'utensils']

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">İstatistik Öğeleri ({items.length})</label>
                <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs text-blue-600">
                    <Plus size={14} /> Öğe Ekle
                </button>
            </div>
            {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center p-2 bg-gray-50 rounded-lg">
                    <select value={item.icon} onChange={e => updateItem(i, 'icon', e.target.value)}
                        className="w-24 border rounded px-2 py-1 text-sm">
                        {iconOptions.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                    <input type="text" value={item.value} onChange={e => updateItem(i, 'value', e.target.value)}
                        className="w-20 border rounded px-2 py-1 text-sm font-bold text-center" placeholder="5★" />
                    <input type="text" value={item.label} onChange={e => updateItem(i, 'label', e.target.value)}
                        className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Etiket" />
                    <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                    </button>
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
