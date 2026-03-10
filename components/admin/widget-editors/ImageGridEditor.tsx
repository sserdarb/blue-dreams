'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { LayoutGrid, Type, Image as ImageIcon } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorImageField, EditorTextarea, EditorSelect, EditorRepeater, SaveBar, EditorGrid2, EditorGrid3 } from './EditorUI'

interface GridItem {
    image?: string
    title?: string
    description?: string
    badge?: string
    meta?: string
    meta2?: string
}

interface ImageGridData {
    label?: string
    heading?: string
    items?: GridItem[]
    variant?: string
    columns?: number
}

export function ImageGridEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<ImageGridData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return { items: [] } }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof ImageGridData, value: any) => {
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
            <EditorSection title="Başlık Alanı" icon={<Type size={14} />} defaultOpen>
                <EditorGrid2>
                    <EditorField label="Etiket (Badge)">
                        <EditorInput value={data.label || ''} onChange={v => set('label', v)} placeholder="Bodrum" />
                    </EditorField>
                    <EditorField label="Başlık">
                        <EditorInput value={data.heading || ''} onChange={v => set('heading', v)} placeholder="Keşfedilecek Yerler" />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="Görünüm Düzeni" icon={<LayoutGrid size={14} />} defaultOpen={false}>
                <EditorGrid2>
                    <EditorField label="Kart Stili">
                        <EditorSelect
                            value={data.variant || 'card'}
                            onChange={v => set('variant', v)}
                            options={[
                                { value: 'card', label: 'Standart Kart' },
                                { value: 'overlay', label: 'Overlay (Görsel Üstü Yazı)' },
                                { value: 'simple', label: 'Basit Görünüm' },
                            ]}
                        />
                    </EditorField>
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
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="Grid Ekranları" icon={<ImageIcon size={14} />} badge={data.items?.length || 0} defaultOpen>
                <EditorRepeater<GridItem>
                    items={data.items || []}
                    onUpdate={items => set('items', items)}
                    createNewItem={() => ({ image: '', title: '', description: '' })}
                    addLabel="Görsel Ekranı Ekle"
                    emptyMessage="Henüz öğe eklenmedi"
                    renderItem={(item, _i, update) => (
                        <div className="space-y-3">
                            <EditorImageField
                                value={item.image || ''}
                                onChange={v => update({ ...item, image: v })}
                                label="Kapak Görseli URL"
                            />
                            <EditorField label="Başlık">
                                <EditorInput value={item.title || ''} onChange={v => update({ ...item, title: v })} placeholder="Gümbet Koyu" />
                            </EditorField>
                            <EditorField label="Açıklama">
                                <EditorTextarea value={item.description || ''} onChange={v => update({ ...item, description: v })} placeholder="Açıklama metni..." rows={2} />
                            </EditorField>
                            <EditorGrid3>
                                <EditorField label="Badge (Üst Etiket)">
                                    <EditorInput value={item.badge || ''} onChange={v => update({ ...item, badge: v })} placeholder="Yeni" />
                                </EditorField>
                                <EditorField label="Sol Alt Meta">
                                    <EditorInput value={item.meta || ''} onChange={v => update({ ...item, meta: v })} placeholder="🕒 10 dk" />
                                </EditorField>
                                <EditorField label="Sağ Alt Meta">
                                    <EditorInput value={item.meta2 || ''} onChange={v => update({ ...item, meta2: v })} placeholder="📍 Merkeze Yakın" />
                                </EditorField>
                            </EditorGrid3>
                        </div>
                    )}
                />
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
