'use client'

import { useState } from 'react'
import { updateSiteSettings } from '@/app/actions/settings'
import { Save, Globe, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

interface SiteSettingsFormProps {
    locale: string
    initialSettings: {
        siteName?: string
        logo?: string
        favicon?: string
        phone?: string
        email?: string
        address?: string
        socialLinks?: string
        footerText?: string
        footerCopyright?: string
        headerStyle?: string
    }
}

export function SiteSettingsForm({ locale, initialSettings }: SiteSettingsFormProps) {
    const [settings, setSettings] = useState(initialSettings)
    const [socialLinks, setSocialLinks] = useState(() => {
        try {
            return JSON.parse(initialSettings.socialLinks || '{}')
        } catch {
            return {}
        }
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleChange = (field: string, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }))
        setSaved(false)
    }

    const handleSocialChange = (platform: string, value: string) => {
        setSocialLinks((prev: Record<string, string>) => ({ ...prev, [platform]: value }))
        setSaved(false)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateSiteSettings(locale, {
                ...settings,
                socialLinks: JSON.stringify(socialLinks)
            })
            setSaved(true)
        } catch (e) {
            alert('Failed to save settings')
        }
        setSaving(false)
    }

    return (
        <div className="space-y-8">
            {/* General Settings */}
            <section className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-blue-600" />
                    General Settings
                </h2>
                <div className="grid gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                        <input
                            type="text"
                            value={settings.siteName || ''}
                            onChange={e => handleChange('siteName', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                            <input
                                type="url"
                                value={settings.logo || ''}
                                onChange={e => handleChange('logo', e.target.value)}
                                placeholder="/uploads/logo.png"
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                            <input
                                type="url"
                                value={settings.favicon || ''}
                                onChange={e => handleChange('favicon', e.target.value)}
                                placeholder="/uploads/favicon.ico"
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Header Style</label>
                        <select
                            value={settings.headerStyle || 'default'}
                            onChange={e => handleChange('headerStyle', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="default">Default (White Background)</option>
                            <option value="transparent">Transparent</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Phone size={20} className="text-blue-600" />
                    Contact Information
                </h2>
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <Phone size={14} /> Phone
                            </label>
                            <input
                                type="tel"
                                value={settings.phone || ''}
                                onChange={e => handleChange('phone', e.target.value)}
                                placeholder="+90 252 337 11 11"
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <Mail size={14} /> Email
                            </label>
                            <input
                                type="email"
                                value={settings.email || ''}
                                onChange={e => handleChange('email', e.target.value)}
                                placeholder="info@example.com"
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <MapPin size={14} /> Address
                        </label>
                        <textarea
                            value={settings.address || ''}
                            onChange={e => handleChange('address', e.target.value)}
                            rows={2}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>
                </div>
            </section>

            {/* Social Media Links */}
            <section className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Social Media</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Facebook size={14} className="text-blue-600" /> Facebook
                        </label>
                        <input
                            type="url"
                            value={socialLinks.facebook || ''}
                            onChange={e => handleSocialChange('facebook', e.target.value)}
                            placeholder="https://facebook.com/..."
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Instagram size={14} className="text-pink-600" /> Instagram
                        </label>
                        <input
                            type="url"
                            value={socialLinks.instagram || ''}
                            onChange={e => handleSocialChange('instagram', e.target.value)}
                            placeholder="https://instagram.com/..."
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Twitter size={14} className="text-sky-500" /> Twitter / X
                        </label>
                        <input
                            type="url"
                            value={socialLinks.twitter || ''}
                            onChange={e => handleSocialChange('twitter', e.target.value)}
                            placeholder="https://twitter.com/..."
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Youtube size={14} className="text-red-600" /> YouTube
                        </label>
                        <input
                            type="url"
                            value={socialLinks.youtube || ''}
                            onChange={e => handleSocialChange('youtube', e.target.value)}
                            placeholder="https://youtube.com/..."
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Footer Settings */}
            <section className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Footer</h2>
                <div className="grid gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
                        <textarea
                            value={settings.footerText || ''}
                            onChange={e => handleChange('footerText', e.target.value)}
                            rows={3}
                            placeholder="About your resort..."
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
                        <input
                            type="text"
                            value={settings.footerCopyright || ''}
                            onChange={e => handleChange('footerCopyright', e.target.value)}
                            placeholder="© 2025 Blue Dreams Resort. All rights reserved."
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Save Button */}
            <div className="sticky bottom-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${saved
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } disabled:opacity-50`}
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
                </button>
            </div>
        </div>
    )
}
