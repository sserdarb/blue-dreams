import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Users, Building2, Maximize, ArrowRight, Phone, CheckCircle, Wifi, Monitor, Mic2, Projector, Star, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const i18n: Record<string, Record<string, string>> = {
    tr: {
        heroTitle: "Toplantı & Etkinlik",
        heroSubtitle: "Alanları",
        heroDesc: "52.000 m² yeşil alan içerisinde, en son teknoloji ile donatılmış toplantı salonlarımızda unutulmaz etkinlikler yaratın.",
        heroBtn: "Teklif Alın",
        mainHall: "Ana Salon",
        istanbulDesc: "770 m² genişliğindeki İstanbul Salonu, Ege'nin en büyük otel konferans salonlarından biridir. İhtiyaca göre ses geçirmez paravanla ikiye bölünebilir.",
        section: "Bölüm",
        area: "Alan (m²)",
        theater: "Tiyatro",
        classroom: "Sınıf",
        banquet: "Banket",
        height: "Yükseklik",
        meetingRooms: "Toplantı Odaları",
        meetingRoomsDesc: "Her ölçekte toplantınız için modern ve profesyonel alanlar.",
        capacity: "Kapasite",
        details: "Tiyatro",
        meeting: "Toplantı",
        features: "Tüm Salonlarda",
        feature1: "Profesyonel Ses Sistemi",
        feature2: "HD Projeksiyon & Ekran",
        feature3: "Yüksek Hızlı Wi-Fi",
        feature4: "Kablosuz Mikrofon",
        feature5: "Teknik Destek Ekibi",
        feature6: "Coffee Break Hizmeti",
        ctaTitle: "Etkinliğinizi Planlayalım",
        ctaDesc: "Blue Dreams Resort MICE ekibi, etkinliğinizi kusursuz bir şekilde organize etmek için hazır.",
        ctaBtn: "Hemen Arayın",
        ctaBtn2: "WhatsApp ile İletişim",
        divisible: "Bölünebilir",
    },
    en: {
        heroTitle: "Meeting & Event",
        heroSubtitle: "Spaces",
        heroDesc: "Create unforgettable events in our state-of-the-art meeting rooms within 52,000 m² of green landscape.",
        heroBtn: "Get a Quote",
        mainHall: "Main Hall",
        istanbulDesc: "The 770 m² Istanbul Hall is one of the largest hotel conference halls in the Aegean. It can be divided into two soundproof sections.",
        section: "Section",
        area: "Area (m²)",
        theater: "Theater",
        classroom: "Classroom",
        banquet: "Banquet",
        height: "Height",
        meetingRooms: "Meeting Rooms",
        meetingRoomsDesc: "Modern and professional spaces for meetings of every scale.",
        capacity: "Capacity",
        details: "Theater",
        meeting: "Meeting",
        features: "In All Halls",
        feature1: "Professional Sound System",
        feature2: "HD Projector & Screen",
        feature3: "High-Speed Wi-Fi",
        feature4: "Wireless Microphone",
        feature5: "Technical Support Team",
        feature6: "Coffee Break Service",
        ctaTitle: "Let's Plan Your Event",
        ctaDesc: "The Blue Dreams Resort MICE team is ready to flawlessly organize your event.",
        ctaBtn: "Call Now",
        ctaBtn2: "WhatsApp Contact",
        divisible: "Divisible",
    }
}

const istanbulTable = [
    { section: { tr: 'İstanbul (Tümü)', en: 'Istanbul (Full)' }, area: '770', theater: '700', classroom: '450', banquet: '650', height: '3.50 - 4.00 mt' },
    { section: { tr: 'Avrupa (Sahne Tarafı)', en: 'Europe (Stage Side)' }, area: '400', theater: '450', classroom: '250', banquet: '450', height: '3.50 - 4.00 mt' },
    { section: { tr: 'Asya (Havuz Tarafı)', en: 'Asia (Pool Side)' }, area: '370', theater: '350', classroom: '200', banquet: '200', height: '3.50 - 4.00 mt' },
]

export default async function MeetingRoomPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = i18n[locale] || i18n.tr

    // Fetch meeting rooms from database
    let meetingRooms: any[] = []
    try {
        meetingRooms = await prisma.meetingRoom.findMany({
            where: { locale },
            orderBy: { order: 'asc' },
        })
    } catch (e) {
        console.error('[Meeting Page] DB Error', e)
    }

    // No fallback - content managed via admin panel

    return (
        <main className="min-h-screen bg-[#FDFBF7]">
            {/* ============ FULLSCREEN HERO ============ */}
            <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="https://bluedreamsresort.com/wp-content/uploads/2026/01/Bluedreamstanitimkiti_page-0019-1024x725.jpg"
                        alt="Istanbul Salonu - Blue Dreams Resort"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    <div className="mb-6">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-white/70 bg-white/10 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/20">
                            <Star size={12} className="text-amber-400" />
                            MICE & Events
                            <Star size={12} className="text-amber-400" />
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-2 leading-[0.9]">
                        {t.heroTitle}
                    </h1>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 mb-8 leading-[1.1]">
                        {t.heroSubtitle}
                    </h1>

                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                        {t.heroDesc}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="tel:+902523371111"
                            className="group inline-flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-amber-50 transition-all duration-300 shadow-2xl hover:shadow-white/20"
                        >
                            <Phone size={18} />
                            {t.heroBtn}
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </a>
                        <a
                            href="https://wa.me/905495167803"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-10 py-5 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-white/20 transition-all duration-300"
                        >
                            {t.ctaBtn2}
                        </a>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
                    <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/30"></div>
                </div>
            </section>

            {/* ============ İSTANBUL SALONU - FEATURED ============ */}
            <section className="py-24 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600">{t.mainHall}</span>
                        <h2 className="text-4xl md:text-6xl font-serif text-[#003366] mt-3 mb-4">İstanbul Salonu</h2>
                        <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-6"></div>
                        <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">{t.istanbulDesc}</p>
                    </div>

                    {/* Image + Stats */}
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12">
                        <div className="relative aspect-[21/9] md:aspect-[21/8]">
                            <Image
                                src="https://bluedreamsresort.com/wp-content/uploads/2026/01/Bluedreamstanitimkiti_page-0019-1024x725.jpg"
                                alt="Istanbul Salonu"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                        </div>

                        {/* Floating Stats */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                                {[
                                    { value: '770', label: 'm²', desc: locale === 'en' ? 'Total Area' : 'Toplam Alan' },
                                    { value: '700', label: locale === 'en' ? 'people' : 'kişi', desc: locale === 'en' ? 'Theater Capacity' : 'Tiyatro Kapasitesi' },
                                    { value: '4.0', label: 'mt', desc: locale === 'en' ? 'Ceiling Height' : 'Tavan Yüksekliği' },
                                    { value: '2', label: locale === 'en' ? 'sections' : 'bölüm', desc: t.divisible },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center">
                                        <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                                        <div className="text-amber-300 text-xs font-bold uppercase tracking-wider">{stat.label}</div>
                                        <div className="text-white/60 text-[11px] mt-1">{stat.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Capacity Table */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gradient-to-r from-[#003366] to-[#004488]">
                                        <th className="p-5 text-white font-medium text-sm">{t.section}</th>
                                        <th className="p-5 text-white font-medium text-sm">{t.area}</th>
                                        <th className="p-5 text-white font-medium text-sm">{t.theater}</th>
                                        <th className="p-5 text-white font-medium text-sm">{t.classroom}</th>
                                        <th className="p-5 text-white font-medium text-sm">{t.banquet}</th>
                                        <th className="p-5 text-white font-medium text-sm">{t.height}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {istanbulTable.map((row, i) => (
                                        <tr key={i} className={`hover:bg-blue-50/50 transition-colors ${i === 0 ? 'bg-amber-50/30 font-semibold' : ''}`}>
                                            <td className="p-5 text-gray-800">{row.section[locale as 'tr' | 'en'] || row.section.tr}</td>
                                            <td className="p-5 text-gray-600">{row.area}</td>
                                            <td className="p-5 text-gray-600">{row.theater}</td>
                                            <td className="p-5 text-gray-600">{row.classroom}</td>
                                            <td className="p-5 text-gray-600">{row.banquet}</td>
                                            <td className="p-5 text-gray-600">{row.height}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ MEETING ROOMS GRID ============ */}
            <section className="py-24 px-4 md:px-8 bg-gradient-to-b from-white to-[#f0f4f8]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600">MICE</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-[#003366] mt-3 mb-4">{t.meetingRooms}</h2>
                        <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-6"></div>
                        <p className="text-gray-500 max-w-xl mx-auto">{t.meetingRoomsDesc}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {meetingRooms.map((room, index) => (
                            <div
                                key={room.id}
                                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-amber-200/50 hover:-translate-y-1"
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <Image
                                        src={room.image || 'https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg'}
                                        alt={room.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    {/* Room Name Overlay */}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-[#003366]/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full">
                                            {room.title}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-2xl font-serif text-[#003366] mb-4 flex items-center gap-2">
                                        {room.title}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                                            <Users className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                            <div className="text-xs text-gray-400 uppercase font-bold">{t.capacity}</div>
                                            <div className="text-sm font-bold text-gray-800">{room.capacity?.split('/')[0]?.trim() || '—'}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                                            <Maximize className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                            <div className="text-xs text-gray-400 uppercase font-bold">{t.area}</div>
                                            <div className="text-sm font-bold text-gray-800">{room.area || '—'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Building2 size={14} className="text-amber-500" />
                                            <span>{t.height}: {room.height || '—'}</span>
                                        </div>
                                        <a
                                            href="tel:+902523371111"
                                            className="inline-flex items-center gap-1 text-sm font-bold text-[#003366] hover:text-amber-600 transition-colors group/link"
                                        >
                                            {t.heroBtn}
                                            <ChevronRight size={14} className="transition-transform group-hover/link:translate-x-0.5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ FEATURES ============ */}
            <section className="py-20 px-4 md:px-8 bg-[#003366]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-serif text-white mb-2">{t.features}</h2>
                        <div className="w-12 h-[2px] bg-amber-400 mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[
                            { icon: Mic2, label: t.feature1 },
                            { icon: Projector, label: t.feature2 },
                            { icon: Wifi, label: t.feature3 },
                            { icon: Monitor, label: t.feature4 },
                            { icon: Users, label: t.feature5 },
                            { icon: CheckCircle, label: t.feature6 },
                        ].map((feat, i) => (
                            <div key={i} className="text-center group">
                                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-all duration-300">
                                    <feat.icon size={24} className="text-amber-400" />
                                </div>
                                <p className="text-white/80 text-sm font-medium leading-tight">{feat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ CTA ============ */}
            <section className="py-24 px-4 md:px-8 bg-gradient-to-b from-[#f0f4f8] to-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-serif text-[#003366] mb-6">{t.ctaTitle}</h2>
                    <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">{t.ctaDesc}</p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="tel:+902523371111"
                            className="group inline-flex items-center justify-center gap-3 bg-[#003366] text-white px-10 py-5 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-[#004488] transition-all duration-300 shadow-lg"
                        >
                            <Phone size={18} />
                            {t.ctaBtn}
                        </a>
                        <a
                            href="https://wa.me/905495167803"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-10 py-5 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-[#20BD5A] transition-all duration-300 shadow-lg"
                        >
                            {t.ctaBtn2}
                        </a>
                    </div>
                </div>
            </section>
        </main>
    )
}
