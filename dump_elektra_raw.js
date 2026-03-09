const https = require('https');

function httpReq(opts, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve(JSON.parse(d)); } catch (e) { resolve(d); }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    // Login
    const loginBody = JSON.stringify({ userCode: 'asis', password: 'Bdr.2025', hotelId: 7187 });
    const jwt = (await httpReq({
        hostname: 'hotel.api.elektraweb.com',
        path: '/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': loginBody.length }
    }, loginBody)).jwt;

    console.log('JWT obtained:', jwt ? jwt.substring(0, 20) + '...' : 'FAILED');

    // Fetch reservation-list (small range)
    const path = '/hotel/7187/reservation-list?from-check-in=2026-03-01&to-check-in=2026-03-15&reservation-status=Reservation';
    const items = await httpReq({
        hostname: 'hotel.api.elektraweb.com',
        path: path,
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + jwt, 'Content-Type': 'application/json' }
    });

    if (!Array.isArray(items) || items.length === 0) {
        console.log('No reservations found or error:', typeof items === 'string' ? items.substring(0, 200) : JSON.stringify(items).substring(0, 200));
        return;
    }

    console.log('Total reservations:', items.length);

    // Print ALL keys from first reservation
    const first = items[0];
    console.log('\n=== RESERVATION LEVEL KEYS ===');
    Object.keys(first).forEach(k => {
        const v = first[k];
        if (Array.isArray(v)) {
            console.log('  ' + k + ': [Array of ' + v.length + ']');
        } else {
            console.log('  ' + k + ': ' + JSON.stringify(v));
        }
    });

    // Print guest-list details
    const gl = first['guest-list'] || first['guestList'] || first['guests'] || [];
    if (Array.isArray(gl) && gl.length > 0) {
        console.log('\n=== GUEST-LIST[0] ALL FIELDS ===');
        Object.keys(gl[0]).forEach(k => {
            console.log('  ' + k + ': ' + JSON.stringify(gl[0][k]));
        });
    } else {
        console.log('\nNo guest-list found');
    }

    // Print country-related fields from first 5 reservations
    console.log('\n=== COUNTRY DATA FROM FIRST 5 RESERVATIONS ===');
    items.slice(0, 5).forEach((item, i) => {
        const countryFields = {};
        Object.keys(item).forEach(k => {
            if (k.toLowerCase().includes('country') || k.toLowerCase().includes('nation')) {
                countryFields[k] = item[k];
            }
        });
        const guests = item['guest-list'] || [];
        const guestCountry = {};
        if (Array.isArray(guests) && guests.length > 0) {
            Object.keys(guests[0]).forEach(k => {
                if (k.toLowerCase().includes('country') || k.toLowerCase().includes('nation') || k.toLowerCase().includes('id')) {
                    guestCountry[k] = guests[0][k];
                }
            });
        }
        console.log('  Res#' + i + ' agency=' + item['agency'] + ' resCountry=' + JSON.stringify(countryFields) + ' guestCountry=' + JSON.stringify(guestCountry));
    });

    // Fetch countries
    const countries = await httpReq({
        hostname: 'hotel.api.elektraweb.com',
        path: '/countries',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + jwt }
    });

    const countryList = Array.isArray(countries) ? countries : (countries.result || countries.data || []);
    console.log('\n=== COUNTRIES (first 3) ===');
    console.log(JSON.stringify(countryList.slice(0, 3), null, 2));
    console.log('Total countries:', countryList.length);
}

main().catch(e => console.error('Error:', e.message));
