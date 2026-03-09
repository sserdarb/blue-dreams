// Test with wider date range and multiple statuses
async function main() {
    const API_BASE = 'https://bookingapi.elektraweb.com'
    const HOTEL_ID = 33264

    // Login
    const loginRes = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'hotel-id': HOTEL_ID, 'usercode': 'asis', 'password': 'Bdr.2025' })
    })
    const { jwt } = await loginRes.json()
    console.log('JWT ✅')

    // Try multiple statuses and wider date range
    const statuses = ['Reservation', 'InHouse', 'CheckOut', 'Waiting']
    const from = '2025-03-01'  // From March 2025
    const to = '2026-03-09'    // To today

    for (const status of statuses) {
        const url = `${API_BASE}/hotel/${HOTEL_ID}/reservation-list?from-check-in=${from}&to-check-in=${to}&reservation-status=${status}`
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${jwt}` }
        })
        if (!res.ok) { console.log(`${status}: HTTP ${res.status}`); continue }
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        console.log(`\n=== ${status}: ${list.length} reservations ===`)

        if (list.length > 0) {
            // Show first reservation structure for country
            const first = list[0]
            console.log('\nReservation-level keys:', Object.keys(first).filter(k =>
                k.toLowerCase().includes('country') || k.toLowerCase().includes('nation') ||
                k.toLowerCase().includes('guest') || k.toLowerCase().includes('contact')))

            const gl = first['guest-list'] || first['guestList'] || first['guests'] || []
            console.log('Guest list key:', first['guest-list'] ? 'guest-list' : (first['guestList'] ? 'guestList' : 'unknown'))
            console.log('Guest list length:', Array.isArray(gl) ? gl.length : typeof gl)

            if (Array.isArray(gl) && gl.length > 0) {
                console.log('\nAll guest keys:', Object.keys(gl[0]))
                console.log('FULL FIRST GUEST:', JSON.stringify(gl[0], null, 2))
            }

            // Show country data from first 10 reservations
            console.log('\n--- Country data from first 10 ---')
            for (const r of list.slice(0, 10)) {
                const guests = r['guest-list'] || r['guestList'] || []
                const guestCountry = Array.isArray(guests) && guests.length > 0
                    ? {
                        'country-id': guests[0]['country-id'],
                        'countryId': guests[0]['countryId'],
                        'country': guests[0]['country'],
                        'nation-id': guests[0]['nation-id'],
                        'NationId': guests[0]['NationId'],
                        'nationality': guests[0]['nationality'],
                        'nationality-id': guests[0]['nationality-id'],
                    }
                    : 'NO GUESTS'
                console.log(`  RezID: ${r['reservation-id']} | ${JSON.stringify(guestCountry)}`)
            }

            break // Just check first status that has results
        }
    }
}

main().catch(console.error)
