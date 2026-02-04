import { Facebook, Instagram, Twitter, Youtube, MapPin, Mail, Phone } from 'lucide-react'

export default function Footer() {
    return (
        <footer id="footer" className="bg-[#111] text-gray-400">
            {/* Special Offer Banner */}
            <div className="bg-brand py-12 px-6">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                    <div className="mb-6 md:mb-0">
                        <h3 className="text-2xl font-serif text-white mb-2">%40&apos;a varan özel tekliflerinize ulaşın</h3>
                        <p className="text-brand-dark/80 text-sm">Sizin için sunduğumuz en iyi teklifi almak için müşteri temsilcilerimiz sizi bekliyor.</p>
                    </div>
                    <a href="tel:+902523371111" className="bg-white text-brand px-8 py-3 font-bold uppercase tracking-wider hover:bg-brand-dark hover:text-white transition-colors shadow-lg">
                        Bizi Arayın
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
                            Lüksün, konforun ve doğanın buluştuğu nokta. Bodrum&apos;da unutulmaz anılar biriktirin.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com/BlueDreamsResortBodrum" className="text-gray-400 hover:text-brand transition-colors"><Facebook size={20} /></a>
                            <a href="https://www.instagram.com/bluedreamsresort/" className="text-gray-400 hover:text-brand transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-brand transition-colors"><Twitter size={20} /></a>
                            <a href="https://www.youtube.com/@BlueDreamsResort" className="text-gray-400 hover:text-brand transition-colors"><Youtube size={20} /></a>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-serif text-lg mb-6">İletişim</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 mr-3 text-brand mt-0.5 min-w-[20px]" />
                                <span>Torba Mahallesi Herodot Bulvarı No:11 Bodrum / MUĞLA</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="w-5 h-5 mr-3 text-brand" />
                                <span>+90 252 337 11 11</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="w-5 h-5 mr-3 text-brand" />
                                <span>sales@bluedreamsresort.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-serif text-lg mb-6">Hızlı Erişim</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#about" className="hover:text-brand transition-colors">Hakkımızda</a></li>
                            <li><a href="#rooms" className="hover:text-brand transition-colors">Odalar & Suitler</a></li>
                            <li><a href="#gallery" className="hover:text-brand transition-colors">Fotoğraf Galerisi</a></li>
                            <li><a href="#experience" className="hover:text-brand transition-colors">Spa & Wellness</a></li>
                            <li><a href="#" className="hover:text-brand transition-colors">Toplantı & Etkinlik</a></li>
                            <li><a href="#" className="hover:text-brand transition-colors">İnsan Kaynakları</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-white font-serif text-lg mb-6">E-Bülten</h4>
                        <p className="text-sm mb-4">En son haberler ve özel fırsatlar için abone olun.</p>
                        <form className="flex flex-col space-y-2">
                            <input
                                type="email"
                                placeholder="E-posta adresiniz"
                                className="bg-[#222] border border-[#333] px-4 py-3 text-white focus:outline-none focus:border-brand text-sm"
                            />
                            <button className="bg-brand text-white px-4 py-3 uppercase text-xs font-bold tracking-widest hover:bg-brand-light transition-colors">
                                Abone Ol
                            </button>
                        </form>
                    </div>

                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-[#222] py-8 text-center text-xs tracking-wider">
                <p>&copy; {new Date().getFullYear()} Blue Dreams Resort. Tüm hakları saklıdır.</p>
            </div>
        </footer>
    )
}
