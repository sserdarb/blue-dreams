'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Type, PaintBucket, MousePointerClick } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorSelect, EditorRepeater, SaveBar, EditorGrid2 } from './EditorUI'

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

    const handleSave = async () => {
        setSaving(true)
        try { await updateWidget(id, data); setIsDirty(false) }
        catch (e) { console.error('Save failed:', e) }
        setSaving(false)
    }

    return (
        <div className="space-y-4">
            <EditorSection title="İçerik" icon={<Type size={14} />} defaultOpen>
                <EditorField label="Başlık">
                    <EditorInput value={data.heading || ''} onChange={v => set('heading', v)} placeholder="Sizi Bekliyoruz" />
                </EditorField>
                <EditorField label="Alt Başlık">
                    <EditorInput value={data.subtitle || ''} onChange={v => set('subtitle', v)} placeholder="Hayalinizdeki tatili birlikte planlayalım." />
                </EditorField>
            </EditorSection>

            <EditorSection title="Stil" icon={<PaintBucket size={14} />}>
                <EditorField label="Arka Plan">
                    <EditorSelect
                        value={data.backgroundColor || 'white'}
                        onChange={v => set('backgroundColor', v)}
                        options={[
                            { value: 'white', label: 'Beyaz' },
                            { value: 'dark', label: 'Koyu' },
                            { value: 'brand', label: 'Marka Rengi' },
                            { value: 'gradient', label: 'Gradient' },
                        ]}
                    />
                </EditorField>
            </EditorSection>

            <EditorSection title="Butonlar" icon={<MousePointerClick size={14} />} badge={data.buttons?.length || 0}>
                <EditorRepeater<Button>
                    items={data.buttons || []}
                    onUpdate={items => set('buttons', items)}
                    createNewItem={() => ({ text: '', url: '', variant: 'primary' })}
                    addLabel="Buton Ekle"
                    emptyMessage="Henüz buton eklenmedi"
                    renderItem={(btn, _i, update) => (
                        <div className="space-y-2">
                            <EditorGrid2>
                                <EditorInput value={btn.text} onChange={v => update({ ...btn, text: v })} placeholder="Buton metni" />
                                <EditorInput value={btn.url} onChange={v => update({ ...btn, url: v })} placeholder="URL" type="url" />
                            </EditorGrid2>
                            <EditorSelect
                                value={btn.variant}
                                onChange={v => update({ ...btn, variant: v })}
                                options={[
                                    { value: 'primary', label: '● Primary' },
                                    { value: 'outline', label: '○ Outline' },
                                    { value: 'white', label: '◌ White' },
                                    { value: 'white-outline', label: '◌ White Outline' },
                                ]}
                            />
                        </div>
                    )}
                />
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
