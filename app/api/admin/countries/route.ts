import { NextResponse } from 'next/server'
import { ElektraService } from '@/lib/services/elektra'

export async function GET() {
    try {
        const elektra = ElektraService.getInstance()
        const countries = await elektra.fetchCountries()

        return NextResponse.json({
            success: true,
            total: countries.length,
            countries: countries
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
