import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_BASE = 'https://bookingapi.elektraweb.com';
const HOTEL_ID = 33264;
const USER_CODE = process.env.ELEKTRA_USER_CODE;
const PASSWORD = process.env.ELEKTRA_PASSWORD;

async function getJwt() {
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'hotel-id': HOTEL_ID,
            'usercode': USER_CODE,
            'password': PASSWORD
        })
    });
    const data = await res.json();
    return data.jwt;
}

async function test() {
    const jwt = await getJwt();
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 15);

    const startObj = {
        year: lastMonth.getFullYear(),
        month: lastMonth.getMonth() + 1,
        day: lastMonth.getDate()
    };

    const endObj = {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate()
    };

    console.log("Fetching...", startObj, endObj);
    const url = `${API_BASE}/hotel/${HOTEL_ID}/reservations?check-in=${encodeURIComponent(JSON.stringify(startObj))}&check-out=${encodeURIComponent(JSON.stringify(endObj))}&status=Reservation`;

    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${jwt}` } });
    const data = await res.json();

    const records = data.records || [];
    console.log("Records found:", records.length);

    if (records.length > 0) {
        // Find one with a foreign currency if possible
        const foreign = records.find(r => r.currency && r.currency !== 'TRY') || records[0];
        console.log("\n--- Sample Reservation Fields ---");
        console.log(JSON.stringify(foreign, null, 2));
    }
}
test();
