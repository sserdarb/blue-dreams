'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'

interface TextBlockData {
    label?: string
    heading?: string
    headingAccent?: string
    content?: string
    backgroundColor?: string
}

export function TextBlockEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<TextBlockData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof TextBlockData, value: any) => {
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
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Etiket (Label)</label>
                    <input type="text" value={data.label || ''} onChange={e => set('label', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Hikayemiz" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arka Plan Rengi</label>
                    <select value={data.backgroundColor || 'white'} onChange={e => set('backgroundColor', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm">
                        <option value="white">Beyaz</option>
                        <option value="sand">Kum</option>
                        <option value="dark">Koyu</option>
                        <option value="gradient">Gradient</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={data.heading || ''} onChange={e => set('heading', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2" placeholder="Konfor ve" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vurgulu Başlık</label>
                    <input type="text" value={data.headingAccent || ''} onChange={e => set('headingAccent', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2" placeholder="Zerafet" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
                <textarea value={data.content || ''} onChange={e => set('content', e.target.value)}
                    rows={4} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Metin içeriği..." />
            </div>
            {isDirty && (
                <button onClick={handleSave} disabled={saving}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            )}
        </div>
    )
}
