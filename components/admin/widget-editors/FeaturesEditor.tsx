'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2, GripVertical } from 'lucide-react'

interface Feature {
    icon?: string
    title?: string
    description?: string
}

interface FeaturesData {
    title?: string
    subtitle?: string
    features?: Feature[]
    columns?: number
    style?: 'cards' | 'icons' | 'minimal'
}

const ICON_OPTIONS = [
    { value: 'star', label: '⭐ Star' },
    { value: 'heart', label: '❤️ Heart' },
    { value: 'check', label: '✓ Check' },
    { value: 'sparkles', label: '✨ Sparkles' },
    { value: 'sun', label: '☀️ Sun' },
    { value: 'moon', label: '🌙 Moon' },
    { value: 'coffee', label: '☕ Coffee' },
    { value: 'utensils', label: '🍴 Dining' },
    { value: 'bed', label: '🛏️ Bed' },
    { value: 'spa', label: '💆 Spa' },
    { value: 'pool', label: '🏊 Pool' },
    { value: 'wifi', label: '📶 WiFi' },
    { value: 'parking', label: '🅿️ Parking' },
    { value: 'gym', label: '💪 Gym' },
]

export function FeaturesEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<FeaturesData>(() => {
        try {
            return typeof initialData === 'string' ? JSON.parse(initialData) : initialData
        } catch {
            return { features: [] }
        }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleChange = (field: keyof FeaturesData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const addFeature = () => {
        const features = [...(data.features || []), { icon: 'star', title: '', description: '' }]
        handleChange('features', features)
    }

    const removeFeature = (index: number) => {
        const features = (data.features || []).filter((_, i) => i !== index)
        handleChange('features', features)
    }

    const updateFeature = (index: number, field: keyof Feature, value: string) => {
        const features = [...(data.features || [])]
        features[index] = { ...features[index], [field]: value }
        handleChange('features', features)
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
            {/* Section Header */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={e => handleChange('title', e.target.value)}
                        placeholder="Our Amenities"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input
                        type="text"
                        value={data.subtitle || ''}
                        onChange={e => handleChange('subtitle', e.target.value)}
                        placeholder="Experience luxury at its finest"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                </div>
            </div>

            {/* Layout Options */}
            <div className="grid grid-cols-2 gap-4">
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
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                    <select
                        value={data.style || 'cards'}
                        onChange={e => handleChange('style', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="cards">Cards with Shadow</option>
                        <option value="icons">Icons Only</option>
                        <option value="minimal">Minimal</option>
                    </select>
                </div>
            </div>

            {/* Features List */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Features</label>
                    <button
                        onClick={addFeature}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                        <Plus size={14} /> Add Feature
                    </button>
                </div>

                {(data.features || []).map((feature, index) => (
                    <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg border space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <GripVertical size={16} className="text-gray-400 cursor-move" />
                            <select
                                value={feature.icon || 'star'}
                                onChange={e => updateFeature(index, 'icon', e.target.value)}
                                className="border rounded px-2 py-1 text-sm"
                            >
                                {ICON_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={feature.title || ''}
                                onChange={e => updateFeature(index, 'title', e.target.value)}
                                placeholder="Feature title"
                                className="flex-1 border rounded px-2 py-1 text-sm"
                            />
                            <button
                                onClick={() => removeFeature(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <textarea
                            value={feature.description || ''}
                            onChange={e => updateFeature(index, 'description', e.target.value)}
                            placeholder="Feature description..."
                            rows={2}
                            className="w-full border rounded px-2 py-1 text-sm"
                        />
                    </div>
                ))}

                {(data.features || []).length === 0 && (
                    <p className="text-sm text-gray-500 italic py-4 text-center">No features added yet</p>
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
