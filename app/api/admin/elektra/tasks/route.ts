import { NextResponse } from 'next/server'
import { ElektraService } from '@/lib/services/elektra'

const ELEKTRA_APP_ID = process.env.ELEKTRA_HOTEL_ID || '14264'

export async function GET() {
    try {
        const elektra = ElektraService.getInstance()

        // Ensure token
        await elektra.fetchCountries()
        // Wait, fetchCountries handles its own login. Let's just trigger a login explicitly if needed.
        // Actually, we can use any authenticated endpoint test logic.
        const token = (elektra as any).token
        if (!token) {
            return NextResponse.json({ success: false, error: 'No token' }, { status: 401 })
        }

        const urlsToTest = [
            `/hotel/${ELEKTRA_APP_ID}/tasks`,
            `/hotel/${ELEKTRA_APP_ID}/housekeeping`,
            `/hotel/${ELEKTRA_APP_ID}/room-status`,
            `/hotel/${ELEKTRA_APP_ID}/guest-requests`,
            `/hotel/${ELEKTRA_APP_ID}/maintenance`,
        ]

        const results: Record<string, any> = {}

        for (const path of urlsToTest) {
            try {
                const res = await fetch(`https://bookingapi.elektraweb.com${path}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                results[path] = {
                    status: res.status,
                    statusText: res.statusText,
                    isJson: res.headers.get('content-type')?.includes('json')
                }

                if (res.ok && results[path].isJson) {
                    const data = await res.json()
                    results[path].dataPreview = Array.isArray(data) ? data.slice(0, 2) : data
                }
            } catch (err: any) {
                results[path] = { error: err.message }
            }
        }

        return NextResponse.json({
            success: true,
            results
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
