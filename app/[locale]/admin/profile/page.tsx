'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, Mail, Lock, Save, Shield, Eye, EyeOff, Check, AlertCircle, Calendar, Key } from 'lucide-react'
import LoadingButton from '@/components/admin/LoadingButton'

interface UserProfile {
    id: string
    name: string
    email: string
    role: string
    permissions: string | null
    isActive: boolean
    lastLogin: string | null
    createdAt: string
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Form state
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')

    // Password state
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrentPw, setShowCurrentPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)

    const fetchProfile = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/profile')
            if (res.ok) {
                const data = await res.json()
                if (data.success && data.user) {
                    setProfile(data.user)
                    setName(data.user.name)
                    setEmail(data.user.email)
                }
            }
        } catch (err) {
            console.error('Failed to fetch profile', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 4000)
    }

    const handleSaveProfile = async () => {
        if (!name.trim() || !email.trim()) {
            showMessage('error', 'İsim ve e-posta zorunludur.')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), email: email.trim() })
            })
            const data = await res.json()
            if (data.success) {
                setProfile(data.user)
                showMessage('success', 'Profil başarıyla güncellendi.')
            } else {
                showMessage('error', data.error || 'Güncelleme başarısız.')
            }
        } catch {
            showMessage('error', 'Bir hata oluştu.')
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage('error', 'Tüm şifre alanları zorunludur.')
            return
        }
        if (newPassword !== confirmPassword) {
            showMessage('error', 'Yeni şifreler eşleşmiyor.')
            return
        }
        if (newPassword.length < 6) {
            showMessage('error', 'Şifre en az 6 karakter olmalıdır.')
            return
        }

        setChangingPassword(true)
        try {
            const res = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'change_password',
                    currentPassword,
                    newPassword
                })
            })
            const data = await res.json()
            if (data.success) {
                showMessage('success', 'Şifre başarıyla değiştirildi.')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
                setShowPasswordForm(false)
            } else {
                showMessage('error', data.error || 'Şifre değiştirme başarısız.')
            }
        } catch {
            showMessage('error', 'Bir hata oluştu.')
        } finally {
            setChangingPassword(false)
        }
    }

    const formatDate = (str: string | null) => {
        if (!str) return '—'
        return new Date(str).toLocaleDateString('tr-TR', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    const roleLabels: Record<string, string> = {
        superadmin: 'Süper Admin',
        admin: 'Yönetici',
        editor: 'Editör'
    }

    const roleColors: Record<string, string> = {
        superadmin: 'bg-purple-100 text-purple-700 border-purple-200',
        admin: 'bg-blue-100 text-blue-700 border-blue-200',
        editor: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <User size={24} />
                    </div>
                    Profil Yönetimi
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Hesap bilgilerinizi görüntüleyin ve düzenleyin.</p>
            </div>

            {/* Toast Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-fade-in-up ${message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                {/* User Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-3xl font-serif">
                            {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{profile?.name}</h2>
                            <p className="text-blue-100 text-sm">{profile?.email}</p>
                            <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${roleColors[profile?.role || 'admin']} !text-white bg-white/20 !border-white/30`}>
                                <Shield size={10} className="inline mr-1" />
                                {roleLabels[profile?.role || 'admin'] || profile?.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            <User size={12} className="inline mr-1" /> Ad Soyad
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="İsminizi girin"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            <Mail size={12} className="inline mr-1" /> E-posta
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="E-posta adresiniz"
                        />
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                                <Calendar size={10} className="inline mr-1" /> Kayıt Tarihi
                            </p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {formatDate(profile?.createdAt || null)}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                                <Key size={10} className="inline mr-1" /> Son Giriş
                            </p>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {formatDate(profile?.lastLogin || null)}
                            </p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <LoadingButton
                            loading={saving}
                            onClick={handleSaveProfile}
                            icon={<Save size={16} />}
                        >
                            Profili Kaydet
                        </LoadingButton>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 dark:border-white/10"></div>

                {/* Password Section */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Lock size={18} className="text-blue-500" />
                            Şifre Değiştir
                        </h3>
                        <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            {showPasswordForm ? 'İptal' : 'Şifre Değiştir'}
                        </button>
                    </div>

                    {showPasswordForm && (
                        <div className="space-y-4 animate-fade-in-up">
                            {/* Current Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Mevcut Şifre
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPw ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Yeni Şifre
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPw ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pr-12"
                                        placeholder="En az 6 karakter"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPw(!showNewPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Yeni Şifre (Tekrar)
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none transition-all ${confirmPassword && confirmPassword !== newPassword
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                            : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-200'
                                        }`}
                                    placeholder="Şifreyi tekrar girin"
                                />
                                {confirmPassword && confirmPassword !== newPassword && (
                                    <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <LoadingButton
                                    loading={changingPassword}
                                    onClick={handleChangePassword}
                                    variant="danger"
                                    icon={<Lock size={16} />}
                                >
                                    Şifreyi Değiştir
                                </LoadingButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
