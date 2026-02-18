// Booking Service — Fetches room availability from Elektra API
// Provides availability grouped by room type with TRY pricing

import { ElektraService } from './elektra'
import type { RoomAvailability } from './elektra'

export interface RoomTypeAvailability {
    roomType: string
    roomTypeId: number
    availableDates: {
        date: string
        availableCount: number
        pricePerNight: number // TRY
        pricePerNightEur: number // EUR
        stopsell: boolean
    }[]
    minPrice: number // TRY — cheapest night
    maxPrice: number // TRY — most expensive night
    minPriceEur: number
    maxPriceEur: number
    totalPrice: number // TRY — sum of all nights
    totalPriceEur: number
    avgPricePerNight: number // TRY
    avgPricePerNightEur: number
    isAvailable: boolean
    nights: number
}

export interface BookingRequest {
    roomTypeId: number
    roomType: string
    checkIn: string
    checkOut: string
    adults: number
    children: number
    childAges?: number[]
    guestName: string
    guestEmail: string
    guestPhone: string
    notes?: string
    totalPrice: number
    currency: string
}

export class BookingService {

    static async getAvailability(
        checkIn: string,
        checkOut: string,
        adults: number = 2,
        children: number = 0,
        currency: string = 'TRY'
    ): Promise<RoomTypeAvailability[]> {
        try {
            // Fetch raw availability from Elektra
            const rawAvailability = await ElektraService.getAvailability(
                new Date(checkIn),
                new Date(checkOut)
            )

            if (!rawAvailability || rawAvailability.length === 0) {
                return []
            }

            // Get exchange rates for EUR conversion
            const rates = await ElektraService.getExchangeRates()
            const eurRate = rates.EUR_TO_TRY || 38

            // Group by room type
            const byRoomType = new Map<string, { roomTypeId: number; dates: RoomAvailability[] }>()

            for (const avail of rawAvailability) {
                const key = avail.roomType
                if (!byRoomType.has(key)) {
                    byRoomType.set(key, { roomTypeId: avail.roomTypeId, dates: [] })
                }
                byRoomType.get(key)!.dates.push(avail)
            }

            // Calculate per room type
            const results: RoomTypeAvailability[] = []

            for (const [roomType, { roomTypeId, dates }] of byRoomType) {
                const availableDates = dates.map(d => {
                    const price = d.discountedPrice ?? d.basePrice ?? 0
                    return {
                        date: d.date,
                        availableCount: d.availableCount,
                        pricePerNight: price,
                        pricePerNightEur: price / eurRate,
                        stopsell: d.stopsell
                    }
                })

                const prices = availableDates
                    .filter(d => !d.stopsell && d.availableCount > 0 && d.pricePerNight > 0)
                    .map(d => d.pricePerNight)

                const isAvailable = prices.length > 0
                const totalPrice = prices.reduce((s, p) => s + p, 0)
                const nights = prices.length

                results.push({
                    roomType,
                    roomTypeId,
                    availableDates,
                    minPrice: isAvailable ? Math.min(...prices) : 0,
                    maxPrice: isAvailable ? Math.max(...prices) : 0,
                    minPriceEur: isAvailable ? Math.min(...prices) / eurRate : 0,
                    maxPriceEur: isAvailable ? Math.max(...prices) / eurRate : 0,
                    totalPrice,
                    totalPriceEur: totalPrice / eurRate,
                    avgPricePerNight: nights > 0 ? totalPrice / nights : 0,
                    avgPricePerNightEur: nights > 0 ? (totalPrice / nights) / eurRate : 0,
                    isAvailable,
                    nights
                })
            }

            // Sort: available first, then by price
            return results.sort((a, b) => {
                if (a.isAvailable && !b.isAvailable) return -1
                if (!a.isAvailable && b.isAvailable) return 1
                return a.minPrice - b.minPrice
            })

        } catch (error) {
            console.error('[BookingService] Availability error:', error)
            return []
        }
    }

    static async submitBookingRequest(request: BookingRequest): Promise<{ success: boolean; message: string; referenceId?: string }> {
        // For now, we'll generate a reference ID and log the request
        // In production, this would either:
        // 1. Create a reservation via Elektra API
        // 2. Send an email notification to the hotel
        const referenceId = `BDR-${Date.now().toString(36).toUpperCase()}`

        console.log('[BookingService] New booking request:', {
            referenceId,
            ...request
        })

        // TODO: Integrate with Elektra reservation creation API or email notification
        return {
            success: true,
            message: `Rezervasyon talebiniz alınmıştır. Referans No: ${referenceId}. En kısa sürede sizinle iletişime geçeceğiz.`,
            referenceId
        }
    }
}
