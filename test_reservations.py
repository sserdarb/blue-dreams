"""
Test reservation-list with properly formatted dates
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

# The error said date must be "yyyy-MM-dd HH:mm:ss"
# and from-check-in must be BEFORE to-check-in
# Let's try the correct format

# Test 1: Wide date range, All statuses
print('Testing reservation-list with correct format...')
for status in ['Waiting', 'Reservation', 'InHouse', 'CheckOut', 'Cancelled']:
    url = f'{API}/hotel/{HID}/reservation-list'
    params = {
        'from-check-in': '2026-01-01 00:00:00',
        'to-check-in': '2026-12-31 23:59:59',
        'reservation-status': status
    }
    r1 = requests.get(url, params=params, headers=H, timeout=15)
    body = r1.text
    short = body[:2000]
    results.append(f'=== reservation-list (status={status}, 2026 full year) — HTTP {r1.status_code} ===')
    results.append(f'Body length: {len(body)} bytes')
    results.append(short)
    results.append('')
    print(f'  {status}: HTTP {r1.status_code}, {len(body)} bytes')
    if r1.status_code == 200:
        try:
            data = r1.json()
            if isinstance(data, list):
                print(f'    -> {len(data)} reservations')
            elif isinstance(data, dict) and 'data' in data:
                print(f'    -> {len(data["data"])} reservations')
            else:
                print(f'    -> Response type: {type(data).__name__}')
        except:
            pass

# Test 2: Past reservations (2025)
print('\nTesting 2025 past reservations...')
for status in ['Reservation', 'CheckOut']:
    url = f'{API}/hotel/{HID}/reservation-list'
    params = {
        'from-check-in': '2025-06-01 00:00:00',
        'to-check-in': '2025-12-31 23:59:59',
        'reservation-status': status
    }
    r2 = requests.get(url, params=params, headers=H, timeout=15)
    body = r2.text
    results.append(f'=== reservation-list (status={status}, 2025 summer-dec) — HTTP {r2.status_code} ===')
    results.append(f'Body length: {len(body)} bytes')
    results.append(body[:3000])
    results.append('')
    print(f'  {status}: HTTP {r2.status_code}, {len(body)} bytes')
    if r2.status_code == 200:
        try:
            data = r2.json()
            if isinstance(data, list):
                print(f'    -> {len(data)} reservations')
        except:
            pass

with open('elektra_reservations.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))
print(f'\nResults: elektra_reservations.txt')
