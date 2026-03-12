// Widget type metadata - shared between server and client components
// Using a plain array with explicit type for SSR compatibility
const widgetTypes = [
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
    { type: 'factsheet', label: 'Factsheet Page', description: 'Complete Factsheet builder', icon: '📋' },
    { type: 'divider', label: 'Divider', description: 'Visual separator', icon: '➖' },
] as const

export type WidgetTypeInfo = typeof widgetTypes[number]

// Export as a mutable array to avoid SSR/RSC module boundary issues
export const WIDGET_TYPES: WidgetTypeInfo[] = [...widgetTypes]

// Helper function for safer lookups (avoids .find on potentially non-array module exports)
export function getWidgetTypeInfo(type: string): WidgetTypeInfo | undefined {
    return widgetTypes.find(w => w.type === type)
}

export function getWidgetIcon(type: string): string {
    return widgetTypes.find(w => w.type === type)?.icon || '📦'
}
