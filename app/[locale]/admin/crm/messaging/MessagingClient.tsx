'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────

interface Conversation {
    identifier: string
    platform: string
    messageCount: number
    lastMessageAt: string
    guest: { id: string; name: string; surname: string; country: string; totalStays: number } | null
    lastMessage: { content: string; direction: string; createdAt: string } | null
}

interface Message {
    id: string
    platform: string
    phone: string | null
    socialId: string | null
    direction: 'inbound' | 'outbound'
    type: string
    content: string
    senderName: string | null
    status: string
    createdAt: string
    guest: { id: string; name: string; surname: string } | null
}

// ─── Platform Badge ─────────────────────────────────────────────────────

const PlatformBadge = ({ platform }: { platform: string }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        whatsapp: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'WhatsApp' },
        facebook: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Facebook' },
        instagram: { bg: 'bg-pink-500/20', text: 'text-pink-400', label: 'Instagram' },
    }
    const c = config[platform] || { bg: 'bg-slate-500/20', text: 'text-slate-400', label: platform }
    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    )
}

// ─── Platform Icon ──────────────────────────────────────────────────────

const PlatformIcon = ({ platform }: { platform: string }) => {
    if (platform === 'whatsapp') return <span className="text-green-400 text-lg">📱</span>
    if (platform === 'facebook') return <span className="text-blue-400 text-lg">💬</span>
    if (platform === 'instagram') return <span className="text-pink-400 text-lg">📷</span>
    return <span>💬</span>
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function MessagingClient() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [replyText, setReplyText] = useState('')
    const [platformFilter, setPlatformFilter] = useState('')
    const [searchText, setSearchText] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // ── Fetch conversations ─────────────────────────────────────────────

    const fetchConversations = useCallback(async () => {
        try {
            const params = new URLSearchParams({ view: 'conversations', limit: '50' })
            if (platformFilter) params.set('platform', platformFilter)
            const res = await fetch(`/api/admin/crm/social?${params}`)
            const data = await res.json()
            setConversations(data.conversations || [])
        } catch (err) {
            console.error('[Messaging] Fetch conversations error:', err)
        } finally {
            setLoading(false)
        }
    }, [platformFilter])

    // ── Fetch thread messages ───────────────────────────────────────────

    const fetchMessages = useCallback(async (identifier: string, platform: string) => {
        try {
            const params = new URLSearchParams({
                view: 'messages',
                phone: identifier,
                platform,
                limit: '100',
            })
            const res = await fetch(`/api/admin/crm/social?${params}`)
            const data = await res.json()
            setMessages(data.messages || [])
        } catch (err) {
            console.error('[Messaging] Fetch messages error:', err)
        }
    }, [])

    // ── Polling ─────────────────────────────────────────────────────────

    useEffect(() => {
        fetchConversations()
        const interval = setInterval(fetchConversations, 30000)
        return () => clearInterval(interval)
    }, [fetchConversations])

    // ── Auto-scroll to bottom ───────────────────────────────────────────

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // ── Select conversation ─────────────────────────────────────────────

    const selectConversation = (conv: Conversation) => {
        setSelectedConv(conv)
        fetchMessages(conv.identifier, conv.platform)
    }

    // ── Send reply ──────────────────────────────────────────────────────

    const sendReply = async () => {
        if (!replyText.trim() || !selectedConv) return
        setSending(true)
        try {
            await fetch('/api/admin/crm/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reply',
                    phone: selectedConv.identifier,
                    platform: selectedConv.platform,
                    content: replyText.trim(),
                }),
            })
            setReplyText('')
            // Refresh thread
            await fetchMessages(selectedConv.identifier, selectedConv.platform)
            await fetchConversations()
        } catch (err) {
            console.error('[Messaging] Send reply error:', err)
        } finally {
            setSending(false)
        }
    }

    // ── Time format ─────────────────────────────────────────────────────

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - d.getTime()
        if (diff < 60000) return 'Az önce'
        if (diff < 3600000) return `${Math.floor(diff / 60000)} dk önce`
        if (diff < 86400000) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
    }

    // ── Filtered conversations ──────────────────────────────────────────

    const filteredConvs = conversations.filter(c => {
        if (searchText) {
            const name = `${c.guest?.name || ''} ${c.guest?.surname || ''}`.toLowerCase()
            const id = c.identifier.toLowerCase()
            const q = searchText.toLowerCase()
            return name.includes(q) || id.includes(q)
        }
        return true
    })

    // ─── RENDER ─────────────────────────────────────────────────────────

    return (
        <div className="flex h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-white/10 bg-slate-900/50">
            {/* Left Panel — Conversations List */}
            <div className="w-96 border-r border-white/10 flex flex-col">
                {/* Search + Filters */}
                <div className="p-3 border-b border-white/10 space-y-2">
                    <input
                        type="text"
                        placeholder="İsim veya numara ara..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex gap-1">
                        {['', 'whatsapp', 'facebook', 'instagram'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPlatformFilter(p)}
                                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                    platformFilter === p
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                {p === '' ? 'Tümü' : p === 'whatsapp' ? '📱 WA' : p === 'facebook' ? '💬 FB' : '📷 IG'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                        </div>
                    ) : filteredConvs.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">
                            <p className="text-2xl mb-2">💬</p>
                            <p>Henüz mesaj yok</p>
                            <p className="text-xs mt-1">Webhook aktif olduğunda mesajlar burada görünecek</p>
                        </div>
                    ) : (
                        filteredConvs.map(conv => (
                            <button
                                key={`${conv.platform}-${conv.identifier}`}
                                onClick={() => selectConversation(conv)}
                                className={`w-full text-left p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                                    selectedConv?.identifier === conv.identifier && selectedConv?.platform === conv.platform
                                        ? 'bg-blue-600/10 border-l-2 border-l-blue-500'
                                        : ''
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <PlatformIcon platform={conv.platform} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-white truncate">
                                                {conv.guest
                                                    ? `${conv.guest.name} ${conv.guest.surname}`
                                                    : conv.identifier}
                                            </p>
                                            <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                                {conv.lastMessageAt && formatTime(conv.lastMessageAt)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 truncate mt-0.5">
                                            {conv.lastMessage?.direction === 'outbound' && '↪ '}
                                            {conv.lastMessage?.content || '...'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <PlatformBadge platform={conv.platform} />
                                            <span className="text-xs text-slate-500">
                                                {conv.messageCount} mesaj
                                            </span>
                                            {conv.guest?.totalStays ? (
                                                <span className="text-xs text-amber-400">
                                                    ⭐ {conv.guest.totalStays} konaklama
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel — Thread */}
            <div className="flex-1 flex flex-col">
                {selectedConv ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <PlatformIcon platform={selectedConv.platform} />
                                <div>
                                    <p className="text-white font-medium">
                                        {selectedConv.guest
                                            ? `${selectedConv.guest.name} ${selectedConv.guest.surname}`
                                            : selectedConv.identifier}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <PlatformBadge platform={selectedConv.platform} />
                                        <span className="text-xs text-slate-500">{selectedConv.identifier}</span>
                                    </div>
                                </div>
                            </div>
                            {selectedConv.guest?.country && (
                                <span className="text-sm text-slate-400">
                                    🌍 {selectedConv.guest.country}
                                </span>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {[...messages].reverse().map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                                            msg.direction === 'outbound'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-800 text-slate-200'
                                        }`}
                                    >
                                        {msg.direction === 'inbound' && msg.senderName && (
                                            <p className="text-xs text-slate-400 mb-1">{msg.senderName}</p>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <span className="text-[10px] opacity-60">
                                                {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {msg.direction === 'outbound' && (
                                                <span className="text-[10px] opacity-60">
                                                    {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply input */}
                        <div className="p-3 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Mesajınızı yazın..."
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    disabled={sending}
                                />
                                <button
                                    onClick={sendReply}
                                    disabled={sending || !replyText.trim()}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
                                >
                                    {sending ? '...' : 'Gönder'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <p className="text-5xl mb-4">💬</p>
                            <p className="text-lg font-medium">Bir konuşma seçin</p>
                            <p className="text-sm mt-1">Soldaki listeden bir konuşma seçerek mesajları görüntüleyin</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
