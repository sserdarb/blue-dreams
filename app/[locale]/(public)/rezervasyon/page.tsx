import Image from 'next/image'
import BookingWidget from '@/components/widgets/BookingWidget'
import { Phone, MapPin, Clock, Star, Shield, CreditCard, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

const i18n: Record<string, Record<string, string>> = {
    tr: {
        heroTitle: "Online Rezervasyon",
        heroSubtitle: "En iyi fiyat garantisi ile doğrudan otelimizden rezervasyon yapın.",
        searchTitle: "Tarih Seçin & Müsaitlik Sorgulayın",
        whyTitle: "Neden Doğrudan Rezervasyon?",
        best: "En İyi Fiyat Garantisi",
        bestDesc: "Üçüncü parti sitelerden daha uygun fiyatlar.",
        free: "Ücretsiz İptal",
        freeDesc: "Belirli tarihler öncesi ücretsiz iptal imkanı.",
        secure: "Güvenli Ödeme",
        secureDesc: "256-bit SSL şifreleme ile güvenli ödeme.",
        support: "7/24 Destek",
        supportDesc: "Rezervasyon sürecinizde yanınızdayız.",
        contactTitle: "İletişim",
        phone: "+90 252 337 11 11",
        address: "Torba Mah. Torba Cad. No:4/1 Torba / Bodrum",
        hours: "Resepsiyon: 7/24",
    },
    en: {
        heroTitle: "Online Reservation",
        heroSubtitle: "Book directly from our hotel with best price guarantee.",
        searchTitle: "Select Dates & Check Availability",
        whyTitle: "Why Book Directly?",
        best: "Best Price Guarantee",
        bestDesc: "Better prices than third-party sites.",
        free: "Free Cancellation",
        freeDesc: "Free cancellation available before certain dates.",
        secure: "Secure Payment",
        secureDesc: "Secure payment with 256-bit SSL encryption.",
        support: "24/7 Support",
        supportDesc: "We're here for you throughout the booking process.",
        contactTitle: "Contact",
        phone: "+90 252 337 11 11",
        address: "Torba Mah. Torba Cad. No:4/1 Torba / Bodrum",
        hours: "Reception: 24/7",
    }
}

export default async function ReservationPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = i18n[locale] || i18n.tr

    return (
        <main className="min-h-screen bg-[#FDFBF7]">
            {/* Hero */}
            <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg"
                        alt="Blue Dreams Resort"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#003366]/80 to-[#003366]/60"></div>
                </div>
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">{t.heroTitle}</h1>
                    <p className="text-lg text-white/80 font-light">{t.heroSubtitle}</p>
                </div>
            </section>

            {/* Booking Widget */}
            <section className="py-16 px-4 -mt-12 relative z-20">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-[#003366] to-[#004488] text-white">
                            <h2 className="text-xl font-bold">{t.searchTitle}</h2>
                        </div>
                        <div className="p-6">
                            <BookingWidget inline />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Book Direct */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-serif text-[#003366] mb-3">{t.whyTitle}</h2>
                        <div className="w-16 h-[2px] bg-amber-400 mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Star, title: t.best, desc: t.bestDesc, color: 'text-amber-500' },
                            { icon: CheckCircle, title: t.free, desc: t.freeDesc, color: 'text-emerald-500' },
                            { icon: Shield, title: t.secure, desc: t.secureDesc, color: 'text-blue-500' },
                            { icon: CreditCard, title: t.support, desc: t.supportDesc, color: 'text-purple-500' },
                        ].map((item, i) => (
                            <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100">
                                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-white shadow flex items-center justify-center ${item.color}`}>
                                    <item.icon size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Strip */}
            <section className="py-12 px-4 bg-[#003366]">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 text-white">
                    <div className="flex items-center gap-3">
                        <Phone size={20} className="text-amber-400" />
                        <a href="tel:+902523371111" className="font-bold hover:text-amber-400 transition-colors">{t.phone}</a>
                    </div>
                    <div className="hidden md:block w-px h-6 bg-white/20"></div>
                    <div className="flex items-center gap-3">
                        <MapPin size={20} className="text-amber-400" />
                        <span className="text-white/80 text-sm">{t.address}</span>
                    </div>
                    <div className="hidden md:block w-px h-6 bg-white/20"></div>
                    <div className="flex items-center gap-3">
                        <Clock size={20} className="text-amber-400" />
                        <span className="text-white/80 text-sm">{t.hours}</span>
                    </div>
                </div>
            </section>
        </main>
    )
}
