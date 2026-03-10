'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Type, Sparkles } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorTextarea, EditorImageField, EditorRepeater, SaveBar, EditorGrid2 } from './EditorUI'

interface ExperienceItem {
    title?: string
    description?: string
    imageUrl?: string
}

interface ExperienceData {
    title?: string
    subtitle?: string
    items?: ExperienceItem[]
}

export function ExperienceEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<ExperienceData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof ExperienceData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const items = data.items || []

    const handleSave = async () => {
        setSaving(true)
        try { await updateWidget(id, data); setIsDirty(false) }
        catch (e) { console.error('Save failed:', e) }
        setSaving(false)
    }

    return (
        <div className="space-y-4">
            <EditorSection title="Bölüm Başlığı" icon={<Type size={14} />} defaultOpen>
                <EditorGrid2>
                    <EditorField label="Ana Başlık">
                        <EditorInput value={data.title || ''} onChange={v => set('title', v)} placeholder="Deneyimler" />
                    </EditorField>
                    <EditorField label="Alt Başlık (Opsiyonel)">
                        <EditorInput value={data.subtitle || ''} onChange={v => set('subtitle', v)} placeholder="Unutulmaz anılar..." />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="Deneyim Öğeleri" icon={<Sparkles size={14} />} badge={items.length} defaultOpen>
                <EditorRepeater<ExperienceItem>
                    items={items}
                    onUpdate={newItems => set('items', newItems)}
                    createNewItem={() => ({ title: '', description: '', imageUrl: '' })}
                    addLabel="Deneyim Ekle"
                    emptyMessage="Henüz deneyim eklenmedi"
                    renderItem={(item, _i, update) => (
                        <div className="space-y-3">
                            <EditorImageField
                                value={item.imageUrl || ''}
                                onChange={v => update({ ...item, imageUrl: v })}
                                label="Kapak Görseli URL"
                            />
                            <EditorField label="Deneyim Başlığı">
                                <EditorInput value={item.title || ''} onChange={v => update({ ...item, title: v })} placeholder="Örn: Spa & Wellness" />
                            </EditorField>
                            <EditorField label="Kısa Açıklama">
                                <EditorTextarea value={item.description || ''} onChange={v => update({ ...item, description: v })} placeholder="Deneyim detayı..." rows={2} />
                            </EditorField>
                        </div>
                    )}
                />
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
