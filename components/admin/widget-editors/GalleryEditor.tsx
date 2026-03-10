'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Images } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorImageField, EditorRepeater, SaveBar, EditorGrid2 } from './EditorUI'

interface GalleryImage {
    src: string
    title?: string
    category?: string
}

interface GalleryData {
    images?: GalleryImage[]
}

export function GalleryEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<GalleryData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return { images: [] } }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof GalleryData, value: any) => {
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
            <EditorSection title="Galeri Görselleri" icon={<Images size={14} />} badge={data.images?.length || 0} defaultOpen>
                <EditorRepeater<GalleryImage>
                    items={data.images || []}
                    onUpdate={items => set('images', items)}
                    createNewItem={() => ({ src: '', title: '', category: '' })}
                    addLabel="Görsel Ekle"
                    emptyMessage="Henüz galeriye görsel eklenmedi"
                    renderItem={(img, _i, update) => (
                        <div className="space-y-3">
                            <EditorImageField
                                value={img.src}
                                onChange={v => update({ ...img, src: v })}
                                label="Fotoğraf URL"
                            />
                            <EditorGrid2>
                                <EditorField label="Görsel Başlığı / Alt">
                                    <EditorInput value={img.title || ''} onChange={v => update({ ...img, title: v })} placeholder="Manzara Fotoğrafı" />
                                </EditorField>
                                <EditorField label="Kategori" hint="Filtreleme için kullanılabilir">
                                    <EditorInput value={img.category || ''} onChange={v => update({ ...img, category: v })} placeholder="Örn: Havuz, Odalar" />
                                </EditorField>
                            </EditorGrid2>
                        </div>
                    )}
                />
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
