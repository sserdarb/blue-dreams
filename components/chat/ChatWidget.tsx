'use client'

import { useState, useEffect } from 'react'
import AiAssistant from './AiAssistant'

// Multi-language support (minimal needed as AI handles logic internally)
const translations = {
  tr: { title: 'Blue Concierge' },
  en: { title: 'Blue Concierge' },
  de: { title: 'Blue Concierge' },
  ru: { title: 'Blue Concierge' }
}

export default function ChatWidget({ locale = 'tr' }: { locale?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  // Listen for header button click to open AI assistant
  useEffect(() => {
    const handleOpenConcierge = () => {
      setIsOpen(true)
    }

    window.addEventListener('openBlueConcierge', handleOpenConcierge)
    return () => window.removeEventListener('openBlueConcierge', handleOpenConcierge)
  }, [])

  return (
    <>
      <AiAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

