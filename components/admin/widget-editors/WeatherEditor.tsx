'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

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

export function WeatherEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<WeatherData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof WeatherData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const months = data.months || []

    const updateMonth = (i: number, field: keyof MonthData, value: any) => {
        const nm = [...months]; nm[i] = { ...nm[i], [field]: value }; set('months', nm)
    }

    const addMonth = () => set('months', [...months, { name: '', avgHigh: 25, avgLow: 15, icon: 'sun', rainDays: 3 }])
    const removeMonth = (i: number) => set('months', months.filter((_, idx) => idx !== i))

    const handleSave = async () => {
        setSaving(true)
        try { await updateWidget(id, data); setIsDirty(false) }
        catch (e) { console.error('Save failed:', e) }
        setSaving(false)
    }

    const iconOptions = [
        { value: 'sun', label: '☀️ Güneş' },
        { value: 'cloudsun', label: '⛅ Parçalı Bulutlu' },
        { value: 'cloud', label: '☁️ Bulutlu' },
        { value: 'rain', label: '🌧️ Yağmur' },
    ]

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={data.title || ''} onChange={e => set('title', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Bodrum Hava Durumu" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                    <input type="text" value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Aylık ortalama sıcaklıklar" />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Aylar ({months.length})</label>
                <button type="button" onClick={addMonth} className="flex items-center gap-1 text-xs text-blue-600">
                    <Plus size={14} /> Ay Ekle
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-1 text-xs">Ay</th>
                            <th className="border p-1 text-xs">🔴 Maks °C</th>
                            <th className="border p-1 text-xs">🔵 Min °C</th>
                            <th className="border p-1 text-xs">Hava</th>
                            <th className="border p-1 text-xs">Yağışlı Gün</th>
                            <th className="border p-1 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {months.map((m, i) => (
                            <tr key={i}>
                                <td className="border p-1">
                                    <input type="text" value={m.name || ''} onChange={e => updateMonth(i, 'name', e.target.value)}
                                        className="w-full border-0 bg-transparent px-1 py-0.5 text-xs font-medium" placeholder="Oca" />
                                </td>
                                <td className="border p-1">
                                    <input type="number" value={m.avgHigh ?? ''} onChange={e => updateMonth(i, 'avgHigh', parseInt(e.target.value))}
                                        className="w-full border-0 bg-transparent px-1 py-0.5 text-xs text-center" />
                                </td>
                                <td className="border p-1">
                                    <input type="number" value={m.avgLow ?? ''} onChange={e => updateMonth(i, 'avgLow', parseInt(e.target.value))}
                                        className="w-full border-0 bg-transparent px-1 py-0.5 text-xs text-center" />
                                </td>
                                <td className="border p-1">
                                    <select value={m.icon || 'sun'} onChange={e => updateMonth(i, 'icon', e.target.value)}
                                        className="w-full border-0 bg-transparent text-xs">
                                        {iconOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </td>
                                <td className="border p-1">
                                    <input type="number" value={m.rainDays ?? ''} onChange={e => updateMonth(i, 'rainDays', parseInt(e.target.value))}
                                        className="w-full border-0 bg-transparent px-1 py-0.5 text-xs text-center" />
                                </td>
                                <td className="border p-1">
                                    <button type="button" onClick={() => removeMonth(i)} className="text-red-400 hover:text-red-600">
                                        <Trash2 size={12} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
