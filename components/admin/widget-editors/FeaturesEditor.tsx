'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Type, LayoutTemplate, Star } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorSelect, EditorTextarea, EditorRepeater, SaveBar, EditorGrid2 } from './EditorUI'

interface Feature {
    icon?: string
    title?: string
    description?: string
}

interface FeaturesData {
    title?: string
    subtitle?: string
    features?: Feature[]
    columns?: number
    style?: 'cards' | 'icons' | 'minimal'
}

const ICON_OPTIONS = [
    { value: 'star', label: '⭐ Star' },
    { value: 'heart', label: '❤️ Heart' },
    { value: 'check', label: '✓ Check' },
    { value: 'sparkles', label: '✨ Sparkles' },
    { value: 'sun', label: '☀️ Sun' },
    { value: 'moon', label: '🌙 Moon' },
    { value: 'coffee', label: '☕ Coffee' },
    { value: 'utensils', label: '🍴 Dining' },
    { value: 'bed', label: '🛏️ Bed' },
    { value: 'spa', label: '💆 Spa' },
    { value: 'pool', label: '🏊 Pool' },
    { value: 'wifi', label: '📶 WiFi' },
    { value: 'parking', label: '🅿️ Parking' },
    { value: 'gym', label: '💪 Gym' },
]

export function FeaturesEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<FeaturesData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return { features: [] } }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof FeaturesData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try { await updateWidget(id, data); setIsDirty(false) }
        catch (e) { alert('Failed to save') }
        setSaving(false)
    }

    return (
        <div className="space-y-4">
            <EditorSection title="Başlık & İçerik" icon={<Type size={14} />} defaultOpen>
                <EditorGrid2>
                    <EditorField label="Bölüm Başlığı">
                        <EditorInput value={data.title || ''} onChange={v => set('title', v)} placeholder="Öne Çıkan Özellikler" />
                    </EditorField>
                    <EditorField label="Bölüm Alt Başlığı">
                        <EditorInput value={data.subtitle || ''} onChange={v => set('subtitle', v)} placeholder="Konforunuz için düşünüldü..." />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="Görünüm Seçenekleri" icon={<LayoutTemplate size={14} />}>
                <EditorGrid2>
                    <EditorField label="Sütun Sayısı">
                        <EditorSelect
                            value={data.columns || 3}
                            onChange={v => set('columns', parseInt(v))}
                            options={[
                                { value: 2, label: '2 Sütun' },
                                { value: 3, label: '3 Sütun' },
                                { value: 4, label: '4 Sütun' },
                            ]}
                        />
                    </EditorField>
                    <EditorField label="Kart Stili">
                        <EditorSelect
                            value={data.style || 'cards'}
                            onChange={v => set('style', v)}
                            options={[
                                { value: 'cards', label: 'Kart (Gölgeli)' },
                                { value: 'icons', label: 'Sadece İkonlar' },
                                { value: 'minimal', label: 'Minimal' },
                            ]}
                        />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="Özellikler Listesi" icon={<Star size={14} />} badge={data.features?.length || 0}>
                <EditorRepeater<Feature>
                    items={data.features || []}
                    onUpdate={items => set('features', items)}
                    createNewItem={() => ({ icon: 'star', title: '', description: '' })}
                    addLabel="Özellik Ekle"
                    emptyMessage="Henüz özellik eklenmedi"
                    renderItem={(feature, _i, update) => (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="w-32 shrink-0">
                                    <EditorSelect
                                        value={feature.icon || 'star'}
                                        onChange={v => update({ ...feature, icon: v })}
                                        options={ICON_OPTIONS}
                                    />
                                </div>
                                <div className="flex-1">
                                    <EditorInput
                                        value={feature.title || ''}
                                        onChange={v => update({ ...feature, title: v })}
                                        placeholder="Başlık"
                                    />
                                </div>
                            </div>
                            <EditorTextarea
                                value={feature.description || ''}
                                onChange={v => update({ ...feature, description: v })}
                                placeholder="Açıklama (opsiyonel)"
                                rows={2}
                            />
                        </div>
                    )}
                />
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
