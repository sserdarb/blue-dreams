'use client'

import { useState, useEffect, useCallback } from 'react'

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [audioContext, setAudioContext] = useState<HTMLAudioElement | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission)
        }
        // Preload notification sound
        if (typeof window !== 'undefined') {
            const audio = new Audio('/sounds/notification.mp3') // Assume this files exists or we provide a generic one
            audio.load()
            setAudioContext(audio)
        }
    }, [])

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return false

        try {
            const result = await Notification.requestPermission()
            setPermission(result)
            return result === 'granted'
        } catch (error) {
            console.error('Notification permission error:', error)
            return false
        }
    }, [])

    const notify = useCallback((title: string, options?: NotificationOptions, playSound: boolean = true) => {
        if (permission === 'granted') {
            new Notification(title, {
                icon: '/icon-192.png',
                ...options
            })
        }

        if (playSound && audioContext) {
            // Browsers might block audio if user hasn't interacted with document
            audioContext.currentTime = 0
            audioContext.play().catch(e => console.warn('Audio play blocked by browser:', e))
        }
    }, [permission, audioContext])

    return {
        permission,
        requestPermission,
        notify
    }
}
