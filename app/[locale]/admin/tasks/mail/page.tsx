'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
    Mail, Sparkles, ArrowRight, CheckSquare, RefreshCw, ExternalLink,
    Inbox, Send, AlertTriangle, Plus, X, Clock, Loader2
} from 'lucide-react'

interface EmailMessage {
    id: string; subject: string; from: string; date: string; snippet: string; isRead: boolean
}

interface TaskSuggestion {
    title: string; description: string; priority: string
    suggestedDepartment: string; estimatedMin: number; tags: string[]
    sourceType: string; sourceRef: string
}

// Mock emails for demo — will be replaced by real Gmail API
const MOCK_EMAILS: EmailMessage[] = [
    { id: '1', subject: 'Re: Havuz bakımı acil gerekli', from: 'teknik@bluedreams.com', date: '2026-02-24T15:30:00', snippet: 'Havuz motorunda arıza tespit edildi. Ana filtre değişimi ve klor seviyesi kontrolü yapılmalı...', isRead: false },
    { id: '2', subject: 'Booking.com - Yorum Yanıtı Gerekli', from: 'noreply@booking.com', date: '2026-02-24T14:15:00', snippet: 'Misafir John Smith bir değerlendirme bıraktı (3/10). Yanıtınız bekleniyor...', isRead: false },
    { id: '3', subject: 'Oda 301 klima arızası bildirimi', from: 'onburo@bluedreams.com', date: '2026-02-24T12:00:00', snippet: 'Misafir Mehmet Yılmaz 301 numaralı odadaki klimanın çalışmadığını bildirdi. Acil müdahale...', isRead: true },
    { id: '4', subject: 'Malzeme Siparişi Onayı', from: 'mutfak@bluedreams.com', date: '2026-02-24T10:30:00', snippet: 'Şef Ahmet tarafından hazırlanan haftalık malzeme listesi ekte sunulmuştur. Onayınızı bekliyoruz...', isRead: true },
    { id: '5', subject: 'Grup rezervasyonu - 15 oda', from: 'sales@agentur-berlin.de', date: '2026-02-24T09:00:00', snippet: 'Wir möchten 15 Zimmer für 20.-27. Juni buchen. Bitte senden Sie uns ein Angebot...', isRead: true },
]

export default function MailIntegrationPage() {
    const [emails, setEmails] = useState<EmailMessage[]>(MOCK_EMAILS)
    const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
    const [converting, setConverting] = useState(false)
    const [suggestion, setSuggestion] = useState<TaskSuggestion | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [creating, setCreating] = useState(false)

    const convertToTask = async (email: EmailMessage) => {
        setConverting(true)
        setSuggestion(null)
        try {
            const res = await fetch('/api/admin/mail-integration/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: email.subject, body: email.snippet, from: email.from }),
            })
            if (res.ok) {
                const data = await res.json()
                setSuggestion(data)
            } else {
                alert('AI analizi başarısız oldu')
            }
        } catch { alert('Bağlantı hatası') }
        setConverting(false)
    }

    const createTaskFromSuggestion = async () => {
        if (!suggestion) return
        setCreating(true)
        try {
            await fetch('/api/admin/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: suggestion.title,
                    description: suggestion.description,
                    priority: suggestion.priority,
                    sourceType: suggestion.sourceType,
                    sourceRef: suggestion.sourceRef,
                    estimatedMin: suggestion.estimatedMin,
                    tags: suggestion.tags,
                    creatorId: 'system',
                }),
            })
            alert('Görev başarıyla oluşturuldu!')
            setSuggestion(null)
            setSelectedEmail(null)
        } catch { alert('Görev oluşturulamadı') }
        setCreating(false)
    }

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
                {!isConnected ? (
                    <button onClick={() => setIsConnected(true)}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:border-cyan-500 transition-colors shadow-sm">
                        <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Google Workspace Bağla
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Bağlı
                        </span>
                        <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-600 font-medium"><RefreshCw size={12} /> Senkronize Et</button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Email List */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Inbox size={16} /> Gelen Kutusu</h3>
                        <span className="text-[10px] bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full font-bold">{emails.filter(e => !e.isRead).length} yeni</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-[500px] overflow-y-auto">
                        {emails.map(email => (
                            <button key={email.id} onClick={() => { setSelectedEmail(email); setSuggestion(null) }}
                                className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedEmail?.id === email.id ? 'bg-cyan-50 dark:bg-cyan-900/10 border-l-2 border-cyan-500' : ''}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs font-bold truncate ${!email.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{email.from.split('@')[0]}</span>
                                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                                        {new Date(email.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className={`text-sm truncate ${!email.isRead ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{email.subject}</p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{email.snippet}</p>
                            </button>
                        ))}
                    </div>
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
                                    <span className="text-xs text-slate-400">{new Date(selectedEmail.date).toLocaleString('tr-TR')}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 mb-4">
                                    {selectedEmail.snippet}
                                </div>

                                <button onClick={() => convertToTask(selectedEmail)} disabled={converting}
                                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50">
                                    {converting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    {converting ? 'AI Analiz Ediyor...' : 'AI ile Göreve Dönüştür'}
                                </button>
                            </div>

                            {/* AI Suggestion */}
                            {suggestion && (
                                <div className="bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-violet-900/20 dark:to-cyan-900/20 rounded-2xl border border-violet-200 dark:border-violet-800 p-5 shadow-sm">
                                    <h3 className="text-sm font-bold text-violet-700 dark:text-violet-300 flex items-center gap-2 mb-4">
                                        <Sparkles size={16} /> AI Görev Önerisi
                                    </h3>

                                    <div className="space-y-3 mb-4">
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase font-bold">Başlık</label>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{suggestion.title}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase font-bold">Açıklama</label>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{suggestion.description}</p>
                                        </div>
                                        <div className="flex gap-4 flex-wrap">
                                            <div>
                                                <label className="text-[10px] text-slate-500 uppercase font-bold">Öncelik</label>
                                                <p className="text-sm font-bold capitalize">{suggestion.priority}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-500 uppercase font-bold">Departman</label>
                                                <p className="text-sm font-bold">{suggestion.suggestedDepartment}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-500 uppercase font-bold">Tahmini Süre</label>
                                                <p className="text-sm font-bold">{suggestion.estimatedMin} dk</p>
                                            </div>
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
