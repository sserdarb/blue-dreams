'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { BedDouble, Settings } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorSelect, SaveBar, EditorGrid2 } from './EditorUI'

interface RoomListData {
    title?: string
    subtitle?: string
    maxRooms?: number
    showPrices?: boolean
    layout?: 'grid' | 'list'
}

export function RoomListEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<RoomListData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof RoomListData, value: any) => {
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
            <EditorSection title="Başlık & İçerik" icon={<BedDouble size={14} />} defaultOpen>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-lg p-3 mb-4">
                    <p className="text-[11px] text-blue-600 dark:text-blue-400">
                        <strong className="font-bold">Not:</strong> Odalar veritabanındaki <i>Room</i> tablosundan otomatik çekilir.
                    </p>
                </div>
                <EditorGrid2>
                    <EditorField label="Ana Başlık">
                        <EditorInput value={data.title || ''} onChange={v => set('title', v)} placeholder="Odalarımız" />
                    </EditorField>
                    <EditorField label="Alt Başlık (Opsiyonel)">
                        <EditorInput value={data.subtitle || ''} onChange={v => set('subtitle', v)} placeholder="En iyi odalarımızı keşfedin" />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="Ayarlar" icon={<Settings size={14} />} defaultOpen>
                <EditorGrid2>
                    <EditorField label="Maksimum Görüntülenecek Oda">
                        <EditorInput
                            value={data.maxRooms?.toString() || '6'}
                            onChange={v => set('maxRooms', parseInt(v))}
                            placeholder="6"
                            type="number"
                        />
                    </EditorField>
                    <EditorField label="Görünüm Şekli">
                        <EditorSelect
                            value={data.layout || 'grid'}
                            onChange={v => set('layout', v as any)}
                            options={[
                                { value: 'grid', label: 'Kart Görünümü (Grid)' },
                                { value: 'list', label: 'Liste Görünümü (Yatay)' },
                            ]}
                        />
                    </EditorField>
                </EditorGrid2>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={data.showPrices ?? true}
                                onChange={e => set('showPrices', e.target.checked)}
                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded checked:bg-blue-500 checked:border-blue-500 transition-colors"
                            />
                            <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            Oda fiyatlarını göster
                        </span>
                    </label>
                </div>
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
