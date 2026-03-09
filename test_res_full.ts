async function main() {
    const API_BASE = 'https://bookingapi.elektraweb.com'
    const HOTEL_ID = 33264

    const loginRes = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'hotel-id': HOTEL_ID, 'usercode': 'asis', 'password': 'Bdr.2025' })
    })
    const { jwt } = await loginRes.json()

    const url = `${API_BASE}/hotel/${HOTEL_ID}/reservation-list?from-check-in=2025-03-01&to-check-in=2026-03-09&reservation-status=CheckOut`
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${jwt}` } })
    const list = await res.json()

    if (list && list.length > 0) {
        console.log("Full Object keys:", Object.keys(list[0]))
        console.log(JSON.stringify(list[0], null, 2))
    } else {
        console.log("No reservations found for that date.")
    }
}

main().catch(console.error)
