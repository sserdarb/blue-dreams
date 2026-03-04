import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { date, roomType, roomTypeId, basePrice, currency, action } = body

        // If this were connected to the real Elektra price update endpoint:
        // const res = await fetch('https://bookingapi.elektraweb.com/hotel/33264/rate', { ... })
        // For now, we simulate a successful price update push:

        console.log(`[Elektra PMS Mock] Updating price for ${roomType} on ${date} to ${basePrice} ${currency}`)

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800))

        return NextResponse.json({
            success: true,
            message: 'Fiyat başarıyla güncellendi.',
            data: {
                date,
                roomType,
                newPrice: basePrice,
                currency
            }
        })
    } catch (error: any) {
        console.error('[Channel Manager Price Update Error]', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Fiyat güncellenirken hata oluştu' },
            { status: 500 }
        )
    }
}
