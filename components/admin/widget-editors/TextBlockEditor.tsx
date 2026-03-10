'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Type, PaintBucket } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorTextarea, EditorSelect, SaveBar, EditorGrid2 } from './EditorUI'

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
            <EditorSection title="Başlık & İçerik" icon={<Type size={14} />} defaultOpen>
                <EditorField label="Etiket (Badge)" hint="Başlığın hemen üstünde küçük metin olarak gösterilir">
                    <EditorInput value={data.label || ''} onChange={v => set('label', v)} placeholder="Hikayemiz" />
                </EditorField>
                <EditorGrid2>
                    <EditorField label="Başlık">
                        <EditorInput value={data.heading || ''} onChange={v => set('heading', v)} placeholder="Konfor ve" />
                    </EditorField>
                    <EditorField label="Vurgulu Başlık">
                        <EditorInput value={data.headingAccent || ''} onChange={v => set('headingAccent', v)} placeholder="Zerafet" />
                    </EditorField>
                </EditorGrid2>
                <EditorField label="Metin İçeriği">
                    <EditorTextarea value={data.content || ''} onChange={v => set('content', v)} placeholder="Açıklama metni..." rows={5} />
                </EditorField>
            </EditorSection>

            <EditorSection title="Görünüm" icon={<PaintBucket size={14} />}>
                <EditorField label="Arka Plan Rengi">
                    <EditorSelect
                        value={data.backgroundColor || 'white'}
                        onChange={v => set('backgroundColor', v)}
                        options={[
                            { value: 'white', label: 'Beyaz' },
                            { value: 'sand', label: 'Kum' },
                            { value: 'dark', label: 'Koyu' },
                            { value: 'gradient', label: 'Gradient' },
                        ]}
                    />
                </EditorField>
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
