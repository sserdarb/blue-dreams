'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface Column { key: string; label: string; align?: string }

interface TableData {
    label?: string
    heading?: string
    backgroundColor?: string
    columns?: Column[]
    rows?: Record<string, string>[]
}

export function TableEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<TableData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof TableData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const columns = data.columns || []
    const rows = data.rows || []

    const updateColumn = (i: number, field: keyof Column, value: string) => {
        const nc = [...columns]; nc[i] = { ...nc[i], [field]: value }; set('columns', nc)
    }

    const addColumn = () => {
        const key = `col${columns.length + 1}`
        set('columns', [...columns, { key, label: `Sütun ${columns.length + 1}`, align: 'left' }])
    }

    const removeColumn = (i: number) => {
        const removedKey = columns[i].key
        set('columns', columns.filter((_, idx) => idx !== i))
        set('rows', rows.map(row => {
            const newRow = { ...row }; delete newRow[removedKey]; return newRow
        }))
    }

    const addRow = () => {
        const empty: Record<string, string> = {}
        columns.forEach(c => { empty[c.key] = '' })
        set('rows', [...rows, empty])
    }

    const removeRow = (i: number) => set('rows', rows.filter((_, idx) => idx !== i))

    const updateCell = (rowIdx: number, key: string, value: string) => {
        const nr = [...rows]; nr[rowIdx] = { ...nr[rowIdx], [key]: value }; set('rows', nr)
    }

    const handleSave = async () => {
        setSaving(true)
        try { await updateWidget(id, data); setIsDirty(false) }
        catch (e) { console.error('Save failed:', e) }
        setSaving(false)
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Etiket</label>
                    <input type="text" value={data.label || ''} onChange={e => set('label', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Toplantı Odaları" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                    <input type="text" value={data.heading || ''} onChange={e => set('heading', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Farklı İhtiyaçlar İçin" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arka Plan</label>
                    <select value={data.backgroundColor || 'white'} onChange={e => set('backgroundColor', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm">
                        <option value="white">Beyaz</option>
                        <option value="sand">Kum</option>
                        <option value="dark">Koyu</option>
                    </select>
                </div>
            </div>

            {/* Column definitions */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Sütunlar ({columns.length})</label>
                    <button type="button" onClick={addColumn} className="flex items-center gap-1 text-xs text-blue-600">
                        <Plus size={14} /> Sütun Ekle
                    </button>
                </div>
                {columns.map((col, i) => (
                    <div key={i} className="flex gap-2 items-center mb-1">
                        <input type="text" value={col.key} onChange={e => updateColumn(i, 'key', e.target.value)}
                            className="w-24 border rounded px-2 py-1 text-xs font-mono" placeholder="key" />
                        <input type="text" value={col.label} onChange={e => updateColumn(i, 'label', e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Sütun başlığı" />
                        <select value={col.align || 'left'} onChange={e => updateColumn(i, 'align', e.target.value)}
                            className="w-20 border rounded px-1 py-1 text-xs">
                            <option value="left">Sol</option>
                            <option value="center">Orta</option>
                            <option value="right">Sağ</option>
                        </select>
                        <button type="button" onClick={() => removeColumn(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Data rows */}
            {columns.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Satırlar ({rows.length})</label>
                        <button type="button" onClick={addRow} className="flex items-center gap-1 text-xs text-blue-600">
                            <Plus size={14} /> Satır Ekle
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    {columns.map(col => (
                                        <th key={col.key} className="border p-1 bg-gray-100 text-xs font-medium">{col.label}</th>
                                    ))}
                                    <th className="border p-1 w-8 bg-gray-100"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, ri) => (
                                    <tr key={ri}>
                                        {columns.map(col => (
                                            <td key={col.key} className="border p-1">
                                                <input type="text" value={row[col.key] || ''} onChange={e => updateCell(ri, col.key, e.target.value)}
                                                    className="w-full border-0 bg-transparent px-1 py-0.5 text-xs" />
                                            </td>
                                        ))}
                                        <td className="border p-1 w-8">
                                            <button type="button" onClick={() => removeRow(ri)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isDirty && (
                <button onClick={handleSave} disabled={saving}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            )}
        </div>
    )
}
