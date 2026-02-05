'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'

interface CtaBarData {
    id: string
    title: string
    subtitle?: string
    buttonText?: string
    buttonUrl?: string
    backgroundColor: string
    textColor: string
}

export function CtaBar() {
    const [ctaBar, setCtaBar] = useState<CtaBarData | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCtaBar = async () => {
            try {
                const res = await fetch('/api/cta-bar')
                const data = await res.json()
                if (data && data.id) {
                    setCtaBar(data)
                }
            } catch (error) {
                console.error('Failed to fetch CTA bar:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCtaBar()
    }, [])

    const handleClick = async () => {
        if (!ctaBar) return

        // Track the click
        try {
            await fetch('/api/cta-bar/click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: ctaBar.id })
            })
        } catch (error) {
            console.error('Failed to track click:', error)
        }

        // Navigate to URL
        if (ctaBar.buttonUrl) {
            window.open(ctaBar.buttonUrl, '_blank')
        }
    }

    const handleDismiss = () => {
        setIsVisible(false)
        // Optionally store in localStorage to keep it hidden
        if (ctaBar) {
            localStorage.setItem(`cta-dismissed-${ctaBar.id}`, 'true')
        }
    }

    // Check if dismissed previously
    useEffect(() => {
        if (ctaBar) {
            const isDismissed = localStorage.getItem(`cta-dismissed-${ctaBar.id}`)
            if (isDismissed) {
                setIsVisible(false)
            }
        }
    }, [ctaBar])

    if (isLoading || !ctaBar || !isVisible) {
        return null
    }

    return (
        <div
            className="relative w-full py-4 px-6"
            style={{ backgroundColor: ctaBar.backgroundColor }}
        >
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="text-center md:text-left" style={{ color: ctaBar.textColor }}>
                    <span className="font-bold text-lg md:text-xl">{ctaBar.title}</span>
                    {ctaBar.subtitle && (
                        <span className="block md:inline md:ml-3 text-sm opacity-90">
                            {ctaBar.subtitle}
                        </span>
                    )}
                </div>

                {ctaBar.buttonText && (
                    <button
                        onClick={handleClick}
                        className="flex items-center gap-2 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full font-semibold text-sm uppercase tracking-wide transition-all hover:scale-105"
                        style={{ color: ctaBar.textColor }}
                    >
                        {ctaBar.buttonText}
                        <ExternalLink size={14} />
                    </button>
                )}

                <button
                    onClick={handleDismiss}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
                    style={{ color: ctaBar.textColor }}
                    aria-label="Dismiss"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    )
}

export default CtaBar
