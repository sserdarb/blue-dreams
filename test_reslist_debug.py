"""
Test reservation-list with URL-encoded dates and alternate formats
"""
import requests, json
from urllib.parse import quote

API = 'https://bookingapi.elektraweb.com'
HID = 33264

# Login
r = requests.post(f'{API}/login',
    json={'hotel-id': HID, 'usercode': 'asis', 'password': 'Bdr.2025'},
    headers={'Content-Type': 'application/json'}, timeout=10)
jwt = r.json()['jwt']
H = {'Content-Type': 'application/json', 'Authorization': f'Bearer {jwt}'}

results = []

# Try different date formats
date_formats = [
    ('URL-encoded space', '2026-01-01%2000:00:00', '2026-12-31%2023:59:59'),
    ('Plus encoded', '2026-01-01+00:00:00', '2026-12-31+23:59:59'),
    ('T separator', '2026-01-01T00:00:00', '2026-12-31T23:59:59'),
    ('Date only', '2026-01-01', '2026-12-31'),
    ('Short time', '2026-01-01 00:00', '2026-12-31 23:59'),
]

for label, from_d, to_d in date_formats:
    # Try manually constructing URL to control encoding
    url = f'{API}/hotel/{HID}/reservation-list?from-check-in={from_d}&to-check-in={to_d}&reservation-status=Reservation'
    r1 = requests.get(url, headers=H, timeout=15)
    results.append(f'=== {label} — HTTP {r1.status_code} ===')
    results.append(f'URL: {url}')
    results.append(r1.text[:500])
    results.append('')
    print(f'  {label}: HTTP {r1.status_code} — {len(r1.text)} bytes')
    if r1.status_code == 200:
        try:
            data = r1.json()
            if isinstance(data, list):
                print(f'    -> {len(data)} reservations!')
        except:
            pass

# Also try POST variant
print('\nTrying POST...')
r2 = requests.post(f'{API}/hotel/{HID}/reservation-list',
    json={
        'from-check-in': '2026-01-01 00:00:00',
        'to-check-in': '2026-12-31 23:59:59',
        'reservation-status': 'Reservation'
    },
    headers=H, timeout=15)
results.append(f'=== POST variant — HTTP {r2.status_code} ===')
results.append(r2.text[:500])

# Try without hotel-id in URL (maybe it's GET /reservation-list with hotel-id param)
print('\nTrying root-level reservation-list...')
for fmt in ['2026-01-01 00:00:00', '2026-01-01T00:00:00']:
    url = f'{API}/reservation-list'
    r3 = requests.get(url, params={
        'hotel-id': HID,
        'from-check-in': fmt,
        'to-check-in': '2026-12-31 23:59:59',
        'reservation-status': 'Reservation'
    }, headers=H, timeout=15)
    results.append(f'=== Root /reservation-list (fmt={fmt}) — HTTP {r3.status_code} ===')
    results.append(r3.text[:500])
    results.append('')
    print(f'  fmt={fmt}: HTTP {r3.status_code}')

with open('elektra_reslist_debug.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))
print('\nResults: elektra_reslist_debug.txt')
