'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { MapPin } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, SaveBar, EditorGrid3 } from './EditorUI'

interface MapData {
    lat?: number
    lng?: number
    zoom?: number
}

export function MapEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<MapData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof MapData, value: any) => {
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
            <EditorSection title="Harita Konumu" icon={<MapPin size={14} />} defaultOpen>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-lg p-3 mb-4">
                    <p className="text-[11px] text-blue-600 dark:text-blue-400">
                        <strong className="font-bold">İpucu:</strong> Google Haritalar'dan koordinat almak için haritada istediğiniz konuma sağ tıklayın ve enlem/boylam değerlerini kopyalayın.
                    </p>
                </div>

                <EditorGrid3>
                    <EditorField label="Enlem (Lattitude)">
                        <EditorInput
                            value={data.lat?.toString() || ''}
                            onChange={v => set('lat', parseFloat(v))}
                            placeholder="37.091832"
                            type="number"
                        />
                    </EditorField>
                    <EditorField label="Boylam (Longitude)">
                        <EditorInput
                            value={data.lng?.toString() || ''}
                            onChange={v => set('lng', parseFloat(v))}
                            placeholder="27.4824998"
                            type="number"
                        />
                    </EditorField>
                    <EditorField label="Yakınlaştırma (Zoom)">
                        <EditorInput
                            value={data.zoom?.toString() || '15'}
                            onChange={v => set('zoom', parseInt(v))}
                            placeholder="15"
                            type="number"
                        />
                    </EditorField>
                </EditorGrid3>

                {data.lat && data.lng && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <iframe
                            src={`https://www.google.com/maps?q=${data.lat},${data.lng}&z=${data.zoom || 15}&output=embed`}
                            width="100%"
                            height="250"
                            style={{ border: 0 }}
                            loading="lazy"
                        />
                    </div>
                )}
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
