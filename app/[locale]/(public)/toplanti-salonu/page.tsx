import Image from 'next/image'
import Link from 'next/link'
import { FileText, Users, Building2, MapPin, Maximize, PlaySquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MeetingRoomPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    // We can define texts here, mostly Turkish for now, easily extendable.
    const t = {
        title: "Toplantı & Etkinlik Alanları",
        subtitle: "Meeting & Event Spaces",
        istanbulTitle: "İstanbul Salonu",
        istanbulDesc: "En büyük salonumuz olan İstanbul, 770 m² genişliği ile büyük kongreler ve gala yemekleri için idealdir. İhtiyaca göre ses geçirmez paravanla ikiye bölünebilir (Avrupa ve Asya).",
        istanbulFeat1: "Toplam Alan: 770 m²",
        istanbulFeat2: "Yükseklik: 3.50 - 4.00 mt",
        istanbulFeat3: "Bölünebilir Yapı: Evet (2 Bölüm)",
        istanbulEnDesc: "Ideal for large congresses and gala dinners with 770 m² width. Can be divided into two soundproof sections (Europe & Asia).",
        getQuote: "Teklif Alın / Get Quote",
        section: "Bölüm / Section",
        size: "m²",
        theater: "Tiyatro / Theater",
        class: "Sınıf / Classroom",
        banquet: "Banket / Banquet",
        height: "Yükseklik / Height",
        meetingRoomsTitle: "Toplantı Odaları"
    }

    const rooms = [
        {
            title: "Turunç",
            theater: "35 Kişi",
            meeting: "10 Kişi",
            size: "4,50 x 6,50 mt",
            height: "3,20 mt",
            image: "https://bluedreamsresort.com/wp-content/uploads/2026/01/Ekran-goruntusu-2026-01-14-171200-768x448.png"
        },
        {
            title: "Salamis",
            theater: "45 Kişi",
            meeting: "14 Kişi",
            size: "8,30 x 4,35 mt",
            height: "2,70 mt",
            image: "https://bluedreamsresort.com/wp-content/uploads/2026/01/Ekran-goruntusu-2026-01-14-171426-768x453.png"
        },
        {
            title: "Belek",
            theater: "20 Kişi",
            meeting: "10 Kişi",
            size: "4,40 x 4,40 mt",
            height: "2,70 mt",
            image: "https://bluedreamsresort.com/wp-content/uploads/2026/01/Ekran-goruntusu-2026-01-14-171524-768x450.png"
        },
        {
            title: "Marmaris",
            theater: "30 Kişi",
            meeting: "10 Kişi",
            size: "4,30 x 5,30 mt",
            height: "2,70 mt",
            image: "https://bluedreamsresort.com/wp-content/uploads/2026/01/Ekran-goruntusu-2026-01-14-171826-768x451.png"
        },
        {
            title: "Stockholm",
            theater: "20 Kişi",
            meeting: "10 Kişi",
            size: "4,30 x 4,40 mt",
            height: "2,70 mt",
            image: "https://bluedreamsresort.com/wp-content/uploads/2026/01/Ekran-goruntusu-2026-01-14-171917-768x451.png"
        }
    ]

    return (
        <main className="min-h-screen bg-[#FDFBF7]">
            {/* Header Section */}
            <section className="pt-32 pb-16 px-4 md:px-8 text-center bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-serif text-[#003366] mb-4">{t.title}</h1>
                    <h4 className="text-xl md:text-2xl text-gray-500 font-light mb-8">{t.subtitle}</h4>
                    <div className="w-24 h-px bg-[#c5a47e] mx-auto"></div>
                </div>
            </section>

            {/* Istanbul Salonu Section */}
            <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        {/* Text Content */}
                        <div className="p-8 md:p-12 lg:col-span-5 flex flex-col justify-center">
                            <h2 className="text-3xl font-serif text-[#003366] mb-6">{t.istanbulTitle}</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">{t.istanbulDesc}</p>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-700">
                                    <Maximize className="w-5 h-5 text-[#c5a47e] mr-3" />
                                    <span>{t.istanbulFeat1}</span>
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <Building2 className="w-5 h-5 text-[#c5a47e] mr-3" />
                                    <span>{t.istanbulFeat2}</span>
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <FileText className="w-5 h-5 text-[#c5a47e] mr-3" />
                                    <span>{t.istanbulFeat3}</span>
                                </li>
                            </ul>

                            <p className="text-sm text-gray-500 italic mb-8">{t.istanbulEnDesc}</p>

                            <a href="tel:+902523371111" className="inline-flex items-center justify-center bg-[#003366] hover:bg-[#002244] text-white px-8 py-4 rounded-md transition-colors duration-300 w-fit">
                                {t.getQuote}
                            </a>
                        </div>

                        {/* Image */}
                        <div className="relative min-h-[400px] lg:col-span-7">
                            <Image
                                src="https://bluedreamsresort.com/wp-content/uploads/2026/01/Bluedreamstanitimkiti_page-0019-1024x725.jpg"
                                alt="Istanbul Salonu"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="overflow-x-auto p-4 md:p-8 border-t border-gray-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#003366] text-white">
                                    <th className="p-4 rounded-tl-lg font-medium">{t.section}</th>
                                    <th className="p-4 font-medium">{t.size}</th>
                                    <th className="p-4 font-medium">{t.theater}</th>
                                    <th className="p-4 font-medium">{t.class}</th>
                                    <th className="p-4 font-medium">{t.banquet}</th>
                                    <th className="p-4 rounded-tr-lg font-medium">{t.height}</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600">
                                <tr className="border-b border-gray-100 font-semibold bg-gray-50/50">
                                    <td className="p-4">İstanbul (Tümü)</td>
                                    <td className="p-4">770</td>
                                    <td className="p-4">700</td>
                                    <td className="p-4">450</td>
                                    <td className="p-4">650</td>
                                    <td className="p-4">3.50 - 4.00 mt</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="p-4">Avrupa (Sahne Tarafı)</td>
                                    <td className="p-4">400</td>
                                    <td className="p-4">450</td>
                                    <td className="p-4">250</td>
                                    <td className="p-4">450</td>
                                    <td className="p-4">3.50 - 4.00 mt</td>
                                </tr>
                                <tr>
                                    <td className="p-4">Asya (Havuz Tarafı)</td>
                                    <td className="p-4">370</td>
                                    <td className="p-4">350</td>
                                    <td className="p-4">200</td>
                                    <td className="p-4">200</td>
                                    <td className="p-4">3.50 - 4.00 mt</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Other Meeting Rooms */}
            <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif text-[#003366] mb-4">{t.meetingRoomsTitle}</h2>
                    <div className="w-16 h-px bg-[#c5a47e] mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room, index) => (
                        <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md group hover:shadow-xl transition-shadow duration-300">
                            <div className="relative aspect-video overflow-hidden">
                                <Image
                                    src={room.image}
                                    alt={room.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-6 border-t-[3px] border-[#c5a47e] bg-gray-50/50">
                                <h3 className="text-2xl font-serif text-[#003366] mb-4">{room.title}</h3>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-2 text-[#c5a47e]" />
                                            <span><span className="font-semibold">Tiyatro:</span> {room.theater}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span><span className="font-semibold">Toplantı:</span> {room.meeting}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Maximize className="w-4 h-4 mr-2 text-[#c5a47e]" />
                                        <span><span className="font-semibold">Boyut:</span> {room.size}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Building2 className="w-4 h-4 mr-2 text-[#c5a47e]" />
                                        <span><span className="font-semibold">Yükseklik:</span> {room.height}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    )
}
