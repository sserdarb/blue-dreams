'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Type, PaintBucket, LayoutTemplate } from 'lucide-react'
import { EditorSection, EditorField, EditorSelect, EditorTextarea, SaveBar, EditorGrid2 } from './EditorUI'

interface TextData {
    content?: string
    backgroundColor?: string
    textColor?: string
    padding?: 'small' | 'medium' | 'large'
    maxWidth?: 'narrow' | 'medium' | 'full'
}

export function TextEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<TextData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return { content: '' } }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof TextData, value: any) => {
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
            <EditorSection title="Metin İçeriği" icon={<Type size={14} />} defaultOpen>
                <EditorField label="İçerik (HTML Destekli)" hint="Kullanılabilir etiketler: <h2>, <p>, <strong>, <em>, <ul>, <li>, <a>">
                    <EditorTextarea
                        value={data.content || ''}
                        onChange={v => set('content', v)}
                        placeholder="<h2>Hoş Geldiniz</h2><p>İçeriğinizi buraya girin...</p>"
                        rows={8}
                    />
                </EditorField>
            </EditorSection>

            <EditorSection title="Renk Seçenekleri" icon={<PaintBucket size={14} />} defaultOpen={false}>
                <EditorGrid2>
                    <EditorField label="Arka Plan Rengi">
                        <EditorSelect
                            value={data.backgroundColor || 'white'}
                            onChange={v => set('backgroundColor', v)}
                            options={[
                                { value: 'white', label: 'Beyaz' },
                                { value: 'gray', label: 'Açık Gri' },
                                { value: 'blue', label: 'Açık Mavi' },
                                { value: 'dark', label: 'Koyu' },
                            ]}
                        />
                    </EditorField>
                    <EditorField label="Metin Rengi">
                        <EditorSelect
                            value={data.textColor || 'dark'}
                            onChange={v => set('textColor', v)}
                            options={[
                                { value: 'dark', label: 'Koyu' },
                                { value: 'light', label: 'Açık' },
                                { value: 'blue', label: 'Mavi' },
                            ]}
                        />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="Sayfa Düzeni (Layout)" icon={<LayoutTemplate size={14} />} defaultOpen={false}>
                <EditorGrid2>
                    <EditorField label="İç Boşluk (Padding)">
                        <EditorSelect
                            value={data.padding || 'medium'}
                            onChange={v => set('padding', v)}
                            options={[
                                { value: 'small', label: 'Küçük' },
                                { value: 'medium', label: 'Orta' },
                                { value: 'large', label: 'Büyük' },
                            ]}
                        />
                    </EditorField>
                    <EditorField label="Maksimum Genişlik">
                        <EditorSelect
                            value={data.maxWidth || 'medium'}
                            onChange={v => set('maxWidth', v)}
                            options={[
                                { value: 'narrow', label: 'Dar (800px)' },
                                { value: 'medium', label: 'Orta (1200px)' },
                                { value: 'full', label: 'Tam Genişlik' },
                            ]}
                        />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
