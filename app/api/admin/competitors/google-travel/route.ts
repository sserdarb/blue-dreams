import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { isAuthenticated } from '@/app/actions/auth';
import { prisma as db } from '@/lib/prisma';

const APIFY_TOKEN = process.env.APIFY_API_KEY || '';
const client = new ApifyClient({ token: APIFY_TOKEN });

// Competitor hotels with their Google Travel / Google Hotels search terms
const COMPETITORS = [
    { name: "Blue Dreams Resort", query: "Blue Dreams Resort Bodrum" },
    { name: "Duja Bodrum", query: "Duja Bodrum Hotel" },
    { name: "La Blanche Resort", query: "La Blanche Resort Bodrum" },
    { name: "Samara Hotel Bodrum", query: "Samara Hotel Bodrum" },
    { name: "Kefaluka Resort", query: "Kefaluka Resort Bodrum" }
];

// Generate monthly check-in dates for the full hotel season (April–November)
function getSeasonDates(year: number): { checkIn: string; checkOut: string; month: string }[] {
    const months = [];
    for (let m = 3; m <= 10; m++) { // April (3) to November (10)
        const checkIn = new Date(year, m, 15); // Mid-month sample
        const checkOut = new Date(year, m, 17); // 2-night stay
        months.push({
            checkIn: checkIn.toISOString().split('T')[0],
            checkOut: checkOut.toISOString().split('T')[0],
            month: checkIn.toLocaleString('en', { month: 'short', year: 'numeric' })
        });
    }
    return months;
}

async function scrapeGoogleTravel(query: string, checkIn: string, checkOut: string, currency: string = 'EUR') {
    try {
        // Try Google Hotels scraper actors (common Apify actors for Google Travel)
        // We use "dtrungtin/google-hotels-scraper" or "voyager/google-hotels-scraper"
        const actorId = 'voyager/google-hotels-scraper';

        const input = {
            queries: [query],
            checkInDate: checkIn,
            checkOutDate: checkOut,
            adults: 2,
            currency: currency.toUpperCase(),
            maxResults: 1,
            language: 'en',
        };

        console.log(`[GoogleTravel] Scraping ${query} for ${checkIn}→${checkOut}`);

        const run = await client.actor(actorId).call(input, {
            waitSecs: 90,
            memory: 256,
        });

        if (run.status === 'SUCCEEDED' || run.status === 'READY') {
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            if (items && items.length > 0) {
                const hotel = items[0] as any;
                return {
                    price: hotel.price || hotel.minPrice || hotel.ratePerNight || 0,
                    currency: hotel.currency || currency,
                    rating: hotel.rating || hotel.overallRating || 0,
                    available: hotel.price > 0 || hotel.available !== false,
                    source: 'google-travel',
                    raw: hotel,
                };
            }
        }
    } catch (err: any) {
        // If the specific actor doesn't exist, try a Booking.com fallback
        console.warn(`[GoogleTravel] Actor failed for ${query}:`, err.message);
        try {
            // Fallback: use the existing booking-scraper
            const fallbackInput = {
                search: query,
                checkIn: checkIn,
                checkOut: checkOut,
                rooms: 1,
                adults: 2,
                currency: currency,
                language: "en-us",
                maxItems: 1
            };

            const run = await client.actor("epctex/booking-scraper").call(fallbackInput, { waitSecs: 60 });
            if (run.status === 'SUCCEEDED' || run.status === 'READY') {
                const { items } = await client.dataset(run.defaultDatasetId).listItems();
                if (items && items.length > 0) {
                    const hotel = items[0] as any;
                    const price = hotel.price || hotel.priceAmount || hotel.price_min || 0;
                    let parsedPrice = 0;
                    if (typeof price === 'number') parsedPrice = price;
                    else if (typeof price === 'string') {
                        const match = price.replace(/\./g, '').match(/\d+/);
                        if (match) parsedPrice = parseInt(match[0], 10);
                    }
                    return {
                        price: parsedPrice,
                        currency,
                        rating: hotel.rating || hotel.reviewScore || 0,
                        available: parsedPrice > 0,
                        source: 'booking-fallback',
                        raw: hotel,
                    };
                }
            }
        } catch (fallbackErr) {
            console.error(`[GoogleTravel] Booking fallback also failed for ${query}:`, fallbackErr);
        }
    }

    return { price: 0, currency, rating: 0, available: false, source: 'none', raw: null };
}

export async function POST(req: Request) {
    try {
        const isAuthed = await isAuthenticated();
        if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const {
            currency = 'EUR',
            competitors = COMPETITORS.map(c => c.name),
            year = new Date().getFullYear(),
            mode = 'season' // 'season' for full season, 'single' for single date
        } = body;

        const targetCompetitors = COMPETITORS.filter(c => competitors.includes(c.name));
        // Add dynamic competitors
        for (const name of competitors) {
            if (!targetCompetitors.find(c => c.name === name)) {
                targetCompetitors.push({ name, query: `${name} Bodrum` });
            }
        }

        if (mode === 'single') {
            // Single date check
            const { checkIn, checkOut } = body;
            const date = checkIn || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
            const d = new Date(date);
            const co = checkOut || new Date(d.getTime() + 2 * 86400000).toISOString().split('T')[0];

            const results = await Promise.all(
                targetCompetitors.map(async comp => {
                    const data = await scrapeGoogleTravel(comp.query, date, co, currency);
                    return { name: comp.name, ...data, checkIn: date, checkOut: co };
                })
            );

            return NextResponse.json({ success: true, mode: 'single', data: results });
        }

        // Full season mode - scrape monthly prices for the entire hotel season
        const seasonDates = getSeasonDates(year);
        console.log(`[GoogleTravel] Starting full season scrape: ${seasonDates.length} months × ${targetCompetitors.length} hotels`);

        const seasonData: any[] = [];

        // Process sequentially by month to avoid rate limits, but hotels in parallel per month
        for (const dateSlot of seasonDates) {
            const monthResults = await Promise.all(
                targetCompetitors.map(async comp => {
                    const data = await scrapeGoogleTravel(comp.query, dateSlot.checkIn, dateSlot.checkOut, currency);
                    return {
                        name: comp.name,
                        month: dateSlot.month,
                        checkIn: dateSlot.checkIn,
                        price: data.price,
                        currency: data.currency,
                        available: data.available,
                        rating: data.rating,
                        source: data.source,
                    };
                })
            );

            seasonData.push(...monthResults);

            // Store in DB for historical tracking
            for (const result of monthResults) {
                if (result.price <= 0) continue;
                try {
                    await db.competitorPrice.create({
                        data: {
                            competitorName: result.name,
                            checkInDate: new Date(result.checkIn),
                            price: result.price,
                            currency: result.currency,
                        }
                    });
                } catch (dbErr) {
                    console.error(`[GoogleTravel] DB save failed:`, dbErr);
                }
            }
        }

        // Pivot data for easy frontend consumption: { month, Hotel1, Hotel2, ... }
        const pivoted: Record<string, any>[] = [];
        const monthGroups = new Map<string, Record<string, any>>();
        for (const item of seasonData) {
            if (!monthGroups.has(item.month)) {
                monthGroups.set(item.month, { month: item.month });
            }
            const row = monthGroups.get(item.month)!;
            row[item.name] = item.price;
            row[`${item.name}_available`] = item.available;
        }
        for (const row of monthGroups.values()) pivoted.push(row);

        console.log(`[GoogleTravel] Season scrape complete: ${seasonData.length} data points`);

        return NextResponse.json({
            success: true,
            mode: 'season',
            year,
            currency,
            seasonData,
            pivoted,
            competitors: targetCompetitors.map(c => c.name),
        });

    } catch (error) {
        console.error('API /api/admin/competitors/google-travel POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
