'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface Review { author: string; text: string; rating: number }

interface ReviewsData {
    label?: string
    heading?: string
    headingAccent?: string
    description?: string
    bookingScore?: string
    bookingLabel?: string
    buttonText?: string
    buttonUrl?: string
    reviews?: Review[]
    sourceLabel?: string
}

export function ReviewsEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<ReviewsData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof ReviewsData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const reviews = data.reviews || []

    const addReview = () => set('reviews', [...reviews, { author: '', text: '', rating: 5 }])
    const removeReview = (i: number) => set('reviews', reviews.filter((_, idx) => idx !== i))

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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Etiket</label>
                    <input type="text" value={data.label || ''} onChange={e => set('label', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Misafir Yorumları" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kaynak</label>
                    <input type="text" value={data.sourceLabel || ''} onChange={e => set('sourceLabel', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Google Yorumu" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={data.heading || ''} onChange={e => set('heading', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Sizden Gelen" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vurgulu Başlık</label>
                    <input type="text" value={data.headingAccent || ''} onChange={e => set('headingAccent', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Güzel Sözler" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea value={data.description || ''} onChange={e => set('description', e.target.value)}
                    rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Gerçek deneyimler..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booking.com Puanı</label>
                    <input type="text" value={data.bookingScore || ''} onChange={e => set('bookingScore', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="9.4" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Puan Etiketi</label>
                    <input type="text" value={data.bookingLabel || ''} onChange={e => set('bookingLabel', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Booking.com Puanı" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buton Metni</label>
                    <input type="text" value={data.buttonText || ''} onChange={e => set('buttonText', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Tüm Yorumları Oku" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buton URL</label>
                    <input type="url" value={data.buttonUrl || ''} onChange={e => set('buttonUrl', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Yorumlar ({reviews.length})</label>
                <button type="button" onClick={addReview} className="flex items-center gap-1 text-xs text-blue-600">
                    <Plus size={14} /> Yorum Ekle
                </button>
            </div>
            {reviews.map((r, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex gap-2 items-center">
                        <input type="text" value={r.author} onChange={e => {
                            const nr = [...reviews]; nr[i] = { ...nr[i], author: e.target.value }; set('reviews', nr)
                        }} className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Misafir adı" />
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} type="button" onClick={() => {
                                    const nr = [...reviews]; nr[i] = { ...nr[i], rating: star }; set('reviews', nr)
                                }} className={`text-lg ${star <= r.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    ★
                                </button>
                            ))}
                        </div>
                        <button type="button" onClick={() => removeReview(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <textarea value={r.text} onChange={e => {
                        const nr = [...reviews]; nr[i] = { ...nr[i], text: e.target.value }; set('reviews', nr)
                    }} rows={2} className="w-full border rounded px-2 py-1 text-sm" placeholder="Yorum metni" />
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
