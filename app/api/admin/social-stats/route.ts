import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Environment API Keys
const SERPAPI_KEY = process.env.SERPAPI_KEY || ''
// Note: These tokens will be obtained in-system via OAuth if possible, or stored in generic site settings
// We simulate finding them in our prisma SiteSetting table.

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action') || 'all'

        // Retrieve stored tokens for Meta (match actual .env key names)
        const FB_PAGE_ID = process.env.FB_PAGE_ID
        const IG_ACC_ID = process.env.IG_ACCOUNT_ID
        const GRAPH_TOKEN = process.env.META_ACCESS_TOKEN

        let responsePayload: any = {}

        if (action === 'meta' || action === 'all') {
            if (!GRAPH_TOKEN || (!FB_PAGE_ID && !IG_ACC_ID)) {
                responsePayload.meta = { error: 'Meta API kimlik bilgileri Site Ayarlarında eksik.' }
            } else {
                // Fetch Meta basic data via simple FETCH calls
                try {
                    let fbData = null
                    let igData = null

                    if (FB_PAGE_ID) {
                        const fbRes = await fetch(`https://graph.facebook.com/v19.0/${FB_PAGE_ID}?fields=fan_count,followers_count,name&access_token=${GRAPH_TOKEN}`)
                        fbData = await fbRes.json()
                    }

                    if (IG_ACC_ID) {
                        const igRes = await fetch(`https://graph.facebook.com/v19.0/${IG_ACC_ID}?fields=followers_count,media_count,username&access_token=${GRAPH_TOKEN}`)
                        igData = await igRes.json()
                    }

                    responsePayload.meta = {
                        facebook: fbData,
                        instagram: igData
                    }

                } catch (metaErr: any) {
                    responsePayload.meta = { error: metaErr.message }
                }
            }
        }

        if (action === 'serp' || action === 'all') {
            if (!SERPAPI_KEY) {
                responsePayload.serp = { error: 'SerpAPI Anahtarı eksik (.env)' }
            } else {
                try {
                    // Search for "Bodrum Luxury Resort"
                    const serpRes = await fetch(`https://serpapi.com/search.json?engine=google&q=Bodrum+Luxury+Resort&gl=tr&hl=tr&api_key=${SERPAPI_KEY}`)
                    const serpData = await serpRes.json()

                    // Extract the organic results ranking of Blue Dreams
                    const organic = serpData.organic_results || []
                    const bluedreamsRank = organic.findIndex((r: any) => r.link && r.link.includes('bluedreamsresort'))

                    responsePayload.serp = {
                        organicKeyword: 'Bodrum Luxury Resort',
                        topOrganicPlaces: organic.slice(0, 3).map((o: any) => o.title),
                        ourRank: bluedreamsRank !== -1 ? bluedreamsRank + 1 : '10+' // Not in top 10 organically
                    }
                } catch (serpErr: any) {
                    responsePayload.serp = { error: serpErr.message }
                }
            }
        }

        return NextResponse.json(responsePayload)

    } catch (error: any) {
        console.error('Social Stats API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
