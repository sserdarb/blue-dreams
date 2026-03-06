import fetch from 'node-fetch';

async function test() {
    const API_BASE = 'https://bookingapi.elektraweb.com';
    const HOTEL_ID = 33264;

    // Login
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'hotel-id': HOTEL_ID,
            'usercode': 'asis',
            'password': process.env.ELEKTRA_PASSWORD || 'E*+7548.A'
        })
    });

    const data = await res.json();
    const jwt = data.jwt;

    // Exchange Rates
    const rateRes = await fetch(`${API_BASE}/hotel/${HOTEL_ID}/exchangerates`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
    });

    const rates = await rateRes.json();
    console.log(JSON.stringify(rates, null, 2));
}

test();
