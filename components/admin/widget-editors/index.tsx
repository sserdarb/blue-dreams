'use client'

import { useState } from 'react'
import { HeroEditor } from './HeroEditor'
import { TextEditor } from './TextEditor'
import { GalleryEditor } from './GalleryEditor'
import { FeaturesEditor } from './FeaturesEditor'
import { updateWidget } from '@/app/actions/admin'
import { Save, Check } from 'lucide-react'

interface WidgetEditorProps {
    id: string
    type: string
    initialData: string
}

// Visual editors for specific types
const editorMap: { [key: string]: React.ComponentType<{ id: string; initialData: string }> } = {
    'hero': HeroEditor,
    'text': TextEditor,
    'gallery': GalleryEditor,
    'image-gallery': GalleryEditor,
    'features': FeaturesEditor,
}

/**
 * Generic JSON editor for widget types without a visual editor
 */
function GenericJsonEditor({ id, initialData }: { id: string; initialData: string }) {
    const [json, setJson] = useState(() => {
        try { return JSON.stringify(JSON.parse(initialData), null, 2) } catch { return initialData || '{}' }
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    const handleSave = async () => {
        try {
            setSaving(true)
            setError('')
            const parsed = JSON.parse(json)
            await updateWidget(id, parsed)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (e: any) {
            setError(e.message || 'Invalid JSON')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-3">
            <textarea
                className="w-full h-64 font-mono text-xs border border-gray-200 rounded-lg p-3 bg-gray-50 focus:outline-none focus:border-blue-400 resize-y"
                value={json}
                onChange={(e) => { setJson(e.target.value); setSaved(false); setError('') }}
                placeholder='{ "key": "value" }'
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${saved ? 'bg-green-500 text-white' :
                        'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
            >
                {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save'}</>}
            </button>
        </div>
    )
}

export function WidgetEditor({ id, type, initialData }: WidgetEditorProps) {
    const Editor = editorMap[type]

    if (Editor) {
        return (
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <Editor id={id} initialData={initialData} />
            </div>
        )
    }

    // Fallback to generic JSON editor with save support
    return (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700 mb-3">
                Visual editor for <strong>{type}</strong> — edit JSON data below:
            </p>
            <GenericJsonEditor id={id} initialData={initialData} />
        </div>
    )
}

// Widget type metadata for the UI
export const WIDGET_TYPES = [
    { type: 'hero', label: 'Hero Section', description: 'Full-width banner with image or video background', icon: '🎬' },
    { type: 'page-header', label: 'Page Header', description: 'Sub-page header with background image and breadcrumbs', icon: '📄' },
    { type: 'text', label: 'Text Block', description: 'Rich text content with styling options', icon: '📝' },
    { type: 'text-block', label: 'Statement Block', description: 'Centered statement/quote section', icon: '💬' },
    { type: 'text-image', label: 'Text + Image', description: 'Split layout with text and image', icon: '🖼️' },
    { type: 'stats', label: 'Statistics Bar', description: 'Row of stat items with icons', icon: '📊' },
    { type: 'icon-grid', label: 'Icon Cards', description: 'Grid of cards with icons and text', icon: '✨' },
    { type: 'image-grid', label: 'Image Cards', description: 'Grid of cards with images', icon: '🎨' },
    { type: 'gallery', label: 'Image Gallery', description: 'Gallery with lightbox', icon: '📸' },
    { type: 'features', label: 'Features', description: 'Feature list with icons', icon: '⭐' },
    { type: 'cta', label: 'Call to Action', description: 'CTA section with buttons', icon: '📢' },
    { type: 'contact', label: 'Contact Section', description: 'Contact info + form', icon: '✉️' },
    { type: 'map', label: 'Map Embed', description: 'Google Maps embed', icon: '🗺️' },
    { type: 'youtube', label: 'YouTube Videos', description: 'Embed YouTube videos', icon: '📺' },
    { type: 'table', label: 'Data Table', description: 'Table with columns and rows', icon: '📋' },
    { type: 'reviews', label: 'Reviews', description: 'Guest reviews and ratings', icon: '⭐' },
    { type: 'weather', label: 'Weather', description: 'Monthly weather data', icon: '🌤️' },
    { type: 'experience', label: 'Experience', description: 'Interactive experience showcase', icon: '🏊' },
    { type: 'room-list', label: 'Room List', description: 'Room cards from database', icon: '🏨' },
    { type: 'divider', label: 'Divider', description: 'Visual separator', icon: '➖' },
]
