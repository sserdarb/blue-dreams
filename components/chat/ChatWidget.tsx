'use client'

import { useState, useEffect } from 'react'
import { BlueConciergeFull } from './BlueConciergeFull'

export function ChatWidget({ locale = 'tr' }: { locale?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  // Listen for header button click to open Blue Concierge
  useEffect(() => {
    const handleOpenConcierge = () => {
      setIsOpen(true)
    }

    window.addEventListener('openBlueConcierge', handleOpenConcierge)
    return () => window.removeEventListener('openBlueConcierge', handleOpenConcierge)
  }, [])

  return (
    <BlueConciergeFull
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      locale={locale as 'tr' | 'en' | 'de' | 'ru'}
    />
  )
}
