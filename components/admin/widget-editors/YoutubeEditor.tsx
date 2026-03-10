'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Youtube, LayoutGrid } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorSelect, EditorRepeater, SaveBar, EditorGrid2 } from './EditorUI'

interface Video { url: string; title: string }

interface YoutubeData {
    videos?: Video[]
    columns?: number
}

export function YoutubeEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<YoutubeData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return { videos: [] } }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof YoutubeData, value: any) => {
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
            <EditorSection title="Görünüm" icon={<LayoutGrid size={14} />} defaultOpen={false}>
                <EditorField label="Sütun Sayısı">
                    <EditorSelect
                        value={data.columns || 2}
                        onChange={v => set('columns', parseInt(v))}
                        options={[
                            { value: 1, label: '1 Sütun (Büyük Video)' },
                            { value: 2, label: '2 Sütun' },
                            { value: 3, label: '3 Sütun' },
                        ]}
                    />
                </EditorField>
            </EditorSection>

            <EditorSection title="Videolar" icon={<Youtube size={14} />} badge={data.videos?.length || 0} defaultOpen>
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-4">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        <strong className="font-bold">Önemli:</strong> Sadece <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">https://www.youtube.com/embed/...</code> formatındaki 'embed' URL'lerini kullanın.
                    </p>
                </div>

                <EditorRepeater<Video>
                    items={data.videos || []}
                    onUpdate={items => set('videos', items)}
                    createNewItem={() => ({ url: '', title: '' })}
                    addLabel="Video Ekle"
                    emptyMessage="Henüz video eklenmedi"
                    renderItem={(v, _i, update) => (
                        <div className="space-y-3">
                            <EditorGrid2>
                                <EditorField label="Video Başlığı">
                                    <EditorInput value={v.title} onChange={val => update({ ...v, title: val })} placeholder="Tanıtım Filmi" />
                                </EditorField>
                                <EditorField label="Embed URL">
                                    <EditorInput value={v.url} onChange={val => update({ ...v, url: val })} placeholder="https://www.youtube.com/embed/..." type="url" />
                                </EditorField>
                            </EditorGrid2>
                            {v.url && v.url.includes('embed') && (
                                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <iframe src={v.url} className="w-full h-40" allowFullScreen style={{ border: 0 }} />
                                </div>
                            )}
                        </div>
                    )}
                />
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}
