import { NextResponse } from 'next/server'
import { ElektraService } from '@/lib/services/elektra'

// GET — Returns the full list of countries from Elektra PMS API
// Used by CRM Marketing, BigData, and other components for nationality filters
export async function GET() {
    try {
        const countries = await ElektraService.getCountries()
        return NextResponse.json({
            success: true,
            countries,
            count: countries.length
        })
    } catch (error: any) {
        console.error('[Countries API]', error)
        return NextResponse.json({
            success: false,
            error: error.message,
            countries: []
        }, { status: 500 })
    }
}
