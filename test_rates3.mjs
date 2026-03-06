async function test() {
    console.log('Testing Elektra API Rates...');
    const API_BASE = 'https://bookingapi.elektraweb.com';
    const HOTEL_ID = 33264;
    try {
        const payload = JSON.stringify({
            'hotel-id': HOTEL_ID,
            'usercode': 'asis',
            'password': process.env.ELEKTRA_PASSWORD
        });
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });
        const data = await res.json();

        const rateRes = await fetch(`${API_BASE}/hotel/${HOTEL_ID}/exchangerates`, {
            headers: { 'Authorization': 'Bearer ' + data.jwt }
        });
        const txt = await rateRes.text();
        console.log('Rates Body Format:', txt.substring(0, 100));
        try {
            const rates = JSON.parse(txt);
            console.log('EUR:', rates.find(r => r['currency-code'] === 'EUR'));
            console.log('USD:', rates.find(r => r['currency-code'] === 'USD'));
        } catch (e) { }
    } catch (e) {
        console.error(e);
    }
}
test();
