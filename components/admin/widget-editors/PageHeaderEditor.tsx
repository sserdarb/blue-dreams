'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface Breadcrumb {
    label: string
    href: string
}

interface PageHeaderData {
    title?: string
    subtitle?: string
    backgroundImage?: string
    breadcrumbs?: Breadcrumb[]
}

export function PageHeaderEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<PageHeaderData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof PageHeaderData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const breadcrumbs = data.breadcrumbs || []

    const updateBreadcrumb = (i: number, field: keyof Breadcrumb, value: string) => {
        const newBc = [...breadcrumbs]
        newBc[i] = { ...newBc[i], [field]: value }
        set('breadcrumbs', newBc)
    }

    const addBreadcrumb = () => {
        set('breadcrumbs', [...breadcrumbs, { label: '', href: '' }])
    }

    const removeBreadcrumb = (i: number) => {
        set('breadcrumbs', breadcrumbs.filter((_, idx) => idx !== i))
    }

    const handleSave = async () => {
        setSaving(true)
        try { await updateWidget(id, data); setIsDirty(false) }
        catch (e) { console.error('Save failed:', e) }
        setSaving(false)
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                <input type="text" value={data.title || ''} onChange={e => set('title', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2" placeholder="Sayfa başlığı" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                <input type="text" value={data.subtitle || ''} onChange={e => set('subtitle', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Sayfa alt başlığı" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arka Plan Görseli</label>
                <input type="url" value={data.backgroundImage || ''} onChange={e => set('backgroundImage', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                {data.backgroundImage && (
                    <img src={data.backgroundImage} alt="bg" className="mt-2 h-24 w-full object-cover rounded-lg" />
                )}
            </div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Breadcrumbs</label>
                    <button type="button" onClick={addBreadcrumb} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                        <Plus size={14} /> Ekle
                    </button>
                </div>
                {breadcrumbs.map((bc, i) => (
                    <div key={i} className="flex gap-2 items-center mb-2">
                        <input type="text" value={bc.label} onChange={e => updateBreadcrumb(i, 'label', e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Etiket" />
                        <input type="text" value={bc.href} onChange={e => updateBreadcrumb(i, 'href', e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-sm" placeholder="/tr/sayfa" />
                        <button type="button" onClick={() => removeBreadcrumb(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
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
