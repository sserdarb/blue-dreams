'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface Subject { value: string; label: string }

interface ContactData {
    infoLabel?: string
    infoHeading?: string
    infoHeadingAccent?: string
    address?: string
    phone?: string
    whatsapp?: string
    email?: string
    hours?: string
    socialLinks?: { facebook?: string; instagram?: string; youtube?: string; linkedin?: string }
    subjects?: Subject[]
}

export function ContactEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<ContactData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof ContactData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const socialLinks = data.socialLinks || {}
    const subjects = data.subjects || []

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
                    <input type="text" value={data.infoLabel || ''} onChange={e => set('infoLabel', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="İletişim Bilgileri" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={data.infoHeading || ''} onChange={e => set('infoHeading', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Bize" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vurgulu Başlık</label>
                    <input type="text" value={data.infoHeadingAccent || ''} onChange={e => set('infoHeadingAccent', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ulaşın" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input type="tel" value={data.phone || ''} onChange={e => set('phone', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="+90 252 337 11 11" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input type="tel" value={data.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="+90 549 516 78 03" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input type="email" value={data.email || ''} onChange={e => set('email', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="sales@bluedreamsresort.com" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <textarea value={data.address || ''} onChange={e => set('address', e.target.value)}
                    rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Adres bilgisi" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Saatleri</label>
                <textarea value={data.hours || ''} onChange={e => set('hours', e.target.value)}
                    rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Resepsiyon: 7/24&#10;Rezervasyon: 09:00 - 22:00" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sosyal Medya</label>
                <div className="grid grid-cols-2 gap-2">
                    <input type="url" value={socialLinks.facebook || ''} onChange={e => set('socialLinks', { ...socialLinks, facebook: e.target.value })}
                        className="border rounded px-2 py-1 text-sm" placeholder="Facebook URL" />
                    <input type="url" value={socialLinks.instagram || ''} onChange={e => set('socialLinks', { ...socialLinks, instagram: e.target.value })}
                        className="border rounded px-2 py-1 text-sm" placeholder="Instagram URL" />
                    <input type="url" value={socialLinks.youtube || ''} onChange={e => set('socialLinks', { ...socialLinks, youtube: e.target.value })}
                        className="border rounded px-2 py-1 text-sm" placeholder="YouTube URL" />
                    <input type="url" value={socialLinks.linkedin || ''} onChange={e => set('socialLinks', { ...socialLinks, linkedin: e.target.value })}
                        className="border rounded px-2 py-1 text-sm" placeholder="LinkedIn URL" />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">İletişim Konuları</label>
                    <button type="button" onClick={() => set('subjects', [...subjects, { value: '', label: '' }])}
                        className="flex items-center gap-1 text-xs text-blue-600"><Plus size={14} /> Ekle</button>
                </div>
                {subjects.map((s, i) => (
                    <div key={i} className="flex gap-2 items-center mb-1">
                        <input type="text" value={s.value} onChange={e => {
                            const ns = [...subjects]; ns[i] = { ...ns[i], value: e.target.value }; set('subjects', ns)
                        }} className="w-1/3 border rounded px-2 py-1 text-sm" placeholder="Değer (reservation)" />
                        <input type="text" value={s.label} onChange={e => {
                            const ns = [...subjects]; ns[i] = { ...ns[i], label: e.target.value }; set('subjects', ns)
                        }} className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Etiket (Rezervasyon)" />
                        <button type="button" onClick={() => set('subjects', subjects.filter((_, idx) => idx !== i))}
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
