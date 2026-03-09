import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE = 'https://hotel.api.elektraweb.com';

async function getJwt(): Promise<string> {
    const body = JSON.stringify({
        userCode: process.env.ELEKTRA_USER_CODE,
        password: process.env.ELEKTRA_PASSWORD,
        hotelId: parseInt(process.env.ELEKTRA_HOTEL_ID || '7187')
    });
    console.log('[test-raw] Logging in with:', process.env.ELEKTRA_USER_CODE);
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        cache: 'no-store'
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Login failed: ${res.status} - ${text}`);
    }
    const data = await res.json();
    return data.jwt;
}

export async function GET() {
    try {
        const jwt = await getJwt();
        const hotelId = process.env.ELEKTRA_HOTEL_ID || '7187';

        // Fetch just a small date range of reservations
        const from = '2026-03-01';
        const to = '2026-03-15';
        const url = `${API_BASE}/hotel/${hotelId}/reservation-list?from-check-in=${from}&to-check-in=${to}&reservation-status=Reservation`;

        const resResp = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            cache: 'no-store'
        });

        if (!resResp.ok) {
            return NextResponse.json({ error: `Reservation fetch failed: ${resResp.status}`, body: await resResp.text() });
        }

        const rawItems = await resResp.json();
        if (!Array.isArray(rawItems) || rawItems.length === 0) {
            return NextResponse.json({ error: 'No reservations found', total: 0 });
        }

        // Get ALL keys from first reservation
        const firstItem = rawItems[0];
        const allKeys = Object.keys(firstItem);

        // Get country-related keys from reservation level
        const countryKeys = allKeys.filter(k =>
            k.toLowerCase().includes('country') ||
            k.toLowerCase().includes('nation') ||
            k.toLowerCase().includes('ülke') ||
            k.toLowerCase().includes('ulke')
        );

        // Get full guest-list from first item
        const guestList = firstItem['guest-list'] || firstItem['guestList'] || firstItem['guests'] || [];
        const guestKeys = Array.isArray(guestList) && guestList.length > 0 ? Object.keys(guestList[0]) : [];
        const guestCountryKeys = guestKeys.filter(k =>
            k.toLowerCase().includes('country') ||
            k.toLowerCase().includes('nation') ||
            k.toLowerCase().includes('ülke') ||
            k.toLowerCase().includes('ulke')
        );

        // Extract country-related values from first 5 reservations
        const countryValues = rawItems.slice(0, 5).map((item: any, i: number) => {
            const guests = item['guest-list'] || [];
            const guestCountryData: Record<string, any> = {};
            if (Array.isArray(guests) && guests.length > 0) {
                for (const k of guestKeys) {
                    if (k.toLowerCase().includes('country') || k.toLowerCase().includes('nation') || k.toLowerCase().includes('id')) {
                        guestCountryData[k] = guests[0][k];
                    }
                }
            }

            const reservationCountryData: Record<string, any> = {};
            for (const k of allKeys) {
                if (k.toLowerCase().includes('country') || k.toLowerCase().includes('nation')) {
                    reservationCountryData[k] = item[k];
                }
            }

            return {
                index: i,
                agency: item['agency'],
                reservationCountryData,
                guestCountryData,
                guestCount: Array.isArray(guests) ? guests.length : 0
            };
        });

        // Also fetch countries list
        let countrySample: any = 'fetch failed';
        try {
            const cResp = await fetch(`${API_BASE}/countries`, {
                headers: { 'Authorization': `Bearer ${jwt}` },
                cache: 'no-store'
            });
            if (cResp.ok) {
                const cData = await cResp.json();
                const list = Array.isArray(cData) ? cData : (cData?.result || cData?.data || []);
                countrySample = Array.isArray(list) ? list.slice(0, 5) : 'not array';
            }
        } catch (e) {
            countrySample = 'error fetching';
        }

        return NextResponse.json({
            totalReservations: rawItems.length,
            allReservationKeys: allKeys,
            countryRelatedKeysAtReservationLevel: countryKeys,
            allGuestKeys: guestKeys,
            countryRelatedKeysAtGuestLevel: guestCountryKeys,
            countryValues,
            countrySample,
            rawFirstGuestList: Array.isArray(guestList) ? guestList.slice(0, 1) : guestList
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
