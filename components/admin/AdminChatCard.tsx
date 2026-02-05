'use client'

import { useState } from 'react'
import { sendMessage } from '@/app/actions/chat'

export function AdminChatCard({ session }: { session: any }) {
    const [reply, setReply] = useState('')

    const lastMsg = session.messages[0]

    return (
        <div className="bg-white p-4 rounded shadow border flex flex-col h-80">
            <div className="mb-2 border-b pb-2">
                <span className="font-bold">{session.customerName}</span>
                <span className="text-xs text-gray-400 block">{new Date(session.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50 p-2 rounded mb-2 text-sm">
                {lastMsg && (
                    <div className="mb-2">
                        <span className="font-bold text-xs">{lastMsg.sender}: </span>
                        {lastMsg.content}
                    </div>
                )}
                {!lastMsg && <p className="text-gray-400 italic">No messages</p>}

                <div className="text-xs text-gray-400 mt-4 text-center">
                    (Real-time updates require refresh in this demo)
                </div>
            </div>
            <div className="flex gap-2">
                <input
                    className="flex-1 border rounded px-2 py-1 text-sm"
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Reply..."
                />
                <button
                    onClick={async () => {
                        await sendMessage(session.id, reply, 'agent')
                        setReply('')
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                    Send
                </button>
            </div>
        </div>
    )
}
