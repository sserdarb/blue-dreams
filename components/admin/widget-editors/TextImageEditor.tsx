'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Type, Image, AlignLeft, MousePointerClick, ListChecks, Award } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorTextarea, EditorImageField, EditorSelect, EditorRepeater, SaveBar, EditorGrid2, EditorGrid3 } from './EditorUI'

interface Button { text: string; url: string; variant: string }

interface TextImageData {
    label?: string
    heading?: string
    headingAccent?: string
    paragraphs?: string[]
    image?: string
    imageAlt?: string
    imagePosition?: string
    badge?: { value: string; label: string }
    buttons?: Button[]
    listItems?: string[]
}

export function TextImageEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<TextImageData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof TextImageData, value: any) => {
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
                <EditorGrid3>
                    <EditorField label="Etiket" hint="Üstte küçük metin">
                        <EditorInput value={data.label || ''} onChange={v => set('label', v)} placeholder="Naya Spa" />
                    </EditorField>
                    <EditorField label="Başlık">
                        <EditorInput value={data.heading || ''} onChange={v => set('heading', v)} placeholder="Beden ve" />
                    </EditorField>
                    <EditorField label="Vurgulu Başlık">
                        <EditorInput value={data.headingAccent || ''} onChange={v => set('headingAccent', v)} placeholder="Ruh Dengesi" />
                    </EditorField>
                </EditorGrid3>
            </EditorSection>

            <EditorSection title="Paragraflar" icon={<AlignLeft size={14} />} badge={data.paragraphs?.length || 0}>
                <EditorRepeater<string>
                    items={data.paragraphs || []}
                    onUpdate={items => set('paragraphs', items)}
                    createNewItem={() => ''}
                    addLabel="Paragraf Ekle"
                    emptyMessage="Paragraf eklenmedi"
                    renderItem={(p, _i, update) => (
                        <EditorTextarea value={p} onChange={v => update(v)} placeholder="Paragraf metni..." rows={2} />
                    )}
                />
            </EditorSection>

            <EditorSection title="Görsel" icon={<Image size={14} />}>
                <EditorImageField
                    value={data.image || ''}
                    onChange={v => set('image', v)}
                />
                <EditorGrid2>
                    <EditorField label="Alt Metin (SEO)" hint="Erişilebilirlik için gerekli">
                        <EditorInput value={data.imageAlt || ''} onChange={v => set('imageAlt', v)} placeholder="Blue Dreams Resort" />
                    </EditorField>
                    <EditorField label="Görsel Pozisyonu">
                        <EditorSelect
                            value={data.imagePosition || 'right'}
                            onChange={v => set('imagePosition', v)}
                            options={[
                                { value: 'right', label: '→ Sağ' },
                                { value: 'left', label: '← Sol' },
                            ]}
                        />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="Badge" icon={<Award size={14} />} defaultOpen={false}>
                <EditorGrid2>
                    <EditorField label="Değer" hint="Büyük sayı/metin">
                        <EditorInput
                            value={data.badge?.value || ''}
                            onChange={v => set('badge', { ...data.badge, value: v, label: data.badge?.label || '' })}
                            placeholder="25+"
                        />
                    </EditorField>
                    <EditorField label="Etiket" hint="Altında açıklama">
                        <EditorInput
                            value={data.badge?.label || ''}
                            onChange={v => set('badge', { ...data.badge, label: v, value: data.badge?.value || '' })}
                            placeholder="Yıl"
                        />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="Liste Öğeleri" icon={<ListChecks size={14} />} badge={data.listItems?.length || 0} defaultOpen={false}>
                <EditorRepeater<string>
                    items={data.listItems || []}
                    onUpdate={items => set('listItems', items)}
                    createNewItem={() => ''}
                    addLabel="Liste Öğesi Ekle"
                    emptyMessage="Liste öğesi eklenmedi"
                    renderItem={(item, _i, update) => (
                        <EditorInput value={item} onChange={v => update(v)} placeholder="Özellik açıklaması..." />
                    )}
                />
            </EditorSection>

            <EditorSection title="Butonlar" icon={<MousePointerClick size={14} />} badge={data.buttons?.length || 0} defaultOpen={false}>
                <EditorRepeater<Button>
                    items={data.buttons || []}
                    onUpdate={items => set('buttons', items)}
                    createNewItem={() => ({ text: '', url: '', variant: 'primary' })}
                    addLabel="Buton Ekle"
                    emptyMessage="Buton eklenmedi"
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
