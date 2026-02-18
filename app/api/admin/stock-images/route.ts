import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'KiH3M94y82QVD5wyqnoxzEjy4bHdxTi5FBHtZeAWusfXGjzGMWTn8Y40'

export async function GET(request: Request) {
    // 1. Auth Check
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const page = searchParams.get('page') || '1'
    const per_page = searchParams.get('per_page') || '20'

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    try {
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}&locale=tr-TR`, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error('[Pexels Proxy] Error:', res.status, errorText)
            return NextResponse.json({ error: 'Failed to fetch images from Pexels' }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)

    } catch (error) {
        console.error('[Pexels Proxy] Exception:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
