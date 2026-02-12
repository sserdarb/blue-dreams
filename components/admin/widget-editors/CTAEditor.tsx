'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface Button { text: string; url: string; variant: string }

interface CTAData {
    heading?: string
    subtitle?: string
    backgroundColor?: string
    buttons?: Button[]
}

export function CTAEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<CTAData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof CTAData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const buttons = data.buttons || []

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
                <input type="text" value={data.heading || ''} onChange={e => set('heading', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2" placeholder="Sizi Bekliyoruz" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                <input type="text" value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Hayalinizdeki tatili birlikte planlayalım." />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arka Plan</label>
                <select value={data.backgroundColor || 'white'} onChange={e => set('backgroundColor', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="white">Beyaz</option>
                    <option value="dark">Koyu</option>
                    <option value="brand">Marka Rengi</option>
                    <option value="gradient">Gradient</option>
                </select>
            </div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Butonlar</label>
                    <button type="button" onClick={() => set('buttons', [...buttons, { text: '', url: '', variant: 'primary' }])}
                        className="flex items-center gap-1 text-xs text-blue-600"><Plus size={14} /> Buton Ekle</button>
                </div>
                {buttons.map((btn, i) => (
                    <div key={i} className="flex gap-2 items-center mb-2 p-2 bg-gray-50 rounded">
                        <input type="text" value={btn.text} onChange={e => {
                            const nb = [...buttons]; nb[i] = { ...nb[i], text: e.target.value }; set('buttons', nb)
                        }} className="w-1/3 border rounded px-2 py-1 text-sm" placeholder="Buton metni" />
                        <input type="url" value={btn.url} onChange={e => {
                            const nb = [...buttons]; nb[i] = { ...nb[i], url: e.target.value }; set('buttons', nb)
                        }} className="flex-1 border rounded px-2 py-1 text-sm" placeholder="URL" />
                        <select value={btn.variant} onChange={e => {
                            const nb = [...buttons]; nb[i] = { ...nb[i], variant: e.target.value }; set('buttons', nb)
                        }} className="w-28 border rounded px-1 py-1 text-xs">
                            <option value="primary">Primary</option>
                            <option value="outline">Outline</option>
                            <option value="white">White</option>
                            <option value="white-outline">White Outline</option>
                        </select>
                        <button type="button" onClick={() => set('buttons', buttons.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                ))}
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
