'use client'

import { useState } from 'react'
import { HeroEditor } from './HeroEditor'
import { TextEditor } from './TextEditor'
import { GalleryEditor } from './GalleryEditor'
import { FeaturesEditor } from './FeaturesEditor'
import { PageHeaderEditor } from './PageHeaderEditor'
import { TextBlockEditor } from './TextBlockEditor'
import { TextImageEditor } from './TextImageEditor'
import { StatsEditor } from './StatsEditor'
import { IconGridEditor } from './IconGridEditor'
import { ImageGridEditor } from './ImageGridEditor'
import { CTAEditor } from './CTAEditor'
import { ContactEditor } from './ContactEditor'
import { MapEditor } from './MapEditor'
import { YoutubeEditor } from './YoutubeEditor'
import { TableEditor } from './TableEditor'
import { ReviewsEditor } from './ReviewsEditor'
import { WeatherEditor } from './WeatherEditor'
import { ExperienceEditor } from './ExperienceEditor'
import { RoomListEditor } from './RoomListEditor'
import { DividerEditor } from './DividerEditor'
import { FactsheetEditor } from './FactsheetEditor'
import { updateWidget } from '@/app/actions/admin'
import { Save, Check } from 'lucide-react'

interface WidgetEditorProps {
    id: string
    type: string
    initialData: string
}

// Visual editors — type string maps to editor component
const editorMap: { [key: string]: React.ComponentType<{ id: string; initialData: string }> } = {
    // Core types
    'hero': HeroEditor,
    'text': TextEditor,
    'gallery': GalleryEditor,
    'image-gallery': GalleryEditor,
    'features': FeaturesEditor,
    // Page widget types
    'page-header': PageHeaderEditor,
    'text-block': TextBlockEditor,
    'text-image': TextImageEditor,
    'stats': StatsEditor,
    'icon-grid': IconGridEditor,
    'image-grid': ImageGridEditor,
    'cta': CTAEditor,
    'contact': ContactEditor,
    'map': MapEditor,
    'youtube': YoutubeEditor,
    'table': TableEditor,
    'reviews': ReviewsEditor,
    'reviews-section': ReviewsEditor,       // Homepage variant
    'weather': WeatherEditor,
    'experience': ExperienceEditor,
    'experience-blocks': ExperienceEditor,  // Homepage variant
    'room-list': RoomListEditor,
    'divider': DividerEditor,
    'factsheet': FactsheetEditor,
    // Homepage widget aliases → generic JSON (complex structures)
    'location-map': MapEditor,
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
            console.error('Widget save error:', e)
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
                {saved ? <><Check size={14} /> Kaydedildi!</> : <><Save size={14} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}</>}
            </button>
        </div>
    )
}

export function WidgetEditor({ id, type, initialData }: WidgetEditorProps) {
    const Editor = editorMap[type]

    if (Editor) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 lg:p-6 shadow-sm overflow-hidden relative group">
                {/* Optional decorative top border based on type */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Editor id={id} initialData={initialData} />
            </div>
        )
    }

    // Fallback to generic JSON editor with save support
    return (
        <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-5 lg:p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 dark:bg-amber-500" />
            <div className="pl-2">
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        Fallback Modu
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        <strong className="font-mono text-amber-600 dark:text-amber-500">{type}</strong> için JSON Düzenleyici
                    </h4>
                </div>
                <GenericJsonEditor id={id} initialData={initialData} />
            </div>
        </div>
    )
}

// Re-export WIDGET_TYPES from shared module (not 'use client' boundary)
export { WIDGET_TYPES } from './widget-types'
