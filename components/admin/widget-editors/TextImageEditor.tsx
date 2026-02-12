'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface Button { text: string; url: string; variant: string }

interface TextImageData {
    label?: string
    heading?: string
    headingAccent?: string
    paragraphs?: string[]
    image?: string
    imageAlt?: string
    imagePosition?: string
    badge?: { value: string; label: string }
    buttons?: Button[]
    listItems?: string[]
}

export function TextImageEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<TextImageData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof TextImageData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const paragraphs = data.paragraphs || []
    const buttons = data.buttons || []
    const listItems = data.listItems || []

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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Etiket</label>
                    <input type="text" value={data.label || ''} onChange={e => set('label', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Naya Spa" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={data.heading || ''} onChange={e => set('heading', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="25 Yıllık" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vurgulu Başlık</label>
                    <input type="text" value={data.headingAccent || ''} onChange={e => set('headingAccent', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Tutku" />
                </div>
            </div>

            {/* Paragraphs */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Paragraflar</label>
                    <button type="button" onClick={() => set('paragraphs', [...paragraphs, ''])}
                        className="flex items-center gap-1 text-xs text-blue-600"><Plus size={14} /> Ekle</button>
                </div>
                {paragraphs.map((p, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <textarea value={p} onChange={e => {
                            const newP = [...paragraphs]; newP[i] = e.target.value; set('paragraphs', newP)
                        }} rows={2} className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Paragraf metni" />
                        <button type="button" onClick={() => set('paragraphs', paragraphs.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-600 self-start mt-1"><Trash2 size={14} /></button>
                    </div>
                ))}
            </div>

            {/* Image */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL</label>
                    <input type="url" value={data.image || ''} onChange={e => set('image', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Görsel Alt Metin</label>
                    <input type="text" value={data.imageAlt || ''} onChange={e => set('imageAlt', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Blue Dreams Resort" />
                </div>
            </div>
            {data.image && <img src={data.image} alt={data.imageAlt} className="h-24 w-full object-cover rounded-lg" />}

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Görsel Pozisyonu</label>
                    <select value={data.imagePosition || 'right'} onChange={e => set('imagePosition', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm">
                        <option value="right">Sağ</option>
                        <option value="left">Sol</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Badge Değer</label>
                        <input type="text" value={data.badge?.value || ''} onChange={e => set('badge', { ...data.badge, value: e.target.value, label: data.badge?.label || '' })}
                            className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="25+" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Badge Etiket</label>
                        <input type="text" value={data.badge?.label || ''} onChange={e => set('badge', { ...data.badge, label: e.target.value, value: data.badge?.value || '' })}
                            className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Yıl" />
                    </div>
                </div>
            </div>

            {/* List Items */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Liste Öğeleri (isteğe bağlı)</label>
                    <button type="button" onClick={() => set('listItems', [...listItems, ''])}
                        className="flex items-center gap-1 text-xs text-blue-600"><Plus size={14} /> Ekle</button>
                </div>
                {listItems.map((item, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                        <input type="text" value={item} onChange={e => {
                            const newL = [...listItems]; newL[i] = e.target.value; set('listItems', newL)
                        }} className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Liste öğesi" />
                        <button type="button" onClick={() => set('listItems', listItems.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                ))}
            </div>

            {/* Buttons */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Butonlar</label>
                    <button type="button" onClick={() => set('buttons', [...buttons, { text: '', url: '', variant: 'primary' }])}
                        className="flex items-center gap-1 text-xs text-blue-600"><Plus size={14} /> Ekle</button>
                </div>
                {buttons.map((btn, i) => (
                    <div key={i} className="flex gap-2 items-center mb-2">
                        <input type="text" value={btn.text} onChange={e => {
                            const newB = [...buttons]; newB[i] = { ...newB[i], text: e.target.value }; set('buttons', newB)
                        }} className="w-1/3 border rounded px-2 py-1 text-sm" placeholder="Buton metni" />
                        <input type="url" value={btn.url} onChange={e => {
                            const newB = [...buttons]; newB[i] = { ...newB[i], url: e.target.value }; set('buttons', newB)
                        }} className="flex-1 border rounded px-2 py-1 text-sm" placeholder="URL" />
                        <select value={btn.variant} onChange={e => {
                            const newB = [...buttons]; newB[i] = { ...newB[i], variant: e.target.value }; set('buttons', newB)
                        }} className="w-24 border rounded px-1 py-1 text-xs">
                            <option value="primary">Primary</option>
                            <option value="outline">Outline</option>
                            <option value="white">White</option>
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
