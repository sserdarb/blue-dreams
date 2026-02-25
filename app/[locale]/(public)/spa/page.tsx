export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'

export default async function SpaPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    // Fetch spa settings and services
    const spa = await prisma.spa.findUnique({
        where: { locale },
        include: { services: { where: { isActive: true }, orderBy: { order: 'asc' } } }
    })

    // Default values if empty
    const heroImage = spa?.heroImage || "https://bluedreamsresort.com/wp-content/uploads/2025/07/MER00210.jpg"
    const whatsappNum = spa?.whatsappNumber?.replace(/[^0-9]/g, '') || "905495167803"
    const title = spa?.title || "Wellness & Spa"
    const description1 = spa?.description1 || "Bedeninizi ve ruhunuzu yenilemek için tasarlanmış özel terapilerimizle kendinizi şımartın."
    const description2 = spa?.description2 || "Uzman terapistlerimiz eşliğinde huzur dolu bir yolculuğa çıkın."
    const description3 = spa?.description3 || "Geleneksel hamam, sauna ve çeşitli masaj seçeneklerimizle rahatlayın."
    const customLogo = spa?.customLogo || null
    const services = spa?.services || [
        { id: '1', title: 'Geleneksel Türk Hamamı', description: 'Geleneksel kese ve köpük masajı ile yenilenin.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/04/bdr-spa-2.jpg', isActive: true, order: 1 },
        { id: '2', title: 'Aromaterapi Masajı', description: 'Özel bitkisel yağlar ile uygulanan rahatlatıcı masaj.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/04/bdr-spa-3.jpg', isActive: true, order: 2 },
        { id: '3', title: 'Cilt Bakımı', description: 'Doğal ürünlerle uygulanan derinlemesine cilt bakım kürleri.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/04/bdr-spa-1.jpg', isActive: true, order: 3 },
        { id: '4', title: 'Sauna & Buhar Odası', description: 'Fin saunası ve buhar odası ile toksinlerden arının.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/04/bdr-spa-2.jpg', isActive: true, order: 4 },
        { id: '5', title: 'Sıcak Taş Masajı', description: 'Volkanik taşlarla derin doku masajı.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/04/bdr-spa-3.jpg', isActive: true, order: 5 },
    ]
    const whatsappText = spa?.whatsappText || 'Rezervasyon Yapın'

    // Grid pattern for varied sizes
    const getGridClass = (index: number, total: number) => {
        if (total <= 3) return '' // Equal size for small counts
        const patterns = [
            'md:col-span-2 md:row-span-2', // Large
            '',                              // Normal
            '',                              // Normal
            'md:col-span-2',                 // Wide
            '',                              // Normal
            '',                              // Normal
        ]
        return patterns[index % patterns.length] || ''
    }

    const getAspect = (index: number, total: number) => {
        if (total <= 3) return 'aspect-[4/3]'
        const aspects = [
            'aspect-square',     // Large tile
            'aspect-[4/3]',      // Normal
            'aspect-[4/3]',      // Normal
            'aspect-[16/9]',     // Wide tile
            'aspect-[4/3]',      // Normal
            'aspect-[4/3]',      // Normal
        ]
        return aspects[index % aspects.length] || 'aspect-[4/3]'
    }

    return (
        <main className="min-h-screen bg-[#0a0a0a]">
            {/* Hero Section — Full viewport cinematic */}
            <section className="relative h-screen min-h-[700px] flex items-end">
                <div className="absolute inset-0">
                    <Image
                        src={heroImage}
                        alt="The Naya Spa"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
                </div>
                <div className="relative z-10 w-full px-6 md:px-16 pb-20 md:pb-28">
                    <div className="max-w-5xl">
                        {customLogo ? (
                            <div className="relative w-48 h-24 mb-8">
                                <Image src={customLogo} alt={title} fill className="object-contain filter invert" />
                            </div>
                        ) : (
                            <>
                                <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#c5a47e] block mb-4">
                                    Blue Dreams Resort
                                </span>
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-light text-white tracking-[0.15em] leading-[0.9]">
                                    THE NAYA
                                </h1>
                                <div className="w-24 h-[1px] bg-gradient-to-r from-[#c5a47e] to-transparent mt-6 mb-4" />
                                <p className="text-sm md:text-base text-white/60 font-light tracking-[0.2em] uppercase">
                                    {title}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Introduction Section */}
            <section className="py-24 md:py-32 px-6 bg-[#0a0a0a]">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-[#c5a47e] to-transparent mx-auto" />
                    <p className="text-xl md:text-2xl text-white/90 font-serif leading-relaxed font-light">{description1}</p>
                    {description2 && <p className="text-white/40 leading-relaxed font-light text-sm">{description2}</p>}
                    {description3 && <p className="text-white/40 leading-relaxed font-light text-sm">{description3}</p>}

                    <div className="pt-6">
                        <a
                            href={`https://wa.me/${whatsappNum}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 px-10 py-4 border border-[#c5a47e]/30 hover:bg-[#c5a47e]/10 text-[#c5a47e] transition-all duration-300 tracking-[0.15em] text-xs uppercase font-medium"
                        >
                            <MessageCircle size={16} />
                            {whatsappText}
                        </a>
                    </div>
                </div>
            </section>

            {/* Services Grid — Varied sizes with image overlays */}
            {services.length > 0 && (
                <section className="px-3 md:px-6 pb-6">
                    <div className="max-w-[1600px] mx-auto">
                        {/* Section Header */}
                        <div className="text-center mb-12 md:mb-16">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c5a47e]">
                                {locale === 'tr' ? 'KENDİNİZİ ŞIMARTIN' : 'TREAT YOURSELF'}
                            </span>
                            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wide font-light mt-3">
                                {locale === 'tr' ? 'Hizmetlerimiz' : 'Our Services'}
                            </h2>
                            <div className="w-16 h-[1px] bg-[#c5a47e]/50 mx-auto mt-4" />
                        </div>

                        {/* Bento-style Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 auto-rows-auto">
                            {services.map((service, index) => (
                                <div
                                    key={service.id}
                                    className={`group relative overflow-hidden rounded-lg cursor-pointer ${getGridClass(index, services.length)}`}
                                >
                                    {/* Service Image */}
                                    <div className={`relative w-full ${getAspect(index, services.length)}`}>
                                        {service.image ? (
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
                                        )}

                                        {/* Overlay — Always visible, darkens on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 group-hover:via-black/50 transition-all duration-500" />

                                        {/* Content — sits on top of overlay */}
                                        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-7">
                                            {/* Gold accent line */}
                                            <div className="w-8 h-[2px] bg-[#c5a47e] mb-3 transition-all duration-500 group-hover:w-14" />

                                            <h3 className="text-lg md:text-xl lg:text-2xl font-serif text-white tracking-wide leading-tight mb-2">
                                                {service.title}
                                            </h3>

                                            {/* Description — revealed on hover */}
                                            <p className="text-white/0 group-hover:text-white/60 text-xs md:text-sm leading-relaxed font-light max-h-0 group-hover:max-h-20 overflow-hidden transition-all duration-500">
                                                {service.description}
                                            </p>

                                            {/* CTA — subtle */}
                                            <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                                                <a
                                                    href={`https://wa.me/${whatsappNum}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-[10px] font-bold text-[#c5a47e] uppercase tracking-[0.2em] hover:text-[#d4b896] transition-colors"
                                                >
                                                    <MessageCircle size={12} />
                                                    {locale === 'tr' ? 'Randevu Al' : 'Book Now'}
                                                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Gallery (If exists) */}
            {spa?.gallery && (() => {
                try {
                    const galleryImages = JSON.parse(spa.gallery) as string[]
                    if (galleryImages.length > 0) {
                        return (
                            <section className="py-4 bg-[#0a0a0a]">
                                <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-2 px-3">
                                    {galleryImages.map((img, i) => (
                                        <div key={i} className="min-w-[70vw] md:min-w-[40vw] lg:min-w-[30vw] aspect-square relative snap-center rounded-lg overflow-hidden">
                                            <Image src={img} alt="Gallery" fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )
                    }
                } catch { }
                return null
            })()}
        </main>
    )
}
