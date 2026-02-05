'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Save, Trash2, Plus, Eye, Calendar, BarChart3 } from 'lucide-react'

interface CtaBar {
    id: string
    title: string
    subtitle?: string
    buttonText?: string
    buttonUrl?: string
    backgroundColor: string
    textColor: string
    startDate?: string
    endDate?: string
    isActive: boolean
    clickCount: number
    createdAt: string
}

const defaultForm = {
    id: '',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonUrl: '',
    backgroundColor: '#2563eb',
    textColor: '#ffffff',
    startDate: '',
    endDate: '',
    isActive: false
}

export default function CtaBarPage() {
    const [ctaBars, setCtaBars] = useState<CtaBar[]>([])
    const [form, setForm] = useState(defaultForm)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        fetchCtaBars()
    }, [])

    const fetchCtaBars = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/cta-bar')
            const data = await res.json()
            setCtaBars(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch CTA bars:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!form.title.trim()) {
            alert('Başlık gerekli!')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/admin/cta-bar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })

            if (res.ok) {
                setForm(defaultForm)
                setShowForm(false)
                fetchCtaBars()
            }
        } catch (error) {
            console.error('Failed to save CTA bar:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bu CTA barı silmek istediğinizden emin misiniz?')) return

        try {
            await fetch(`/api/admin/cta-bar?id=${id}`, { method: 'DELETE' })
            fetchCtaBars()
        } catch (error) {
            console.error('Failed to delete CTA bar:', error)
        }
    }

    const handleEdit = (ctaBar: CtaBar) => {
        setForm({
            id: ctaBar.id,
            title: ctaBar.title,
            subtitle: ctaBar.subtitle || '',
            buttonText: ctaBar.buttonText || '',
            buttonUrl: ctaBar.buttonUrl || '',
            backgroundColor: ctaBar.backgroundColor,
            textColor: ctaBar.textColor,
            startDate: ctaBar.startDate ? new Date(ctaBar.startDate).toISOString().slice(0, 16) : '',
            endDate: ctaBar.endDate ? new Date(ctaBar.endDate).toISOString().slice(0, 16) : '',
            isActive: ctaBar.isActive
        })
        setShowForm(true)
    }

    const toggleActive = async (ctaBar: CtaBar) => {
        try {
            await fetch('/api/admin/cta-bar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...ctaBar, isActive: !ctaBar.isActive })
            })
            fetchCtaBars()
        } catch (error) {
            console.error('Failed to toggle active:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">CTA Bar Yönetimi</h1>
                        <p className="text-gray-500 text-sm">Hero altında görünen promosyon barını yönetin</p>
                    </div>
                </div>
                <button
                    onClick={() => { setForm(defaultForm); setShowForm(true) }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    Yeni CTA Bar
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {form.id ? 'CTA Bar Düzenle' : 'Yeni CTA Bar'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Başlık *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Özel Fırsat!"
                            />
                        </div>

                        {/* Subtitle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Alt Başlık</label>
                            <input
                                type="text"
                                value={form.subtitle}
                                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Bugüne özel %20 indirim"
                            />
                        </div>

                        {/* Button Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buton Metni</label>
                            <input
                                type="text"
                                value={form.buttonText}
                                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Şimdi Rezervasyon Yap"
                            />
                        </div>

                        {/* Button URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buton Linki</label>
                            <input
                                type="url"
                                value={form.buttonUrl}
                                onChange={(e) => setForm({ ...form, buttonUrl: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="https://..."
                            />
                        </div>

                        {/* Background Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Arka Plan Rengi</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={form.backgroundColor}
                                    onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={form.backgroundColor}
                                    onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Text Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Yazı Rengi</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={form.textColor}
                                    onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={form.textColor}
                                    onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={14} className="inline mr-1" />
                                Başlangıç Tarihi
                            </label>
                            <input
                                type="datetime-local"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={14} className="inline mr-1" />
                                Bitiş Tarihi
                            </label>
                            <input
                                type="datetime-local"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <span className="text-sm text-gray-700">Aktif</span>
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Eye size={14} className="inline mr-1" />
                            Önizleme
                        </label>
                        <div
                            className="py-4 px-6 rounded-lg"
                            style={{ backgroundColor: form.backgroundColor }}
                        >
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                <div className="text-center md:text-left" style={{ color: form.textColor }}>
                                    <span className="font-bold text-lg md:text-xl">{form.title || 'Başlık'}</span>
                                    {form.subtitle && (
                                        <span className="block md:inline md:ml-3 text-sm opacity-90">
                                            {form.subtitle}
                                        </span>
                                    )}
                                </div>
                                {form.buttonText && (
                                    <button
                                        className="px-6 py-2 bg-white/20 rounded-full font-semibold text-sm uppercase tracking-wide"
                                        style={{ color: form.textColor }}
                                    >
                                        {form.buttonText}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button
                            onClick={() => { setForm(defaultForm); setShowForm(false) }}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Mevcut CTA Barlar</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
                ) : ctaBars.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Henüz CTA bar oluşturulmamış.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {ctaBars.map((ctaBar) => (
                            <div key={ctaBar.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full"
                                                style={{ backgroundColor: ctaBar.backgroundColor }}
                                            />
                                            <h3 className="font-semibold text-gray-900">{ctaBar.title}</h3>
                                            {ctaBar.isActive ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                    Pasif
                                                </span>
                                            )}
                                        </div>
                                        {ctaBar.subtitle && (
                                            <p className="text-gray-500 text-sm mt-1">{ctaBar.subtitle}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            {(ctaBar.startDate || ctaBar.endDate) && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {ctaBar.startDate && new Date(ctaBar.startDate).toLocaleDateString('tr-TR')}
                                                    {ctaBar.startDate && ctaBar.endDate && ' - '}
                                                    {ctaBar.endDate && new Date(ctaBar.endDate).toLocaleDateString('tr-TR')}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <BarChart3 size={12} />
                                                {ctaBar.clickCount} tıklama
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleActive(ctaBar)}
                                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${ctaBar.isActive
                                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                        >
                                            {ctaBar.isActive ? 'Devre Dışı Bırak' : 'Aktif Et'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(ctaBar)}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 transition-colors"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ctaBar.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
