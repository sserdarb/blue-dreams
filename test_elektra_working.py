"""
Test working Elektra endpoints with proper parameters
"""
import requests, json

API = 'https://bookingapi.elektraweb.com'
HID = 33264

# Login
r = requests.post(f'{API}/login',
    json={'hotel-id': HID, 'usercode': 'asis', 'password': 'Bdr.2025'},
    headers={'Content-Type': 'application/json'}, timeout=10)
jwt = r.json()['jwt']
H = {'Content-Type': 'application/json', 'Authorization': f'Bearer {jwt}'}

results = []

# === Test 1: Reservation list with proper date params ===
print('Testing reservation-list...')
for status in ['Waiting', 'Reservation', 'InHouse', 'CheckOut', 'No Show', 'Cancelled']:
    r1 = requests.get(f'{API}/hotel/{HID}/reservation-list',
        params={
            'from-check-in': '2025-01-01 00:00:00',
            'to-check-in': '2026-12-31 23:59:59',
            'reservation-status': status
        },
        headers=H, timeout=15)
    text = r1.text[:1000]
    results.append(f'=== reservation-list (status={status}) — HTTP {r1.status_code} ===\n{text}\n')
    print(f'  {status}: {r1.status_code} — {len(r1.text)} bytes')

# === Test 2: Get Summer availability with prices ===
print('\nTesting summer availability with different currencies...')
for curr in ['TRY', 'EUR', 'USD']:
    r2 = requests.get(f'{API}/hotel/{HID}/availability',
        params={'currency': curr, 'fromdate': '2026-07-01', 'todate': '2026-07-07', 'adult': 2, 'child': 0},
        headers=H, timeout=15)
    results.append(f'=== availability (currency={curr}, july) — HTTP {r2.status_code} ===\n{r2.text[:1500]}\n')
    print(f'  {curr}: {r2.status_code} — {len(r2.text)} bytes')

# === Test 3: createReservation error details ===
print('\nTesting createReservation params...')
r3 = requests.post(f'{API}/hotel/{HID}/createReservation',
    json={},
    headers=H, timeout=15)
results.append(f'=== createReservation (empty body) — HTTP {r3.status_code} ===\n{r3.text[:2000]}\n')

# Minimal params
r3b = requests.post(f'{API}/hotel/{HID}/createReservation',
    json={
        'hotel-id': HID,
        'rate-type-id': 1,
        'board-type-id': 1,
        'room-type-id': 469700,
        'price-agency-id': 1,
    },
    headers=H, timeout=15)
results.append(f'=== createReservation (minimal) — HTTP {r3b.status_code} ===\n{r3b.text[:2000]}\n')

# === Test 4: More undiscovered endpoints ===
print('\nTesting additional patterns...')
extra_tests = [
    ('GET', f'/hotel/{HID}/rate-types'),
    ('GET', f'/hotel/{HID}/board-types'),
    ('GET', f'/hotel/{HID}/price-agencies'),
    ('GET', f'/hotel/{HID}/rate-plans'),
    ('GET', f'/hotel/{HID}/room-count'),
    ('GET', f'/hotel/{HID}/reservation-count'),
    ('GET', f'/hotel/{HID}/guest-list'),
    ('GET', f'/hotel/{HID}/booking-list'),
    ('GET', f'/hotel/{HID}/cancellation-policies'),
    ('GET', f'/hotel/{HID}/payment-types'),
    ('GET', f'/hotel/{HID}/min-price'),
    ('GET', f'/hotel/{HID}/folio'),
    ('POST', f'/hotel/{HID}/calculate-price', {'start-date':'2026-07-01','end-date':'2026-07-07','adult':2,'child':0,'room-type-id':469700}),
    ('POST', f'/hotel/{HID}/get-price', {'start-date':'2026-07-01','end-date':'2026-07-07','adult':2,'child':0,'room-type-id':469700}),
    ('POST', f'/hotel/{HID}/check-availability', {'start-date':'2026-07-01','end-date':'2026-07-07'}),
]

for ep in extra_tests:
    method = ep[0]
    path = ep[1]
    body = ep[2] if len(ep) > 2 else None
    try:
        if method == 'GET':
            resp = requests.get(f'{API}{path}', headers=H, timeout=10)
        else:
            resp = requests.post(f'{API}{path}', headers=H, json=body, timeout=10)
        status = resp.status_code
        if status != 404:
            results.append(f'=== {path} ({method}) — HTTP {status} ===\n{resp.text[:1000]}\n')
            print(f'  ** {path}: {status} (NON-404!)')
        else:
            print(f'  {path}: 404')
    except Exception as e:
        print(f'  {path}: ERROR {e}')

with open('elektra_working_endpoints.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))
print(f'\nResults written to elektra_working_endpoints.txt')
