'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'

interface MapData {
    lat?: number
    lng?: number
    zoom?: number
}

export function MapEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<MapData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof MapData, value: any) => {
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
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enlem (Lat)</label>
                    <input type="number" step="any" value={data.lat ?? ''} onChange={e => set('lat', parseFloat(e.target.value))}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="37.091832" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Boylam (Lng)</label>
                    <input type="number" step="any" value={data.lng ?? ''} onChange={e => set('lng', parseFloat(e.target.value))}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="27.4824998" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
                    <input type="number" min={1} max={20} value={data.zoom ?? 15} onChange={e => set('zoom', parseInt(e.target.value))}
                        className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
            </div>
            {data.lat && data.lng && (
                <div className="rounded-lg overflow-hidden border">
                    <iframe
                        src={`https://www.google.com/maps?q=${data.lat},${data.lng}&z=${data.zoom || 15}&output=embed`}
                        width="100%" height="250" style={{ border: 0 }} loading="lazy"
                    />
                </div>
            )}
            <p className="text-xs text-gray-500">
                💡 Google Maps'ten koordinat almak için: Haritada sağ tıklayın → Enlem ve boylamı kopyalayın
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
