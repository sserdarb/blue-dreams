import { prisma } from '@/lib/prisma'
import { ApifyClient } from 'apify-client'
import { scraperCache } from '@/lib/utils/api-cache'

export interface FlightData {
    origin: string
    destination: string
    date: string
    airline: string
    price: number
    currency: string
    duration: string
    stops: number
}

export interface CompetitorRate {
    hotelName: string
    platform: 'Booking.com' | 'Expedia' | 'Hotel Website'
    checkIn: string
    price: number
    currency: string
    roomType: string
    score: number
}

export interface MarketDemand {
    date: string
    searchVolume: 'Low' | 'Medium' | 'High' | 'Very High'
    events: string[]
}

export class ScraperService {
    /**
     * Simulates scraping flight data from major hubs to Bodrum (BJV)
     */
    static async getFlightData(date: string): Promise<FlightData[]> {
        // Mock data generator for flights
        // In production, this would connect to a flight aggregator API or scraper
        const origins = ['IST', 'SAW', 'LGW', 'FRA', 'MUC', 'AMS']
        const airlines = ['THY', 'Pegasus', 'EasyJet', 'Lufthansa']

        return origins.map(origin => ({
            origin,
            destination: 'BJV',
            date,
            airline: airlines[Math.floor(Math.random() * airlines.length)],
            price: Math.floor(Math.random() * (300 - 50) + 50), // 50-300 EUR
            currency: 'EUR',
            duration: `${Math.floor(Math.random() * 3) + 1}h ${Math.floor(Math.random() * 50)}m`,
            stops: Math.random() > 0.8 ? 1 : 0
        }))
    }

    /**
     * Scrapes competitor rates using Apify (voyager/booking-scraper or similar)
     * Falls back to simulated data if the API limit is reached or execution fails.
     */
    static async getCompetitorRates(checkIn: string): Promise<CompetitorRate[]> {
        const cacheKey = `scraper:competitors:${checkIn}`
        return scraperCache.getOrFetch(cacheKey, async () => {
        const competitors = [
            { name: 'Rixos Premium Bodrum', score: 9.1 },
            { name: 'Vogue Hotel Supreme', score: 8.8 },
            { name: 'Titanic Luxury Collection', score: 9.0 },
            { name: 'Lujo Hotel', score: 9.4 }
        ]

        try {
            console.log(`[Scraper API] Starting Apify run for competitor rates at ${checkIn}...`)
            const client = new ApifyClient({
                token: process.env.APIFY_API_TOKEN,
            });

            // Calculate check-out (1 night stay for baseline rate)
            const checkInDate = new Date(checkIn)
            const checkOutDate = new Date(checkInDate)
            checkOutDate.setDate(checkOutDate.getDate() + 1)
            const checkOut = checkOutDate.toISOString().split('T')[0]

            // Start the Apify Actor (booking.com scraper)
            // Using a generic lightweight configuration to avoid long execution times
            const run = await client.actor("voyager/booking-scraper").call({
                search: "Bodrum",
                destType: "city",
                checkIn: checkIn,
                checkOut: checkOut,
                rooms: 1,
                adults: 2,
                currency: "EUR",
                language: "en-us",
                maxPages: 1 // Keep it fast, only first page of results
            });

            console.log(`[Scraper API] Apify run completed. Fetching dataset: ${run.defaultDatasetId}`)
            const { items } = await client.dataset(run.defaultDatasetId).listItems();

            if (items && items.length > 0) {
                const rates: CompetitorRate[] = []
                const targetNames = competitors.map(c => c.name.toLowerCase())

                items.forEach((item: any) => {
                    const itemName = (item.name || item.hotelName || '').toLowerCase()
                    // If it's one of our target competitors (fuzzy match)
                    const matchedComp = competitors.find(c => itemName.includes(c.name.toLowerCase().replace(' hotel', '')))

                    if (matchedComp || item.rating >= 8.5) { // Also include high-rated generic competitors if exact match fails
                        rates.push({
                            hotelName: matchedComp ? matchedComp.name : (item.name || item.hotelName),
                            platform: 'Booking.com',
                            checkIn,
                            price: item.price || item.priceAmount || Math.floor(Math.random() * (800 - 300) + 300),
                            currency: item.currency || 'EUR',
                            roomType: item.roomType || 'Standard Room',
                            score: item.rating || item.score || (matchedComp ? matchedComp.score : 8.5)
                        })
                    }
                })

                if (rates.length > 0) {
                    return rates.sort((a, b) => a.price - b.price).slice(0, 10) // Return top 10 relevant
                }
            }
            console.log('[Scraper API] Apify returned empty or non-matching results. Falling back to simulation.')
        } catch (error) {
            console.error('[Scraper API] Apify integration error:', error)
            console.log('[Scraper API] Falling back to competitor rate simulation...')
        }

        // Fallback to simulation
        const platforms: ('Booking.com' | 'Expedia')[] = ['Booking.com', 'Expedia']
        const rates: CompetitorRate[] = []

        competitors.forEach(comp => {
            const count = Math.floor(Math.random() * 2) + 1
            for (let i = 0; i < count; i++) {
                rates.push({
                    hotelName: comp.name,
                    platform: platforms[Math.floor(Math.random() * platforms.length)],
                    checkIn,
                    price: Math.floor(Math.random() * (800 - 300) + 300),
                    currency: 'EUR',
                    roomType: 'Standard Room',
                    score: comp.score
                })
            }
        })

        return rates.sort((a, b) => a.price - b.price)
        }, 120)
    }

    /**
     * Simulates fetching market demand signals (Google Trends, regional events)
     */
    static async getMarketDemand(date: string): Promise<MarketDemand> {
        const volumes: MarketDemand['searchVolume'][] = ['Low', 'Medium', 'High', 'Very High']
        const eventsList = [
            'Bodrum Jazz Festival',
            'Local Concert',
            'International Regatta',
            'Public Holiday',
            'Weekend Gateway'
        ]

        const isHighSeason = new Date(date).getMonth() >= 5 && new Date(date).getMonth() <= 8; // Jun-Sep

        return {
            date,
            searchVolume: isHighSeason ? volumes[Math.floor(Math.random() * 2) + 2] : volumes[Math.floor(Math.random() * 3)],
            events: Math.random() > 0.7 ? [eventsList[Math.floor(Math.random() * eventsList.length)]] : []
        }
    }

    /**
     * Aggregates all external data for the Yield Analysis AI
     */
    static async getExternalMarketData(date: string) {
        const [flights, competitors, demand] = await Promise.all([
            this.getFlightData(date),
            this.getCompetitorRates(date),
            this.getMarketDemand(date)
        ])

        return {
            flights,
            competitors,
            demand,
            lastUpdated: new Date().toISOString()
        }
    }

    static clearCache(): void {
        scraperCache.invalidatePrefix('scraper:')
    }
}
