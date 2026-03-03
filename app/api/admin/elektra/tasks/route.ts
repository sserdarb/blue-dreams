import { NextResponse } from 'next/server'

// ─── Elektra API Task/Housekeeping Endpoint Discovery ──────────
// Probes the Elektra PMS API for task management, housekeeping,
// and guest request endpoints that may not be publicly documented

const API_BASE = 'https://bookingapi.elektraweb.com'
const HOTEL_ID = 33264

async function getJwt(): Promise<string> {
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'hotel-id': HOTEL_ID,
            'usercode': process.env.ELEKTRA_USER_CODE || 'asis',
            'password': process.env.ELEKTRA_PASSWORD || ''
        }),
        cache: 'no-store'
    })
    if (!res.ok) throw new Error(`Login failed: ${res.status}`)
    const data = await res.json()
    if (!data.jwt) throw new Error('No JWT')
    return data.jwt
}

export async function GET() {
    const results: { endpoint: string; status: number; hasData: boolean; sample?: any }[] = []

    try {
        const jwt = await getJwt()

        // Potential task/housekeeping endpoints to probe
        const endpoints = [
            `/hotel/${HOTEL_ID}/tasks`,
            `/hotel/${HOTEL_ID}/task-list`,
            `/hotel/${HOTEL_ID}/housekeeping`,
            `/hotel/${HOTEL_ID}/housekeeping-list`,
            `/hotel/${HOTEL_ID}/hk-status`,
            `/hotel/${HOTEL_ID}/guest-requests`,
            `/hotel/${HOTEL_ID}/guest-request-list`,
            `/hotel/${HOTEL_ID}/complaints`,
            `/hotel/${HOTEL_ID}/work-orders`,
            `/hotel/${HOTEL_ID}/maintenance`,
            `/hotel/${HOTEL_ID}/staff-tasks`,
            `/hotel/${HOTEL_ID}/room-status`,
            `/hotel/${HOTEL_ID}/room-status-list`,
            `/hotel/${HOTEL_ID}/minibar`,
            `/hotel/${HOTEL_ID}/lost-found`,
        ]

        for (const ep of endpoints) {
            try {
                const res = await fetch(`${API_BASE}${ep}`, {
                    headers: { 'Authorization': `Bearer ${jwt}` },
                    signal: AbortSignal.timeout(5000),
                })
                const hasData = res.ok
                let sample = null
                if (res.ok) {
                    try {
                        const body = await res.json()
                        sample = Array.isArray(body)
                            ? { count: body.length, firstItem: body[0] ? Object.keys(body[0]) : [] }
                            : { keys: Object.keys(body).slice(0, 10) }
                    } catch { sample = 'non-JSON response' }
                }
                results.push({ endpoint: ep, status: res.status, hasData, sample })
            } catch (err: any) {
                results.push({ endpoint: ep, status: 0, hasData: false, sample: err.message })
            }
        }

        const available = results.filter(r => r.hasData)
        return NextResponse.json({
            success: true,
            summary: `${available.length}/${results.length} endpoints responded with data`,
            available,
            unavailable: results.filter(r => !r.hasData),
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            results
        }, { status: 500 })
    }
}
