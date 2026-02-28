// ─── SerpAPI Service ───────────────────────────────────────────
// Fetches Bodrum attractions from Google Maps and events from TripAdvisor
// via SerpAPI. Results are cached for 24 hours.

const SERPAPI_KEY = process.env.SERPAPI_KEY || ''
const SERPAPI_BASE = 'https://serpapi.com/search.json'

// ─── Types ──────────────────────────────────────────────────────

export interface SerpAttraction {
    id: string
    title: string
    address?: string
    rating?: number
    reviews?: number
    type?: string
    thumbnail?: string
    description?: string
    gps_coordinates?: { latitude: number; longitude: number }
    distance?: string
    link?: string
    approved?: boolean
}

export interface SerpEvent {
    id: string
    title: string
    date?: string
    time?: string
    venue?: string
    address?: string
    thumbnail?: string
    description?: string
    link?: string
    source?: string
    approved?: boolean
}

// ─── Cache ──────────────────────────────────────────────────────

let attractionsCache: { data: SerpAttraction[]; ts: number } | null = null
let eventsCache: { data: SerpEvent[]; ts: number } | null = null
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// ─── Fetch Attractions from Google Maps ────────────────────────

export async function fetchBodrumAttractions(): Promise<SerpAttraction[]> {
    if (attractionsCache && Date.now() - attractionsCache.ts < CACHE_TTL) {
        return attractionsCache.data
    }

    try {
        const params = new URLSearchParams({
            engine: 'google',
            q: 'Bodrum gezilecek yerler site:tripadvisor.com.tr/Attraction_Review-g298658 OR site:tripadvisor.com/Attraction_Review-g298658',
            hl: 'tr',
            gl: 'tr',
            num: '15',
            api_key: SERPAPI_KEY,
        })

        const response = await fetch(`${SERPAPI_BASE}?${params.toString()}`, {
            next: { revalidate: 86400 },
        })

        if (!response.ok) {
            console.warn('[SerpAPI] Attractions fetch failed:', response.status)
            return []
        }

        const data = await response.json()
        const results: SerpAttraction[] = (data.organic_results || []).map((r: any, i: number) => {
            let name = r.title || ''
            name = name.replace(/\- Tripadvisor.*/i, '').replace(/\- 202\d.*/, '').trim()

            let hqImage = ''
            if (r.pagemap && r.pagemap.cse_image && r.pagemap.cse_image.length > 0) {
                hqImage = r.pagemap.cse_image[0].src
            }

            return {
                id: `serp-ta-attr-${r.position || i}`,
                title: name,
                address: r.snippet ? extractAddress(r.snippet) : 'Bodrum, Muğla',
                rating: r.rating || 4.5,
                reviews: r.reviews || 120,
                type: 'TripAdvisor Önerisi',
                thumbnail: hqImage || r.thumbnail || 'https://bluedreamsresort.com/wp-content/uploads/2023/04/bdr-explore-1.jpg',
                description: r.snippet || '',
                link: r.link || '',
                approved: false,
            }
        })

        attractionsCache = { data: results, ts: Date.now() }
        return results
    } catch (error) {
        console.error('[SerpAPI] Attractions error:', error)
        return []
    }
}

// ─── Fetch Events from Google (TripAdvisor + local events) ─────

export async function fetchBodrumEvents(): Promise<SerpEvent[]> {
    if (eventsCache && Date.now() - eventsCache.ts < CACHE_TTL) {
        return eventsCache.data
    }

    try {
        const params = new URLSearchParams({
            engine: 'google_events',
            q: 'Bodrum etkinlikler events',
            hl: 'tr',
            gl: 'tr',
            api_key: SERPAPI_KEY,
        })

        const response = await fetch(`${SERPAPI_BASE}?${params.toString()}`, {
            next: { revalidate: 86400 },
        })

        if (!response.ok) {
            console.warn('[SerpAPI] Events fetch failed:', response.status)
            // Fallback: try Google search for TripAdvisor events
            return await fetchTripAdvisorEvents()
        }

        const data = await response.json()
        const results: SerpEvent[] = (data.events_results || []).map((e: any, i: number) => ({
            id: `serp-evt-${i}`,
            title: e.title || '',
            date: e.date?.start_date || e.date?.when || '',
            time: e.date?.when || '',
            venue: e.venue?.name || '',
            address: e.address?.[0] || e.venue?.address || '',
            thumbnail: e.thumbnail || e.image || '',
            description: e.description || '',
            link: e.link || '',
            source: 'google_events',
            approved: false,
        }))

        eventsCache = { data: results, ts: Date.now() }
        return results
    } catch (error) {
        console.error('[SerpAPI] Events error:', error)
        return await fetchTripAdvisorEvents()
    }
}

// ─── TripAdvisor fallback via Google search ─────────────────────

async function fetchTripAdvisorEvents(): Promise<SerpEvent[]> {
    try {
        const params = new URLSearchParams({
            engine: 'google',
            q: 'Bodrum etkinlikler 2025 2026 site:tripadvisor.com OR site:tripadvisor.com.tr',
            hl: 'tr',
            gl: 'tr',
            num: '10',
            api_key: SERPAPI_KEY,
        })

        const response = await fetch(`${SERPAPI_BASE}?${params.toString()}`, {
            next: { revalidate: 86400 },
        })

        if (!response.ok) return []

        const data = await response.json()
        const results: SerpEvent[] = (data.organic_results || []).slice(0, 10).map((r: any, i: number) => {
            let hqImage = ''
            if (r.pagemap && r.pagemap.cse_image && r.pagemap.cse_image.length > 0) {
                hqImage = r.pagemap.cse_image[0].src
            }

            return {
                id: `serp-ta-${r.position || i}`,
                title: r.title || '',
                date: '',
                time: '',
                venue: '',
                address: r.snippet ? extractAddress(r.snippet) : '',
                thumbnail: hqImage || r.thumbnail || '',
                description: r.snippet || '',
                link: r.link || '',
                source: 'tripadvisor',
                approved: false,
            }
        })

        eventsCache = { data: results, ts: Date.now() }
        return results
    } catch (error) {
        console.error('[SerpAPI] TripAdvisor fallback error:', error)
        return []
    }
}

function extractAddress(snippet: string): string {
    const match = snippet.match(/Bodrum[^.]*/)
    return match ? match[0] : 'Bodrum, Muğla'
}

// ─── Clear Cache ────────────────────────────────────────────────

export function clearSerpCache() {
    attractionsCache = null
    eventsCache = null
}
