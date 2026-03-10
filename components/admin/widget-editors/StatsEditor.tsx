'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { BarChart3 } from 'lucide-react'
import { EditorSection, EditorInput, EditorSelect, EditorRepeater, SaveBar, EditorGrid3 } from './EditorUI'

interface StatItem { icon: string; value: string; label: string }

interface StatsData {
    items?: StatItem[]
}

const ICON_OPTIONS = [
    { value: 'award', label: '🏆 Ödül' },
    { value: 'users', label: '👥 Müşteri' },
    { value: 'calendar', label: '📅 Takvim' },
    { value: 'mappin', label: '📍 Konum' },
    { value: 'star', label: '⭐ Yıldız' },
    { value: 'heart', label: '❤️ Kalp' },
    { value: 'globe', label: '🌍 Küre' },
    { value: 'building', label: '🏢 Bina' },
    { value: 'bed', label: '🛏️ Yatak' },
    { value: 'utensils', label: '🍽️ Restoran' },
]

export function StatsEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<StatsData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return { items: [] } }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof StatsData, value: any) => {
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
            <EditorSection title="İstatistik Öğeleri" icon={<BarChart3 size={14} />} badge={data.items?.length || 0} defaultOpen>
                <EditorRepeater<StatItem>
                    items={data.items || []}
                    onUpdate={items => set('items', items)}
                    createNewItem={() => ({ icon: 'star', value: '', label: '' })}
                    addLabel="İstatistik Ekle"
                    emptyMessage="Henüz istatistik eklenmedi"
                    renderItem={(item, _i, update) => (
                        <EditorGrid3>
                            <EditorSelect
                                value={item.icon || 'star'}
                                onChange={v => update({ ...item, icon: v })}
                                options={ICON_OPTIONS}
                            />
                            <EditorInput
                                value={item.value || ''}
                                onChange={v => update({ ...item, value: v })}
                                placeholder="Değer (Örn: 25+)"
                            />
                            <EditorInput
                                value={item.label || ''}
                                onChange={v => update({ ...item, label: v })}
                                placeholder="Açıklama (Örn: Yıllık Deneyim)"
                            />
                        </EditorGrid3>
                    )}
                />
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
