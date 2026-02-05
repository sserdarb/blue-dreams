'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'

interface TextData {
    content?: string
    backgroundColor?: string
    textColor?: string
    padding?: 'small' | 'medium' | 'large'
    maxWidth?: 'narrow' | 'medium' | 'full'
}

export function TextEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<TextData>(() => {
        try {
            return typeof initialData === 'string' ? JSON.parse(initialData) : initialData
        } catch {
            return { content: '' }
        }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleChange = (field: keyof TextData, value: any) => {
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
            {/* Content */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML supported)</label>
                <textarea
                    value={data.content || ''}
                    onChange={e => handleChange('content', e.target.value)}
                    placeholder="<h2>Welcome</h2><p>Your content here...</p>"
                    rows={6}
                    className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Use HTML tags: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;
                </p>
            </div>

            {/* Styling Options */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                    <select
                        value={data.backgroundColor || 'white'}
                        onChange={e => handleChange('backgroundColor', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="white">White</option>
                        <option value="gray">Light Gray</option>
                        <option value="blue">Light Blue</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                    <select
                        value={data.textColor || 'dark'}
                        onChange={e => handleChange('textColor', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="blue">Blue</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
                    <select
                        value={data.padding || 'medium'}
                        onChange={e => handleChange('padding', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Width</label>
                    <select
                        value={data.maxWidth || 'medium'}
                        onChange={e => handleChange('maxWidth', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="narrow">Narrow (800px)</option>
                        <option value="medium">Medium (1200px)</option>
                        <option value="full">Full Width</option>
                    </select>
                </div>
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
