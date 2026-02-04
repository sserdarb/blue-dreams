'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { GALLERY_IMAGES } from '@/lib/constants'

export default function GalleryPage() {
    const categories = ["Tümü", "Odalar", "Plaj & Havuz", "Gastronomi", "Genel"]
    const [activeCategory, setActiveCategory] = useState("Tümü")
    const [filteredImages, setFilteredImages] = useState(GALLERY_IMAGES)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    useEffect(() => {
        if (activeCategory === "Tümü") {
            setFilteredImages(GALLERY_IMAGES)
        } else {
            setFilteredImages(GALLERY_IMAGES.filter(img => img.category === activeCategory))
        }
    }, [activeCategory])

    const openModal = (index: number) => {
        setSelectedIndex(index)
        document.body.style.overflow = 'hidden'
    }

    const closeModal = useCallback(() => {
        setSelectedIndex(null)
        document.body.style.overflow = 'unset'
    }, [])

    const nextImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (selectedIndex !== null) {
            setSelectedIndex((prev) => (prev !== null ? (prev + 1) % filteredImages.length : null))
        }
    }, [selectedIndex, filteredImages.length])

    const prevImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (selectedIndex !== null) {
            setSelectedIndex((prev) => (prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : null))
        }
    }, [selectedIndex, filteredImages.length])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return
            if (e.key === 'Escape') closeModal()
            if (e.key === 'ArrowRight') nextImage()
            if (e.key === 'ArrowLeft') prevImage()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedIndex, closeModal, nextImage, prevImage])

    return (
        <div>
            <PageHeader
                title="Galeri"
                subtitle="Blue Dreams Resort'un eşsiz atmosferini fotoğraflarla keşfedin."
                backgroundImage="https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg"
                breadcrumbs={[{ label: 'Galeri', href: '/tr/galeri' }]}
            />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-full border ${activeCategory === cat
                                        ? 'bg-brand text-white border-brand shadow-lg'
                                        : 'bg-transparent text-gray-500 border-gray-200 hover:border-brand hover:text-brand'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Masonry Layout */}
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {filteredImages.map((image, index) => (
                            <div
                                key={`${image.src}-${index}`}
                                className="break-inside-avoid relative group overflow-hidden cursor-pointer rounded-lg shadow-md hover:shadow-xl transition-all duration-500"
                                onClick={() => openModal(index)}
                            >
                                <div className="overflow-hidden">
                                    <img
                                        src={image.src}
                                        alt={image.title}
                                        className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                    <span className="text-brand-light text-xs font-bold tracking-widest uppercase mb-2">
                                        {image.category}
                                    </span>
                                    <h3 className="text-white font-serif text-xl">
                                        {image.title}
                                    </h3>
                                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-2 rounded-full text-white">
                                        <ZoomIn size={18} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lightbox */}
            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
                    onClick={closeModal}
                >
                    <button
                        onClick={closeModal}
                        className="absolute top-6 right-6 text-white/50 hover:text-white z-20 p-2"
                    >
                        <X size={32} />
                    </button>

                    <button
                        onClick={prevImage}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-20 p-3 border border-white/10 rounded-full hover:bg-white/10"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <div className="relative max-w-5xl w-full flex flex-col items-center">
                        <img
                            src={filteredImages[selectedIndex].src}
                            alt={filteredImages[selectedIndex].title}
                            className="max-h-[80vh] max-w-full object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="mt-4 text-center">
                            <h3 className="text-white font-serif text-2xl">{filteredImages[selectedIndex].title}</h3>
                            <p className="text-brand-light text-xs uppercase tracking-widest mt-1">{filteredImages[selectedIndex].category}</p>
                        </div>
                    </div>

                    <button
                        onClick={nextImage}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-20 p-3 border border-white/10 rounded-full hover:bg-white/10"
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>
            )}
        </div>
    )
}
