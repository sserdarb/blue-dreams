import { NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'

function extractText(html: string) {
    // Basic dependency-free HTML to Text extraction
    let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    clean = clean.replace(/<[^>]+>/g, ' ')
    return clean.replace(/\s+/g, ' ').trim()
}

export async function POST(request: Request) {
    try {
        const { url } = await request.json()
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        console.log(`[CMS Scrape] Attempting to scrape: ${url}`)

        // 1. Try a standard fetch first (fastest)
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 8000)

            const res = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
                }
            })
            clearTimeout(timeoutId)

            if (res.ok) {
                const html = await res.text()
                const text = extractText(html)
                if (text.length > 300) {
                    console.log(`[CMS Scrape] Success via fetch: ${text.length} chars extracted.`)
                    // Take up to 6000 chars to avoid prompt overflow
                    return NextResponse.json({ text: text.substring(0, 6000) })
                }
            }
        } catch (fetchError) {
            console.warn(`[CMS Scrape] Standard fetch failed, falling back to Apify.`, fetchError)
        }

        // 2. Fallback to Apify Website Content Crawler (bypasses anti-bot)
        if (process.env.APIFY_API_TOKEN) {
            console.log(`[CMS Scrape] Using Apify fallback...`)
            const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN })
            const run = await client.actor("apify/website-content-crawler").call({
                startUrls: [{ url }],
                maxCrawlPages: 1,
                crawlerType: 'cheerio'
            })

            const { items } = await client.dataset(run.defaultDatasetId).listItems()
            const itemsArr = items as any[]
            if (itemsArr && itemsArr.length > 0) {
                const item: any = itemsArr[0]
                const text = typeof item.text === 'string' ? item.text : (typeof item.markdown === 'string' ? item.markdown : '')
                console.log(`[CMS Scrape] Success via Apify: ${text.length} chars extracted.`)
                return NextResponse.json({ text: text.substring(0, 6000) })
            }
        }

        return NextResponse.json({ text: '', warning: 'Could not extract significant text from URL.' })

    } catch (error: any) {
        console.error('[CMS Scrape] Error:', error)
        return NextResponse.json({ error: error.message || 'Scraping failed' }, { status: 500 })
    }
}
