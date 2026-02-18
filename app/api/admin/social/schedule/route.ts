import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    // 1. Auth Check
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { image, date, caption } = body

        if (!image || !date) {
            return NextResponse.json({ error: 'Image and date are required' }, { status: 400 })
        }

        // Mock saving logic
        console.log(`[Social Schedule] Scheduled post for ${date}: ${caption?.slice(0, 20)}...`)

        return NextResponse.json({
            success: true,
            message: 'Tasarım başarıyla takvime eklendi.',
            scheduledAt: date
        })

    } catch (error) {
        console.error('[Social Schedule] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
