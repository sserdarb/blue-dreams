'use client'

import { Star } from 'lucide-react'

interface ReviewItem {
    name: string
    country?: string
    rating: number
    text: string
    date?: string
}

interface ReviewsData {
    label?: string
    heading?: string
    source?: string
    overallRating?: number
    reviewCount?: number
    items: ReviewItem[]
}

export function ReviewsWidget({ data }: { data: ReviewsData }) {
    return (
        <section className="py-20 bg-sand">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    {data.label && (
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                            {data.label}
                        </span>
                    )}
                    {data.heading && (
                        <h2 className="text-4xl font-serif text-gray-900 mb-4">{data.heading}</h2>
                    )}
                    {(data.source || data.overallRating) && (
                        <div className="flex items-center justify-center gap-4">
                            {data.source && <span className="text-gray-500 text-sm">{data.source}</span>}
                            {data.overallRating && (
                                <div className="flex items-center gap-1">
                                    <div className="bg-brand text-white px-3 py-1 rounded-lg font-bold">
                                        {data.overallRating}
                                    </div>
                                    <div className="flex">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} size={16} className={i < Math.round(data.overallRating! / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {data.reviewCount && <span className="text-gray-500 text-sm">({data.reviewCount} reviews)</span>}
                        </div>
                    )}
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.items?.map((review, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span className="font-bold text-gray-900">{review.name}</span>
                                    {review.country && <span className="text-gray-500 text-sm ml-2">{review.country}</span>}
                                </div>
                                <div className="bg-brand text-white px-2 py-0.5 rounded text-sm font-bold">
                                    {review.rating}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm italic leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                            {review.date && <span className="text-gray-400 text-xs mt-3 block">{review.date}</span>}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
