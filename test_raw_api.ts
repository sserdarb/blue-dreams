import { config } from 'dotenv';
config({ path: '.env.local' });

async function test() {
    const HOTEL_ID = 33264;
    const USER_CODE = process.env.ELEKTRA_USER_CODE || 'asis';
    const PASSWORD = process.env.ELEKTRA_PASSWORD || '';

    // Login
    const resLogin = await fetch(`https://bookingapi.elektraweb.com/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'hotel-id': HOTEL_ID,
            'usercode': USER_CODE,
            'password': PASSWORD
        })
    });

    if (!resLogin.ok) {
        console.error("Login failed", await resLogin.text());
        return;
    }
    const body = await resLogin.json();
    const jwt = body.jwt;

    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 14);
    const checkInStr = checkIn.toISOString().split('T')[0];

    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);
    const checkOutStr = checkOut.toISOString().split('T')[0];

    const url = new URL(`https://bookingapi.elektraweb.com/hotel/${HOTEL_ID}/availability`);
    url.searchParams.set('currency', 'EUR'); // try EUR for direct comparison next
    url.searchParams.set('fromdate', checkInStr);
    url.searchParams.set('todate', checkOutStr);
    url.searchParams.set('adult', '2');
    url.searchParams.set('child', '0');
    url.searchParams.set('agency', 'HOTELWEB EUR');

    console.log("Checking:", url.toString());

    const res = await fetch(url.toString(), {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        }
    });

    if (res.ok) {
        const data = await res.json();
        console.log(`Found ${data.length} room/price options`);
        // Find unique room types in the output to show user contract result
        const summary = Array.from(new Set(data.map((d: any) => d['room-type'])));
        console.log("Available room types corresponding to this contract:", summary);

        if (data.length > 0) {
            console.log("Sample price for first night:", data[0]['base-price'] || data[0]['discounted-price'], "TRY");
        }
    } else {
        console.error("Availability mapping failed:", res.status, await res.text());
    }
}
test();
