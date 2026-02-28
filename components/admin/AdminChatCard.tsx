'use client'

import { useState, useEffect, useRef } from 'react'
import { sendMessage, getSessionMessagesSince, closeSession } from '@/app/actions/chat'

export function AdminChatCard({ session }: { session: any }) {
    const [messages, setMessages] = useState<any[]>(session.messages || [])
    const [reply, setReply] = useState('')
    const [lastSync, setLastSync] = useState<string>(new Date().toISOString())
    const scrollRef = useRef<HTMLDivElement>(null)

    // Polling for user messages
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const newMsgs = await getSessionMessagesSince(session.id, lastSync)
                if (newMsgs && newMsgs.length > 0) {
                    setMessages(prev => {
                        const newHistory = [...prev];
                        newMsgs.forEach(m => {
                            if (!newHistory.find(x => x.id === m.id)) {
                                newHistory.push(m)
                            }
                        })
                        return newHistory
                    })
                    const latestDate = newMsgs[newMsgs.length - 1].createdAt
                    setLastSync(new Date(latestDate).toISOString())
                }
            } catch (e) { /* ignore polling errors */ }
        }, 3000)
        return () => clearInterval(interval)
    }, [session.id, lastSync])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!reply.trim()) return
        const tempText = reply
        setReply('')

        // Optimistically add agent message
        setMessages(prev => [...prev, {
            id: 'temp-' + Date.now(),
            sender: 'agent',
            content: tempText,
            createdAt: new Date().toISOString(),
            isFromAdmin: true
        }])

        await sendMessage(session.id, tempText, 'agent')
    }

    const unreadUserMsgs = messages.filter(m => m.sender === 'user').length

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col h-96 overflow-hidden">
            <div className="bg-blue-600 p-3 text-white flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-sm">{session.customerName || 'Misafir'}</h3>
                    <span className="text-xs opacity-75">{new Date(session.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{unreadUserMsgs} İstek</span>
                    <button
                        onClick={async () => {
                            await closeSession(session.id)
                        }}
                        className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                    >
                        Kapat
                    </button>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-50 p-3 space-y-3">
                {messages.length === 0 && <p className="text-gray-400 italic text-center text-sm pt-10">Mesaj bulunmuyor</p>}
                {messages.map((msg, i) => (
                    <div key={msg.id || i} className={`w-full flex ${msg.isFromAdmin || msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`text-sm p-3 rounded-xl max-w-[85%] ${msg.isFromAdmin || msg.sender === 'agent'
                                ? 'bg-blue-100 text-blue-900 rounded-tr-none'
                                : msg.sender === 'bot'
                                    ? 'bg-purple-100 text-purple-900 italic border border-purple-200'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                            }`}>
                            {msg.sender === 'bot' && <span className="text-[10px] uppercase font-bold tracking-widest text-purple-600 mb-1 block">AI Bot</span>}
                            {msg.metadata && JSON.parse(msg.metadata).isError && <span className="text-red-500 font-bold block mb-1">HATA: </span>}
                            {msg.content}
                            <div className="text-[10px] mt-1 opacity-50 text-right">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 bg-white border-t flex gap-2">
                <input
                    className="flex-1 border bg-gray-50 border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Sohbete dahil ol / Yanıtla..."
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                >
                    <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </div>
        </div>
    )
}
