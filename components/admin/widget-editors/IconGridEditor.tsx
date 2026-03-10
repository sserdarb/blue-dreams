'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Type, PaintBucket, LayoutGrid, CheckCircle2 } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorTextarea, EditorSelect, EditorRepeater, SaveBar, EditorGrid2 } from './EditorUI'

interface IconItem { icon: string; title: string; description: string }

interface IconGridData {
    label?: string
    heading?: string
    backgroundColor?: string
    items?: IconItem[]
    columns?: number
}

export function IconGridEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<IconGridData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return { items: [] } }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof IconGridData, value: any) => {
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
                        <EditorInput value={data.label || ''} onChange={v => set('label', v)} placeholder="Değerlerimiz" />
                    </EditorField>
                    <EditorField label="Başlık">
                        <EditorInput value={data.heading || ''} onChange={v => set('heading', v)} placeholder="Temel İlkelerimiz" />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="Görünüm Seçenekleri" icon={<PaintBucket size={14} />} defaultOpen={false}>
                <EditorGrid2>
                    <EditorField label="Arka Plan Rengi">
                        <EditorSelect
                            value={data.backgroundColor || 'white'}
                            onChange={v => set('backgroundColor', v)}
                            options={[
                                { value: 'white', label: 'Beyaz' },
                                { value: 'dark', label: 'Koyu' },
                                { value: 'sand', label: 'Kum' },
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

            <EditorSection title="Grid Özellikleri" icon={<LayoutGrid size={14} />} badge={data.items?.length || 0} defaultOpen>
                <EditorRepeater<IconItem>
                    items={data.items || []}
                    onUpdate={items => set('items', items)}
                    createNewItem={() => ({ icon: '⭐', title: '', description: '' })}
                    addLabel="Özellik Ekle"
                    emptyMessage="Henüz özellik eklenmedi"
                    renderItem={(item, _i, update) => (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="w-16 shrink-0">
                                    <EditorInput
                                        value={item.icon || ''}
                                        onChange={v => update({ ...item, icon: v })}
                                        placeholder="⭐"
                                        className="text-center text-xl"
                                    />
                                </div>
                                <div className="flex-1">
                                    <EditorInput
                                        value={item.title || ''}
                                        onChange={v => update({ ...item, title: v })}
                                        placeholder="Başlık (Örn: Sürdürülebilirlik)"
                                    />
                                </div>
                            </div>
                            <EditorTextarea
                                value={item.description || ''}
                                onChange={v => update({ ...item, description: v })}
                                placeholder="Açıklama metni..."
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
