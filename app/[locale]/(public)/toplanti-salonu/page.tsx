import PageHeader from '@/components/shared/PageHeader'
import { Users, Maximize, Phone, Mail, Check } from 'lucide-react'

export default function MeetingRoomPage() {
    const mainHall = {
        name: 'İstanbul Salonu',
        description: 'En büyük salonumuz olan İstanbul, 770 m² genişliği ile büyük kongreler ve gala yemekleri için idealdir. İhtiyaca göre ses geçirmez paravanla ikiye bölünebilir (Avrupa ve Asya).',
        area: '770 m²',
        height: '3.50 – 4.00 mt',
        divisible: true,
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg',
        features: [
            'Profesyonel ses sistemi',
            'Projeksiyon ve ekran',
            'Kablosuz mikrofon',
            'Video konferans imkanı',
            'Klima sistemi',
        ]
    }

    const meetingRooms = [
        { name: 'Turunç', theater: 35, meeting: 10, size: '4.50 x 6.50 mt', height: '3.20 mt' },
        { name: 'Salamis', theater: 45, meeting: 14, size: '8.30 x 4.35 mt', height: '2.70 mt' },
        { name: 'Belek', theater: 20, meeting: 10, size: '4.40 x 4.40 mt', height: '2.70 mt' },
        { name: 'Marmaris', theater: 30, meeting: 10, size: '4.30 x 5.30 mt', height: '2.70 mt' },
        { name: 'Stockholm', theater: 20, meeting: 10, size: '4.30 x 4.40 mt', height: '2.70 mt' },
    ]

    return (
        <div>
            <PageHeader
                title="Toplantı & Etkinlik Alanları"
                subtitle="Kurumsal etkinlikleriniz için profesyonel çözümler"
                backgroundImage="https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg"
                breadcrumbs={[{ label: 'Toplantı & Etkinlik', href: '/tr/toplanti-salonu' }]}
            />

            {/* Main Hall Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                Ana Salon
                            </span>
                            <h2 className="text-4xl font-serif text-gray-900 mb-6">
                                {mainHall.name}
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                {mainHall.description}
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-sand p-4 rounded-lg text-center">
                                    <Maximize className="w-6 h-6 text-brand mx-auto mb-2" />
                                    <span className="text-2xl font-serif font-bold text-gray-900 block">{mainHall.area}</span>
                                    <span className="text-gray-500 text-xs">Toplam Alan</span>
                                </div>
                                <div className="bg-sand p-4 rounded-lg text-center">
                                    <Users className="w-6 h-6 text-brand mx-auto mb-2" />
                                    <span className="text-2xl font-serif font-bold text-gray-900 block">500+</span>
                                    <span className="text-gray-500 text-xs">Kişi Kapasitesi</span>
                                </div>
                                <div className="bg-sand p-4 rounded-lg text-center">
                                    <span className="text-2xl font-serif font-bold text-gray-900 block">{mainHall.height}</span>
                                    <span className="text-gray-500 text-xs">Tavan Yüksekliği</span>
                                </div>
                            </div>

                            <ul className="space-y-2 mb-8">
                                {mainHall.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-gray-600">
                                        <Check className="w-5 h-5 text-brand mr-3" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="tel:+902523371111"
                                className="inline-flex items-center gap-2 bg-brand text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors"
                            >
                                <Phone size={18} />
                                Teklif Alın
                            </a>
                        </div>

                        <div className="relative">
                            <img
                                src={mainHall.image}
                                alt={mainHall.name}
                                className="w-full h-[500px] object-cover rounded-lg shadow-2xl"
                            />
                            <div className="absolute -bottom-6 -left-6 bg-brand text-white p-6 rounded-lg shadow-xl">
                                <span className="block text-2xl font-serif">Bölünebilir</span>
                                <span className="text-xs uppercase tracking-widest">2 Ayrı Bölüm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Meeting Rooms Table */}
            <section className="py-16 bg-sand">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                            Toplantı Odaları
                        </span>
                        <h2 className="text-4xl font-serif text-gray-900">
                            Farklı İhtiyaçlar İçin Farklı Mekanlar
                        </h2>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-brand-dark text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-sm">Salon Adı</th>
                                        <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-sm">Tiyatro Düzeni</th>
                                        <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-sm">Toplantı Düzeni</th>
                                        <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-sm">Boyut</th>
                                        <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-sm">Yükseklik</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {meetingRooms.map((room, index) => (
                                        <tr key={room.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4 font-serif text-lg text-gray-900">{room.name}</td>
                                            <td className="px-6 py-4 text-center text-gray-600">{room.theater} Kişi</td>
                                            <td className="px-6 py-4 text-center text-gray-600">{room.meeting} Kişi</td>
                                            <td className="px-6 py-4 text-center text-gray-600">{room.size}</td>
                                            <td className="px-6 py-4 text-center text-gray-600">{room.height}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-brand-dark text-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-serif mb-4">Etkinliğinizi Planlayalım</h2>
                    <p className="text-white/70 mb-8 max-w-xl mx-auto">
                        Kurumsal toplantılarınız, kongreleriniz veya özel etkinlikleriniz için ekibimizle iletişime geçin.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="tel:+902523371111"
                            className="inline-flex items-center gap-2 bg-white text-brand-dark px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-light hover:text-white transition-colors"
                        >
                            <Phone size={18} />
                            +90 252 337 11 11
                        </a>
                        <a
                            href="mailto:sales@bluedreamsresort.com"
                            className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors"
                        >
                            <Mail size={18} />
                            E-posta Gönderin
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}
