import { NextResponse } from 'next/server'
import { ElektraCache, setElektraConfig } from '@/lib/services/elektra-cache'

export async function GET() {
    try {
        const status = await ElektraCache.getStatus()
        return NextResponse.json(status)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch cache status' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { action, ttlMinutes } = body

        if (action === 'refresh') {
            await ElektraCache.refresh()
            const status = await ElektraCache.getStatus()
            return NextResponse.json({ success: true, status })
        }

        if (action === 'update_ttl' && typeof ttlMinutes === 'number') {
            setElektraConfig({ ttlMinutes })
            const status = await ElektraCache.getStatus()
            return NextResponse.json({ success: true, status })
        }

        if (action === 'refresh_year' && typeof body.year === 'number') {
            await ElektraCache.refreshYear(body.year)
            const status = await ElektraCache.getStatus()
            return NextResponse.json({ success: true, status })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update cache settings' }, { status: 500 })
    }
}
