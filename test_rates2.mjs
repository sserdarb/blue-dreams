async function test() {
    console.log('Testing Elektra API...');
    const API_BASE = 'https://bookingapi.elektraweb.com';
    const HOTEL_ID = 33264;
    try {
        const payload = JSON.stringify({
            'hotel-id': HOTEL_ID,
            'usercode': 'asis',
            'password': process.env.ELEKTRA_PASSWORD || 'E*+7548.A'
        });
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });
        const dText = await res.text();
        console.log('Login Response:', dText);
    } catch (e) {
        console.error(e);
    }
}
test();
