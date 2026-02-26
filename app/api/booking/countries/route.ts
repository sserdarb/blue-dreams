import { NextResponse } from 'next/server'
import { ElektraService } from '@/lib/services/elektra'

// GET: Fetch countries/nationalities from Elektra PMS
export async function GET() {
    try {
        const countries = await ElektraService.getCountries()
        return NextResponse.json({ countries })
    } catch (err) {
        console.error('[Countries API] Error:', err)
        return NextResponse.json({ countries: [] }, { status: 500 })
    }
}
