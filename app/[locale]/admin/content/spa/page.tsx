'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon, MessageCircle } from 'lucide-react'
import { useParams } from 'next/navigation'

interface SpaService {
    id: string
    title: string
    description: string
    image: string
    order: number
    isActive: boolean
}

interface SpaData {
    id: string
    title: string
    customLogo: string
    heroImage: string
    whatsappNumber: string
    whatsappText: string
    description1: string
    description2: string
    description3: string
    services: SpaService[]
}

export default function SpaAdminPage() {
    const params = useParams()
    const locale = params.locale as string

    const [loading, setLoading] = useState(true)
    const [spaData, setSpaData] = useState<SpaData | null>(null)
    const [activeTab, setActiveTab] = useState<'settings' | 'services'>('settings')

    // Service Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<SpaService | null>(null)
    const [serviceForm, setServiceForm] = useState({
        title: '', description: '', image: '', order: 0, isActive: true
    })

    const fetchSpaData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/spa?locale=${locale}`)
            if (res.ok) {
                const data = await res.json()
                setSpaData(data)
            }
        } catch (error) {
            console.error('Error fetching spa data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSpaData()
    }, [locale])

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!spaData) return

        try {
            const res = await fetch('/api/admin/spa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...spaData, locale })
            })
            if (res.ok) {
                alert('Ayarlar kaydedildi.')
                fetchSpaData()
            }
        } catch (error) {
            console.error('Error saving spa settings:', error)
        }
    }

    const handleServiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!spaData) return

        try {
            if (editingService) {
                await fetch(`/api/admin/spa-services/${editingService.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(serviceForm)
                })
            } else {
                await fetch('/api/admin/spa-services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...serviceForm, spaId: spaData.id, locale })
                })
            }
            setIsModalOpen(false)
            fetchSpaData()
        } catch (error) {
            console.error('Error saving service:', error)
        }
    }

    const handleDeleteService = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return
        try {
            await fetch(`/api/admin/spa-services/${id}`, { method: 'DELETE' })
            fetchSpaData()
        } catch (error) {
            console.error('Error deleting service:', error)
        }
    }

    const openServiceModal = (service?: SpaService) => {
        if (service) {
            setEditingService(service)
            setServiceForm({
                title: service.title,
                description: service.description || '',
                image: service.image || '',
                order: service.order,
                isActive: service.isActive
            })
        } else {
            setEditingService(null)
            setServiceForm({
                title: '', description: '', image: '', order: (spaData?.services?.length || 0) + 1, isActive: true
            })
        }
        setIsModalOpen(true)
    }

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>
    if (!spaData) return <div className="p-8 text-center text-red-500">Veri yüklenemedi.</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Spa & Wellness Yönetimi</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Spa içerikleri, rezervasyon butonları ve masaj hizmetleri.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>Genel Ayarlar</button>
                    <button onClick={() => setActiveTab('services')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'services' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>Hizmetler</button>
                </div>
            </div>

            {activeTab === 'settings' && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Başlık</label>
                                <input type="text" value={spaData.title} onChange={e => setSpaData({ ...spaData, title: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Özel Logo URL (Opsiyonel)</label>
                                <input type="text" value={spaData.customLogo || ''} onChange={e => setSpaData({ ...spaData, customLogo: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hero Görsel URL</label>
                            <input type="text" value={spaData.heroImage || ''} onChange={e => setSpaData({ ...spaData, heroImage: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">WhatsApp No (+90...)</label>
                                <div className="flex flex-col relative w-full">
                                    <MessageCircle className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                    <input type="text" value={spaData.whatsappNumber || ''} onChange={e => setSpaData({ ...spaData, whatsappNumber: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg pl-9 p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">WhatsApp Buton Metni</label>
                                <input type="text" value={spaData.whatsappText || ''} onChange={e => setSpaData({ ...spaData, whatsappText: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Rezervasyon Yapın" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Açıklama Bölümleri</label>
                            <textarea rows={3} value={spaData.description1 || ''} onChange={e => setSpaData({ ...spaData, description1: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Paragraf 1"></textarea>
                            <textarea rows={3} value={spaData.description2 || ''} onChange={e => setSpaData({ ...spaData, description2: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Paragraf 2"></textarea>
                            <textarea rows={3} value={spaData.description3 || ''} onChange={e => setSpaData({ ...spaData, description3: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Paragraf 3"></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2">
                                <Save size={18} /> Ayarları Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'services' && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-[#0f172a]">
                        <h3 className="font-bold text-slate-900 dark:text-white">Spa Hizmetleri</h3>
                        <button onClick={() => openServiceModal()} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm">
                            <Plus size={16} /> Yeni Hizmet
                        </button>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {spaData.services.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">Henüz hizmet eklenmemiş.</div>
                        ) : (
                            spaData.services.map(service => (
                                <div key={service.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                            {service.image ? <img src={service.image} alt={service.title} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 m-5 text-slate-300" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                {service.title}
                                                {!service.isActive && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Pasif</span>}
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-1">{service.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openServiceModal(service)} className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteService(service.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e293b] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl">
                        <form onSubmit={handleServiceSubmit}>
                            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingService ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}</h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hizmet Adı</label>
                                    <input type="text" required value={serviceForm.title} onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Görsel URL</label>
                                    <input type="text" value={serviceForm.image} onChange={e => setServiceForm({ ...serviceForm, image: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Açıklama</label>
                                    <textarea rows={3} value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sıra</label>
                                        <input type="number" value={serviceForm.order} onChange={e => setServiceForm({ ...serviceForm, order: parseInt(e.target.value) })} className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={serviceForm.isActive} onChange={e => setServiceForm({ ...serviceForm, isActive: e.target.checked })} className="rounded border-slate-300" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Aktif</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1e293b] rounded-b-2xl flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors">İptal</button>
                                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Save size={16} /> Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
