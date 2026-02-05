'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import Image from 'next/image'
import { Plus, Trash2, GripVertical } from 'lucide-react'

interface GalleryData {
    images?: { url: string; alt?: string }[]
    columns?: number
    gap?: 'small' | 'medium' | 'large'
    style?: 'grid' | 'masonry'
}

export function GalleryEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<GalleryData>(() => {
        try {
            return typeof initialData === 'string' ? JSON.parse(initialData) : initialData
        } catch {
            return { images: [], columns: 3 }
        }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)
    const [newImageUrl, setNewImageUrl] = useState('')

    const handleChange = (field: keyof GalleryData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const addImage = () => {
        if (!newImageUrl) return
        const images = [...(data.images || []), { url: newImageUrl, alt: '' }]
        handleChange('images', images)
        setNewImageUrl('')
    }

    const removeImage = (index: number) => {
        const images = (data.images || []).filter((_, i) => i !== index)
        handleChange('images', images)
    }

    const updateImageAlt = (index: number, alt: string) => {
        const images = [...(data.images || [])]
        images[index] = { ...images[index], alt }
        handleChange('images', images)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateWidget(id, data)
            setIsDirty(false)
        } catch (e) {
            alert('Failed to save')
        }
        setSaving(false)
    }

    return (
        <div className="space-y-4">
            {/* Layout Options */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
                    <select
                        value={data.columns || 3}
                        onChange={e => handleChange('columns', parseInt(e.target.value))}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value={2}>2 Columns</option>
                        <option value={3}>3 Columns</option>
                        <option value={4}>4 Columns</option>
                        <option value={6}>6 Columns</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gap</label>
                    <select
                        value={data.gap || 'medium'}
                        onChange={e => handleChange('gap', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                    <select
                        value={data.style || 'grid'}
                        onChange={e => handleChange('style', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="grid">Grid</option>
                        <option value="masonry">Masonry</option>
                    </select>
                </div>
            </div>

            {/* Add New Image */}
            <div className="flex gap-2">
                <input
                    type="url"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="/uploads/gallery-1.jpg"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                    onClick={addImage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={16} /> Add
                </button>
            </div>

            {/* Image List */}
            <div className="space-y-2">
                {(data.images || []).map((image, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border"
                    >
                        <GripVertical size={16} className="text-gray-400 cursor-move" />
                        <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                            <Image
                                src={image.url}
                                alt={image.alt || ''}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 truncate">{image.url}</p>
                            <input
                                type="text"
                                value={image.alt || ''}
                                onChange={e => updateImageAlt(index, e.target.value)}
                                placeholder="Alt text (optional)"
                                className="w-full border rounded px-2 py-1 text-sm mt-1"
                            />
                        </div>
                        <button
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700 p-2"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {(data.images || []).length === 0 && (
                    <p className="text-sm text-gray-500 italic py-4 text-center">No images added yet</p>
                )}
            </div>

            {/* Save Button */}
            {isDirty && (
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            )}
        </div>
    )
}
