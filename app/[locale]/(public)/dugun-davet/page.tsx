'use client'

import React from 'react'
import Image from 'next/image'
import { Users, Wine, MapPin, Play } from 'lucide-react'

export default function WeddingEventsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3-1024x682.jpg"
                        alt="Blue Dreams Wedding"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-4 animate-fade-in-up">
                        Düğün & Davet
                    </h1>
                    <p className="text-lg md:text-xl font-light tracking-wider opacity-90 animate-fade-in-up delay-100">
                        En özel anlarınız için eşsiz bir atmosfer
                    </p>
                </div>
            </section>

            {/* Intro Section */}
            <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="w-full md:w-1/2 relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                        <Image
                            src="https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg"
                            alt="Wedding Couple"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="w-full md:w-1/2 space-y-6">
                        <h2 className="text-3xl md:text-4xl font-serif text-slate-800">
                            Rüyaların Gerçeğe Dönüştüğü Yer <br />
                            <span className="text-brand">Blue Dreams Resort</span>
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            Bodrum’un en güzel manzarası ayaklarınızın altında. Özel günlerinizi harika gün batımı manzarası ile yaşayın.
                            Denize sıfır konumu, profesyonel ekibi ve büyüleyici atmosferi ile hayallerinizdeki düğünü gerçeğe dönüştürüyoruz.
                        </p>
                        <ul className="space-y-3 pt-4">
                            <li className="flex items-center gap-3 text-slate-700">
                                <span className="w-2 h-2 bg-brand rounded-full"></span>
                                Eşsiz Gün Batımı Manzarası
                            </li>
                            <li className="flex items-center gap-3 text-slate-700">
                                <span className="w-2 h-2 bg-brand rounded-full"></span>
                                Özel Kokteyl ve Yemek Menüleri
                            </li>
                            <li className="flex items-center gap-3 text-slate-700">
                                <span className="w-2 h-2 bg-brand rounded-full"></span>
                                Profesyonel Organizasyon Desteği
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Video Section */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                            <iframe
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/JJc20SjIENQ?controls=1&rel=0"
                                title="Wedding Video 1"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                            <iframe
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/KDfh1NV2eUc?controls=1&rel=0"
                                title="Wedding Video 2"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Info */}
            <section className="py-20 bg-brand text-white text-center px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-4xl font-serif">Profesyonel Organizasyon Ekibi</h2>
                    <p className="text-lg md:text-xl opacity-90 leading-relaxed">
                        Alanında uzmanlaşmış organizasyon ekibimiz standart konseptler sunduğu gibi
                        sizin belirleyeceğiniz özelleştirilmiş konseptleri de zevkinize sunuyor.
                        Hayalinizdeki geceyi en ince ayrıntısına kadar planlıyoruz.
                    </p>
                </div>
            </section>

            {/* Venue Details (Icon Boxes) */}
            <section className="py-24 bg-white px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl md:text-3xl font-serif text-slate-800 uppercase tracking-widest">Etkinlik Alanlarımız</h2>
                        <div className="w-24 h-1 bg-brand mx-auto mt-4"></div>
                        <h3 className="text-xl md:text-2xl font-light text-slate-500 mt-4">SUNSET POOL</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Venue Image */}
                        <div className="md:col-span-1 rounded-xl overflow-hidden shadow-lg">
                            <Image
                                src="https://bluedreamsresort.com/wp-content/uploads/2023/04/EXTERIOR-10-scaled-1-768x576.jpg"
                                alt="Sunset Pool Venue"
                                width={768}
                                height={576}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Venue Info Icons */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-100 shadow-sm">
                                <div className="p-4 bg-white rounded-full shadow-md mb-4 text-brand">
                                    <MapPin size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Mekan</h4>
                                <p className="text-slate-600">Sunset Pool</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-100 shadow-sm">
                                <div className="p-4 bg-white rounded-full shadow-md mb-4 text-brand">
                                    <Wine size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Kokteyl</h4>
                                <p className="text-slate-600">Teras</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-100 shadow-sm">
                                <div className="p-4 bg-white rounded-full shadow-md mb-4 text-brand">
                                    <Users size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Kişi Sayısı</h4>
                                <p className="text-slate-600">300 - 500</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-20 bg-slate-50 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-serif text-center text-slate-800 mb-12">Galeri</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            "https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00128.jpg",
                            "https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.40.42.jpeg",
                            "https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.39.56.jpeg",
                            "https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00170.jpg",
                            "https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg",
                            "https://bluedreamsresort.com/wp-content/uploads/2023/04/0713_MR_2020__U5A2186_3.jpg",
                            "https://bluedreamsresort.com/wp-content/uploads/2023/04/0940_MR_2020__U5A3160-e1627306040392.jpg",
                            "https://bluedreamsresort.com/wp-content/uploads/2023/04/1066_MR_2020__U5A3486_3.jpg"
                        ].map((src, index) => (
                            <div key={index} className="relative aspect-[3/2] rounded-lg overflow-hidden group cursor-pointer shadow-md">
                                <Image
                                    src={src}
                                    alt={`Gallery Image ${index + 1}`}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
