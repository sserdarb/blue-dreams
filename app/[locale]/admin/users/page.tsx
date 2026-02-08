'use client'

import { useState } from 'react'
import { Users, Plus, Trash2, Edit, Shield, ShieldCheck, Mail, UserCircle } from 'lucide-react'

interface AdminUser {
    id: string
    name: string
    email: string
    role: 'superadmin' | 'admin' | 'editor'
    lastLogin: string | null
    createdAt: string
}

const SAMPLE_USERS: AdminUser[] = [
    { id: '1', name: 'Serdar', email: 'sserdarb@gmail.com', role: 'superadmin', lastLogin: '2026-02-07T14:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
]

export default function UserManagementPage() {
    const [users, setUsers] = useState<AdminUser[]>(SAMPLE_USERS)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({
        name: '', email: '', role: 'editor' as 'superadmin' | 'admin' | 'editor', password: ''
    })

    const roleLabels = { superadmin: 'Süper Admin', admin: 'Admin', editor: 'Editör' }
    const roleColors = {
        superadmin: 'bg-red-900/30 text-red-400',
        admin: 'bg-cyan-900/30 text-cyan-400',
        editor: 'bg-green-900/30 text-green-400',
    }

    const handleSave = () => {
        if (!form.name || !form.email) return

        if (editingId) {
            setUsers(prev => prev.map(u => u.id === editingId ? { ...u, name: form.name, email: form.email, role: form.role } : u))
            setEditingId(null)
        } else {
            if (!form.password) { alert('Şifre zorunludur.'); return }
            setUsers(prev => [...prev, {
                id: Date.now().toString(), name: form.name, email: form.email, role: form.role,
                lastLogin: null, createdAt: new Date().toISOString()
            }])
        }
        setForm({ name: '', email: '', role: 'editor', password: '' })
        setShowForm(false)
    }

    const handleEdit = (user: AdminUser) => {
        setForm({ name: user.name, email: user.email, role: user.role, password: '' })
        setEditingId(user.id)
        setShowForm(true)
    }

    const handleDelete = (id: string) => {
        const user = users.find(u => u.id === id)
        if (user?.role === 'superadmin') { alert('Süper admin silinemez.'); return }
        if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
            setUsers(prev => prev.filter(u => u.id !== id))
        }
    }

    const formatDate = (str: string | null) => {
        if (!str) return '—'
        try { return new Date(str).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
        catch { return str }
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users size={28} className="text-cyan-400" /> Kullanıcı Yönetimi
                    </h1>
                    <p className="text-slate-400 mt-1">Admin panel erişim yetkisi olan kullanıcıları yönetin</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', email: '', role: 'editor', password: '' }) }}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={18} /> Yeni Kullanıcı
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-700">
                    <div className="text-2xl font-bold text-white">{users.length}</div>
                    <div className="text-slate-400 text-sm">Toplam Kullanıcı</div>
                </div>
                <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-700">
                    <div className="text-2xl font-bold text-cyan-400">{users.filter(u => u.role === 'admin' || u.role === 'superadmin').length}</div>
                    <div className="text-slate-400 text-sm">Admin</div>
                </div>
                <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-700">
                    <div className="text-2xl font-bold text-green-400">{users.filter(u => u.role === 'editor').length}</div>
                    <div className="text-slate-400 text-sm">Editör</div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-[#1e293b] rounded-2xl p-6 mb-8 border border-slate-700">
                    <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Ad Soyad *</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">E-posta *</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Rol</label>
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as any })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm">
                                <option value="editor">Editör</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Süper Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">{editingId ? 'Yeni Şifre (opsiyonel)' : 'Şifre *'}</label>
                            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => { setShowForm(false); setEditingId(null) }} className="px-4 py-2 text-slate-400 hover:text-white">İptal</button>
                        <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors">Kaydet</button>
                    </div>
                </div>
            )}

            {/* Users List */}
            <div className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-700 text-left">
                                <th className="px-6 py-4 text-slate-400 font-medium">Kullanıcı</th>
                                <th className="px-4 py-4 text-slate-400 font-medium">Rol</th>
                                <th className="px-4 py-4 text-slate-400 font-medium">Son Giriş</th>
                                <th className="px-4 py-4 text-slate-400 font-medium">Kayıt Tarihi</th>
                                <th className="px-4 py-4 text-slate-400 font-medium text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center">
                                                <UserCircle size={20} className="text-cyan-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10} /> {user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${roleColors[user.role]}`}>
                                            {user.role === 'superadmin' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                                            {roleLabels[user.role]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-slate-300 text-xs">{formatDate(user.lastLogin)}</td>
                                    <td className="px-4 py-4 text-slate-300 text-xs">{formatDate(user.createdAt)}</td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(user)} className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors" title="Düzenle">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors" title="Sil" disabled={user.role === 'superadmin'}>
                                                <Trash2 size={16} className={user.role === 'superadmin' ? 'opacity-20' : ''} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
