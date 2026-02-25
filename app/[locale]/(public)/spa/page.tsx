export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export default async function SpaPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    // Fetch spa settings and services
    const spa = await prisma.spa.findUnique({
        where: { locale },
        include: { services: { where: { isActive: true }, orderBy: { order: 'asc' } } }
    })

    // Default values if empty
    const heroImage = spa?.heroImage || "https://bluedreamsresort.com/wp-content/uploads/2023/04/bdr-spa-4.jpg"
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
    ]
    const whatsappText = spa?.whatsappText || 'Rezervasyon Yapın'

    return (
        <main className="min-h-screen bg-[#FAFAFA]">
            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center">
                <div className="absolute inset-0">
                    <Image
                        src={heroImage}
                        alt="The Naya Spa"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/30" />
                </div>
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
                    {customLogo ? (
                        <div className="relative w-48 h-24 mx-auto mb-8">
                            <Image src={customLogo} alt={title} fill className="object-contain filter invert" />
                        </div>
                    ) : (
                        <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6 tracking-[0.2em] drop-shadow-md">
                            THE NAYA
                        </h1>
                    )}
                    <p className="text-sm md:text-base text-white/90 font-light tracking-[0.3em] uppercase max-w-2xl mx-auto">
                        {title}
                    </p>
                </div>
            </section>

            {/* Introduction Section */}
            <section className="py-24 md:py-32 px-4 bg-white">
                <div className="max-w-4xl mx-auto text-center space-y-10">
                    <div className="w-10 h-10 mx-auto opacity-40">
                        {/* Decorative Lotus Icon */}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-gray-800">
                            <path d="M12 21C12 21 8 18 5 13C2 8 5 4 12 3C19 4 22 8 19 13C16 18 12 21 12 21Z" />
                        </svg>
                    </div>

                    <p className="text-xl md:text-2xl text-gray-800 font-serif leading-relaxed font-light">{description1}</p>
                    {description2 && <p className="text-gray-500 leading-relaxed font-light">{description2}</p>}
                    {description3 && <p className="text-gray-500 leading-relaxed font-light">{description3}</p>}

                    <div className="pt-8">
                        <a
                            href={`https://wa.me/${whatsappNum}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#7A7869] hover:bg-[#5C5A4C] text-white transition-all duration-300 tracking-[0.1em] text-sm uppercase font-medium shadow-md shadow-[#7A7869]/20"
                        >
                            <MessageCircle size={18} />
                            {whatsappText}
                        </a>
                    </div>
                </div>
            </section>

            {/* Services List */}
            {services.length > 0 && (
                <section className="py-24 px-4 bg-[#F5F5F3]">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-wide font-light mb-4">
                                {locale === 'tr' ? 'Örnek Hizmetlerimiz' : 'Featured Services'}
                            </h2>
                            <div className="w-16 h-px bg-[#7A7869] mx-auto"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {services.map((service) => (
                                <div key={service.id} className="group cursor-pointer">
                                    <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-white">
                                        {service.image ? (
                                            <Image
                                                src={service.image}
                                                alt={service.title}
                                                fill
                                                className="object-cover transition-transform duration-1000 group-hover:scale-[1.03] group-hover:opacity-90 grayscale-[20%]"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-20 h-20">
                                                    <path d="M12 21C12 21 8 18 5 13C2 8 5 4 12 3C19 4 22 8 19 13C16 18 12 21 12 21Z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center px-4">
                                        <h3 className="text-xl font-serif text-gray-900 mb-3 tracking-wide">{service.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed font-light">{service.description}</p>
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
                            <section className="bg-white py-4">
                                {/* Thin elegant horizontal gallery */}
                                <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                                    {galleryImages.map((img, i) => (
                                        <div key={i} className="min-w-[70vw] md:min-w-[40vw] lg:min-w-[30vw] aspect-square relative snap-center">
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
