'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Bell, X, CheckSquare, MessageSquare, Mail, Clock, AlertTriangle } from 'lucide-react'

interface Notification {
    id: string; type: string; title: string; message: string; link?: string; isRead: boolean; createdAt: string
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
    task_assigned: <CheckSquare size={14} className="text-cyan-500" />,
    task_comment: <MessageSquare size={14} className="text-blue-500" />,
    task_due: <Clock size={14} className="text-amber-500" />,
    email_converted: <Mail size={14} className="text-violet-500" />,
    workflow_step: <AlertTriangle size={14} className="text-orange-500" />,
}

export default function NotificationBell({ userId }: { userId?: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    const fetchNotifications = useCallback(async () => {
        if (!userId) return
        try {
            const res = await fetch(`/api/admin/notifications?userId=${userId}`)
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch { /* silent */ }
    }, [userId])

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
        return () => clearInterval(interval)
    }, [fetchNotifications])

    const markAllRead = async () => {
        if (!userId) return
        await fetch('/api/admin/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, markAll: true }),
        })
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    }

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bildirimler</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-[10px] text-cyan-600 font-bold hover:underline">Tümünü Oku</button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={16} /></button>
                            </div>
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                            {notifications.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">Bildirim yok</div>
                            ) : (
                                notifications.slice(0, 20).map(n => (
                                    <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.isRead ? 'bg-cyan-50/50 dark:bg-cyan-900/10' : ''}`}>
                                        <div className="flex items-start gap-2.5">
                                            <div className="mt-0.5">{TYPE_ICONS[n.type] || <Bell size={14} className="text-slate-400" />}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                                <span className="text-[10px] text-slate-400 mt-1 block">
                                                    {new Date(n.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {!n.isRead && <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1 flex-shrink-0" />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
