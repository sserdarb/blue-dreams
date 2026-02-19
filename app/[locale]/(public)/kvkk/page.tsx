export const dynamic = 'force-dynamic'

import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'KVKK Aydınlatma Metni | Blue Dreams Resort & Spa',
    description: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Blue Dreams Resort & Spa aydınlatma metni.',
}

export default function KVKKPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Hero */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg')] bg-cover bg-center opacity-15" />
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-blue-200 text-xs font-bold uppercase tracking-wider mb-6">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        Kişisel Verilerin Korunması
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        KVKK Aydınlatma Metni
                    </h1>
                    <p className="text-blue-200 text-sm max-w-2xl mx-auto">
                        6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Blue Dreams Resort & Spa
                        olarak kişisel verilerinizin güvenliği ve gizliliği konusundaki yaklaşımımız.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-blue-900 dark:prose-headings:text-blue-300 prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-li:text-gray-600 dark:prose-li:text-gray-400">

                    <div className="bg-blue-50 dark:bg-gray-800 rounded-2xl p-6 mb-10 border border-blue-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mt-0 flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                            Veri Sorumlusu
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                            <strong>Blue Dreams Resort & Spa</strong><br />
                            Torba Mahallesi, 48400 Bodrum/Muğla<br />
                            Tel: +90 252 337 11 11<br />
                            E-posta: info@bluedreamsresort.com
                        </p>
                    </div>

                    <h2>1. Kişisel Verilerin İşlenme Amaçları</h2>
                    <p>
                        Kişisel verileriniz, Blue Dreams Resort & Spa tarafından aşağıdaki amaçlarla 6698 sayılı
                        Kişisel Verilerin Korunması Kanunu&apos;na uygun olarak işlenmektedir:
                    </p>
                    <ul>
                        <li>Konaklama hizmetlerinin sunulması ve rezervasyon işlemlerinin gerçekleştirilmesi</li>
                        <li>Misafir memnuniyetinin sağlanması ve hizmet kalitesinin artırılması</li>
                        <li>Yasal yükümlülüklerin yerine getirilmesi (emniyet bildirimleri, fatura düzenleme vb.)</li>
                        <li>Transfer, spa ve restoran hizmetlerinin organizasyonu</li>
                        <li>İletişim taleplerinin yanıtlanması</li>
                        <li>Pazarlama ve kampanya bilgilendirmeleri (açık rıza ile)</li>
                        <li>Güvenlik kamerası ve otel güvenliği</li>
                    </ul>

                    <h2>2. İşlenen Kişisel Veriler</h2>
                    <p>Aşağıdaki kategorilerdeki kişisel verileriniz işlenebilir:</p>
                    <ul>
                        <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik / pasaport numarası, doğum tarihi, uyruk</li>
                        <li><strong>İletişim Bilgileri:</strong> Telefon numarası, e-posta adresi, adres</li>
                        <li><strong>Konaklama Bilgileri:</strong> Giriş-çıkış tarihleri, oda tercihleri, özel talepler</li>
                        <li><strong>Finansal Bilgiler:</strong> Ödeme bilgileri, fatura bilgileri</li>
                        <li><strong>Dijital Veriler:</strong> Web sitesi kullanım verileri, çerez bilgileri, IP adresi</li>
                        <li><strong>Görsel Veriler:</strong> Güvenlik kamerası kayıtları</li>
                    </ul>

                    <h2>3. Kişisel Verilerin Toplanma Yöntemleri</h2>
                    <p>Kişisel verileriniz aşağıdaki yollarla toplanmaktadır:</p>
                    <ul>
                        <li>Online rezervasyon formları ve web sitesi</li>
                        <li>Telefon, e-posta ve yazılı iletişim</li>
                        <li>Otel giriş (check-in) işlemleri</li>
                        <li>Acenta ve online seyahat platformları</li>
                        <li>Concierge AI asistanı üzerinden yapılan iletişimler</li>
                        <li>Güvenlik kameraları</li>
                    </ul>

                    <h2>4. Kişisel Verilerin Aktarılması</h2>
                    <p>
                        Kişisel verileriniz, yasal zorunluluklar çerçevesinde ve hizmet sunumu amacıyla
                        aşağıdaki taraflara aktarılabilir:
                    </p>
                    <ul>
                        <li>Emniyet Genel Müdürlüğü (konaklama bildirim yükümlülüğü)</li>
                        <li>Vergi daireleri ve mali kuruluşlar</li>
                        <li>Transfer ve tur hizmeti sağlayıcıları (yalnızca gerekli bilgiler)</li>
                        <li>Ödeme altyapı sağlayıcıları (güvenli ödeme işlemleri için)</li>
                        <li>Hukuki danışmanlar ve denetim firmaları (yasal zorunluluk halinde)</li>
                    </ul>

                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700 my-6">
                        <p className="text-sm text-amber-800 dark:text-amber-300 mb-0 flex items-start gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            <span>Kişisel verileriniz hiçbir koşulda ticari amaçla üçüncü kişilere satılmaz veya paylaşılmaz.</span>
                        </p>
                    </div>

                    <h2>5. Kişisel Verilerin Muhafaza Süresi</h2>
                    <p>
                        Kişisel verileriniz, işlenme amaçları için gerekli olan süre ve yasal saklama
                        süreleri boyunca muhafaza edilir:
                    </p>
                    <ul>
                        <li>Konaklama kayıtları: 10 yıl (yasal zorunluluk)</li>
                        <li>Emniyet bildirimleri: 5 yıl</li>
                        <li>Fatura ve finansal kayıtlar: 10 yıl</li>
                        <li>Güvenlik kamerası kayıtları: 30 gün</li>
                        <li>Pazarlama verileri: Rıza geri alınana kadar</li>
                    </ul>

                    <h2>6. Haklarınız</h2>
                    <p>KVKK&apos;nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
                    <ul>
                        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                        <li>İşlenmiş ise buna ilişkin bilgi talep etme</li>
                        <li>Verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                        <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                        <li>Eksik veya yanlış işlenmiş ise düzeltilmesini isteme</li>
                        <li>Kanun&apos;un 7. maddesi çerçevesinde silinmesini veya yok edilmesini isteme</li>
                        <li>Düzeltme ve silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                        <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle
                            aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                        <li>Kanuna aykırı işleme sebebiyle zarara uğraması halinde zararın giderilmesini talep etme</li>
                    </ul>

                    <h2>7. Başvuru Yöntemi</h2>
                    <p>
                        Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki iletişim kanallarından
                        bize ulaşabilirsiniz:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">📧 E-posta</h4>
                            <a href="mailto:kvkk@bluedreamsresort.com" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                                kvkk@bluedreamsresort.com
                            </a>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">📮 Posta</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Blue Dreams Resort & Spa<br />
                                Torba Mah. 48400 Bodrum/Muğla
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        Son güncelleme: Şubat 2026 • Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun
                        10. maddesi uyarınca aydınlatma yükümlülüğü kapsamında hazırlanmıştır.
                    </p>
                </div>
            </div>
        </div>
    )
}
