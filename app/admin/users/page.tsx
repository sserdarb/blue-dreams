'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Users, Plus, Trash2, Pencil, Shield, ShieldCheck, ShieldAlert,
    RefreshCw, X, Check, UserPlus, Mail, Lock, User
} from 'lucide-react'

interface AdminUser {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    lastLogin: string | null
    createdAt: string
}

const ROLES = [
    { value: 'superadmin', label: 'Süper Admin', icon: ShieldAlert, color: 'text-red-600 bg-red-50' },
    { value: 'admin', label: 'Admin', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
    { value: 'editor', label: 'Editör', icon: Shield, color: 'text-green-600 bg-green-50' },
]

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Add form state
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin' })

    // Edit form state
    const [editData, setEditData] = useState({ name: '', role: '', password: '' })

    const loadUsers = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/users')
            if (res.ok) {
                setUsers(await res.json())
            } else if (res.status === 403) {
                setError('Bu sayfaya erişim yetkiniz yok. Sadece Süper Admin erişebilir.')
            }
        } catch (err) {
            setError('Kullanıcılar yüklenemedi')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadUsers() }, [loadUsers])

    const addUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            setError('Tüm alanları doldurun')
            return
        }
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            })
            if (res.ok) {
                setShowAddForm(false)
                setNewUser({ name: '', email: '', password: '', role: 'admin' })
                setSuccess('Kullanıcı eklendi!')
                loadUsers()
            } else {
                const data = await res.json()
                setError(data.error || 'Ekleme başarısız')
            }
        } catch { setError('Bağlantı hatası') }
    }

    const updateUser = async (id: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...editData })
            })
            if (res.ok) {
                setEditingId(null)
                setSuccess('Kullanıcı güncellendi!')
                loadUsers()
            } else {
                const data = await res.json()
                setError(data.error || 'Güncelleme başarısız')
            }
        } catch { setError('Bağlantı hatası') }
    }

    const toggleActive = async (user: AdminUser) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, isActive: !user.isActive })
            })
            if (res.ok) {
                setSuccess(`${user.name} ${!user.isActive ? 'aktif' : 'pasif'} yapıldı`)
                loadUsers()
            }
        } catch { setError('Güncelleme başarısız') }
    }

    const deleteUser = async (user: AdminUser) => {
        if (!confirm(`${user.name} kullanıcısını silmek istediğinize emin misiniz?`)) return
        try {
            const res = await fetch(`/api/admin/users?id=${user.id}`, { method: 'DELETE' })
            if (res.ok) {
                setSuccess('Kullanıcı silindi')
                loadUsers()
            } else {
                const data = await res.json()
                setError(data.error || 'Silme başarısız')
            }
        } catch { setError('Bağlantı hatası') }
    }

    const startEdit = (user: AdminUser) => {
        setEditingId(user.id)
        setEditData({ name: user.name, role: user.role, password: '' })
    }

    // Auto-clear messages
    useEffect(() => {
        if (error || success) {
            const t = setTimeout(() => { setError(''); setSuccess('') }, 4000)
            return () => clearTimeout(t)
        }
    }, [error, success])

    const getRoleInfo = (role: string) => ROLES.find(r => r.value === role) || ROLES[1]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h1>
                        <p className="text-sm text-slate-400">{users.length} kayıtlı kullanıcı</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 font-medium text-sm transition-all shadow-lg shadow-indigo-600/20"
                >
                    {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {showAddForm ? 'İptal' : 'Yeni Kullanıcı'}
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                    ✓ {success}
                </div>
            )}

            {/* Add User Form */}
            {showAddForm && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-indigo-400" />
                        Yeni Kullanıcı Ekle
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                <User className="w-3 h-3 inline mr-1" />İsim
                            </label>
                            <input
                                type="text"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="Ad Soyad"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                <Mail className="w-3 h-3 inline mr-1" />E-posta
                            </label>
                            <input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="kullanici@ornek.com"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                <Lock className="w-3 h-3 inline mr-1" />Şifre
                            </label>
                            <input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Güçlü şifre"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                <Shield className="w-3 h-3 inline mr-1" />Rol
                            </label>
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="admin">Admin</option>
                                <option value="editor">Editör</option>
                                <option value="superadmin">Süper Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={addUser}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Kullanıcıyı Ekle
                        </button>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kullanıcı</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rol</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Durum</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Son Giriş</th>
                            <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {/* Hardcoded superadmin row */}
                        <tr className="bg-indigo-500/5">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                                        SA
                                    </div>
                                    <div>
                                        <p className="font-medium text-white text-sm">Super Admin</p>
                                        <p className="text-xs text-slate-400">ENV ile tanımlı</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-500/10">
                                    <ShieldAlert className="w-3 h-3" />
                                    Süper Admin
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 text-xs text-green-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                    Her zaman aktif
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400">—</td>
                            <td className="px-6 py-4 text-right text-xs text-slate-500">Düzenlenemez</td>
                        </tr>

                        {/* DB users */}
                        {users.map((user) => {
                            const roleInfo = getRoleInfo(user.role)
                            const RoleIcon = roleInfo.icon
                            const isEditing = editingId === user.id
                            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

                            return (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                                {initials}
                                            </div>
                                            <div>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editData.name}
                                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                        className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-sm text-white w-40"
                                                    />
                                                ) : (
                                                    <p className="font-medium text-white text-sm">{user.name}</p>
                                                )}
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <select
                                                value={editData.role}
                                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                                className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="editor">Editör</option>
                                                <option value="superadmin">Süper Admin</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                                                <RoleIcon className="w-3 h-3" />
                                                {roleInfo.label}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleActive(user)}
                                            className={`inline-flex items-center gap-1 text-xs cursor-pointer ${user.isActive ? 'text-green-400' : 'text-red-400'}`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                                            {user.isActive ? 'Aktif' : 'Pasif'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        {user.lastLogin
                                            ? new Date(user.lastLogin).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            : 'Henüz giriş yok'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            {isEditing ? (
                                                <>
                                                    <input
                                                        type="password"
                                                        value={editData.password}
                                                        onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                                        placeholder="Yeni şifre (opsiyonel)"
                                                        className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs text-white w-36 mr-2"
                                                    />
                                                    <button
                                                        onClick={() => updateUser(user.id)}
                                                        className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg"
                                                        title="Kaydet"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-1.5 text-slate-400 hover:bg-white/5 rounded-lg"
                                                        title="İptal"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => startEdit(user)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Düzenle"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(user)}
                                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Sil"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}

                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    Henüz veritabanında kayıtlı kullanıcı yok. Yukarıdaki butona tıklayarak ekleyin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Info card */}
            <div className="bg-slate-800/30 rounded-xl border border-white/5 p-4">
                <p className="text-xs text-slate-500">
                    <strong className="text-slate-400">Not:</strong> ENV ile tanımlı Super Admin hesabı her zaman çalışır ve buradan düzenlenemez.
                    Veritabanı kullanıcıları yukarıdaki tablodan yönetilebilir.
                    <span className="ml-2 text-amber-400/60">Roller: Süper Admin (tam yetki), Admin (içerik + ayarlar), Editör (sadece içerik).</span>
                </p>
            </div>
        </div>
    )
}
