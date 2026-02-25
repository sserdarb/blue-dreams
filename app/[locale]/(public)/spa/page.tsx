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
    const heroImage = spa?.heroImage || "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg"
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

            {/* Services List - Premium Design */}
            {services.length > 0 && (
                <section className="py-24 px-4 bg-gradient-to-b from-[#F5F5F3] to-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#7A7869]">
                                {locale === 'tr' ? 'KENDİNİZİ ŞIMARTIN' : 'TREAT YOURSELF'}
                            </span>
                            <h2 className="text-3xl md:text-5xl font-serif text-gray-900 tracking-wide font-light mt-3 mb-4">
                                {locale === 'tr' ? 'Hizmetlerimiz' : 'Our Services'}
                            </h2>
                            <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#7A7869] to-transparent mx-auto mb-6"></div>
                            <p className="text-gray-500 max-w-xl mx-auto font-light">
                                {locale === 'tr'
                                    ? 'Uzman terapistlerimiz eşliğinde huzur ve yenilenme yolculuğu.'
                                    : 'A journey of peace and rejuvenation with our expert therapists.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service, index) => (
                                <div
                                    key={service.id}
                                    className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#c5a47e]/30 hover:-translate-y-2 ${index === 0 && services.length > 2 ? 'lg:row-span-2' : ''
                                        }`}
                                >
                                    {/* Image */}
                                    <div className={`relative overflow-hidden ${index === 0 && services.length > 2 ? 'aspect-[3/4]' : 'aspect-[4/3]'
                                        }`}>
                                        {service.image ? (
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#F5F5F3] text-[#c5a47e]">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-20 h-20">
                                                    <path d="M12 21C12 21 8 18 5 13C2 8 5 4 12 3C19 4 22 8 19 13C16 18 12 21 12 21Z" />
                                                </svg>
                                            </div>
                                        )}
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                        {/* Title on Image */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6">
                                            <h3 className="text-xl md:text-2xl font-serif text-white tracking-wide drop-shadow-lg">{service.title}</h3>
                                        </div>

                                        {/* Gold accent line */}
                                        <div className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-[#c5a47e] to-[#d4b896] group-hover:w-full transition-all duration-700"></div>
                                    </div>

                                    {/* Description */}
                                    <div className="p-6">
                                        <p className="text-sm text-gray-500 leading-relaxed font-light">{service.description}</p>
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <a
                                                href={`https://wa.me/${whatsappNum}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-medium text-[#7A7869] hover:text-[#c5a47e] transition-colors group/link"
                                            >
                                                <MessageCircle size={14} />
                                                {locale === 'tr' ? 'Randevu Al' : 'Book Appointment'}
                                                <span className="transition-transform group-hover/link:translate-x-0.5">→</span>
                                            </a>
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
