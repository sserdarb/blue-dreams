'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Mail, Sparkles, CheckSquare, RefreshCw, Settings, Save,
    Inbox, X, Clock, Loader2, Server, Lock, Wifi, WifiOff,
    Eye, EyeOff, TestTube, Trash2, ArrowRight
} from 'lucide-react'

interface EmailMessage {
    id: string; subject: string; from: string; date: string; snippet: string; isRead: boolean
}
interface TaskSuggestion {
    title: string; description: string; priority: string
    suggestedDepartment: string; estimatedMin: number; tags: string[]
    sourceType: string; sourceRef: string
}
interface MailConfig {
    id?: string; email: string; provider: string
    imapHost: string; imapPort: number; imapUser: string; imapSsl: boolean
    smtpHost: string; smtpPort: number; smtpUser: string; smtpSsl: boolean
    isConnected: boolean; lastSyncAt: string | null; syncCount: number
}

const EMPTY_CONFIG: MailConfig = {
    email: '', provider: 'imap',
    imapHost: '', imapPort: 993, imapUser: '', imapSsl: true,
    smtpHost: '', smtpPort: 587, smtpUser: '', smtpSsl: true,
    isConnected: false, lastSyncAt: null, syncCount: 0,
}

export default function MailIntegrationPage() {
    const [emails, setEmails] = useState<EmailMessage[]>([])
    const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
    const [converting, setConverting] = useState(false)
    const [suggestion, setSuggestion] = useState<TaskSuggestion | null>(null)
    const [creating, setCreating] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [config, setConfig] = useState<MailConfig>(EMPTY_CONFIG)
    const [imapPass, setImapPass] = useState('')
    const [smtpPass, setSmtpPass] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [saving, setSaving] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [configLoaded, setConfigLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchConfig = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/mail-integration')
            if (res.ok) {
                const data = await res.json()
                if (data) { setConfig(data); if (!data.isConnected) setShowSettings(true) }
                else setShowSettings(true)
            }
        } catch { /* silent */ }
        setConfigLoaded(true)
    }, [])

    useEffect(() => { fetchConfig() }, [fetchConfig])

    const saveConfig = async () => {
        setSaving(true); setError(null)
        try {
            const res = await fetch('/api/admin/mail-integration', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: config.email,
                    imapHost: config.imapHost, imapPort: config.imapPort,
                    imapUser: config.imapUser, imapPass: imapPass || undefined,
                    imapSsl: config.imapSsl,
                    smtpHost: config.smtpHost || config.imapHost,
                    smtpPort: config.smtpPort, smtpUser: config.smtpUser || config.imapUser,
                    smtpPass: smtpPass || imapPass || undefined, smtpSsl: config.smtpSsl,
                }),
            })
            if (res.ok) {
                const saved = await res.json()
                setConfig(saved)
                setImapPass(''); setSmtpPass('')
                setShowSettings(false)
            } else {
                const err = await res.json()
                setError(err.error || 'Kaydetme hatası')
            }
        } catch { setError('Bağlantı hatası') }
        setSaving(false)
    }

    const syncEmails = async () => {
        setSyncing(true); setError(null)
        try {
            const res = await fetch('/api/admin/mail-integration/sync', { method: 'POST' })
            const data = await res.json()
            if (res.ok) {
                setEmails(data.emails || [])
                setConfig(prev => ({ ...prev, isConnected: true, lastSyncAt: new Date().toISOString(), syncCount: prev.syncCount + 1 }))
            } else setError(data.error || 'Senkronizasyon hatası')
        } catch { setError('Bağlantı hatası') }
        setSyncing(false)
    }

    const deleteConfig = async () => {
        if (!confirm('Mail bağlantısını kaldırmak istediğinize emin misiniz?')) return
        await fetch('/api/admin/mail-integration', { method: 'DELETE' })
        setConfig(EMPTY_CONFIG); setEmails([]); setShowSettings(true)
    }

    const convertToTask = async (email: EmailMessage) => {
        setConverting(true); setSuggestion(null)
        try {
            const res = await fetch('/api/admin/mail-integration/convert', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: email.subject, body: email.snippet, from: email.from }),
            })
            if (res.ok) setSuggestion(await res.json())
            else setError('AI analizi başarısız oldu')
        } catch { setError('Bağlantı hatası') }
        setConverting(false)
    }

    const createTaskFromSuggestion = async () => {
        if (!suggestion) return
        setCreating(true)
        try {
            await fetch('/api/admin/tasks', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: suggestion.title, description: suggestion.description,
                    priority: suggestion.priority, sourceType: suggestion.sourceType,
                    sourceRef: suggestion.sourceRef, estimatedMin: suggestion.estimatedMin,
                    tags: suggestion.tags, creatorId: 'system',
                }),
            })
            setSuggestion(null); setSelectedEmail(null)
        } catch { setError('Görev oluşturulamadı') }
        setCreating(false)
    }

    if (!configLoaded) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-cyan-500" size={32} /></div>

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Mail className="text-violet-500" size={22} /> Mail Entegrasyonu
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">E-postaları AI ile görevlere dönüştürün</p>
                </div>
                <div className="flex items-center gap-2">
                    {config.id && (
                        <>
                            <span className={`text-xs font-bold flex items-center gap-1 ${config.isConnected ? 'text-emerald-600' : 'text-amber-500'}`}>
                                {config.isConnected ? <><Wifi size={12} /> Bağlı</> : <><WifiOff size={12} /> Bağlantı Yok</>}
                            </span>
                            <button onClick={syncEmails} disabled={syncing}
                                className="flex items-center gap-1.5 text-xs text-white bg-cyan-600 hover:bg-cyan-500 px-3 py-2 rounded-lg font-bold transition-colors disabled:opacity-50">
                                <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                                {syncing ? 'Senkronize...' : 'Senkronize Et'}
                            </button>
                        </>
                    )}
                    <button onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                        <Settings size={12} /> Ayarlar
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <Server size={16} className="text-cyan-500" /> Mail Sunucu Ayarları
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* IMAP */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Inbox size={12} /> IMAP (Gelen)</h4>
                            <input value={config.email} onChange={e => setConfig(p => ({ ...p, email: e.target.value }))}
                                placeholder="E-posta adresi" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                            <div className="grid grid-cols-3 gap-2">
                                <input value={config.imapHost} onChange={e => setConfig(p => ({ ...p, imapHost: e.target.value }))}
                                    placeholder="IMAP Host" className="col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                                <input type="number" value={config.imapPort} onChange={e => setConfig(p => ({ ...p, imapPort: Number(e.target.value) }))}
                                    placeholder="Port" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                            </div>
                            <input value={config.imapUser} onChange={e => setConfig(p => ({ ...p, imapUser: e.target.value }))}
                                placeholder="Kullanıcı adı" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                            <div className="relative">
                                <input type={showPass ? 'text' : 'password'} value={imapPass} onChange={e => setImapPass(e.target.value)}
                                    placeholder={config.id ? '••••• (değiştirmek için yazın)' : 'Şifre'}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 pr-9 text-sm outline-none focus:border-cyan-500" />
                                <button onClick={() => setShowPass(!showPass)} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
                                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            <label className="flex items-center gap-2 text-xs text-slate-500">
                                <input type="checkbox" checked={config.imapSsl} onChange={e => setConfig(p => ({ ...p, imapSsl: e.target.checked }))}
                                    className="rounded" />
                                <Lock size={10} /> SSL/TLS
                            </label>
                        </div>

                        {/* SMTP */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><ArrowRight size={12} /> SMTP (Giden)</h4>
                            <p className="text-[10px] text-slate-400">Boş bırakılırsa IMAP ayarları kullanılır</p>
                            <div className="grid grid-cols-3 gap-2">
                                <input value={config.smtpHost} onChange={e => setConfig(p => ({ ...p, smtpHost: e.target.value }))}
                                    placeholder="SMTP Host" className="col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                                <input type="number" value={config.smtpPort} onChange={e => setConfig(p => ({ ...p, smtpPort: Number(e.target.value) }))}
                                    placeholder="Port" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                            </div>
                            <input value={config.smtpUser} onChange={e => setConfig(p => ({ ...p, smtpUser: e.target.value }))}
                                placeholder="Kullanıcı adı (aynı ise boş bırakın)" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
                            <div className="relative">
                                <input type={showPass ? 'text' : 'password'} value={smtpPass} onChange={e => setSmtpPass(e.target.value)}
                                    placeholder="Şifre (aynı ise boş bırakın)"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 pr-9 text-sm outline-none focus:border-cyan-500" />
                            </div>
                            <label className="flex items-center gap-2 text-xs text-slate-500">
                                <input type="checkbox" checked={config.smtpSsl} onChange={e => setConfig(p => ({ ...p, smtpSsl: e.target.checked }))}
                                    className="rounded" />
                                <Lock size={10} /> SSL/TLS
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex gap-2">
                            <button onClick={saveConfig} disabled={saving || !config.email || !config.imapHost}
                                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {saving ? 'Kaydediliyor...' : 'Kaydet & Bağlan'}
                            </button>
                            {config.id && (
                                <button onClick={() => setShowSettings(false)}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">İptal</button>
                            )}
                        </div>
                        {config.id && (
                            <button onClick={deleteConfig} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 size={12} /> Bağlantıyı Kaldır
                            </button>
                        )}
                    </div>

                    {config.lastSyncAt && (
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            <Clock size={10} /> Son senkronizasyon: {new Date(config.lastSyncAt).toLocaleString('tr-TR')} ({config.syncCount} kez)
                        </p>
                    )}
                </div>
            )}

            {/* Email List + Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Email List */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Inbox size={16} /> Gelen Kutusu</h3>
                        <span className="text-[10px] bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full font-bold">
                            {emails.filter(e => !e.isRead).length} yeni
                        </span>
                    </div>
                    {emails.length === 0 ? (
                        <div className="p-8 text-center">
                            <Mail className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
                            <p className="text-xs text-slate-400">
                                {config.id ? 'Senkronize Et butonuna tıklayarak e-postalarınızı çekin' : 'Önce mail sunucu ayarlarını yapılandırın'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-[500px] overflow-y-auto">
                            {emails.map(email => (
                                <button key={email.id} onClick={() => { setSelectedEmail(email); setSuggestion(null) }}
                                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedEmail?.id === email.id ? 'bg-cyan-50 dark:bg-cyan-900/10 border-l-2 border-cyan-500' : ''}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-bold truncate ${!email.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{email.from.split('<')[0] || email.from}</span>
                                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                                            {(() => { try { return new Date(email.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) } catch { return '' } })()}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${!email.isRead ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{email.subject}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Email Detail + AI Conversion */}
                <div className="lg:col-span-2 space-y-4">
                    {selectedEmail ? (
                        <>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedEmail.subject}</h3>
                                    <button onClick={() => { setSelectedEmail(null); setSuggestion(null) }} className="p-1 text-slate-400 hover:text-slate-900"><X size={18} /></button>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs text-slate-500">Gönderen:</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedEmail.from}</span>
                                    <span className="text-xs text-slate-400">{(() => { try { return new Date(selectedEmail.date).toLocaleString('tr-TR') } catch { return '' } })()}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 mb-4">
                                    {selectedEmail.snippet || '(İçerik yok)'}
                                </div>
                                <button onClick={() => convertToTask(selectedEmail)} disabled={converting}
                                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50">
                                    {converting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    {converting ? 'AI Analiz Ediyor...' : 'AI ile Göreve Dönüştür'}
                                </button>
                            </div>

                            {suggestion && (
                                <div className="bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-violet-900/20 dark:to-cyan-900/20 rounded-2xl border border-violet-200 dark:border-violet-800 p-5 shadow-sm">
                                    <h3 className="text-sm font-bold text-violet-700 dark:text-violet-300 flex items-center gap-2 mb-4">
                                        <Sparkles size={16} /> AI Görev Önerisi
                                    </h3>
                                    <div className="space-y-3 mb-4">
                                        <div><label className="text-[10px] text-slate-500 uppercase font-bold">Başlık</label><p className="text-sm font-bold text-slate-900 dark:text-white">{suggestion.title}</p></div>
                                        <div><label className="text-[10px] text-slate-500 uppercase font-bold">Açıklama</label><p className="text-sm text-slate-700 dark:text-slate-300">{suggestion.description}</p></div>
                                        <div className="flex gap-4 flex-wrap">
                                            <div><label className="text-[10px] text-slate-500 uppercase font-bold">Öncelik</label><p className="text-sm font-bold capitalize">{suggestion.priority}</p></div>
                                            <div><label className="text-[10px] text-slate-500 uppercase font-bold">Departman</label><p className="text-sm font-bold">{suggestion.suggestedDepartment}</p></div>
                                            <div><label className="text-[10px] text-slate-500 uppercase font-bold">Tahmini Süre</label><p className="text-sm font-bold">{suggestion.estimatedMin} dk</p></div>
                                        </div>
                                        {suggestion.tags?.length > 0 && (
                                            <div className="flex gap-1 flex-wrap">
                                                {suggestion.tags.map((tag, i) => (
                                                    <span key={i} className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={createTaskFromSuggestion} disabled={creating}
                                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                                            {creating ? <Loader2 size={14} className="animate-spin" /> : <CheckSquare size={14} />}
                                            {creating ? 'Oluşturuluyor...' : 'Görev Olarak Oluştur'}
                                        </button>
                                        <button onClick={() => setSuggestion(null)}
                                            className="px-4 py-2 text-slate-500 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-sm font-medium">İptal</button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
                            <Mail className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
                            <p className="text-slate-500 font-medium">Bir e-posta seçin</p>
                            <p className="text-slate-400 text-sm mt-1">AI ile görevlere dönüştürmek için sol taraftaki bir e-postaya tıklayın</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
