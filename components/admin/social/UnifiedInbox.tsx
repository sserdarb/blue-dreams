'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, User, MessageCircle, Instagram, Facebook, Clock, CheckCircle2, Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

interface Message {
    id: string
    content: string
    direction: 'inbound' | 'outbound'
    platform: string
    createdAt: string
    isFromGuest: boolean
}

interface Thread {
    contactId: string
    platform: string
    guestName: string
    lastMessage: string
    lastMessageDate: string
    unreadCount: number
}

export default function UnifiedInbox() {
    const [threads, setThreads] = useState<Thread[]>([])
    const [activeContactId, setActiveContactId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [replyText, setReplyText] = useState('')
    const [loadingThreads, setLoadingThreads] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const prevUnreadRef = useRef<number>(0)

    // Notifications Hook
    const { permission, requestPermission, notify } = useNotifications()

    useEffect(() => {
        fetchThreads(true) // Initial fetch
        const interval = setInterval(() => fetchThreads(false), 15000) // Poll for new messages
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (activeContactId) {
            fetchMessages(activeContactId)
        } else {
            setMessages([])
        }
    }, [activeContactId])

    useEffect(() => {
        // Scroll to bottom of messages
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchThreads = async (isInitial = false) => {
        try {
            const res = await fetch('/api/admin/social/messages')
            const data = await res.json()
            if (data.success) {
                const totalUnread = data.threads.reduce((sum: number, t: Thread) => sum + t.unreadCount, 0)

                // Trigger notification if there are MORE unread messages than before, and it's not the first page load
                if (!isInitial && totalUnread > prevUnreadRef.current) {
                    notify('Yeni Mesajınız Var', {
                        body: 'Omnichannel gelen kutunuza yeni bir mesaj düştü.'
                    })
                }

                prevUnreadRef.current = totalUnread
                setThreads(data.threads)
            }
        } catch (error) {
            console.error('Failed to fetch threads:', error)
        } finally {
            setLoadingThreads(false)
        }
    }

    const fetchMessages = async (contactId: string) => {
        setLoadingMessages(true)
        try {
            const res = await fetch(`/api/admin/social/messages?contactId=${encodeURIComponent(contactId)}`)
            const data = await res.json()
            if (data.success) {
                setMessages(data.messages)
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error)
        } finally {
            setLoadingMessages(false)
        }
    }

    const handleSend = async () => {
        if (!replyText.trim() || !activeContactId) return

        const activeThread = threads.find(t => t.contactId === activeContactId)
        if (!activeThread) return

        setSending(true)
        try {
            const res = await fetch('/api/admin/social/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: activeThread.platform,
                    contactId: activeContactId,
                    content: replyText.trim() // Changed from text to content for API consistency
                })
            })

            if (res.ok) {
                setReplyText('')
                await fetchMessages(activeContactId)
            } else {
                alert('Mesaj gönderilemedi.')
            }
        } catch (error) {
            console.error('Send error:', error)
            alert('Mesaj gönderilirken hata oluştu.')
        } finally {
            setSending(false)
        }
    }

    const getPlatformIcon = (platform: string, size = 16) => {
        switch (platform) {
            case 'whatsapp': return <MessageCircle size={size} className="text-emerald-500" />
            case 'instagram': return <Instagram size={size} className="text-pink-500" />
            case 'facebook': return <Facebook size={size} className="text-blue-500" />
            default: return <MessageCircle size={size} className="text-slate-500" />
        }
    }

    const activeThread = threads.find(t => t.contactId === activeContactId)

    return (
        <div className="flex h-[700px] bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
            {/* Sidebar / Threads List */}
            <div className="w-1/3 border-r border-slate-200 dark:border-white/10 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white">Gelen Kutusu</h3>
                    {permission === 'default' && (
                        <button
                            onClick={requestPermission}
                            className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 p-1.5 rounded-lg flex items-center justify-center transition-colors"
                            title="Bildirimlere İzin Ver"
                        >
                            <Bell size={16} />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingThreads ? (
                        <div className="p-4 text-center text-slate-500 text-sm">Yükleniyor...</div>
                    ) : threads.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">Henüz mesaj yok.</div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {threads.map(thread => (
                                <button
                                    key={thread.contactId}
                                    onClick={() => setActiveContactId(thread.contactId)}
                                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${activeContactId === thread.contactId ? 'bg-cyan-50 dark:bg-cyan-900/10' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            {getPlatformIcon(thread.platform)}
                                            <span className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[120px]">
                                                {thread.guestName}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(thread.lastMessageDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-500 truncate max-w-[180px]">{thread.lastMessage}</p>
                                        {thread.unreadCount > 0 && (
                                            <span className="bg-cyan-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                {thread.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
                {activeContactId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{activeThread?.guestName}</h4>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        {activeThread && getPlatformIcon(activeThread.platform, 12)}
                                        <span className="capitalize">{activeThread?.platform}</span>
                                        <span>•</span>
                                        <span className="truncate max-w-[150px]">{activeThread?.contactId}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingMessages ? (
                                <div className="text-center text-slate-500 text-sm py-8">Mesajlar yükleniyor...</div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-slate-500 text-sm py-8">Bu sohbet boş.</div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isOutbound = msg.direction === 'outbound'
                                    return (
                                        <div key={msg.id || idx} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOutbound
                                                ? 'bg-cyan-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-sm'
                                                }`}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                <div className={`flex items-center gap-1 text-[10px] mt-1 justify-end ${isOutbound ? 'text-cyan-100' : 'text-slate-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    {isOutbound && <CheckCircle2 size={10} />}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-[#1e293b] border-t border-slate-200 dark:border-white/10">
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSend()
                                        }
                                    }}
                                    placeholder="Mesaj yazın... (Göndermek için Enter'a basın)"
                                    className="flex-1 resize-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-cyan-500 min-h-[50px] max-h-[120px]"
                                    rows={1}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!replyText.trim() || sending}
                                    className="w-12 h-12 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                >
                                    <Send size={20} className={sending ? 'animate-pulse' : ''} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageCircle size={48} className="mb-4 opacity-20" />
                        <p>Sohbet başlatmak için bir kişiyi seçin</p>
                    </div>
                )}
            </div>
        </div>
    )
}
