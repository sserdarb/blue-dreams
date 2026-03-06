import fetch from 'node-fetch';

async function test() {
    console.log('Testing Elektra API...');
    const API_BASE = 'https://bookingapi.elektraweb.com';
    const HOTEL_ID = 33264;
    try {
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
        console.log('Login successful, JWT:', data.jwt.substring(0, 10) + '...');

        const rateRes = await fetch(`${API_BASE}/hotel/${HOTEL_ID}/exchangerates`, {
            headers: { 'Authorization': 'Bearer ' + data.jwt }
        });
        console.log('ExCh Rate Status:', rateRes.status);
        const rates = await rateRes.json();
        console.log('Rates returned:', rates.length);
        console.log(rates.find((r: any) => r['currency-code'] === 'EUR'));
    } catch (e) {
        console.error(e);
    }
}
test();
