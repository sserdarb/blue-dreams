'use client'

import { useState } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    })
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In production, this would send to an API
        console.log('Form submitted:', formData)
        setSubmitted(true)
    }

    return (
        <div>
            <PageHeader
                title="İletişim"
                subtitle="Sorularınız ve önerileriniz için bize ulaşın."
                backgroundImage="https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg"
                breadcrumbs={[{ label: 'İletişim', href: '/tr/iletisim' }]}
            />

            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                        {/* Contact Info */}
                        <div>
                            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                İletişim Bilgileri
                            </span>
                            <h2 className="text-4xl font-serif text-gray-900 mb-8">
                                Bize <span className="italic text-brand">Ulaşın</span>
                            </h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="text-brand" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Adres</h3>
                                        <p className="text-gray-600">
                                            Torba Mahallesi Herodot Bulvarı No:11<br />
                                            Bodrum / MUĞLA / TÜRKİYE
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Phone className="text-brand" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Telefon</h3>
                                        <p className="text-gray-600">
                                            <a href="tel:+902523371111" className="hover:text-brand transition-colors">
                                                +90 252 337 11 11
                                            </a>
                                        </p>
                                        <p className="text-gray-600">
                                            <a href="https://wa.me/905495167803" className="hover:text-brand transition-colors">
                                                WhatsApp: +90 549 516 78 03
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Mail className="text-brand" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">E-posta</h3>
                                        <p className="text-gray-600">
                                            <a href="mailto:sales@bluedreamsresort.com" className="hover:text-brand transition-colors">
                                                sales@bluedreamsresort.com
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Clock className="text-brand" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Çalışma Saatleri</h3>
                                        <p className="text-gray-600">
                                            Resepsiyon: 7/24<br />
                                            Rezervasyon: 09:00 - 22:00
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Sosyal Medya</h3>
                                <div className="flex gap-3">
                                    <a href="https://www.facebook.com/bluedreamshotel" target="_blank" rel="noreferrer"
                                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-brand hover:text-white transition-colors">
                                        <Facebook size={18} />
                                    </a>
                                    <a href="https://www.instagram.com/clubbluedreamsresort/" target="_blank" rel="noreferrer"
                                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-brand hover:text-white transition-colors">
                                        <Instagram size={18} />
                                    </a>
                                    <a href="https://www.youtube.com/@bluedreamsresort8738/videos" target="_blank" rel="noreferrer"
                                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-brand hover:text-white transition-colors">
                                        <Youtube size={18} />
                                    </a>
                                    <a href="https://www.linkedin.com/company/bluedreamsresortbodrum" target="_blank" rel="noreferrer"
                                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-brand hover:text-white transition-colors">
                                        <Linkedin size={18} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-sand p-8 rounded-lg">
                            <h3 className="text-2xl font-serif text-gray-900 mb-6">Mesaj Gönderin</h3>

                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="text-green-600" size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Mesajınız Gönderildi!</h4>
                                    <p className="text-gray-600">En kısa sürede size dönüş yapacağız.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
                                            <select
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand bg-white"
                                            >
                                                <option value="">Seçiniz</option>
                                                <option value="reservation">Rezervasyon</option>
                                                <option value="info">Bilgi Talebi</option>
                                                <option value="complaint">Şikayet</option>
                                                <option value="other">Diğer</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mesajınız *</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand resize-none"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-brand text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Send size={16} /> Gönder
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Map */}
            <section className="h-[400px] relative">
                <iframe
                    src="https://maps.google.com/maps?q=37.091832,27.4824998&hl=tr&z=15&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    title="Blue Dreams Resort Location"
                    className="w-full h-full"
                ></iframe>
            </section>
        </div>
    )
}
