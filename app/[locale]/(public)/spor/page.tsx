export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { PartyPopper } from 'lucide-react'

export default async function SportPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    // Fetch sports & activities from the Custom Admin DB
    const sports = await prisma.sport.findMany({
        where: { locale, isActive: true },
        orderBy: { order: 'asc' }
    })

    return (
        <main className="min-h-screen bg-[#FDFBF7]">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
                <div className="absolute inset-0">
                    <Image
                        src="https://bluedreamsresort.com/wp-content/uploads/2023/03/tennis-court.jpg"
                        alt="Spor & Aktiviteler"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
                    <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 tracking-wide drop-shadow-lg">
                        {locale === 'tr' ? 'Spor & Aktiviteler' : locale === 'en' ? 'Sports & Activities' : locale === 'de' ? 'Sport & Aktivitäten' : 'Спорт и Активности'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto">
                        {locale === 'tr' ? 'Tatiliniz boyunca hem dinlenin hem de formda kalın. Birbirinden keyifli aktivitelerle dolu bir deneyim sizi bekliyor.' : 'Relax and stay in shape during your holiday. Explore a variety of enjoyable activities waiting for you.'}
                    </p>
                </div>
            </section>

            {/* Sports List */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto space-y-32">
                    {sports.length === 0 ? (
                        <div className="text-center py-20">
                            <PartyPopper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-serif text-gray-900 mb-2">Çok Yakında</h2>
                            <p className="text-gray-500">Spor ve aktivite bilgilerimiz güncellenmektedir.</p>
                        </div>
                    ) : (
                        sports.map((sport, index) => {
                            const isEven = index % 2 === 0
                            return (
                                <div key={sport.id} className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                                    {/* Image Side */}
                                    <div className="w-full lg:w-1/2 relative">
                                        <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-2xl group">
                                            {sport.image ? (
                                                <Image
                                                    src={sport.image}
                                                    alt={sport.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                    <PartyPopper className="w-12 h-12 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Side */}
                                    <div className="w-full lg:w-1/2 space-y-8">
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">{sport.title}</h2>
                                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                                                {sport.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </section>
        </main>
    )
}
