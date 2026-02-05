import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'

interface SiteSettings {
    siteName?: string
    phone?: string
    email?: string
    address?: string
    socialLinks?: string
    footerText?: string
    footerCopyright?: string
}

interface FooterProps {
    settings: SiteSettings
    locale: string
}

export function Footer({ settings, locale }: FooterProps) {
    const socialLinks = (() => {
        try {
            return JSON.parse(settings.socialLinks || '{}')
        } catch {
            return {}
        }
    })()

    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand & Description */}
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-bold tracking-wider mb-4">
                            {settings.siteName || 'BLUE DREAMS RESORT'}
                        </h3>
                        {settings.footerText && (
                            <p className="text-gray-400 leading-relaxed mb-6">
                                {settings.footerText}
                            </p>
                        )}

                        {/* Social Links */}
                        <div className="flex gap-4">
                            {socialLinks.facebook && (
                                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-blue-500 transition-colors">
                                    <Facebook size={22} />
                                </a>
                            )}
                            {socialLinks.instagram && (
                                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-pink-500 transition-colors">
                                    <Instagram size={22} />
                                </a>
                            )}
                            {socialLinks.twitter && (
                                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-sky-400 transition-colors">
                                    <Twitter size={22} />
                                </a>
                            )}
                            {socialLinks.youtube && (
                                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-red-500 transition-colors">
                                    <Youtube size={22} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 tracking-wide">Contact</h4>
                        <div className="space-y-3">
                            {settings.phone && (
                                <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                                    <Phone size={16} />
                                    <span>{settings.phone}</span>
                                </a>
                            )}
                            {settings.email && (
                                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                                    <Mail size={16} />
                                    <span>{settings.email}</span>
                                </a>
                            )}
                            {settings.address && (
                                <div className="flex items-start gap-3 text-gray-400">
                                    <MapPin size={16} className="mt-1 flex-shrink-0" />
                                    <span className="text-sm">{settings.address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 tracking-wide">Quick Links</h4>
                        <div className="space-y-2">
                            <Link href={`/${locale}/accommodation`} className="block text-gray-400 hover:text-white transition-colors">
                                Accommodation
                            </Link>
                            <Link href={`/${locale}/dining`} className="block text-gray-400 hover:text-white transition-colors">
                                Dining
                            </Link>
                            <Link href={`/${locale}/spa`} className="block text-gray-400 hover:text-white transition-colors">
                                Spa & Wellness
                            </Link>
                            <Link href={`/${locale}/gallery`} className="block text-gray-400 hover:text-white transition-colors">
                                Gallery
                            </Link>
                            <Link href={`/${locale}/contact`} className="block text-gray-400 hover:text-white transition-colors">
                                Contact
                            </Link>
                            <Link href={`/${locale}/admin`} className="block text-gray-500 hover:text-gray-300 text-sm mt-4 transition-colors">
                                Admin Panel
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
                    {settings.footerCopyright || `© ${currentYear} ${settings.siteName || 'Blue Dreams Resort'}. All rights reserved.`}
                </div>
            </div>
        </footer>
    )
}
