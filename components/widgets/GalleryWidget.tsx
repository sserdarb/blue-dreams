'use client'

import { useState, useMemo } from 'react'

interface GalleryImage {
    url?: string
    src?: string
    alt?: string
    title?: string
    category?: string
}

interface GalleryData {
    images?: GalleryImage[]
    columns?: number
    gap?: 'small' | 'medium' | 'large'
    style?: 'grid' | 'masonry'
}

export function GalleryWidget({ data }: { data: GalleryData }) {
    const [lightboxImage, setLightboxImage] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    const images = data.images || []
    const columns = data.columns || 3
    const gap = data.gap || 'medium'

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set<string>()
        images.forEach(img => { if (img.category) cats.add(img.category) })
        return Array.from(cats)
    }, [images])

    // Filter images by category
    const filteredImages = activeCategory
        ? images.filter(img => img.category === activeCategory)
        : images

    if (images.length === 0) return null

    const gapClasses = { small: 'gap-2', medium: 'gap-4', large: 'gap-6' }
    const colClasses: Record<number, string> = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        6: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
    }

    const getImageUrl = (img: GalleryImage) => img.url || img.src || ''

    return (
        <>
            <section className="py-12 md:py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Category Filter */}
                    {categories.length > 1 && (
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            <button
                                onClick={() => setActiveCategory(null)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!activeCategory ? 'bg-brand text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Tümü
                            </button>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-brand text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className={`grid ${colClasses[columns] || colClasses[3]} ${gapClasses[gap]}`}>
                        {filteredImages.map((image, index) => {
                            const imgUrl = getImageUrl(image)
                            return (
                                <div key={index}
                                    className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group shadow-md hover:shadow-xl transition-shadow"
                                    onClick={() => setLightboxImage(imgUrl)}>
                                    <img src={imgUrl} alt={image.alt || image.title || `Gallery image ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl">⤢</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {lightboxImage && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setLightboxImage(null)}>
                    <button className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
                        onClick={() => setLightboxImage(null)}>×</button>
                    <img src={lightboxImage} alt="Lightbox" className="max-w-full max-h-[90vh] object-contain" />
                </div>
            )}
        </>
    )
}
