'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Type, MessageSquare, Star, Link as LinkIcon } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorTextarea, EditorRepeater, SaveBar, EditorGrid2 } from './EditorUI'

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
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return { reviews: [] } }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof ReviewsData, value: any) => {
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
            <EditorSection title="Başlık & Kaynak" icon={<Type size={14} />} defaultOpen>
                <EditorGrid2>
                    <EditorField label="Etiket (Badge)">
                        <EditorInput value={data.label || ''} onChange={v => set('label', v)} placeholder="Misafir Yorumları" />
                    </EditorField>
                    <EditorField label="Kaynak (Platform)">
                        <EditorInput value={data.sourceLabel || ''} onChange={v => set('sourceLabel', v)} placeholder="Google Yorumu" />
                    </EditorField>
                </EditorGrid2>
                <div className="mt-3"></div>
                <EditorGrid2>
                    <EditorField label="Başlık">
                        <EditorInput value={data.heading || ''} onChange={v => set('heading', v)} placeholder="Sizden Gelen" />
                    </EditorField>
                    <EditorField label="Vurgulu Başlık">
                        <EditorInput value={data.headingAccent || ''} onChange={v => set('headingAccent', v)} placeholder="Güzel Sözler" />
                    </EditorField>
                </EditorGrid2>
                <div className="mt-3">
                    <EditorField label="Açıklama">
                        <EditorTextarea value={data.description || ''} onChange={v => set('description', v)} placeholder="Gerçek misafir deneyimleri..." rows={2} />
                    </EditorField>
                </div>
            </EditorSection>

            <EditorSection title="Dış Kaynak Puanı (Örn: Booking.com)" icon={<Star size={14} />} defaultOpen={false}>
                <EditorGrid2>
                    <EditorField label="Genel Puan">
                        <EditorInput value={data.bookingScore || ''} onChange={v => set('bookingScore', v)} placeholder="9.4" />
                    </EditorField>
                    <EditorField label="Puan Etiketi">
                        <EditorInput value={data.bookingLabel || ''} onChange={v => set('bookingLabel', v)} placeholder="Booking.com Puanı" />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="Misafir Yorumları" icon={<MessageSquare size={14} />} badge={data.reviews?.length || 0} defaultOpen>
                <EditorRepeater<Review>
                    items={data.reviews || []}
                    onUpdate={items => set('reviews', items)}
                    createNewItem={() => ({ author: '', text: '', rating: 5 })}
                    addLabel="Yorum Ekle"
                    emptyMessage="Henüz yorum eklenmedi"
                    renderItem={(r, _i, update) => (
                        <div className="space-y-3">
                            <div className="flex gap-3 items-center">
                                <div className="flex-1">
                                    <EditorField label="Misafir Adı">
                                        <EditorInput value={r.author} onChange={v => update({ ...r, author: v })} placeholder="Misafir adı soyadı" />
                                    </EditorField>
                                </div>
                                <div>
                                    <EditorField label="Puan">
                                        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 mt-0.5">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => update({ ...r, rating: star })}
                                                    className={`p-1.5 transition-colors ${star <= r.rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                                                >
                                                    <Star size={18} fill={star <= r.rating ? 'currentColor' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </EditorField>
                                </div>
                            </div>
                            <EditorField label="Yorum Metni">
                                <EditorTextarea value={r.text} onChange={v => update({ ...r, text: v })} placeholder="Yorum içeriği..." rows={3} />
                            </EditorField>
                        </div>
                    )}
                />
            </EditorSection>

            <EditorSection title="Yönlendirme Butonu" icon={<LinkIcon size={14} />} defaultOpen={false}>
                <EditorGrid2>
                    <EditorField label="Buton Metni">
                        <EditorInput value={data.buttonText || ''} onChange={v => set('buttonText', v)} placeholder="Tüm Yorumları Oku" />
                    </EditorField>
                    <EditorField label="Buton URL">
                        <EditorInput value={data.buttonUrl || ''} onChange={v => set('buttonUrl', v)} placeholder="https://..." type="url" />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
