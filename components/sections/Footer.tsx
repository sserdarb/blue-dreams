'use client'

import { Facebook, Instagram, Twitter, Youtube, MapPin, Mail, Phone } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Footer({ locale: propLocale }: { locale?: string }) {
    const pathname = usePathname()
    const locale = propLocale || pathname?.split('/')[1] || 'tr'

    const t = {
        tr: {
            offer: '%40\'a varan özel tekliflerinize ulaşın',
            offerSub: 'Sizin için sunduğumuz en iyi teklifi almak için müşteri temsilcilerimiz sizi bekliyor.',
            callUs: 'Bizi Arayın',
            contact: 'İletişim',
            quickLinks: 'Hızlı Erişim',
            newsletter: 'E-Bülten',
            newsletterDesc: 'En son haberler ve özel fırsatlar için abone olun.',
            subscribe: 'Abone Ol',
            emailPlaceholder: 'E-posta adresiniz',
            about: 'Hakkımızda', rooms: 'Odalar & Suitler', gallery: 'Fotoğraf Galerisi',
            spa: 'Spa & Wellness', meeting: 'Toplantı & Etkinlik', hr: 'İnsan Kaynakları',
            sustainability: 'Sürdürülebilirlik', kvkk: 'KVKK',
            brand: 'Lüksün, konforun ve doğanın buluştuğu nokta. Bodrum\'da unutulmaz anılar biriktirin.',
            rights: 'Tüm hakları saklıdır.',
        },
        en: {
            offer: 'Get up to 40% special offers',
            offerSub: 'Our representatives are waiting to offer you the best deal.',
            callUs: 'Call Us',
            contact: 'Contact',
            quickLinks: 'Quick Links',
            newsletter: 'Newsletter',
            newsletterDesc: 'Subscribe for the latest news and special offers.',
            subscribe: 'Subscribe',
            emailPlaceholder: 'Your email address',
            about: 'About Us', rooms: 'Rooms & Suites', gallery: 'Photo Gallery',
            spa: 'Spa & Wellness', meeting: 'Meetings & Events', hr: 'Human Resources',
            sustainability: 'Sustainability', kvkk: 'Privacy',
            brand: 'Where luxury, comfort and nature meet. Create unforgettable memories in Bodrum.',
            rights: 'All rights reserved.',
        },
        de: {
            offer: 'Bis zu 40% Sonderangebote',
            offerSub: 'Unsere Berater warten darauf, Ihnen das beste Angebot zu machen.',
            callUs: 'Rufen Sie Uns An',
            contact: 'Kontakt',
            quickLinks: 'Schnellzugriff',
            newsletter: 'Newsletter',
            newsletterDesc: 'Abonnieren Sie für die neuesten Nachrichten und Sonderangebote.',
            subscribe: 'Abonnieren',
            emailPlaceholder: 'Ihre E-Mail-Adresse',
            about: 'Über Uns', rooms: 'Zimmer & Suiten', gallery: 'Fotogalerie',
            spa: 'Spa & Wellness', meeting: 'Meetings & Events', hr: 'Karriere',
            sustainability: 'Nachhaltigkeit', kvkk: 'Datenschutz',
            brand: 'Wo Luxus, Komfort und Natur aufeinandertreffen. Schaffen Sie unvergessliche Erinnerungen in Bodrum.',
            rights: 'Alle Rechte vorbehalten.',
        },
        ru: {
            offer: 'Получите скидки до 40%',
            offerSub: 'Наши представители ждут, чтобы предложить вам лучшее предложение.',
            callUs: 'Позвоните Нам',
            contact: 'Контакт',
            quickLinks: 'Быстрые Ссылки',
            newsletter: 'Рассылка',
            newsletterDesc: 'Подпишитесь на последние новости и специальные предложения.',
            subscribe: 'Подписаться',
            emailPlaceholder: 'Ваш email',
            about: 'О нас', rooms: 'Номера и Люксы', gallery: 'Фотогалерея',
            spa: 'Спа и Велнес', meeting: 'Конференции', hr: 'Карьера',
            sustainability: 'Устойчивость', kvkk: 'Конфиденциальность',
            brand: 'Где роскошь, комфорт и природа встречаются. Создайте незабываемые воспоминания в Бодруме.',
            rights: 'Все права защищены.',
        },
    }
    const texts = t[locale as keyof typeof t] || t.tr

    return (
        <footer id="footer" className="bg-[#111] text-gray-400">
            {/* Special Offer Banner */}
            <div className="bg-brand py-12 px-6">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                    <div className="mb-6 md:mb-0">
                        <h3 className="text-2xl font-serif text-white mb-2">{texts.offer}</h3>
                        <p className="text-brand-dark/80 text-sm">{texts.offerSub}</p>
                    </div>
                    <a href="tel:+902523371111" className="bg-white text-brand px-8 py-3 font-bold uppercase tracking-wider hover:bg-brand-dark hover:text-white transition-colors shadow-lg">
                        {texts.callUs}
                    </a>
                </div>
            </div>

            <div className="container mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="flex flex-col leading-none mb-6">
                            <span className="text-3xl font-serif font-bold text-white tracking-widest">
                                BLUE DREAMS
                            </span>
                            <span className="text-[0.65rem] tracking-[0.3em] uppercase text-brand">
                                Resort Bodrum
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            {texts.brand}
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com/BlueDreamsResortBodrum" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors"><Facebook size={20} /></a>
                            <a href="https://www.instagram.com/bluedreamsresort/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors"><Instagram size={20} /></a>
                            <a href="https://www.youtube.com/@BlueDreamsResort" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors"><Youtube size={20} /></a>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-serif text-lg mb-6">{texts.contact}</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 mr-3 text-brand mt-0.5 min-w-[20px]" />
                                <span>Torba Mahallesi Herodot Bulvarı No:11 Bodrum / MUĞLA</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="w-5 h-5 mr-3 text-brand" />
                                <a href="tel:+902523371111" className="hover:text-white transition-colors">+90 252 337 11 11</a>
                            </li>
                            <li className="flex items-center">
                                <Mail className="w-5 h-5 mr-3 text-brand" />
                                <a href="mailto:sales@bluedreamsresort.com" className="hover:text-white transition-colors">sales@bluedreamsresort.com</a>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-serif text-lg mb-6">{texts.quickLinks}</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href={`/${locale}/hakkimizda`} className="hover:text-brand transition-colors">{texts.about}</a></li>
                            <li><a href={`/${locale}/odalar`} className="hover:text-brand transition-colors">{texts.rooms}</a></li>
                            <li><a href={`/${locale}/galeri`} className="hover:text-brand transition-colors">{texts.gallery}</a></li>
                            <li><a href={`/${locale}/spa`} className="hover:text-brand transition-colors">{texts.spa}</a></li>
                            <li><a href={`/${locale}/toplanti-salonu`} className="hover:text-brand transition-colors">{texts.meeting}</a></li>
                            <li><a href={`/${locale}/surdurulebilirlik`} className="hover:text-brand transition-colors">{texts.sustainability}</a></li>
                            <li><a href={`/${locale}/kvkk`} className="hover:text-brand transition-colors">{texts.kvkk}</a></li>
                            <li><a href={`/${locale}/iletisim`} className="hover:text-brand transition-colors">{texts.hr}</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-white font-serif text-lg mb-6">{texts.newsletter}</h4>
                        <p className="text-sm mb-4">{texts.newsletterDesc}</p>
                        <form className="flex flex-col space-y-2">
                            <input
                                type="email"
                                placeholder={texts.emailPlaceholder}
                                className="bg-[#222] border border-[#333] px-4 py-3 text-white focus:outline-none focus:border-brand text-sm"
                            />
                            <button className="bg-brand text-white px-4 py-3 uppercase text-xs font-bold tracking-widest hover:bg-brand-light transition-colors">
                                {texts.subscribe}
                            </button>
                        </form>
                    </div>

                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-[#222] py-8 text-center text-xs tracking-wider">
                <p>&copy; {new Date().getFullYear()} Blue Dreams Resort. {texts.rights}</p>
            </div>
        </footer>
    )
}
