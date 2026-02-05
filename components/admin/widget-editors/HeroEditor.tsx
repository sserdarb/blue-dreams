'use client'

import { useState, useEffect } from 'react'
import { updateWidget } from '@/app/actions/admin'
import Image from 'next/image'

interface HeroData {
    title?: string
    subtitle?: string
    imageUrl?: string
    youtubeUrl?: string
    ctaText?: string
    ctaUrl?: string
    overlayOpacity?: number
    textAlign?: 'left' | 'center' | 'right'
}

export function HeroEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<HeroData>(() => {
        try {
            return typeof initialData === 'string' ? JSON.parse(initialData) : initialData
        } catch {
            return {}
        }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleChange = (field: keyof HeroData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
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
            {/* Media Type Toggle */}
            <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name={`media-${id}`}
                        checked={!data.youtubeUrl}
                        onChange={() => handleChange('youtubeUrl', '')}
                        className="text-blue-600"
                    />
                    <span className="text-sm font-medium">Image Background</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name={`media-${id}`}
                        checked={!!data.youtubeUrl}
                        onChange={() => handleChange('youtubeUrl', 'https://youtube.com/watch?v=')}
                        className="text-blue-600"
                    />
                    <span className="text-sm font-medium">YouTube Video Background</span>
                </label>
            </div>

            {/* Image or YouTube URL */}
            {data.youtubeUrl !== undefined && data.youtubeUrl !== '' ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                    <input
                        type="url"
                        value={data.youtubeUrl || ''}
                        onChange={e => handleChange('youtubeUrl', e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Video will autoplay muted as background</p>
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL</label>
                    <input
                        type="url"
                        value={data.imageUrl || ''}
                        onChange={e => handleChange('imageUrl', e.target.value)}
                        placeholder="/uploads/hero.jpg"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                    {data.imageUrl && (
                        <div className="mt-2 relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
                            <Image src={data.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                        </div>
                    )}
                </div>
            )}

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                    type="text"
                    value={data.title || ''}
                    onChange={e => handleChange('title', e.target.value)}
                    placeholder="Welcome to Blue Dreams Resort"
                    className="w-full border rounded-lg px-3 py-2"
                />
            </div>

            {/* Subtitle */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea
                    value={data.subtitle || ''}
                    onChange={e => handleChange('subtitle', e.target.value)}
                    placeholder="Experience luxury on the Aegean coast..."
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                />
            </div>

            {/* Text Alignment */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
                <div className="flex gap-2">
                    {(['left', 'center', 'right'] as const).map(align => (
                        <button
                            key={align}
                            type="button"
                            onClick={() => handleChange('textAlign', align)}
                            className={`px-4 py-2 rounded border text-sm capitalize ${(data.textAlign || 'center') === align
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {align}
                        </button>
                    ))}
                </div>
            </div>

            {/* CTA Button */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                    <input
                        type="text"
                        value={data.ctaText || ''}
                        onChange={e => handleChange('ctaText', e.target.value)}
                        placeholder="Book Now"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
                    <input
                        type="text"
                        value={data.ctaUrl || ''}
                        onChange={e => handleChange('ctaUrl', e.target.value)}
                        placeholder="/contact"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                </div>
            </div>

            {/* Overlay Opacity */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overlay Darkness: {data.overlayOpacity || 30}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="80"
                    value={data.overlayOpacity || 30}
                    onChange={e => handleChange('overlayOpacity', parseInt(e.target.value))}
                    className="w-full"
                />
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
