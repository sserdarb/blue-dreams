'use client'

import { Star } from 'lucide-react'

interface ReviewItem {
    author: string
    text: string
    rating?: number
}

interface ReviewsSectionData {
    label?: string
    heading?: string
    headingAccent?: string
    description?: string
    bookingScore?: string
    bookingLabel?: string
    buttonText?: string
    buttonUrl?: string
    reviews?: ReviewItem[]
    sourceLabel?: string
}

export function ReviewsSectionWidget({ data }: { data: ReviewsSectionData }) {
    return (
        <section className="py-24 bg-[#ebe9e4]">
            <div className="container mx-auto px-6 md:px-12">

                <div className="mb-16">
                    {data.label && (
                        <span className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2 block">{data.label}</span>
                    )}
                    <h2 className="text-5xl md:text-7xl font-serif text-gray-900 leading-none">
                        {data.heading} <br />
                        <span className="italic font-light">{data.headingAccent}</span>
                    </h2>
                    {data.description && (
                        <p className="mt-6 text-gray-600 max-w-xl">{data.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-6 flex-wrap">
                        {data.bookingScore && (
                            <div className="flex items-center gap-2 bg-[#003580] text-white px-4 py-2.5 rounded-lg shadow-md">
                                <span className="text-2xl font-bold">{data.bookingScore}</span>
                                <div className="text-left">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">{data.bookingLabel || 'Booking.com'}</span>
                                    <span className="block text-xs opacity-60">/ 10</span>
                                </div>
                            </div>
                        )}
                        {data.buttonText && (
                            <a
                                href={data.buttonUrl || '#'}
                                target="_blank"
                                className="inline-block bg-[#b45309] text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#92400e] transition-colors rounded-sm shadow-md"
                            >
                                {data.buttonText}
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(data.reviews || []).map((review, i) => (
                        <div key={i} className="bg-brand-dark p-10 text-white relative group hover:-translate-y-2 transition-transform duration-300">
                            <div className="flex text-brand-light mb-6">
                                {[...Array(review.rating || 5)].map((_, j) => (
                                    <Star key={j} size={14} fill="currentColor" className="mr-1" />
                                ))}
                            </div>

                            <div className="mb-8 min-h-[100px]">
                                <h4 className="font-serif text-lg mb-2 text-white/90">{review.author}</h4>
                                <p className="text-white/70 text-sm font-light leading-relaxed line-clamp-4">
                                    &quot;{review.text}&quot;
                                </p>
                            </div>

                            <div className="text-[10px] tracking-widest uppercase text-white/40 border-t border-white/10 pt-4">
                                {data.sourceLabel || 'Google Yorumu'}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
