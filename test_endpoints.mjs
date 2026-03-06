async function test() {
    const API_BASE = 'https://bookingapi.elektraweb.com';
    const HOTEL_ID = 33264;
    const authRes = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'hotel-id': HOTEL_ID, 'usercode': 'asis', 'password': process.env.ELEKTRA_PASSWORD
        })
    });
    const auth = await authRes.json();

    const endpoints = [
        `/hotel/${HOTEL_ID}/exchangerate`,
        `/hotel/${HOTEL_ID}/ExchangeRates`,
        `/exchangerates`,
        `/exchangerates/${HOTEL_ID}`,
        `/currencies`,
        `/System/exchangerate`,
        `/System/exchangerates`,
        `/hotel/${HOTEL_ID}/currency`,
    ];

    for (const ep of endpoints) {
        try {
            const res = await fetch(API_BASE + ep, { headers: { 'Authorization': 'Bearer ' + auth.jwt } });
            console.log(ep, res.status);
            if (res.status === 200) {
                const head = await res.text();
                if (head.startsWith('[')) console.log(`Found JSON array! at ${ep}`);
                if (head.startsWith('{')) console.log(`Found JSON obj! at ${ep}`);
            }
        } catch (e) { }
    }
}
test();
