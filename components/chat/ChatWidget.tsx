'use client'

import { useState, useEffect, useRef } from 'react'
import { createSession, getSession, sendMessage } from '@/app/actions/chat'
import { MessageSquare, X, Send, Sparkles } from 'lucide-react'
import { BlueConciergeFull } from './BlueConciergeFull'

// Multi-language support
const translations = {
  tr: {
    title: 'Blue Concierge',
    subtitle: 'Size yardımcı olmak için buradayız',
    welcome: 'Hoş geldiniz! Size nasıl yardımcı olabiliriz?',
    placeholder: 'Mesajınızı yazın...',
    aiAssistant: 'AI Asistan',
    concierge: 'Concierge',
    typing: 'Yazıyor...',
    openAi: 'AI Asistan Başlat'
  },
  en: {
    title: 'Blue Concierge',
    subtitle: "We're here to help you",
    welcome: 'Welcome! How can we assist you today?',
    placeholder: 'Type your message...',
    aiAssistant: 'AI Assistant',
    concierge: 'Concierge',
    typing: 'Typing...',
    openAi: 'Start AI Assistant'
  },
  de: {
    title: 'Blue Concierge',
    subtitle: 'Wir sind hier, um Ihnen zu helfen',
    welcome: 'Willkommen! Wie können wir Ihnen helfen?',
    placeholder: 'Schreiben Sie Ihre Nachricht...',
    aiAssistant: 'KI-Assistent',
    concierge: 'Concierge',
    typing: 'Schreibt...',
    openAi: 'KI-Assistent starten'
  },
  ru: {
    title: 'Blue Concierge',
    subtitle: 'Мы здесь, чтобы помочь вам',
    welcome: 'Добро пожаловать! Чем мы можем вам помочь?',
    placeholder: 'Введите сообщение...',
    aiAssistant: 'AI Ассистент',
    concierge: 'Консьерж',
    typing: 'Печатает...',
    openAi: 'Запустить AI Ассистента'
  }
}

type Locale = keyof typeof translations

interface ChatWidgetProps {
  locale?: Locale
  shouldPulse?: boolean // For admin "attract attention" feature
}

export function ChatWidget({ locale = 'tr', shouldPulse = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPulsing, setIsPulsing] = useState(shouldPulse)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const t = translations[locale] || translations.tr

  // Listen for pulse trigger from admin
  useEffect(() => {
    const handlePulse = () => {
      setIsPulsing(true)
      setTimeout(() => setIsPulsing(false), 5000)
    }

    // Listen for header button click to open AI assistant
    const handleOpenConcierge = () => {
      setIsAiOpen(true)
    }

    window.addEventListener('blueConcierge:pulse', handlePulse)
    window.addEventListener('openBlueConcierge', handleOpenConcierge)
    return () => {
      window.removeEventListener('blueConcierge:pulse', handlePulse)
      window.removeEventListener('openBlueConcierge', handleOpenConcierge)
    }
  }, [])

  useEffect(() => {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !sessionId) return

    setLoading(true)
    const content = inputValue
    setInputValue('')

    setMessages(prev => [...prev, { id: 'temp-' + Date.now(), sender: 'user', content, createdAt: new Date() }])

    await sendMessage(sessionId, content, 'user')
    setLoading(false)
  }

  // Full-screen AI Assistant
  if (isAiOpen) {
    return <BlueConciergeFull isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} locale={locale} />
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <div className="flex flex-col items-end gap-3">
          {/* AI Assistant Button - Primary */}
          <button
            onClick={() => setIsAiOpen(true)}
            className={`group relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2 ${isPulsing ? 'animate-pulse ring-4 ring-purple-400 ring-opacity-50' : ''}`}
            aria-label="Open AI Assistant"
          >
            <Sparkles size={20} className={isPulsing ? 'animate-spin' : ''} />
            <span className="font-medium text-sm">{t.openAi}</span>
            {isPulsing && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Regular Chat Button - Secondary */}
          <button
            onClick={() => setIsOpen(true)}
            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
            aria-label="Open chat"
          >
            <MessageSquare size={24} />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t.title}</h3>
                <p className="text-xs text-blue-100">{t.subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-2 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white space-y-4">
            {messages.length === 0 && (
              <div className="text-center mt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MessageSquare size={28} className="text-blue-600" />
                </div>
                <p className="text-gray-600 text-sm mb-4">{t.welcome}</p>
                {/* Quick AI button inside chat */}
                <button
                  onClick={() => { setIsOpen(false); setIsAiOpen(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  <Sparkles size={16} />
                  {t.openAi}
                </button>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md'
                    : msg.sender === 'bot' || msg.sender === 'ai'
                      ? 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                      : 'bg-gradient-to-r from-emerald-50 to-teal-50 text-gray-800 rounded-bl-md border border-emerald-100'
                    }`}
                >
                  {(msg.sender === 'bot' || msg.sender === 'ai') && (
                    <span className="text-xs text-blue-600 font-semibold flex items-center gap-1 mb-1">
                      <Sparkles size={12} />
                      {t.aiAssistant}
                    </span>
                  )}
                  {msg.sender === 'agent' && (
                    <span className="text-xs text-emerald-600 font-semibold block mb-1">
                      {t.concierge}
                    </span>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-400">{t.typing}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2.5 rounded-full hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
