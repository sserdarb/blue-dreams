'use client'

import { useState, useEffect } from 'react'

export type GeoCurrency = 'TRY' | 'EUR'

interface GeoCurrencyResult {
    currency: GeoCurrency
    country: string
    contract: 'HOTELWEB TL' | 'HOTELWEB EUR'
    label: string
    symbol: string
}

/**
 * Detect user's currency based on browser language/timezone.
 * - Turkish locale or timezone → TRY (HotelWeb TL contract)
 * - International → EUR (HotelWeb EUR contract)
 */
function detectGeoCurrency(): GeoCurrencyResult {
    if (typeof window === 'undefined') {
        return { currency: 'EUR', country: 'International', contract: 'HOTELWEB EUR', label: 'Euro', symbol: '€' }
    }

    const lang = navigator.language || ''
    const langs = navigator.languages || []
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''

    // Check if user is from Turkey
    const isTurkish =
        lang.startsWith('tr') ||
        langs.some(l => l.startsWith('tr')) ||
        tz.includes('Istanbul') ||
        tz.includes('Turkey')

    if (isTurkish) {
        return { currency: 'TRY', country: 'Türkiye', contract: 'HOTELWEB TL', label: 'Türk Lirası', symbol: '₺' }
    }

    return { currency: 'EUR', country: 'International', contract: 'HOTELWEB EUR', label: 'Euro', symbol: '€' }
}

/**
 * Hook to get geo-based currency with manual override support.
 */
export function useGeoCurrency() {
    const [geo, setGeo] = useState<GeoCurrencyResult>(() => detectGeoCurrency())
    const [manualOverride, setManualOverride] = useState<GeoCurrency | null>(null)

    useEffect(() => {
        setGeo(detectGeoCurrency())
    }, [])

    const activeCurrency = manualOverride || geo.currency
    const activeResult: GeoCurrencyResult = manualOverride
        ? manualOverride === 'TRY'
            ? { currency: 'TRY', country: 'Türkiye', contract: 'HOTELWEB TL', label: 'Türk Lirası', symbol: '₺' }
            : { currency: 'EUR', country: 'International', contract: 'HOTELWEB EUR', label: 'Euro', symbol: '€' }
        : geo

    return {
        ...activeResult,
        detected: geo,
        isOverridden: manualOverride !== null,
        setCurrency: setManualOverride,
    }
}

/**
 * Format price with geo-currency.
 */
export function formatGeoPrice(tryPrice: number, eurPrice: number, currency: GeoCurrency): string {
    if (currency === 'EUR') {
        return `€${Math.round(eurPrice).toLocaleString('tr-TR')}`
    }
    return `₺${Math.round(tryPrice).toLocaleString('tr-TR')}`
}
