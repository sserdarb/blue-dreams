import { prisma } from '@/lib/prisma'

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
     * Simulates scraping competitor rates for the same dates
     */
    static async getCompetitorRates(checkIn: string): Promise<CompetitorRate[]> {
        const competitors = [
            { name: 'Rixos Premium Bodrum', score: 9.1 },
            { name: 'Vogue Hotel Supreme', score: 8.8 },
            { name: 'Titanic Luxury Collection', score: 9.0 },
            { name: 'Lujo Hotel', score: 9.4 }
        ]

        const platforms: ('Booking.com' | 'Expedia')[] = ['Booking.com', 'Expedia']

        const rates: CompetitorRate[] = []

        competitors.forEach(comp => {
            // Generate 1-2 rates per competitor
            const count = Math.floor(Math.random() * 2) + 1
            for (let i = 0; i < count; i++) {
                rates.push({
                    hotelName: comp.name,
                    platform: platforms[Math.floor(Math.random() * platforms.length)],
                    checkIn,
                    price: Math.floor(Math.random() * (800 - 300) + 300), // 300-800 EUR
                    currency: 'EUR',
                    roomType: 'Standard Room',
                    score: comp.score
                })
            }
        })

        return rates.sort((a, b) => a.price - b.price)
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
}
