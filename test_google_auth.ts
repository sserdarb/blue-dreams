import { config } from 'dotenv';
config({ path: '.env' });

async function test() {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

    console.log("Client ID:", clientId ? "Set" : "Missing");
    console.log("Client Secret:", clientSecret ? "Set" : "Missing");
    console.log("Refresh Token:", refreshToken ? "Set" : "Missing");

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId || '',
            client_secret: clientSecret || '',
            refresh_token: refreshToken || '',
            grant_type: 'refresh_token'
        })
    });

    if (res.ok) {
        const data = await res.json();
        console.log("Success! Token received ending in:", data.access_token.slice(-10));
    } else {
        const text = await res.text();
        console.log("Error:", res.status, text);
    }
}
test();
