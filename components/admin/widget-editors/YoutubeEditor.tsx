'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2 } from 'lucide-react'

interface Video { url: string; title: string }

interface YoutubeData {
    videos?: Video[]
    columns?: number
}

export function YoutubeEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<YoutubeData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof YoutubeData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const videos = data.videos || []

    const updateVideo = (i: number, field: keyof Video, value: string) => {
        const nv = [...videos]; nv[i] = { ...nv[i], [field]: value }; set('videos', nv)
    }

    const addVideo = () => set('videos', [...videos, { url: '', title: '' }])
    const removeVideo = (i: number) => set('videos', videos.filter((_, idx) => idx !== i))

    const handleSave = async () => {
        setSaving(true)
        try { await updateWidget(id, data); setIsDirty(false) }
        catch (e) { console.error('Save failed:', e) }
        setSaving(false)
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sütun Sayısı</label>
                <select value={data.columns || 2} onChange={e => set('columns', parseInt(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value={1}>1 Sütun</option>
                    <option value={2}>2 Sütun</option>
                    <option value={3}>3 Sütun</option>
                </select>
            </div>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Videolar ({videos.length})</label>
                <button type="button" onClick={addVideo} className="flex items-center gap-1 text-xs text-blue-600">
                    <Plus size={14} /> Video Ekle
                </button>
            </div>
            {videos.map((v, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                        <input type="text" value={v.title} onChange={e => updateVideo(i, 'title', e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Video başlığı" />
                        <button type="button" onClick={() => removeVideo(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <input type="url" value={v.url} onChange={e => updateVideo(i, 'url', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm" placeholder="https://www.youtube.com/embed/..." />
                    {v.url && (
                        <iframe src={v.url} className="w-full h-32 rounded" allowFullScreen />
                    )}
                </div>
            ))}
            {isDirty && (
                <button onClick={handleSave} disabled={saving}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            )}
        </div>
    )
}
