import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID

    // Fallback if client ID is missing across the board
    if (!clientId) {
        return NextResponse.redirect(new URL('/tr/admin/tasks/mail?error=missing_client_id', request.url))
    }

    const host = request.headers.get('host')
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const redirectUri = `${protocol}://${host}/api/auth/google/tasks/callback`

    const scope = encodeURIComponent('https://mail.google.com/ https://www.googleapis.com/auth/gmail.readonly')
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`

    return NextResponse.redirect(url)
}
