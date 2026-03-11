import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

// Google Ads OAuth yeniden yetkilendirme başlatma
export async function GET(request: Request) {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID
    if (!clientId) {
        return NextResponse.json({ error: 'GOOGLE_ADS_CLIENT_ID tanımlı değil' }, { status: 500 })
    }

    // Container içinde request.url localhost olarak görünür.
    // Gerçek public origin'i header'lardan veya env'den al.
    const headersList = await headers()
    const forwardedHost = headersList.get('x-forwarded-host') || headersList.get('host')
    const forwardedProto = headersList.get('x-forwarded-proto') || 'https'

    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin') ||
        (forwardedHost ? `${forwardedProto}://${forwardedHost}` : null) ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://new.bluedreamsresort.com'

    const redirectUri = `${origin}/api/admin/ads/oauth/callback`

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/adwords',
        access_type: 'offline',
        prompt: 'consent', // Force re-consent to get new refresh token
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    return NextResponse.json({ authUrl, redirectUri })
}
