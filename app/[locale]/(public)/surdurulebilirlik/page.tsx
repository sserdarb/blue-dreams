export const dynamic = 'force-dynamic'

import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Sürdürülebilirlik Politikası | Blue Dreams Resort & Spa',
    description: 'Blue Dreams Resort & Spa sürdürülebilirlik, misafir şikayet yönetimi ve gıda güvenliği politikaları.',
}

export default function SustainabilityPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Hero */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg')] bg-cover bg-center opacity-15" />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-emerald-200 text-xs font-bold uppercase tracking-wider mb-6">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        Sürdürülebilirlik
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Sürdürülebilirlik Politikası
                    </h1>
                    <p className="text-emerald-200 text-sm max-w-2xl mx-auto">
                        Blue Dreams Resort & Spa olarak sürdürülebilirliğin üç temel unsuru olan
                        sosyokültürel, ekonomik ve çevre başlıklarını uyguladığımız politikalarla destekleriz.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-emerald-900 dark:prose-headings:text-emerald-300 prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-li:text-gray-600 dark:prose-li:text-gray-400">

                    {/* Section 1: Sustainability Policy */}
                    <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl p-6 mb-10 border border-emerald-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M7 10h10M7 14h10" /></svg>
                            </div>
                            <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-0 mb-0">
                                Sürdürülebilirlik Politikası
                            </h2>
                        </div>
                        <p className="text-sm mb-4">
                            Tesisimizde sürdürülebilirlik ile ilgili konuları, iç misafir ve dış misafirlerimiz olarak iki gruba ayırırız.
                            Vereceğimiz kararlar ve tercihlerimizde her iki grup için sürdürülebilirliğin üç temel unsuru olan
                            <strong> sosyokültürel</strong>, <strong>ekonomik</strong> ve <strong>çevre</strong> başlıklarını
                            uyguladığımız politikalarla destekleriz.
                        </p>
                        <p className="text-sm mb-4">
                            Sürdürülebilirlik kapsamında olan sanat, doğal çevre, kültürel miras gibi konular otel olarak güçlü yanımızdır.
                            Bu güçlü yanımızı iç ve dış misafirlerimize tanıtmak, onu korumak ve devamlılığını sağlamak tesis olarak
                            sürdürülebilirliğe bakış açımızın temelini oluşturur.
                        </p>
                        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 mt-4 border border-emerald-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-0">
                                <strong>Sustainability Policy:</strong> In our facility, we divide the issues related to sustainability
                                into two groups as internal guests and external guests. In our decisions and preferences, we support
                                the three basic elements of sustainability for both groups: sociocultural, economic and environmental
                                issues with the policies we implement.
                            </p>
                        </div>
                    </div>

                    {/* Section 2: Guest Complaint Policy */}
                    <div className="bg-blue-50 dark:bg-gray-800 rounded-2xl p-6 mb-10 border border-blue-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            </div>
                            <h2 className="text-xl font-bold text-blue-800 dark:text-blue-300 mt-0 mb-0">
                                Misafir Şikâyet Yönetimi Politikası
                            </h2>
                        </div>
                        <p className="text-sm mb-4">
                            Değişen dünya koşulları ve tercihler sebebi ile sunduğumuz ürün ve hizmetlerimizde memnuniyet ilkesinin
                            ve şikâyet kavramının öneminin farkındayız. Bu farkındalıkla tesisimizde konaklayanlara Müşteri yerine
                            <strong> Misafir</strong> gözüyle bakarız.
                        </p>
                        <p className="text-sm mb-4">
                            En güçlü yönümüz <strong>Samimiyet</strong> ilkemizle, misafirlerimizin kendilerini evlerindeymiş gibi rahat
                            ve güvende hissetmeleri, onlara bizim için önemli ve özel olduklarını hissettirebilmek için misafirlerimizin
                            tüm talep ve geri bildirimlerini şeffaf, objektif ve adil olarak ele alırız.
                        </p>
                        <p className="text-sm mb-4">
                            Kayıt ve takip sistemimiz ile misafir talepleri ve şikayet yönetim süreçlerimizle ilgili alınan aksiyonlar
                            ve üretilen çözümleri kayıt altına almayı, gelişime açık alanlarımızın tespit edilmesi ve verimliliğin
                            arttırılması için düzenli olarak gözden geçirerek iyileştirmeyi taahhüt ederiz.
                        </p>
                        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 mt-4 border border-blue-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-0">
                                <strong>Guest Complaint Management Policy:</strong> With our sincerity principle, we handle all requests
                                and feedbacks transparently, objectively and fairly in order to make our guests feel comfortable and safe.
                                We commit to recording all actions and solutions, and regularly reviewing them for continuous improvement.
                            </p>
                        </div>
                    </div>

                    {/* Section 3: Food Safety */}
                    <div className="bg-amber-50 dark:bg-gray-800 rounded-2xl p-6 mb-10 border border-amber-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                            <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300 mt-0 mb-0">
                                Gıda Güvenliği Yönetim Politikası
                            </h2>
                        </div>
                        <p className="text-sm mb-4">
                            Blue Dreams Resort & SPA olarak tüm gıda üretim ve sunum aşamalarımızda misafirlerimize, çalışanlarımıza
                            ve tedarikçilerimize karşı sorumlu olduğumuz bilinciyle hareket ederiz.
                        </p>
                        <p className="text-sm mb-4">
                            Gıda Güvenliği ve Hijyen Standartlarımızı oluştururken sürdürülebilirlik anlayışımızla tedarikçilerimiz
                            ve çalışanlarımızla birlikte hareket eder, üretim, sunum ve tüketim aşamalarımızda israfı minimalize ederek
                            planlama yaparız. Çalışanlarımızın yetkinlik düzeyinin artması için eğitimler verir, yasa ve mevzuatlara
                            uygun hareket ederiz.
                        </p>
                        <p className="text-sm mb-4">
                            Yaptığımız risk analizleri ile kritik kontrol noktalarımızı belirler önleyici tedbirler alırız. Sistemin
                            devamlılığı ve sürekli iyileştirme için iç ve tarafsız dış denetimlerimizle performans ölçümleme yaparız.
                        </p>
                        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 mt-4 border border-amber-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-0">
                                <strong>Food Safety Management Policy:</strong> We act with the awareness that we are responsible to
                                our guests, employees and suppliers. We plan by minimising waste, provide trainings, and measure
                                performance through internal and external audits for continuous improvement.
                            </p>
                        </div>
                    </div>

                    {/* Downloads */}
                    <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4 my-10">
                        <a href="https://bluedreamsresort.com/wp-content/uploads/2024/09/SURDURULEBILIRLIK-RAPORU-2024.pdf"
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors group">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-emerald-700">
                                    Sürdürülebilirlik Raporu 2024
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">PDF İndir</p>
                            </div>
                        </a>
                        <a href="https://bluedreamsresort.com/wp-content/uploads/2024/08/genel_aydinlatma_ve_acik_riza-tr.pdf"
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors group">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-700">
                                    Kişisel Verileri Korunması Aydınlatma Metni
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">PDF İndir</p>
                            </div>
                        </a>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        Son güncelleme: Şubat 2026 • Blue Dreams Resort & Spa Sürdürülebilir Turizm Sertifikalı tesis.
                    </p>
                </div>
            </div>
        </div>
    )
}
