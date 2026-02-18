import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { ElektraService } = await import('@/lib/services/elektra')
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)

        const availability = await ElektraService.getAvailability(today, tomorrow)
        const roomTypes = new Set(availability.map(a => a.roomType)).size

        return NextResponse.json({
            success: true,
            roomTypes,
            timestamp: new Date().toISOString()
        })
    } catch (err) {
        return NextResponse.json({
            success: false,
            error: (err as Error).message,
            roomTypes: 0,
            timestamp: new Date().toISOString()
        })
    }
}
