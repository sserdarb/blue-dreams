import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { isAuthenticated } from '@/app/actions/auth';
import { prisma as db } from '@/lib/prisma';

const APIFY_TOKEN = process.env.APIFY_API_KEY || '';
const client = new ApifyClient({ token: APIFY_TOKEN });

const COMPETITORS = [
    { name: "Blue Dreams Resort", search: "Blue Dreams Resort Bodrum" },
    { name: "Duja Bodrum", search: "Duja Bodrum" },
    { name: "La Blanche Resort", search: "La Blanche Resort Bodrum" },
    { name: "Samara Hotel Bodrum", search: "Samara Hotel Bodrum" },
    { name: "Kefaluka Resort", search: "Kefaluka Resort" }
];

async function fetchCompetitorPrice(competitor: any, checkin: string, checkout: string, currency: string) {
    try {
        console.log(`[Apify] Fetching live price for ${competitor.name}...`);

        // We use epctex/booking-scraper
        const input = {
            search: competitor.search,
            checkIn: checkin,
            checkOut: checkout,
            rooms: 1,
            adults: 2,
            currency: currency,
            language: "tr-tr",
            maxItems: 1
        };

        const run = await client.actor("epctex/booking-scraper").call(input, { waitSecs: 60 });

        if (run.status === 'SUCCEEDED' || run.status === 'READY') {
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            if (items && items.length > 0) {
                const bestItem = items[0] as any;
                // Assuming price is exposed as Price, priceAmount, price, or similar
                const price = bestItem.price || bestItem.priceAmount || bestItem.price_min || bestItem.price_amount || 0;
                console.log(`[Apify] Success ${competitor.name}: ${price}`);

                // Extract lowest room price using regex if it's a formatted string like "TL 5.430"
                let parsedPrice = 0;
                if (typeof price === 'number') parsedPrice = price;
                else if (typeof price === 'string') {
                    const match = price.replace(/\./g, '').match(/\d+/);
                    if (match) parsedPrice = parseInt(match[0], 10);
                }

                return { name: competitor.name, livePrice: parsedPrice || 0, rawData: bestItem };
            }
        }

    } catch (e) {
        console.error(`[Apify] Error scraping ${competitor.name}:`, e);
    }

    return { name: competitor.name, livePrice: 0, error: true };
}

export async function POST(req: Request) {
    try {
        const isAuthed = await isAuthenticated();
        if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { checkIn, checkOut, currency = "EUR", competitors = [] } = body;

        let date = checkIn || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        let d = new Date(date);
        let checkoutDate = checkOut || new Date(d.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        let targetCompetitors = COMPETITORS;
        if (competitors && competitors.length > 0) {
            targetCompetitors = COMPETITORS.filter(c => competitors.includes(c.name));
            // Add dynamic competitors if not in hardcoded list
            for (const name of competitors) {
                if (!targetCompetitors.find(c => c.name === name)) {
                    targetCompetitors.push({ name, search: `${name} Bodrum` });
                }
            }
        }

        // Fetch all competitors in parallel
        console.log(`[Apify] Starting scraping job for ${date} to ${checkoutDate} in ${currency}`);

        const results = await Promise.all(
            targetCompetitors.map(comp => fetchCompetitorPrice(comp, date, checkoutDate, currency))
        );

        // Store into DB for historical analysis and tracking
        for (const res of results) {
            if (!res || !res.name || res.error || (res.livePrice as number) <= 0) continue;
            try {
                await db.competitorPrice.create({
                    data: {
                        competitorName: res.name as string,
                        checkInDate: new Date(date),
                        price: res.livePrice,
                        currency: currency,
                    }
                });
            } catch (err) {
                console.error(`[Apify] DB save failed for ${res.name}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            date,
            checkoutDate,
            currency,
            liveData: results
        });

    } catch (error) {
        console.error('API /api/admin/competitors/apify POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
