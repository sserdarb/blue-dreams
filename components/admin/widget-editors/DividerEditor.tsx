'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Scissors } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorSelect, SaveBar, EditorGrid2 } from './EditorUI'

interface DividerData {
    style?: 'line' | 'space' | 'dots' | 'wave'
    height?: number
    color?: string
}

export function DividerEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<DividerData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof DividerData, value: any) => {
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
            <EditorSection title="Ayırıcı Özellikleri" icon={<Scissors size={14} />} defaultOpen>
                <EditorGrid2>
                    <EditorField label="Stil Seçimi">
                        <EditorSelect
                            value={data.style || 'line'}
                            onChange={v => set('style', v as any)}
                            options={[
                                { value: 'line', label: '─ Çizgi' },
                                { value: 'space', label: '⬜ Boşluk (Sadece Boşluk Bırakır)' },
                                { value: 'dots', label: '··· Nokta' },
                                { value: 'wave', label: '〰️ Dalga' },
                            ]}
                        />
                    </EditorField>
                    <EditorField label={`Yükseklik (${data.height || 40}px)`}>
                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="range"
                                min="10"
                                max="150"
                                value={data.height || 40}
                                onChange={e => set('height', parseInt(e.target.value))}
                                className="w-full accent-blue-600"
                            />
                            <span className="text-xs font-mono text-slate-500 w-8">{data.height || 40}px</span>
                        </div>
                    </EditorField>
                </EditorGrid2>

                {(data.style === 'line' || data.style === 'dots' || !data.style) && (
                    <div className="mt-4">
                        <EditorField label="Renk">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={data.color || '#e2e8f0'}
                                    onChange={e => set('color', e.target.value)}
                                    className="h-9 w-12 rounded-lg cursor-pointer border-0 p-0"
                                />
                                <div className="w-32">
                                    <EditorInput
                                        value={data.color || '#e2e8f0'}
                                        onChange={v => set('color', v)}
                                    />
                                </div>
                            </div>
                        </EditorField>
                    </div>
                )}
            </EditorSection>

            <EditorSection title="Canlı Önizleme" icon={<span className="text-xs">👁</span>} defaultOpen>
                <div className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center p-4">
                    <div style={{ height: data.height || 40 }} className="flex items-center justify-center w-full">
                        {(data.style || 'line') === 'line' && (
                            <hr style={{ borderColor: data.color || '#e2e8f0', width: '100%' }} />
                        )}
                        {data.style === 'dots' && (
                            <span style={{ color: data.color || '#e2e8f0', letterSpacing: '8px', fontSize: '24px' }}>• • • • •</span>
                        )}
                        {data.style === 'wave' && (
                            <span style={{ color: data.color || '#e2e8f0', letterSpacing: '2px', fontSize: '24px' }}>〰️〰️〰️</span>
                        )}
                    </div>
                </div>
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
