'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface Button { text: string; url: string; style: string; external?: boolean }

interface HeroData {
    badge?: string
    titleLine1?: string
    titleLine2?: string
    subtitle?: string
    backgroundImage?: string
    scrollText?: string
    buttons?: Button[]
}

export function HeroEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<HeroData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof HeroData, value: any) => {
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                <input type="text" value={data.badge || ''} onChange={e => set('badge', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Bodrum'un İncisi" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık Satır 1</label>
                    <input type="text" value={data.titleLine1 || ''} onChange={e => set('titleLine1', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2" placeholder="Ege'nin Mavi" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık Satır 2 (Vurgu)</label>
                    <input type="text" value={data.titleLine2 || ''} onChange={e => set('titleLine2', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2" placeholder="Rüyası" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                <textarea value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)}
                    rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Doğanın kalbinde..." />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arka Plan Görseli</label>
                <input type="url" value={data.backgroundImage || ''} onChange={e => set('backgroundImage', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                {data.backgroundImage && (
                    <img src={data.backgroundImage} alt="bg" className="mt-2 h-32 w-full object-cover rounded-lg" />
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scroll Metni</label>
                <input type="text" value={data.scrollText || ''} onChange={e => set('scrollText', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Keşfet" />
            </div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Butonlar</label>
                    <button type="button" onClick={() => set('buttons', [...buttons, { text: '', url: '', style: 'primary' }])}
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
                        <select value={btn.style} onChange={e => {
                            const nb = [...buttons]; nb[i] = { ...nb[i], style: e.target.value }; set('buttons', nb)
                        }} className="w-24 border rounded px-1 py-1 text-xs">
                            <option value="primary">Primary</option>
                            <option value="outline">Outline</option>
                        </select>
                        <label className="flex items-center gap-1 text-xs">
                            <input type="checkbox" checked={!!btn.external} onChange={e => {
                                const nb = [...buttons]; nb[i] = { ...nb[i], external: e.target.checked }; set('buttons', nb)
                            }} />
                            Dış
                        </label>
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
