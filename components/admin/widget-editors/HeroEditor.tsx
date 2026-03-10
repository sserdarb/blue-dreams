'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Sparkles, Image, Type, MousePointerClick } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorTextarea, EditorImageField, EditorSelect, EditorRepeater, SaveBar, EditorGrid2 } from './EditorUI'

interface Button { text: string; url: string; style: string; external?: boolean }

interface HeroData {
    badge?: string
    titleLine1?: string
    titleLine2?: string
    subtitle?: string
    backgroundImage?: string
    scrollText?: string
    buttons?: Button[]
}

export function HeroEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<HeroData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof HeroData, value: any) => {
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
                <EditorField label="Badge" hint="Başlığın üstünde görünen küçük etiket">
                    <EditorInput value={data.badge || ''} onChange={v => set('badge', v)} placeholder="Bodrum'un İncisi" />
                </EditorField>
                <EditorGrid2>
                    <EditorField label="Başlık Satır 1">
                        <EditorInput value={data.titleLine1 || ''} onChange={v => set('titleLine1', v)} placeholder="Ege'nin Mavi" />
                    </EditorField>
                    <EditorField label="Başlık Satır 2 (Vurgu)">
                        <EditorInput value={data.titleLine2 || ''} onChange={v => set('titleLine2', v)} placeholder="Rüyası" />
                    </EditorField>
                </EditorGrid2>
                <EditorField label="Alt Başlık">
                    <EditorTextarea value={data.subtitle || ''} onChange={v => set('subtitle', v)} placeholder="Doğanın kalbinde lüks tatil..." rows={2} />
                </EditorField>
                <EditorField label="Scroll Metni" hint="Aşağı kaydırma animasyonundaki metin">
                    <EditorInput value={data.scrollText || ''} onChange={v => set('scrollText', v)} placeholder="Keşfet" />
                </EditorField>
            </EditorSection>

            <EditorSection title="Arka Plan Görseli" icon={<Image size={14} />}>
                <EditorImageField
                    value={data.backgroundImage || ''}
                    onChange={v => set('backgroundImage', v)}
                    previewHeight="h-36"
                />
            </EditorSection>

            <EditorSection title="Butonlar" icon={<MousePointerClick size={14} />} badge={data.buttons?.length || 0}>
                <EditorRepeater<Button>
                    items={data.buttons || []}
                    onUpdate={items => set('buttons', items)}
                    createNewItem={() => ({ text: '', url: '', style: 'primary' })}
                    addLabel="Buton Ekle"
                    emptyMessage="Henüz buton eklenmedi"
                    renderItem={(btn, _i, update) => (
                        <div className="space-y-2">
                            <EditorGrid2>
                                <EditorInput value={btn.text} onChange={v => update({ ...btn, text: v })} placeholder="Buton metni" />
                                <EditorInput value={btn.url} onChange={v => update({ ...btn, url: v })} placeholder="https://..." type="url" />
                            </EditorGrid2>
                            <div className="flex items-center gap-3">
                                <EditorSelect
                                    value={btn.style}
                                    onChange={v => update({ ...btn, style: v })}
                                    options={[
                                        { value: 'primary', label: '● Primary' },
                                        { value: 'outline', label: '○ Outline' },
                                    ]}
                                />
                                <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!btn.external}
                                        onChange={e => update({ ...btn, external: e.target.checked })}
                                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                                    />
                                    Yeni sekme
                                </label>
                            </div>
                        </div>
                    )}
                />
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
