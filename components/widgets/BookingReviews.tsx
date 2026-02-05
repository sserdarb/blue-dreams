'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

interface Review {
    id: number
    author: string
    country: string
    countryFlag: string
    rating: number
    title: string
    positive: string
    negative?: string
    date: string
    roomType: string
    stayType: string
}

const BOOKING_RATING = {
    overall: 8.7,
    reviewCount: 2847,
    categories: [
        { name: 'Personel', score: 9.1 },
        { name: 'Olanaklar', score: 8.5 },
        { name: 'Temizlik', score: 8.8 },
        { name: 'Konfor', score: 8.6 },
        { name: 'Fiyat/Kalite', score: 8.3 },
        { name: 'Konum', score: 9.0 },
        { name: 'Ücretsiz WiFi', score: 8.2 },
    ]
}

const REVIEWS: Review[] = [
    {
        id: 1,
        author: 'Mehmet A.',
        country: 'Türkiye',
        countryFlag: '🇹🇷',
        rating: 9.2,
        title: 'Mükemmel bir tatil deneyimi',
        positive: 'Personel çok ilgili ve yardımsever. Yemekler çok lezzetli ve çeşitli. Deniz ve havuz alanı harika. Çocuk aktiviteleri çok başarılı.',
        negative: 'Bazı odalarda klima biraz gürültülü çalışıyor.',
        date: '2024-08',
        roomType: 'Deluxe Oda',
        stayType: 'Aile'
    },
    {
        id: 2,
        author: 'Hans M.',
        country: 'Almanya',
        countryFlag: '🇩🇪',
        rating: 9.0,
        title: 'Wunderbares Hotel',
        positive: 'Das Essen war ausgezeichnet, sehr vielfältig. Der Strand ist wunderschön, das Wasser kristallklar. Das Personal ist sehr freundlich und hilfsbereit.',
        date: '2024-09',
        roomType: 'Club Oda',
        stayType: 'Çift'
    },
    {
        id: 3,
        author: 'Elena S.',
        country: 'Rusya',
        countryFlag: '🇷🇺',
        rating: 8.8,
        title: 'Отличный отель',
        positive: 'Прекрасное расположение, чистый пляж, вкусная еда. Очень понравился спа-центр. Персонал говорит по-русски.',
        date: '2024-07',
        roomType: 'Aile Odası',
        stayType: 'Aile'
    },
    {
        id: 4,
        author: 'John D.',
        country: 'İngiltere',
        countryFlag: '🇬🇧',
        rating: 9.4,
        title: 'Amazing holiday experience',
        positive: 'Everything was perfect! The staff went above and beyond to make our stay memorable. The food quality was exceptional, and the beach is stunning.',
        date: '2024-08',
        roomType: 'Deluxe Oda',
        stayType: 'Çift'
    }
]

function RatingBadge({ score }: { score: number }) {
    const bgColor = score >= 9 ? 'bg-blue-700' : score >= 8 ? 'bg-blue-600' : 'bg-blue-500'
    return (
        <div className={`${bgColor} text-white font-bold px-2 py-1 rounded-lg text-sm`}>
            {score.toFixed(1)}
        </div>
    )
}

export function BookingReviews() {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextReview = () => {
        setCurrentIndex((prev) => (prev + 1) % REVIEWS.length)
    }

    const prevReview = () => {
        setCurrentIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length)
    }

    return (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Image
                            src="https://cf.bstatic.com/static/img/favicon/9ca83ba2a5a3293ff07452cb24949a5843af4592.svg"
                            alt="Booking.com"
                            width={120}
                            height={20}
                            className="h-6 w-auto"
                            unoptimized
                        />
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-600 font-medium">Misafir Değerlendirmeleri</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Misafirlerimiz Ne Diyor?
                    </h2>
                </div>

                {/* Main Rating Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Overall Score */}
                        <div className="flex items-center gap-6">
                            <div className="bg-blue-700 text-white text-4xl font-bold w-20 h-20 rounded-xl flex items-center justify-center shadow-lg">
                                {BOOKING_RATING.overall}
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900">Harika</p>
                                <p className="text-gray-500">{BOOKING_RATING.reviewCount.toLocaleString('tr-TR')} değerlendirme</p>
                                <div className="flex gap-0.5 mt-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={18}
                                            className={star <= Math.round(BOOKING_RATING.overall / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Category Scores */}
                        <div className="grid grid-cols-2 gap-3">
                            {BOOKING_RATING.categories.map((category) => (
                                <div key={category.name} className="flex items-center justify-between">
                                    <span className="text-gray-600 text-sm">{category.name}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 rounded-full"
                                                style={{ width: `${(category.score / 10) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 w-8">{category.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reviews Carousel */}
                <div className="relative">
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {REVIEWS.map((review) => (
                                <div key={review.id} className="w-full flex-shrink-0 px-4">
                                    <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
                                                    {review.author.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{review.author}</p>
                                                    <p className="text-sm text-gray-500">{review.countryFlag} {review.country}</p>
                                                </div>
                                            </div>
                                            <RatingBadge score={review.rating} />
                                        </div>

                                        <h3 className="font-bold text-lg text-gray-900 mb-3">{review.title}</h3>

                                        <div className="mb-4">
                                            <div className="flex items-start gap-2 mb-2">
                                                <Quote size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                                <p className="text-gray-700">{review.positive}</p>
                                            </div>
                                            {review.negative && (
                                                <div className="flex items-start gap-2">
                                                    <Quote size={16} className="text-red-400 mt-1 flex-shrink-0 rotate-180" />
                                                    <p className="text-gray-500 text-sm">{review.negative}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-500 border-t pt-4">
                                            <span>📅 {new Date(review.date).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>
                                            <span>🛏️ {review.roomType}</span>
                                            <span>👥 {review.stayType}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={prevReview}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <button
                        onClick={nextReview}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                    >
                        <ChevronRight size={24} className="text-gray-700" />
                    </button>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-6">
                        {REVIEWS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <a
                        href="https://www.booking.com/hotel/tr/blue-dreams-resort.tr.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Booking.com&apos;da tüm yorumları görüntüle
                        <ChevronRight size={18} />
                    </a>
                </div>
            </div>
        </section>
    )
}
