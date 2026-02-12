'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'

interface RoomListData {
    title?: string
    subtitle?: string
    maxRooms?: number
    showPrices?: boolean
    layout?: 'grid' | 'list'
}

export function RoomListEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<RoomListData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleChange = (field: keyof RoomListData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
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
                <input type="text" value={data.title || ''} onChange={e => handleChange('title', e.target.value)}
                    placeholder="Odalarımız" className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                <input type="text" value={data.subtitle || ''} onChange={e => handleChange('subtitle', e.target.value)}
                    placeholder="En iyi odalarımızı keşfedin" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gösterilecek Oda Sayısı</label>
                    <input type="number" value={data.maxRooms || 6} onChange={e => handleChange('maxRooms', parseInt(e.target.value))}
                        min={1} max={20} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Görünüm</label>
                    <select value={data.layout || 'grid'} onChange={e => handleChange('layout', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm">
                        <option value="grid">Kart Görünümü</option>
                        <option value="list">Liste Görünümü</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input type="checkbox" checked={data.showPrices ?? true}
                    onChange={e => handleChange('showPrices', e.target.checked)}
                    className="rounded border-gray-300" id={`prices-${id}`} />
                <label htmlFor={`prices-${id}`} className="text-sm text-gray-700">Fiyat bilgisi göster</label>
            </div>
            <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                ℹ️ Odalar veritabanındaki Room tablosundan otomatik çekilir
            </p>
            {isDirty && (
                <button onClick={handleSave} disabled={saving}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            )}
        </div>
    )
}
