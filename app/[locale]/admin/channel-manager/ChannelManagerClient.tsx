'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Globe, Settings, RefreshCw, AlertCircle, CheckCircle2,
    CalendarDays, BarChart3, Link as LinkIcon, Power, ArrowRightLeft,
    Search, Filter, Plus, FileText, ChevronRight
} from 'lucide-react'

// --- Mock Data ---
const MOCK_CHANNELS = [
    { id: '1', name: 'Booking.com', logo: 'https://logo.clearbit.com/booking.com', status: 'active', lastSync: '2 dk önce', properties: 1, commRate: '15%', activeOffers: 3, errors: 0 },
    { id: '2', name: 'Expedia', logo: 'https://logo.clearbit.com/expedia.com', status: 'active', lastSync: '5 dk önce', properties: 1, commRate: '18%', activeOffers: 2, errors: 1 },
    { id: '3', name: 'Agoda', logo: 'https://logo.clearbit.com/agoda.com', status: 'error', lastSync: '1 saat önce', properties: 1, commRate: '15%', activeOffers: 1, errors: 3 },
    { id: '4', name: 'Hotels.com', logo: 'https://logo.clearbit.com/hotels.com', status: 'active', lastSync: '10 dk önce', properties: 1, commRate: '18%', activeOffers: 2, errors: 0 },
    { id: '5', name: 'Airbnb', logo: 'https://logo.clearbit.com/airbnb.com', status: 'inactive', lastSync: '-', properties: 0, commRate: '3%', activeOffers: 0, errors: 0 },
    { id: '6', name: 'Otelz', logo: 'https://logo.clearbit.com/otelz.com', status: 'active', lastSync: '15 dk önce', properties: 1, commRate: '12%', activeOffers: 4, errors: 0 },
]

const MOCK_LOGS = [
    { id: '101', channel: 'Booking.com', type: 'Fiyat Güncelleme', status: 'success', details: 'Standart Oda, 15-20 Haziran fiyatları güncellendi', time: '10:45' },
    { id: '102', channel: 'Expedia', type: 'Müsaitlik Güncelleme', status: 'success', details: 'Aile Odası availability: 0 (Stop Sale)', time: '10:42' },
    { id: '103', channel: 'Agoda', type: 'Rezervasyon İndirme', status: 'error', details: 'API bağlantı hatası: Timeout', time: '09:30' },
    { id: '104', channel: 'Booking.com', type: 'Yeni Rezervasyon', status: 'info', details: 'Rezervasyon #BKG-99214 alındı', time: '09:15' },
    { id: '105', channel: 'Otelz', type: 'Müsaitlik Güncelleme', status: 'success', details: 'Tüm odalar senkronize edildi', time: '08:00' },
]

export default function ChannelManagerClient() {
    const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'logs' | 'mapping'>('overview')
    const [isSyncing, setIsSyncing] = useState(false)
    const [search, setSearch] = useState('')

    const handleSync = () => {
        setIsSyncing(true)
        setTimeout(() => setIsSyncing(false), 2000)
    }

    const filteredChannels = MOCK_CHANNELS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="text-blue-500" /> Kanal Yöneticisi</h1>
                    <p className="text-sm text-muted-foreground mt-1">OTA bağlantıları ve merkezi müsaitlik/fiyat yönetimi (Elektra PMS Entegrasyonu)</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                        Tam Senkronizasyon
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg overflow-x-auto border border-slate-200 dark:border-slate-700">
                {[
                    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
                    { id: 'channels', label: 'Bağlı Kanallar', icon: LinkIcon },
                    { id: 'mapping', label: 'Oda/Fiyat Eşleştirme', icon: ArrowRightLeft },
                    { id: 'logs', label: 'Senkronizasyon Logları', icon: FileText },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="p-5 border-l-4 border-l-blue-500">
                            <p className="text-sm font-medium text-muted-foreground">Aktif Kanal</p>
                            <h3 className="text-3xl font-bold mt-2">4</h3>
                        </Card>
                        <Card className="p-5 border-l-4 border-l-emerald-500">
                            <p className="text-sm font-medium text-muted-foreground">Başarılı Senkronizasyon (24s)</p>
                            <h3 className="text-3xl font-bold mt-2">1,248</h3>
                        </Card>
                        <Card className="p-5 border-l-4 border-l-red-500">
                            <p className="text-sm font-medium text-muted-foreground">Senkronizasyon Hatası</p>
                            <div className="flex items-end gap-3 mt-2">
                                <h3 className="text-3xl font-bold">4</h3>
                                <span className="text-sm text-red-500 mb-1 flex items-center"><AlertCircle size={14} className="mr-1" /> Agoda timeout</span>
                            </div>
                        </Card>
                        <Card className="p-5 border-l-4 border-l-purple-500">
                            <p className="text-sm font-medium text-muted-foreground">Oda Eşleştirmeleri</p>
                            <h3 className="text-3xl font-bold mt-2">24 <span className="text-lg font-normal text-muted-foreground">/ 24</span></h3>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Kanal Durumları</h3>
                            <div className="space-y-4">
                                {MOCK_CHANNELS.slice(0, 4).map(c => (
                                    <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <img src={c.logo} alt={c.name} className="w-8 h-8 rounded-full bg-white p-1" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/32')} />
                                            <div>
                                                <p className="font-medium">{c.name}</p>
                                                <p className="text-xs text-muted-foreground">Son Sync: {c.lastSync}</p>
                                            </div>
                                        </div>
                                        <div>
                                            {c.status === 'active' ? <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900"><CheckCircle2 size={12} className="mr-1" /> Aktif</Badge>
                                                : c.status === 'error' ? <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:border-red-900"><AlertCircle size={12} className="mr-1" /> Hata</Badge>
                                                    : <Badge variant="secondary">Pasif</Badge>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Son Aktiviteler</h3>
                                <button onClick={() => setActiveTab('logs')} className="text-sm text-blue-600 hover:underline">Tümünü Gör</button>
                            </div>
                            <div className="space-y-4">
                                {MOCK_LOGS.map(log => (
                                    <div key={log.id} className="flex gap-3 relative">
                                        <div className={`mt-1 rounded-full p-1 ${log.status === 'success' ? 'bg-emerald-100 text-emerald-600' : log.status === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {log.status === 'success' ? <CheckCircle2 size={14} /> : log.status === 'error' ? <AlertCircle size={14} /> : <RefreshCw size={14} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{log.type} - <span className="font-bold">{log.channel}</span></p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'channels' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between">
                        <div className="relative max-w-md w-full">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                className="w-full pl-9 pr-3 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                placeholder="Kanal ara..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                            <Plus size={16} /> Yeni Kanal Ekle
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredChannels.map(c => (
                            <Card key={c.id} className={`p-5 transition-shadow hover:shadow-md ${c.status === 'inactive' ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <img src={c.logo} alt={c.name} className="h-10 border rounded-lg p-1 bg-white" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40')} />
                                    {c.status === 'active' ? <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Bağlı</Badge>
                                        : c.status === 'error' ? <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Bağlantı Hatası</Badge>
                                            : <Badge variant="secondary">Bağlı Değil</Badge>}
                                </div>
                                <h3 className="font-bold text-lg">{c.name}</h3>
                                <div className="grid grid-cols-2 gap-y-2 mt-4 text-sm">
                                    <div className="text-muted-foreground">Komisyon:</div>
                                    <div className="font-medium text-right">{c.commRate}</div>
                                    <div className="text-muted-foreground">Aktif Promosyon:</div>
                                    <div className="font-medium text-right">{c.activeOffers}</div>
                                    <div className="text-muted-foreground">Son Sync:</div>
                                    <div className="font-medium text-right">{c.lastSync}</div>
                                </div>
                                <div className="mt-6 pt-4 border-t flex justify-between">
                                    <button className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"><Settings size={14} /> Ayarlar</button>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${c.status !== 'inactive' ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                            <div className={`absolute top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${c.status !== 'inactive' ? 'left-[22px]' : 'left-[2px]'}`}></div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'mapping' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="p-8 text-center border-dashed border-2">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ArrowRightLeft size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Oda Tipi ve Fiyat Planı Eşleştirmesi</h2>
                        <p className="max-w-md mx-auto text-muted-foreground mb-6">Elektra PMS üzerindeki oda tiplerinizi ve fiyat kodlarınızı (Rate Plans), OTA tarafındaki karşılıklarıyla eşleştirerek havuz senkronizasyonunu başlatın.</p>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Elektra Eşleştirme Sihirbazını Başlat</button>
                    </Card>
                </div>
            )}

            {activeTab === 'logs' && (
                <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                        <h3 className="font-semibold">Son Dönüşüm ve Senkronizasyon Olayları</h3>
                        <div className="flex gap-2">
                            <select className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900">
                                <option>Tüm Kanallar</option>
                                <option>Booking.com</option>
                                <option>Expedia</option>
                            </select>
                            <select className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900">
                                <option>Tüm Olaylar</option>
                                <option>Hatalar (Errors)</option>
                                <option>Rezervasyonlar</option>
                                <option>Fiyat Pushes</option>
                            </select>
                        </div>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800/50">
                            <tr>
                                <th className="p-4 py-3 font-medium">Zaman</th>
                                <th className="p-4 py-3 font-medium">Kanal</th>
                                <th className="p-4 py-3 font-medium">İşlem Tipi</th>
                                <th className="p-4 py-3 font-medium">Detay</th>
                                <th className="p-4 py-3 font-medium">Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_LOGS.map(log => (
                                <tr key={log.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="p-4 py-3 whitespace-nowrap text-muted-foreground">{log.time}</td>
                                    <td className="p-4 py-3 font-medium">{log.channel}</td>
                                    <td className="p-4 py-3">{log.type}</td>
                                    <td className="p-4 py-3 text-muted-foreground max-w-md truncate">{log.details}</td>
                                    <td className="p-4 py-3">
                                        {log.status === 'success' ? <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">Başarılı</span>
                                            : log.status === 'error' ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">Hata</span>
                                                : <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">Bilgi</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

        </div>
    )
}
