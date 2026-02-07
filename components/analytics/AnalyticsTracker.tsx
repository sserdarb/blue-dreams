'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Generate or retrieve session ID
function getSessionId(): string {
    if (typeof window === 'undefined') return ''
    let sid = sessionStorage.getItem('bd_session_id')
    if (!sid) {
        sid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
        sessionStorage.setItem('bd_session_id', sid)
    }
    return sid
}

// Detect device type
function getDevice(): string {
    if (typeof window === 'undefined') return 'unknown'
    const ua = navigator.userAgent
    if (/Mobi|Android/i.test(ua)) return 'mobile'
    if (/Tablet|iPad/i.test(ua)) return 'tablet'
    return 'desktop'
}

// Detect browser
function getBrowser(): string {
    if (typeof window === 'undefined') return 'unknown'
    const ua = navigator.userAgent
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Edg')) return 'Edge'
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
    return 'Other'
}

export default function AnalyticsTracker() {
    const pathname = usePathname()
    const startTimeRef = useRef<number>(Date.now())
    const prevPathRef = useRef<string>('')

    useEffect(() => {
        // Don't track admin pages
        if (pathname.includes('/admin')) return

        // Send previous page's duration
        if (prevPathRef.current && prevPathRef.current !== pathname) {
            const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
            // Fire and forget duration update
            navigator.sendBeacon?.('/api/analytics/track', JSON.stringify({
                type: 'duration',
                path: prevPathRef.current,
                sessionId: getSessionId(),
                duration
            }))
        }

        // Track new page view
        startTimeRef.current = Date.now()
        prevPathRef.current = pathname

        const locale = pathname.split('/')[1] || 'tr'

        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'pageview',
                path: pathname,
                locale,
                referrer: document.referrer || null,
                device: getDevice(),
                browser: getBrowser(),
                sessionId: getSessionId()
            })
        }).catch(() => { }) // Silently fail

        // Track duration on page unload
        const handleUnload = () => {
            const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
            navigator.sendBeacon?.('/api/analytics/track', JSON.stringify({
                type: 'duration',
                path: pathname,
                sessionId: getSessionId(),
                duration
            }))
        }

        window.addEventListener('beforeunload', handleUnload)
        return () => window.removeEventListener('beforeunload', handleUnload)
    }, [pathname])

    return null // This component renders nothing
}
