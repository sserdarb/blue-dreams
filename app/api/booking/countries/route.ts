import { NextResponse } from 'next/server'
import { ElektraCache } from '@/lib/services/elektra-cache'

// GET: Fetch countries from DB cache (auto-populates from PMS if empty)
export async function GET() {
    try {
        const countries = await ElektraCache.getCountries()
        return NextResponse.json({ countries })
    } catch (err) {
        console.error('[Countries API] Error:', err)
        return NextResponse.json({ countries: [] }, { status: 500 })
    }
}
