'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Plus, Trash2, Edit, Shield, ShieldCheck, Mail, UserCircle, Check, X, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react'

interface AdminUser {
    id: string
    name: string
    email: string
    role: 'superadmin' | 'admin' | 'editor'
    isActive: boolean
    lastLogin: string | null
    createdAt: string
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({
        name: '', email: '', role: 'editor' as 'superadmin' | 'admin' | 'editor', password: ''
    })

    const roleLabels = { superadmin: 'Süper Admin', admin: 'Admin', editor: 'Editör' }
    const roleColors = {
        superadmin: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        admin: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
        editor: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    }

    // Fetch users from API
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/users')
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Kullanıcılar yüklenemedi')
            }
            const data = await res.json()
            setUsers(data)
            setError(null)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchUsers() }, [fetchUsers])

    // Auto-clear success message
    useEffect(() => {
        if (success) {
            const t = setTimeout(() => setSuccess(null), 3000)
            return () => clearTimeout(t)
        }
    }, [success])

    const handleSave = async () => {
        if (!form.name || !form.email) {
            setError('Ad ve e-posta zorunludur.')
            return
        }

        setSaving(true)
        setError(null)

        try {
            if (editingId) {
                // Update existing user
                const body: any = { id: editingId, name: form.name, role: form.role }
                if (form.password.trim()) body.password = form.password.trim()

                const res = await fetch('/api/admin/users', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                })

                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || 'Kullanıcı güncellenemedi')
                }

                setSuccess('Kullanıcı güncellendi')
            } else {
                // Create new user
                if (!form.password || form.password.length < 6) {
                    setError('Şifre en az 6 karakter olmalıdır.')
                    setSaving(false)
                    return
                }

                const res = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        role: form.role,
                        password: form.password,
                    }),
                })

                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || 'Kullanıcı eklenemedi')
                }

                setSuccess('Kullanıcı başarıyla eklendi')
            }

            // Refresh users list and close form
            await fetchUsers()
            setForm({ name: '', email: '', role: 'editor', password: '' })
            setShowForm(false)
            setEditingId(null)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (user: AdminUser) => {
        setForm({ name: user.name, email: user.email, role: user.role, password: '' })
        setEditingId(user.id)
        setShowForm(true)
        setError(null)
    }

    const handleToggleActive = async (user: AdminUser) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Durum güncellenemedi')
            }

            setSuccess(`${user.name} ${!user.isActive ? 'aktif edildi' : 'devre dışı bırakıldı'}`)
            await fetchUsers()
        } catch (err: any) {
            setError(err.message)
        }
    }

    const handleDelete = async (user: AdminUser) => {
        if (user.role === 'superadmin') {
            setError('Süper admin silinemez.')
            return
        }

        if (!confirm(`"${user.name}" kullanıcısını silmek istediğinizden emin misiniz?`)) return

        try {
            const res = await fetch(`/api/admin/users?id=${user.id}`, { method: 'DELETE' })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Kullanıcı silinemedi')
            }

            setSuccess('Kullanıcı silindi')
            await fetchUsers()
        } catch (err: any) {
            setError(err.message)
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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Users size={28} className="text-cyan-600 dark:text-cyan-400" /> Kullanıcı Yönetimi
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Admin panel erişim yetkisi olan kullanıcıları yönetin</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchUsers} disabled={loading}
                        className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Yenile">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', email: '', role: 'editor', password: '' }); setError(null) }}
                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={18} /> Yeni Kullanıcı
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300"><X size={16} /></button>
                </div>
            )}
            {success && (
                <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</div>
                    <div className="text-slate-400 text-sm">Toplam Kullanıcı</div>
                </div>
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl font-bold text-emerald-400">{users.filter(u => u.isActive).length}</div>
                    <div className="text-slate-400 text-sm">Aktif</div>
                </div>
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl font-bold text-cyan-400">{users.filter(u => u.role === 'admin' || u.role === 'superadmin').length}</div>
                    <div className="text-slate-400 text-sm">Admin</div>
                </div>
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="text-2xl font-bold text-green-400">{users.filter(u => u.role === 'editor').length}</div>
                    <div className="text-slate-400 text-sm">Editör</div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{editingId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-500 dark:text-slate-400 block mb-1">Ad Soyad *</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Kullanıcı adı"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white text-sm focus:border-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-500 dark:text-slate-400 block mb-1">E-posta *</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="kullanici@email.com"
                                disabled={!!editingId}
                                className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white text-sm focus:border-cyan-500 outline-none ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        </div>
                        <div>
                            <label className="text-sm text-slate-500 dark:text-slate-400 block mb-1">Rol</label>
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as any })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white text-sm focus:border-cyan-500 outline-none">
                                <option value="editor">Editör</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Süper Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-slate-500 dark:text-slate-400 block mb-1">{editingId ? 'Yeni Şifre (boş bırakılırsa değişmez)' : 'Şifre * (min. 6 karakter)'}</label>
                            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                placeholder={editingId ? 'Boş bırakılırsa değişmez' : 'En az 6 karakter'}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white text-sm focus:border-cyan-500 outline-none" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => { setShowForm(false); setEditingId(null); setError(null) }}
                            className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">İptal</button>
                        <button onClick={handleSave} disabled={saving}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                            {saving && <RefreshCw size={14} className="animate-spin" />}
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </div>
            )}

            {/* Users List */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw size={24} className="animate-spin text-cyan-400 mx-auto mb-2" />
                        <p className="text-slate-400">Kullanıcılar yükleniyor...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users size={48} className="text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-400">Henüz kayıtlı kullanıcı yok</p>
                        <p className="text-slate-500 text-sm mt-1">Yeni kullanıcı eklemek için yukarıdaki butonu kullanın</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                                    <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">Kullanıcı</th>
                                    <th className="px-4 py-4 text-slate-500 dark:text-slate-400 font-medium">Rol</th>
                                    <th className="px-4 py-4 text-slate-500 dark:text-slate-400 font-medium">Durum</th>
                                    <th className="px-4 py-4 text-slate-500 dark:text-slate-400 font-medium">Son Giriş</th>
                                    <th className="px-4 py-4 text-slate-500 dark:text-slate-400 font-medium">Kayıt Tarihi</th>
                                    <th className="px-4 py-4 text-slate-500 dark:text-slate-400 font-medium text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!user.isActive ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-cyan-600/20 flex items-center justify-center">
                                                    <UserCircle size={20} className="text-cyan-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
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
                                        <td className="px-4 py-4">
                                            <button onClick={() => handleToggleActive(user)}
                                                className="flex items-center gap-1.5 text-xs transition-colors"
                                                title={user.isActive ? 'Devre dışı bırak' : 'Aktif et'}>
                                                {user.isActive ? (
                                                    <><ToggleRight size={18} className="text-emerald-400" /><span className="text-emerald-400">Aktif</span></>
                                                ) : (
                                                    <><ToggleLeft size={18} className="text-slate-500" /><span className="text-slate-500">Pasif</span></>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300 text-xs">{formatDate(user.lastLogin)}</td>
                                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300 text-xs">{formatDate(user.createdAt)}</td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(user)} className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors" title="Düzenle">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(user)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors" title="Sil"
                                                    disabled={user.role === 'superadmin'}>
                                                    <Trash2 size={16} className={user.role === 'superadmin' ? 'opacity-20' : ''} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
