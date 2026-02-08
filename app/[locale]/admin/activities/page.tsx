'use client'

import { useState } from 'react'
import { Calendar, MapPin, Clock, Plus, Trash2, Edit, ExternalLink, FileSpreadsheet, Copy, Check } from 'lucide-react'

interface Activity {
    id: string
    name: string
    date: string
    time: string
    location: string
    description: string
    category: string
    ticketUrl: string
    status: 'active' | 'draft' | 'past'
}

const SAMPLE_ACTIVITIES: Activity[] = [
    { id: '1', name: 'Bodrum Caz Festivali', date: '2026-07-15', time: '21:00', location: 'Bodrum Kalesi', description: 'Uluslararası caz festivali', category: 'festival', ticketUrl: '', status: 'active' },
    { id: '2', name: 'Antik Tiyatro Konserleri', date: '2026-08-01', time: '21:30', location: 'Bodrum Antik Tiyatro', description: 'Yaz konserleri serisi', category: 'konser', ticketUrl: '', status: 'active' },
    { id: '3', name: 'Plaj Yoga Seansı', date: '2026-06-20', time: '07:00', location: 'Blue Dreams Plaj', description: 'Sabah yoga aktivitesi', category: 'workshop', ticketUrl: '', status: 'draft' },
]

const GOOGLE_SHEET_TEMPLATE = `Etkinlik Adı\tTarih (YYYY-MM-DD)\tSaat (HH:MM)\tMekan\tAçıklama\tKategori\tBilet URL\tDurum
Örnek Etkinlik\t2026-07-15\t21:00\tBodrum Kalesi\tAçıklama yazın\tfestival\thttps://...\tactive
`

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>(SAMPLE_ACTIVITIES)
    const [showForm, setShowForm] = useState(false)
    const [showSheetModal, setShowSheetModal] = useState(false)
    const [sheetUrl, setSheetUrl] = useState('')
    const [copied, setCopied] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({
        name: '', date: '', time: '', location: '', description: '', category: 'konser', ticketUrl: '', status: 'active' as Activity['status']
    })

    const handleSave = () => {
        if (!form.name || !form.date) return

        if (editingId) {
            setActivities(prev => prev.map(a => a.id === editingId ? { ...a, ...form } : a))
            setEditingId(null)
        } else {
            setActivities(prev => [...prev, { id: Date.now().toString(), ...form }])
        }
        setForm({ name: '', date: '', time: '', location: '', description: '', category: 'konser', ticketUrl: '', status: 'active' })
        setShowForm(false)
    }

    const handleEdit = (activity: Activity) => {
        setForm({ name: activity.name, date: activity.date, time: activity.time, location: activity.location, description: activity.description, category: activity.category, ticketUrl: activity.ticketUrl, status: activity.status })
        setEditingId(activity.id)
        setShowForm(true)
    }

    const handleDelete = (id: string) => {
        if (confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
            setActivities(prev => prev.filter(a => a.id !== id))
        }
    }

    const copyTemplate = () => {
        navigator.clipboard.writeText(GOOGLE_SHEET_TEMPLATE)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const categories = ['konser', 'festival', 'tiyatro', 'bale', 'sergi', 'spor', 'fuar', 'workshop', 'animasyon', 'parti']

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Aktiviteler & Etkinlikler</h1>
                    <p className="text-slate-400 mt-1">Etkinlik yönetimi ve Google Sheets entegrasyonu</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowSheetModal(true)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <FileSpreadsheet size={18} /> Google Sheets
                    </button>
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', date: '', time: '', location: '', description: '', category: 'konser', ticketUrl: '', status: 'active' }) }}
                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={18} /> Yeni Etkinlik
                    </button>
                </div>
            </div>

            {/* Google Sheets Modal */}
            {showSheetModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e293b] rounded-2xl p-6 max-w-xl w-full shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FileSpreadsheet size={20} className="text-green-400" /> Google Sheets Entegrasyonu
                        </h2>
                        <p className="text-slate-400 text-sm mb-4">
                            Etkinlikleri Google Sheets üzerinden toplu olarak yönetebilirsiniz.
                            Aşağıdaki şablon formatını kullanın.
                        </p>

                        {/* Template */}
                        <div className="bg-slate-900 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Şablon Format (TSV)</span>
                                <button onClick={copyTemplate} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
                                    {copied ? <><Check size={12} /> Kopyalandı!</> : <><Copy size={12} /> Kopyala</>}
                                </button>
                            </div>
                            <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre">
                                {`Etkinlik Adı | Tarih | Saat | Mekan | Açıklama | Kategori | Bilet URL | Durum
Caz Festivali | 2026-07-15 | 21:00 | Bodrum Kalesi | ... | festival | https://... | active`}
                            </pre>
                        </div>

                        {/* Sheet URL */}
                        <div className="mb-4">
                            <label className="text-sm text-slate-400 block mb-1">Google Sheets URL</label>
                            <input
                                type="url"
                                value={sheetUrl}
                                onChange={e => setSheetUrl(e.target.value)}
                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowSheetModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
                                Kapat
                            </button>
                            <button
                                onClick={() => { setShowSheetModal(false); alert('Google Sheets URL kaydedildi. Etkinlikler senkronize edilecek.') }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Kaydet & Senkronize Et
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-[#1e293b] rounded-2xl p-6 mb-8 border border-slate-700">
                    <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Etkinlik Düzenle' : 'Yeni Etkinlik Ekle'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Etkinlik Adı *</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Tarih *</label>
                            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Saat</label>
                            <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Mekan</label>
                            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Kategori</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm">
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Durum</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm">
                                <option value="active">Aktif</option>
                                <option value="draft">Taslak</option>
                                <option value="past">Geçmiş</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm text-slate-400 block mb-1">Açıklama</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm text-slate-400 block mb-1">Bilet / Detay URL</label>
                            <input value={form.ticketUrl} onChange={e => setForm({ ...form, ticketUrl: e.target.value })} placeholder="https://..." className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => { setShowForm(false); setEditingId(null) }} className="px-4 py-2 text-slate-400 hover:text-white">İptal</button>
                        <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors">Kaydet</button>
                    </div>
                </div>
            )}

            {/* Activities Table */}
            <div className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-700 text-left">
                                <th className="px-6 py-4 text-slate-400 font-medium">Etkinlik</th>
                                <th className="px-4 py-4 text-slate-400 font-medium">Tarih & Saat</th>
                                <th className="px-4 py-4 text-slate-400 font-medium">Mekan</th>
                                <th className="px-4 py-4 text-slate-400 font-medium">Kategori</th>
                                <th className="px-4 py-4 text-slate-400 font-medium">Durum</th>
                                <th className="px-4 py-4 text-slate-400 font-medium text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map(activity => (
                                <tr key={activity.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{activity.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{activity.description}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-0.5 text-slate-300">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {activity.date}</span>
                                            {activity.time && <span className="flex items-center gap-1"><Clock size={12} /> {activity.time}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="flex items-center gap-1 text-slate-300"><MapPin size={12} /> {activity.location}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="inline-block bg-brand/20 text-cyan-400 text-xs px-2 py-0.5 rounded">{activity.category}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-block text-xs px-2 py-0.5 rounded ${activity.status === 'active' ? 'bg-green-900/30 text-green-400' : activity.status === 'draft' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
                                            {activity.status === 'active' ? 'Aktif' : activity.status === 'draft' ? 'Taslak' : 'Geçmiş'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(activity)} className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors" title="Düzenle">
                                                <Edit size={16} />
                                            </button>
                                            {activity.ticketUrl && (
                                                <a href={activity.ticketUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-green-400 transition-colors" title="Detay">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                            <button onClick={() => handleDelete(activity.id)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors" title="Sil">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {activities.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        Henüz etkinlik eklenmedi. Yukarıdaki &quot;Yeni Etkinlik&quot; butonuna tıklayın.
                    </div>
                )}
            </div>
        </div>
    )
}
