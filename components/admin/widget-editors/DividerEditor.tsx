'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'

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

    const handleChange = (field: keyof DividerData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try { await updateWidget(id, data); setIsDirty(false) }
        catch (e) { console.error('Save failed:', e) }
        setSaving(false)
    }

    const styles = [
        { value: 'line', label: '─ Çizgi' },
        { value: 'space', label: '⬜ Boşluk' },
        { value: 'dots', label: '··· Nokta' },
        { value: 'wave', label: '〰️ Dalga' },
    ]

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stil</label>
                <div className="flex gap-2">
                    {styles.map(s => (
                        <button key={s.value} type="button" onClick={() => handleChange('style', s.value)}
                            className={`px-4 py-2 rounded border text-sm ${(data.style || 'line') === s.value
                                ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yükseklik: {data.height || 40}px</label>
                <input type="range" min="10" max="120" value={data.height || 40}
                    onChange={e => handleChange('height', parseInt(e.target.value))} className="w-full" />
            </div>
            {(data.style === 'line' || data.style === 'dots' || !data.style) && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
                    <div className="flex gap-2 items-center">
                        <input type="color" value={data.color || '#e2e8f0'}
                            onChange={e => handleChange('color', e.target.value)} className="h-8 w-12 rounded border" />
                        <input type="text" value={data.color || '#e2e8f0'} onChange={e => handleChange('color', e.target.value)}
                            className="border rounded px-2 py-1 text-sm w-28" />
                    </div>
                </div>
            )}
            {/* Preview */}
            <div className="border rounded-lg p-4 bg-white">
                <p className="text-xs text-gray-400 mb-2">Önizleme:</p>
                <div style={{ height: data.height || 40 }} className="flex items-center justify-center">
                    {(data.style || 'line') === 'line' && (
                        <hr style={{ borderColor: data.color || '#e2e8f0', width: '100%' }} />
                    )}
                    {data.style === 'dots' && (
                        <span style={{ color: data.color || '#e2e8f0', letterSpacing: '8px' }}>• • • • •</span>
                    )}
                    {data.style === 'wave' && (
                        <span className="text-2xl text-gray-300">〰️〰️〰️</span>
                    )}
                </div>
            </div>
            {isDirty && (
                <button onClick={handleSave} disabled={saving}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            )}
        </div>
    )
}
