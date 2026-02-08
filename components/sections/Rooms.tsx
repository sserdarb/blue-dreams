'use client'

import { usePathname } from 'next/navigation'
import { CATEGORIES } from '@/lib/constants'

export default function Rooms() {
    const pathname = usePathname()
    const locale = pathname?.split('/')[1] || 'tr'

    return (
        <section id="rooms" className="py-12 bg-white">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CATEGORIES.map((category) => (
                        <a key={category.id} href={`/${locale}${category.href}`} className="relative h-[500px] md:h-[450px] lg:h-[600px] group overflow-hidden cursor-pointer block">

                            {/* Image */}
                            <img
                                src={category.image}
                                alt={category.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />

                            {/* Dark Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                            {/* Text Content */}
                            <div className="absolute bottom-12 left-0 right-0 text-center px-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-4xl md:text-3xl lg:text-5xl font-serif text-white mb-3">
                                    {category.title}
                                </h3>
                                <p className="text-white/80 font-sans text-sm tracking-widest uppercase">
                                    {category.subtitle}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    )
}
