'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Cloud, Type, CalendarDays } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorSelect, EditorRepeater, SaveBar, EditorGrid2 } from './EditorUI'

interface MonthData {
    name?: string
    avgHigh?: number
    avgLow?: number
    icon?: string
    rainDays?: number
}

interface WeatherData {
    title?: string
    subtitle?: string
    months?: MonthData[]
}

const ICON_OPTIONS = [
    { value: 'sun', label: '☀️ Güneş' },
    { value: 'cloudsun', label: '⛅ Parçalı Bulutlu' },
    { value: 'cloud', label: '☁️ Bulutlu' },
    { value: 'rain', label: '🌧️ Yağmur' },
]

export function WeatherEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<WeatherData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return { months: [] } }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof WeatherData, value: any) => {
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
                    <EditorField label="Bölüm Başlığı">
                        <EditorInput value={data.title || ''} onChange={v => set('title', v)} placeholder="Bodrum Hava Durumu" />
                    </EditorField>
                    <EditorField label="Alt Başlık">
                        <EditorInput value={data.subtitle || ''} onChange={v => set('subtitle', v)} placeholder="Aylık ortalama sıcaklıklar" />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="Aylık Veriler" icon={<CalendarDays size={14} />} badge={data.months?.length || 0} defaultOpen>
                <EditorRepeater<MonthData>
                    items={data.months || []}
                    onUpdate={items => set('months', items)}
                    createNewItem={() => ({ name: '', avgHigh: 25, avgLow: 15, icon: 'sun', rainDays: 3 })}
                    addLabel="Ay Ekle"
                    emptyMessage="Henüz veri eklenmedi"
                    renderItem={(m, _i, update) => (
                        <div className="space-y-3">
                            <div className="grid grid-cols-5 gap-2">
                                <div className="col-span-1">
                                    <EditorField label="Ay (Kısa)">
                                        <EditorInput value={m.name || ''} onChange={v => update({ ...m, name: v })} placeholder="Oca" />
                                    </EditorField>
                                </div>
                                <div className="col-span-2">
                                    <EditorField label="Durum">
                                        <EditorSelect value={m.icon || 'sun'} onChange={v => update({ ...m, icon: v })} options={ICON_OPTIONS} />
                                    </EditorField>
                                </div>
                                <div className="col-span-2">
                                    <EditorField label="Yağışlı Gün">
                                        <EditorInput value={m.rainDays?.toString() || ''} onChange={v => update({ ...m, rainDays: parseInt(v) })} placeholder="3" type="number" />
                                    </EditorField>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <EditorField label="En Yüksek (🔴 °C)">
                                    <EditorInput value={m.avgHigh?.toString() || ''} onChange={v => update({ ...m, avgHigh: parseInt(v) })} placeholder="25" type="number" />
                                </EditorField>
                                <EditorField label="En Düşük (🔵 °C)">
                                    <EditorInput value={m.avgLow?.toString() || ''} onChange={v => update({ ...m, avgLow: parseInt(v) })} placeholder="15" type="number" />
                                </EditorField>
                            </div>
                        </div>
                    )}
                />
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
