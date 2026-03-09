import { config } from 'dotenv';
config({ path: '.env.local' });

async function test() {
    const HOTEL_ID = 33264;
    const USER_CODE = process.env.ELEKTRA_USER_CODE || 'asis';
    const PASSWORD = process.env.ELEKTRA_PASSWORD || '';

    console.log(`Trying login with code [${USER_CODE}] pass [${PASSWORD}] hotel [${HOTEL_ID}]`);

    const res = await fetch(`https://bookingapi.elektraweb.com/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'hotel-id': HOTEL_ID,
            'usercode': USER_CODE,
            'password': PASSWORD
        })
    });

    if (res.ok) {
        const body = await res.json();
        console.log("Success:", JSON.stringify(body).slice(0, 150));
    } else {
        const text = await res.text();
        console.error("Failed:", res.status, text);
    }
}
test();
