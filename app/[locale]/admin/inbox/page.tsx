'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Inbox, Search, RefreshCw, Send, MessageSquare, Phone,
    Instagram, Facebook, MessageCircle, User, Clock,
    ChevronDown, Filter, X, Loader2, Check, CheckCheck,
    ArrowLeft
} from 'lucide-react'

// ——— Types ———
interface SocialMessage {
    id: string
    platform: 'whatsapp' | 'instagram' | 'facebook' | 'webchat'
    senderName: string
    senderAvatar?: string
    content: string
    timestamp: string
    direction: 'inbound' | 'outbound'
    read: boolean
    guestId?: string
}

interface Conversation {
    id: string
    platform: 'whatsapp' | 'instagram' | 'facebook' | 'webchat'
    contactName: string
    contactPhone?: string
    lastMessage: string
    lastMessageTime: string
    unreadCount: number
    messages: SocialMessage[]
}

const PLATFORM_CONFIG = {
    whatsapp: { label: 'WhatsApp', icon: Phone, color: 'bg-green-500', textColor: 'text-green-500' },
    instagram: { label: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500', textColor: 'text-pink-500' },
    facebook: { label: 'Facebook', icon: Facebook, color: 'bg-blue-600', textColor: 'text-blue-600' },
    webchat: { label: 'Web Chat', icon: MessageSquare, color: 'bg-cyan-500', textColor: 'text-cyan-500' },
}

export default function InboxPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null)
    const [loading, setLoading] = useState(true)
    const [replyText, setReplyText] = useState('')
    const [sending, setSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterPlatform, setFilterPlatform] = useState<string>('all')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const fetchMessages = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/crm/social?action=list')
            if (res.ok) {
                const data = await res.json()
                const msgs: SocialMessage[] = (data.messages || []).map((m: any) => ({
                    id: m.id,
                    platform: m.platform || 'whatsapp',
                    senderName: m.senderName || m.from || 'Bilinmeyen',
                    content: m.content || m.body || '',
                    timestamp: m.timestamp || m.createdAt || new Date().toISOString(),
                    direction: m.direction || 'inbound',
                    read: m.read ?? false,
                    guestId: m.guestProfileId,
                }))

                // Group messages into conversations by sender
                const convoMap = new Map<string, Conversation>()
                for (const msg of msgs) {
                    const key = `${msg.platform}-${msg.senderName}`
                    if (!convoMap.has(key)) {
                        convoMap.set(key, {
                            id: key,
                            platform: msg.platform,
                            contactName: msg.senderName,
                            lastMessage: msg.content,
                            lastMessageTime: msg.timestamp,
                            unreadCount: 0,
                            messages: [],
                        })
                    }
                    const convo = convoMap.get(key)!
                    convo.messages.push(msg)
                    if (!msg.read && msg.direction === 'inbound') convo.unreadCount++
                    if (new Date(msg.timestamp) > new Date(convo.lastMessageTime)) {
                        convo.lastMessage = msg.content
                        convo.lastMessageTime = msg.timestamp
                    }
                }

                const sorted = Array.from(convoMap.values()).sort(
                    (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
                )
                setConversations(sorted)

                // Auto-sync from Meta if no messages found
                if (sorted.length === 0) {
                    syncMeta()
                }
            }
        } catch (err) {
            console.error('Mesajlar yüklenemedi:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    const [syncing, setSyncing] = useState(false)
    const [syncResult, setSyncResult] = useState<string | null>(null)

    const syncMeta = async () => {
        setSyncing(true)
        setSyncResult(null)
        try {
            const res = await fetch('/api/admin/crm/social/sync', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                setSyncResult(`✅ ${data.message}`)
                // Refresh messages after sync
                await fetchMessages()
            } else {
                setSyncResult(`⚠️ ${data.error || 'Senkronizasyon başarısız'}`)
            }
        } catch (err: any) {
            setSyncResult(`❌ ${err.message}`)
        } finally {
            setSyncing(false)
            setTimeout(() => setSyncResult(null), 5000)
        }
    }

    useEffect(() => { fetchMessages() }, [fetchMessages])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [selectedConvo?.messages?.length])

    // Filter conversations
    const filtered = conversations.filter(c => {
        if (filterPlatform !== 'all' && c.platform !== filterPlatform) return false
        if (searchQuery && !c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())) return false
        return true
    })

    const handleSend = async () => {
        if (!replyText.trim() || !selectedConvo || sending) return
        setSending(true)
        try {
            await fetch('/api/admin/crm/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reply',
                    platform: selectedConvo.platform,
                    to: selectedConvo.contactPhone || selectedConvo.contactName,
                    message: replyText,
                })
            })
            // Optimistic update
            const newMsg: SocialMessage = {
                id: `out-${Date.now()}`,
                platform: selectedConvo.platform,
                senderName: 'Siz',
                content: replyText,
                timestamp: new Date().toISOString(),
                direction: 'outbound',
                read: true,
            }
            setSelectedConvo(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : null)
            setReplyText('')
        } catch (err) {
            console.error('Mesaj gönderilemedi:', err)
        } finally {
            setSending(false)
        }
    }

    const formatTime = (ts: string) => {
        const d = new Date(ts)
        const now = new Date()
        const diffMs = now.getTime() - d.getTime()
        const diffMin = Math.floor(diffMs / 60000)
        if (diffMin < 1) return 'Şimdi'
        if (diffMin < 60) return `${diffMin}dk`
        const diffHr = Math.floor(diffMin / 60)
        if (diffHr < 24) return `${diffHr}sa`
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    }

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Inbox size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mesajlaşma</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Omnichannel Gelen Kutusu — WhatsApp, Instagram, Facebook
                        </p>
                    </div>
                    {totalUnread > 0 && (
                        <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{totalUnread} yeni</Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {syncResult && (
                        <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                            {syncResult}
                        </span>
                    )}
                    <button
                        onClick={syncMeta}
                        disabled={syncing}
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 rounded-lg text-sm text-white transition-all"
                    >
                        <Instagram size={14} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Senkronize...' : 'Meta Sync'}
                    </button>
                    <button
                        onClick={fetchMessages}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-sm text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Yenile
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Conversation List */}
                <Card className={`${selectedConvo ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 flex-shrink-0 overflow-hidden`}>
                    {/* Search & Filter */}
                    <div className="p-3 border-b border-slate-200 dark:border-white/10 space-y-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Kişi veya mesaj ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-1 overflow-x-auto pb-1">
                            {['all', 'whatsapp', 'instagram', 'facebook', 'webchat'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setFilterPlatform(p)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterPlatform === p
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {p === 'all' ? 'Tümü' : PLATFORM_CONFIG[p as keyof typeof PLATFORM_CONFIG]?.label || p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 size={24} className="animate-spin text-cyan-500" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-slate-400 dark:text-slate-500">
                                <MessageCircle size={32} className="mb-2" />
                                <p className="text-sm">Henüz mesaj yok</p>
                            </div>
                        ) : (
                            filtered.map((convo) => {
                                const platformCfg = PLATFORM_CONFIG[convo.platform]
                                const isSelected = selectedConvo?.id === convo.id
                                return (
                                    <button
                                        key={convo.id}
                                        onClick={() => setSelectedConvo(convo)}
                                        className={`w-full flex items-start gap-3 p-3 text-left transition-colors border-b border-slate-100 dark:border-white/5 ${isSelected
                                            ? 'bg-cyan-50 dark:bg-cyan-900/20'
                                            : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full ${platformCfg.color} flex items-center justify-center flex-shrink-0`}>
                                            <platformCfg.icon size={18} className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">{convo.contactName}</span>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2 flex-shrink-0">{formatTime(convo.lastMessageTime)}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{convo.lastMessage}</p>
                                        </div>
                                        {convo.unreadCount > 0 && (
                                            <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-1">
                                                {convo.unreadCount}
                                            </span>
                                        )}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </Card>

                {/* Chat View */}
                <Card className={`${selectedConvo ? 'flex' : 'hidden md:flex'} flex-col flex-1 overflow-hidden`}>
                    {selectedConvo ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-white/10">
                                <button
                                    onClick={() => setSelectedConvo(null)}
                                    className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div className={`w-9 h-9 rounded-full ${PLATFORM_CONFIG[selectedConvo.platform].color} flex items-center justify-center`}>
                                    {React.createElement(PLATFORM_CONFIG[selectedConvo.platform].icon, { size: 16, className: 'text-white' })}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{selectedConvo.contactName}</h3>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                        {PLATFORM_CONFIG[selectedConvo.platform].label} • {selectedConvo.messages.length} mesaj
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {selectedConvo.messages
                                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                    .map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.direction === 'outbound'
                                                ? 'bg-cyan-500 text-white rounded-br-md'
                                                : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-bl-md'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <div className={`flex items-center gap-1 mt-1 ${msg.direction === 'outbound' ? 'justify-end' : ''}`}>
                                                    <span className={`text-[10px] ${msg.direction === 'outbound' ? 'text-cyan-100' : 'text-slate-400'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {msg.direction === 'outbound' && (
                                                        msg.read ? <CheckCheck size={12} className="text-cyan-100" /> : <Check size={12} className="text-cyan-200" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Reply */}
                            <div className="p-3 border-t border-slate-200 dark:border-white/10">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Mesajınızı yazın..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                        className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!replyText.trim() || sending}
                                        className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 disabled:dark:bg-white/10 text-white rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                                <MessageCircle size={28} />
                            </div>
                            <p className="text-lg font-semibold mb-1">Bir konuşma seçin</p>
                            <p className="text-sm">Soldaki listeden bir kişi seçerek mesajları görüntüleyin</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
