import { NextResponse } from 'next/server'
import { ElektraService } from '@/lib/services/elektra'
import { prisma } from '@/lib/prisma'

// GET: Fetch real availability/pricing from Elektra
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const adults = parseInt(searchParams.get('adults') || '2')
    const currency = searchParams.get('currency') || 'EUR'

    if (!checkIn || !checkOut) {
        return NextResponse.json({ error: 'checkIn and checkOut required' }, { status: 400 })
    }

    try {
        const fromDate = new Date(checkIn)
        const toDate = new Date(checkOut)

        // Validate dates
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        if (fromDate < now) {
            return NextResponse.json({ error: 'Check-in must be in the future' }, { status: 400 })
        }
        if (toDate <= fromDate) {
            return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 })
        }

        const nights = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))

        const availability = await ElektraService.getAvailability(fromDate, toDate, currency)

        // Group by room type and calculate total price per stay
        const roomTypeMap = new Map<string, {
            roomType: string
            roomTypeId: number
            available: number
            totalPrice: number
            avgNightlyRate: number
            stopsell: boolean
            dailyPrices: { date: string; price: number | null }[]
        }>()

        // Room display names and images
        const roomInfo: Record<string, { name: string; nameEn: string; image: string; size: string; capacity: number; features: string[] }> = {
            'Club Room': { name: 'Club Oda', nameEn: 'Club Room', image: '/images/rooms/club-room.jpg', size: '28m²', capacity: 2, features: ['Balkon', 'Klima', 'Minibar', 'Wi-Fi'] },
            'Club Room Sea View': { name: 'Club Oda Deniz Manzarası', nameEn: 'Club Room Sea View', image: '/images/rooms/club-sea.jpg', size: '28m²', capacity: 2, features: ['Deniz Manzarası', 'Balkon', 'Klima', 'Minibar'] },
            'Club Family Room': { name: 'Club Aile Odası', nameEn: 'Club Family Room', image: '/images/rooms/club-family.jpg', size: '38m²', capacity: 4, features: ['Geniş Alan', 'Balkon', 'Aile Dostu', 'Minibar'] },
            'Deluxe Room': { name: 'Deluxe Oda', nameEn: 'Deluxe Room', image: '/images/rooms/deluxe.jpg', size: '32m²', capacity: 2, features: ['Premium Döşeme', 'Balkon', 'Jakuzi', 'Minibar'] },
            'Deluxe Family Room': { name: 'Deluxe Aile Odası', nameEn: 'Deluxe Family Room', image: '/images/rooms/deluxe-family.jpg', size: '42m²', capacity: 4, features: ['Premium Süit', 'Balkon', 'Jakuzi', 'Geniş Alan'] },
        }

        for (const item of availability) {
            if (!roomTypeMap.has(item.roomType)) {
                roomTypeMap.set(item.roomType, {
                    roomType: item.roomType,
                    roomTypeId: item.roomTypeId,
                    available: Infinity,
                    totalPrice: 0,
                    avgNightlyRate: 0,
                    stopsell: false,
                    dailyPrices: []
                })
            }
            const rt = roomTypeMap.get(item.roomType)!
            rt.available = Math.min(rt.available, item.availableCount)
            if (item.stopsell) rt.stopsell = true
            const price = item.discountedPrice ?? item.basePrice ?? 0
            rt.totalPrice += price
            rt.dailyPrices.push({ date: item.date, price })
        }

        const rooms = Array.from(roomTypeMap.values())
            .filter(r => !r.stopsell && r.available > 0)
            .map(r => {
                const info = roomInfo[r.roomType]
                return {
                    roomType: r.roomType,
                    roomTypeId: r.roomTypeId,
                    displayName: info?.name || r.roomType,
                    displayNameEn: info?.nameEn || r.roomType,
                    image: info?.image || '/images/rooms/default.jpg',
                    size: info?.size || '',
                    capacity: info?.capacity || 2,
                    features: info?.features || [],
                    available: r.available === Infinity ? 0 : r.available,
                    totalPrice: Math.round(r.totalPrice * 100) / 100,
                    avgNightlyRate: Math.round((r.totalPrice / nights) * 100) / 100,
                    currency,
                    nights,
                    dailyPrices: r.dailyPrices
                }
            })
            .sort((a, b) => a.totalPrice - b.totalPrice)

        return NextResponse.json({
            checkIn, checkOut, nights, adults, currency,
            rooms,
            source: 'elektra'
        })
    } catch (err) {
        console.error('[Booking API] Error:', err)
        return NextResponse.json({ error: 'Unable to fetch availability' }, { status: 500 })
    }
}

// POST: Create a reservation request (stored in DB, notification sent)
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { checkIn, checkOut, roomType, roomTypeId, adults, children, currency, totalPrice,
            guestName, guestSurname, guestEmail, guestPhone, guestNationality, specialRequests } = body

        // Validate required fields
        if (!checkIn || !checkOut || !roomType || !guestName || !guestEmail || !guestPhone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Store reservation request in DB
        const reservation = await prisma.reservationRequest.create({
            data: {
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                roomType,
                roomTypeId: roomTypeId || 0,
                adults: adults || 2,
                children: children || 0,
                currency: currency || 'EUR',
                totalPrice: totalPrice || 0,
                guestName,
                guestSurname: guestSurname || '',
                guestEmail,
                guestPhone,
                guestNationality: guestNationality || 'TR',
                specialRequests: specialRequests || '',
                status: 'pending',
                source: 'website'
            }
        })

        return NextResponse.json({
            success: true,
            reservationId: reservation.id,
            message: 'Reservation request received. Our team will contact you shortly.'
        })
    } catch (err) {
        console.error('[Booking API] Create error:', err)
        return NextResponse.json({ error: 'Failed to create reservation request' }, { status: 500 })
    }
}
