'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Table, LayoutTemplate, Columns } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorSelect, EditorRepeater, SaveBar, EditorGrid2 } from './EditorUI'

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
            <EditorSection title="Başlık & Görünüm" icon={<LayoutTemplate size={14} />} defaultOpen>
                <EditorGrid2>
                    <EditorField label="Etiket (Badge)">
                        <EditorInput value={data.label || ''} onChange={v => set('label', v)} placeholder="Toplantı Odaları" />
                    </EditorField>
                    <EditorField label="Başlık">
                        <EditorInput value={data.heading || ''} onChange={v => set('heading', v)} placeholder="Farklı İhtiyaçlar İçin" />
                    </EditorField>
                </EditorGrid2>
                <div className="mt-3">
                    <EditorField label="Arka Plan Rengi">
                        <EditorSelect
                            value={data.backgroundColor || 'white'}
                            onChange={v => set('backgroundColor', v)}
                            options={[
                                { value: 'white', label: 'Beyaz' },
                                { value: 'sand', label: 'Kum' },
                                { value: 'dark', label: 'Koyu' },
                            ]}
                        />
                    </EditorField>
                </div>
            </EditorSection>

            <EditorSection title="Sütun Tanımları" icon={<Columns size={14} />} badge={columns.length} defaultOpen={false}>
                <EditorRepeater<Column>
                    items={columns}
                    onUpdate={newCols => {
                        // Handle column removals (clean up rows data)
                        if (newCols.length < columns.length) {
                            const currentKeys = newCols.map(c => c.key)
                            const updatedRows = rows.map(row => {
                                const newRow = { ...row }
                                Object.keys(newRow).forEach(k => {
                                    if (!currentKeys.includes(k)) delete newRow[k]
                                })
                                return newRow
                            })
                            set('rows', updatedRows)
                        }
                        set('columns', newCols)
                    }}
                    createNewItem={() => ({ key: `col${columns.length + 1}`, label: `Sütun ${columns.length + 1}`, align: 'left' })}
                    addLabel="Sütun Ekle"
                    emptyMessage="Henüz sütun eklenmedi"
                    renderItem={(col, _i, update) => (
                        <EditorGrid2>
                            <EditorField label="Sütun Başlığı">
                                <EditorInput value={col.label} onChange={v => update({ ...col, label: v })} placeholder="Özellik" />
                            </EditorField>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <EditorField label="Hizalama">
                                        <EditorSelect
                                            value={col.align || 'left'}
                                            onChange={v => update({ ...col, align: v })}
                                            options={[
                                                { value: 'left', label: '← Sol' },
                                                { value: 'center', label: '↔ Orta' },
                                                { value: 'right', label: '→ Sağ' },
                                            ]}
                                        />
                                    </EditorField>
                                </div>
                                <div className="w-20">
                                    <EditorField label="ID (Key)">
                                        <EditorInput value={col.key} onChange={v => update({ ...col, key: v })} />
                                    </EditorField>
                                </div>
                            </div>
                        </EditorGrid2>
                    )}
                />
            </EditorSection>

            <EditorSection title="Tablo Verileri" icon={<Table size={14} />} badge={rows.length} defaultOpen>
                {columns.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">Veri eklemeden önce en az bir sütun tanımlamalısınız.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                                        <th className="p-2 w-8 text-center text-xs font-medium text-slate-500">#</th>
                                        {columns.map(col => (
                                            <th key={col.key} className="p-2 text-left text-xs font-bold text-slate-600 dark:text-slate-300">
                                                {col.label}
                                            </th>
                                        ))}
                                        <th className="p-2 w-10 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, ri) => (
                                        <tr key={ri} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="p-2 text-center text-xs font-mono text-slate-400">{ri + 1}</td>
                                            {columns.map(col => (
                                                <td key={col.key} className="p-1">
                                                    <input
                                                        type="text"
                                                        value={row[col.key] || ''}
                                                        onChange={e => updateCell(ri, col.key, e.target.value)}
                                                        className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded px-2 py-1.5 text-sm transition-all outline-none"
                                                        placeholder="..."
                                                    />
                                                </td>
                                            ))}
                                            <td className="p-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(ri)}
                                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            type="button"
                            onClick={addRow}
                            className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-blue-600 dark:text-blue-400 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-xs font-bold flex items-center justify-center gap-2 group"
                        >
                            <span className="group-hover:scale-110 transition-transform text-lg leading-none">+</span> Satır Ekle
                        </button>
                    </div>
                )}
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
