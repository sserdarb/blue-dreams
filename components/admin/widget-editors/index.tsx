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

// Re-export WIDGET_TYPES from shared module (not 'use client' boundary)
export { WIDGET_TYPES } from './widget-types'
