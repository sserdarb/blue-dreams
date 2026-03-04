'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

function getOrCreateId(key: string) {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem(key)
    if (!id) {
        id = uuidv4()
        localStorage.setItem(key, id)
    }
    return id
}

function getSessionId() {
    if (typeof window === 'undefined') return ''
    const now = Date.now()
    const sessionKey = 'bdr_session_id'
    const lastActiveKey = 'bdr_last_active'

    let sessionId = sessionStorage.getItem(sessionKey)
    const lastActive = sessionStorage.getItem(lastActiveKey)

    // If no session or inactive for > 30 mins, create new session
    if (!sessionId || !lastActive || (now - parseInt(lastActive, 10)) > 30 * 60 * 1000) {
        sessionId = uuidv4()
        sessionStorage.setItem(sessionKey, sessionId)
    }

    sessionStorage.setItem(lastActiveKey, now.toString())
    return sessionId
}

export function VisitorTracker() {
    const pathname = usePathname()
    const lastPathRef = useRef<string | null>(null)

    useEffect(() => {
        // Track Page View
        if (lastPathRef.current !== pathname) {
            lastPathRef.current = pathname
            const visitorId = getOrCreateId('bdr_visitor_id')
            const sessionId = getSessionId()

            fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitorId,
                    sessionId,
                    eventType: 'page_view',
                    pageUrl: window.location.href,
                    metadata: {
                        path: pathname,
                        agent: window.navigator.userAgent,
                        lang: window.navigator.language
                    }
                })
            }).catch(() => { /* silent handle */ })
        }
    }, [pathname])

    useEffect(() => {
        // Track Clicks
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            // Look for closest button or a tag
            const element = target.closest('button, a, [role="button"]')

            if (element) {
                const elementId = element.id || undefined
                const elementText = element.textContent?.trim().substring(0, 50) || ''
                const linkHref = element.getAttribute('href')

                const visitorId = getOrCreateId('bdr_visitor_id')
                const sessionId = getSessionId()

                fetch('/api/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        visitorId,
                        sessionId,
                        eventType: 'click',
                        pageUrl: window.location.href,
                        elementId: elementId || elementText,
                        metadata: {
                            tag: element.tagName.toLowerCase(),
                            text: elementText,
                            href: linkHref
                        }
                    })
                }).catch(() => { /* silent handle */ })
            }
        }

        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [])

    return null
}
