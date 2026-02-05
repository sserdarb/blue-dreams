'use client'

import { HeroEditor } from './HeroEditor'
import { TextEditor } from './TextEditor'
import { GalleryEditor } from './GalleryEditor'
import { FeaturesEditor } from './FeaturesEditor'

interface WidgetEditorProps {
    id: string
    type: string
    initialData: string
}

const editorMap: { [key: string]: React.ComponentType<{ id: string; initialData: string }> } = {
    'hero': HeroEditor,
    'text': TextEditor,
    'gallery': GalleryEditor,
    'image-gallery': GalleryEditor,
    'features': FeaturesEditor,
}

export function WidgetEditor({ id, type, initialData }: WidgetEditorProps) {
    const Editor = editorMap[type]

    if (!Editor) {
        // Fallback to JSON editor for unknown types
        return (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700 mb-2">
                    No visual editor available for widget type: <strong>{type}</strong>
                </p>
                <p className="text-xs text-yellow-600">
                    Using raw JSON editor. Consider adding a visual editor for better UX.
                </p>
                <textarea
                    className="w-full h-32 font-mono text-xs border rounded-lg p-2 mt-2 bg-white"
                    defaultValue={(() => {
                        try {
                            return JSON.stringify(JSON.parse(initialData), null, 2)
                        } catch {
                            return initialData
                        }
                    })()}
                    readOnly
                />
            </div>
        )
    }

    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <Editor id={id} initialData={initialData} />
        </div>
    )
}

// Widget type metadata for the UI
export const WIDGET_TYPES = [
    {
        type: 'hero',
        label: 'Hero Section',
        description: 'Full-width banner with image or video background',
        icon: '🎬'
    },
    {
        type: 'text',
        label: 'Text Block',
        description: 'Rich text content with styling options',
        icon: '📝'
    },
    {
        type: 'image-gallery',
        label: 'Image Gallery',
        description: 'Grid of images with lightbox',
        icon: '🖼️'
    },
    {
        type: 'features',
        label: 'Features',
        description: 'Feature cards with icons and text',
        icon: '✨'
    },
    {
        type: 'room-list',
        label: 'Room List',
        description: 'Display accommodation options',
        icon: '🏨'
    },
    {
        type: 'youtube',
        label: 'YouTube Video',
        description: 'Embed a YouTube video',
        icon: '📺'
    },
    {
        type: 'cta-banner',
        label: 'CTA Banner',
        description: 'Call-to-action section with button',
        icon: '📢'
    },
    {
        type: 'testimonials',
        label: 'Testimonials',
        description: 'Guest reviews and ratings',
        icon: '⭐'
    },
    {
        type: 'contact-form',
        label: 'Contact Form',
        description: 'Contact form with email submission',
        icon: '✉️'
    },
    {
        type: 'divider',
        label: 'Divider',
        description: 'Visual separator between sections',
        icon: '➖'
    },
]
