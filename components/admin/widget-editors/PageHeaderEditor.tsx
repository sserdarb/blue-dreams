'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { FileText, Image, Navigation } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorImageField, EditorRepeater, SaveBar, EditorGrid2 } from './EditorUI'

interface Breadcrumb {
    label: string
    href: string
}

interface PageHeaderData {
    title?: string
    subtitle?: string
    backgroundImage?: string
    breadcrumbs?: Breadcrumb[]
}

export function PageHeaderEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<PageHeaderData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof PageHeaderData, value: any) => {
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
            <EditorSection title="İçerik" icon={<FileText size={14} />} defaultOpen>
                <EditorField label="Başlık">
                    <EditorInput value={data.title || ''} onChange={v => set('title', v)} placeholder="Sayfa başlığı" />
                </EditorField>
                <EditorField label="Alt Başlık" hint="Başlığın altında görünecek açıklama metni">
                    <EditorInput value={data.subtitle || ''} onChange={v => set('subtitle', v)} placeholder="Kısa açıklama..." />
                </EditorField>
            </EditorSection>

            <EditorSection title="Arka Plan Görseli" icon={<Image size={14} />}>
                <EditorImageField
                    value={data.backgroundImage || ''}
                    onChange={v => set('backgroundImage', v)}
                    label="Görsel URL"
                    placeholder="https://example.com/image.jpg"
                />
            </EditorSection>

            <EditorSection title="Breadcrumbs" icon={<Navigation size={14} />} badge={data.breadcrumbs?.length || 0}>
                <EditorRepeater<Breadcrumb>
                    items={data.breadcrumbs || []}
                    onUpdate={items => set('breadcrumbs', items)}
                    createNewItem={() => ({ label: '', href: '' })}
                    addLabel="Breadcrumb Ekle"
                    emptyMessage="Henüz breadcrumb eklenmedi"
                    renderItem={(bc, _i, update) => (
                        <EditorGrid2>
                            <EditorInput value={bc.label} onChange={v => update({ ...bc, label: v })} placeholder="Etiket (Örn: Ana Sayfa)" />
                            <EditorInput value={bc.href} onChange={v => update({ ...bc, href: v })} placeholder="/tr/sayfa-adi" />
                        </EditorGrid2>
                    )}
                />
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
