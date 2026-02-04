'use client'

import Image from 'next/image'
import { useState } from 'react'

interface GalleryData {
    images?: { url: string; alt?: string }[]
    columns?: number
    gap?: 'small' | 'medium' | 'large'
    style?: 'grid' | 'masonry'
}

export function GalleryWidget({ data }: { data: GalleryData }) {
    const [lightboxImage, setLightboxImage] = useState<string | null>(null)

    const images = data.images || []
    const columns = data.columns || 3
    const gap = data.gap || 'medium'

    if (images.length === 0) {
        return null
    }

    const gapClasses = {
        small: 'gap-2',
        medium: 'gap-4',
        large: 'gap-6'
    }

    const colClasses = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        6: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
    }

    return (
        <>
            <section className="py-12 md:py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className={`grid ${colClasses[columns as keyof typeof colClasses] || colClasses[3]} ${gapClasses[gap]}`}>
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group shadow-md hover:shadow-xl transition-shadow"
                                onClick={() => setLightboxImage(image.url)}
                            >
                                <Image
                                    src={image.url}
                                    alt={image.alt || `Gallery image ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl">
                                        ⤢
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lightbox */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
                        onClick={() => setLightboxImage(null)}
                    >
                        ×
                    </button>
                    <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
                        <Image
                            src={lightboxImage}
                            alt="Lightbox image"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                </div>
            )}
        </>
    )
}
