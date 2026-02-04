import { Star } from 'lucide-react'
import { REVIEWS } from '@/lib/constants'

export default function Reviews() {
    return (
        <section className="py-24 bg-[#ebe9e4]">
            <div className="container mx-auto px-6 md:px-12">

                <div className="mb-16">
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2 block">Misafir Yorumları</span>
                    <h2 className="text-5xl md:text-7xl font-serif text-gray-900 leading-none">
                        Sizden Gelen <br />
                        <span className="italic font-light">Güzel Sözler</span>
                    </h2>
                    <p className="mt-6 text-gray-600 max-w-xl">
                        Gerçek deneyimler ve dürüst kelimeler. Misafirlerimizin Blue Dreams Resort&apos;taki konaklamalarını nasıl deneyimlediklerini keşfedin.
                    </p>
                    <a href="https://www.google.com/maps" target="_blank" className="inline-block mt-6 bg-[#b45309] text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#92400e] transition-colors rounded-sm shadow-md">
                        Tüm Yorumları Oku
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {REVIEWS.map((review) => (
                        <div key={review.id} className="bg-brand-dark p-10 text-white relative group hover:-translate-y-2 transition-transform duration-300">
                            <div className="flex text-brand-light mb-6">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} size={14} fill="currentColor" className="mr-1" />
                                ))}
                            </div>

                            <div className="mb-8 min-h-[100px]">
                                <h4 className="font-serif text-lg mb-2 text-white/90">{review.author}</h4>
                                <p className="text-white/70 text-sm font-light leading-relaxed line-clamp-4">
                                    &quot;{review.text}&quot;
                                </p>
                            </div>

                            <div className="text-[10px] tracking-widest uppercase text-white/40 border-t border-white/10 pt-4">
                                Google Yorumu
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
