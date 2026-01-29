'use client'

import { useState, useEffect, useRef } from 'react'
import { createSession, getSession, sendMessage } from '@/app/actions/chat'
import { MessageSquare, X, Send } from 'lucide-react'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load session from storage or create new
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('chatSessionId')
        if (stored) {
          setSessionId(stored)
        }
    }
  }, [])

  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession().then(s => {
        setSessionId(s.id)
        localStorage.setItem('chatSessionId', s.id)
      })
    }
  }, [isOpen, sessionId])

  // Polling for messages
  useEffect(() => {
    if (!sessionId || !isOpen) return

    const fetchMessages = async () => {
      const session = await getSession(sessionId)
      if (session) {
        setMessages(session.messages)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [sessionId, isOpen])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !sessionId) return

    setLoading(true)
    const content = inputValue
    setInputValue('')

    // Optimistic update
    setMessages(prev => [...prev, { id: 'temp-' + Date.now(), sender: 'user', content, createdAt: new Date() }])

    await sendMessage(sessionId, content, 'user')
    setLoading(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-lg shadow-2xl flex flex-col overflow-hidden border">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div>
                <h3 className="font-bold">Blue Concierge</h3>
                <p className="text-xs text-blue-100">Always here to help</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-10">
                    <p>Welcome! How can we assist you today?</p>
                </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : msg.sender === 'bot'
                        ? 'bg-gray-200 text-gray-800 rounded-tl-none border border-blue-200'
                        : 'bg-white border text-gray-800 rounded-tl-none shadow-sm' // Agent
                  }`}
                >
                  {msg.sender === 'bot' && <span className="text-xs text-blue-600 font-bold block mb-1">AI Assistant</span>}
                  {msg.sender === 'agent' && <span className="text-xs text-green-600 font-bold block mb-1">Concierge</span>}
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
