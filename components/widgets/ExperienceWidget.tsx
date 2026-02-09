'use client'

import { useState } from 'react'

interface ExperienceItem {
    title: string
    description: string
    image: string
    icon?: string
}

interface ExperienceData {
    label?: string
    heading?: string
    headingAccent?: string
    items: ExperienceItem[]
}

export function ExperienceWidget({ data }: { data: ExperienceData }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const items = data.items || []
    const activeItem = items[activeIndex]

    if (!items.length) return null

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                {(data.label || data.heading) && (
                    <div className="text-center mb-12">
                        {data.label && (
                            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                {data.label}
                            </span>
                        )}
                        {data.heading && (
                            <h2 className="text-4xl font-serif text-gray-900">
                                {data.heading}{' '}
                                {data.headingAccent && <span className="italic text-brand">{data.headingAccent}</span>}
                            </h2>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Image Side */}
                    <div className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl">
                        {activeItem?.image && (
                            <img
                                src={activeItem.image}
                                alt={activeItem.title}
                                className="w-full h-full object-cover transition-all duration-700"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                            <h3 className="text-3xl font-serif mb-2">{activeItem?.title}</h3>
                            <p className="text-white/80 text-sm">{activeItem?.description}</p>
                        </div>
                    </div>

                    {/* Tabs Side */}
                    <div className="space-y-4">
                        {items.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`w-full text-left p-6 rounded-lg transition-all duration-300 ${i === activeIndex
                                        ? 'bg-brand text-white shadow-lg scale-[1.02]'
                                        : 'bg-sand hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {item.icon && <span className="text-2xl">{item.icon}</span>}
                                    <div>
                                        <h4 className={`font-bold text-lg ${i === activeIndex ? 'text-white' : 'text-gray-900'}`}>
                                            {item.title}
                                        </h4>
                                        <p className={`text-sm mt-1 ${i === activeIndex ? 'text-white/80' : 'text-gray-500'}`}>
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
