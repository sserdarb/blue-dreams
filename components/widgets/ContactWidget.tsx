'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'

interface ContactData {
    infoLabel?: string
    infoHeading?: string
    infoHeadingAccent?: string
    address?: string
    phone?: string
    whatsapp?: string
    email?: string
    hours?: string
    socialLinks?: { facebook?: string; instagram?: string; youtube?: string; linkedin?: string }
    formTitle?: string
    subjects?: { value: string; label: string }[]
    labels?: {
        name?: string; emailLabel?: string; phoneLabel?: string;
        subject?: string; message?: string; send?: string;
        selectPlaceholder?: string; successTitle?: string; successMessage?: string;
        addressLabel?: string; phoneTitle?: string; emailTitle?: string;
        hoursLabel?: string; socialTitle?: string
    }
}

export function ContactWidget({ data }: { data: ContactData }) {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        setSubmitted(true)
    }

    const l = data.labels || {}

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <div>
                        {data.infoLabel && (
                            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                {data.infoLabel}
                            </span>
                        )}
                        {data.infoHeading && (
                            <h2 className="text-4xl font-serif text-gray-900 mb-8">
                                {data.infoHeading}{' '}
                                {data.infoHeadingAccent && <span className="italic text-brand">{data.infoHeadingAccent}</span>}
                            </h2>
                        )}

                        <div className="space-y-6">
                            {data.address && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="text-brand" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">{l.addressLabel || 'Adres'}</h3>
                                        <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: data.address.replace(/\n/g, '<br/>') }} />
                                    </div>
                                </div>
                            )}

                            {(data.phone || data.whatsapp) && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Phone className="text-brand" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">{l.phoneTitle || 'Telefon'}</h3>
                                        {data.phone && (
                                            <p className="text-gray-600">
                                                <a href={`tel:${data.phone.replace(/\s/g, '')}`} className="hover:text-brand transition-colors">{data.phone}</a>
                                            </p>
                                        )}
                                        {data.whatsapp && (
                                            <p className="text-gray-600">
                                                <a href={`https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}`} className="hover:text-brand transition-colors">
                                                    WhatsApp: {data.whatsapp}
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {data.email && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Mail className="text-brand" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">{l.emailTitle || 'E-posta'}</h3>
                                        <p className="text-gray-600">
                                            <a href={`mailto:${data.email}`} className="hover:text-brand transition-colors">{data.email}</a>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {data.hours && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Clock className="text-brand" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">{l.hoursLabel || 'Çalışma Saatleri'}</h3>
                                        <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: data.hours.replace(/\n/g, '<br/>') }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Social Links */}
                        {data.socialLinks && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">{l.socialTitle || 'Sosyal Medya'}</h3>
                                <div className="flex gap-3">
                                    {data.socialLinks.facebook && (
                                        <a href={data.socialLinks.facebook} target="_blank" rel="noreferrer"
                                            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-brand hover:text-white transition-colors">
                                            <Facebook size={18} />
                                        </a>
                                    )}
                                    {data.socialLinks.instagram && (
                                        <a href={data.socialLinks.instagram} target="_blank" rel="noreferrer"
                                            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-brand hover:text-white transition-colors">
                                            <Instagram size={18} />
                                        </a>
                                    )}
                                    {data.socialLinks.youtube && (
                                        <a href={data.socialLinks.youtube} target="_blank" rel="noreferrer"
                                            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-brand hover:text-white transition-colors">
                                            <Youtube size={18} />
                                        </a>
                                    )}
                                    {data.socialLinks.linkedin && (
                                        <a href={data.socialLinks.linkedin} target="_blank" rel="noreferrer"
                                            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-brand hover:text-white transition-colors">
                                            <Linkedin size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contact Form */}
                    <div className="bg-sand p-8 rounded-lg">
                        <h3 className="text-2xl font-serif text-gray-900 mb-6">{data.formTitle || 'Mesaj Gönderin'}</h3>
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="text-green-600" size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">{l.successTitle || 'Mesajınız Gönderildi!'}</h4>
                                <p className="text-gray-600">{l.successMessage || 'En kısa sürede size dönüş yapacağız.'}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{l.name || 'Ad Soyad'} *</label>
                                        <input type="text" required value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{l.emailLabel || 'E-posta'} *</label>
                                        <input type="email" required value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{l.phoneLabel || 'Telefon'}</label>
                                        <input type="tel" value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{l.subject || 'Konu'}</label>
                                        <select value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand bg-white">
                                            <option value="">{l.selectPlaceholder || 'Seçiniz'}</option>
                                            {(data.subjects || []).map((s, i) => (
                                                <option key={i} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{l.message || 'Mesajınız'} *</label>
                                    <textarea required rows={5} value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand resize-none" />
                                </div>
                                <button type="submit"
                                    className="w-full bg-brand text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors flex items-center justify-center gap-2">
                                    <Send size={16} /> {l.send || 'Gönder'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
