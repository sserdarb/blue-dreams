'use client'

import { Clock, ChefHat } from 'lucide-react'

interface ImageGridItem {
    image: string
    title: string
    subtitle?: string
    description?: string
    link?: string
    badge?: string
    meta?: string
    meta2?: string
}

interface ImageGridData {
    label?: string
    heading?: string
    headingAccent?: string
    intro?: string
    items: ImageGridItem[]
    columns?: number
    variant?: 'card' | 'overlay' | 'simple' | 'tall'
    backgroundColor?: 'white' | 'sand'
}

export function ImageGridWidget({ data }: { data: ImageGridData }) {
    const bg = data.backgroundColor === 'sand' ? 'bg-sand' : 'bg-white'
    const cols = data.columns || 3
    const variant = data.variant || 'card'

    return (
        <section className={`py-16 ${bg}`}>
            <div className="container mx-auto px-6">
                {/* Header */}
                {(data.label || data.heading || data.intro) && (
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        {data.label && (
                            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                {data.label}
                            </span>
                        )}
                        {data.heading && (
                            <h2 className="text-4xl font-serif text-gray-900 mb-6">
                                {data.heading}{' '}
                                {data.headingAccent && <span className="italic text-brand">{data.headingAccent}</span>}
                            </h2>
                        )}
                        {data.intro && <p className="text-gray-600 leading-relaxed">{data.intro}</p>}
                    </div>
                )}

                {/* Grid */}
                {variant === 'tall' ? (
                    /* Tall overlay cards (homepage category style) */
                    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-6`}>
                        {data.items?.map((item, i) => (
                            <a key={i} href={item.link || '#'} className="relative h-[500px] md:h-[450px] lg:h-[600px] group overflow-hidden cursor-pointer block">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                                <div className="absolute bottom-12 left-0 right-0 text-center px-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-4xl md:text-3xl lg:text-5xl font-serif text-white mb-3">{item.title}</h3>
                                    {item.subtitle && <p className="text-white/80 font-sans text-sm tracking-widest uppercase">{item.subtitle}</p>}
                                </div>
                            </a>
                        ))}
                    </div>
                ) : variant === 'overlay' ? (
                    /* Overlay cards with hover effect */
                    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-8`}>
                        {data.items?.map((item, i) => (
                            <div key={i} className="group bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="relative h-[280px] overflow-hidden">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    {item.badge && (
                                        <div className="absolute top-4 left-4 bg-brand text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
                                            {item.badge}
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-serif text-gray-900 mb-3 group-hover:text-brand transition-colors">{item.title}</h3>
                                    {item.description && <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.description}</p>}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        {item.meta && (
                                            <span className="flex items-center gap-1"><Clock size={14} /> {item.meta}</span>
                                        )}
                                        {item.meta2 && (
                                            <span className="flex items-center gap-1"><ChefHat size={14} /> {item.meta2}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : variant === 'simple' ? (
                    /* Simple image + text cards */
                    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-8`}>
                        {data.items?.map((item, i) => (
                            <div key={i} className="text-center group">
                                <div className="overflow-hidden rounded-lg mb-4">
                                    <img src={item.image} alt={item.title} className="w-full h-[200px] object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <h3 className="text-xl font-serif text-gray-900 mb-2">{item.title}</h3>
                                {item.description && <p className="text-gray-600 text-sm">{item.description}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Standard card style */
                    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-8`}>
                        {data.items?.map((item, i) => (
                            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-lg group hover:shadow-xl transition-all duration-300">
                                <div className="relative h-64 overflow-hidden">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <h3 className="text-2xl font-serif">{item.title}</h3>
                                        {item.meta && (
                                            <div className="flex items-center text-sm text-white/70 mt-1">
                                                <Clock size={14} className="mr-1" /> {item.meta}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6">
                                    {item.description && <p className="text-gray-600 text-sm">{item.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
