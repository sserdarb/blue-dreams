"""
Comprehensive Elektra API endpoint discovery
Tests all documented and undocumented endpoints
"""
import requests, json, os

API = 'https://bookingapi.elektraweb.com'
HID = 33264

# Login
r = requests.post(f'{API}/login',
    json={'hotel-id': HID, 'usercode': 'asis', 'password': 'Bdr.2025'},
    headers={'Content-Type': 'application/json'}, timeout=10)
jwt = r.json()['jwt']
H = {'Content-Type': 'application/json', 'Authorization': f'Bearer {jwt}'}

results = []

def test(method, path, body=None, params=None, label=None):
    url = f'{API}{path}'
    try:
        if method == 'GET':
            resp = requests.get(url, headers=H, params=params, timeout=15)
        else:
            resp = requests.post(url, headers=H, json=body, timeout=15)
        text = resp.text[:500]
        results.append(f'### {label or path} ({method}) — Status: {resp.status_code}\n{text}\n')
    except Exception as e:
        results.append(f'### {label or path} ({method}) — ERROR: {e}\n')

# === Hotel-level endpoints ===
test('GET', f'/hotel/{HID}', label='Hotel Info')
test('GET', f'/hotel/{HID}/availability', params={'currency':'TRY','fromdate':'2026-06-15','todate':'2026-06-20','adult':2,'child':0}, label='Availability (Summer)')
test('GET', f'/hotel/{HID}/hotel-price-list', label='Price List')

# === Search / Price / Booking endpoints ===
test('POST', f'/hotel/{HID}/search', body={'start-date':'2026-06-15','end-date':'2026-06-20','adult':2,'child':0,'currency':'TRY'}, label='Search')
test('POST', f'/hotel/{HID}/price', body={'start-date':'2026-06-15','end-date':'2026-06-20','adult':2,'child':0,'currency':'TRY','room-type-id':469700}, label='Price for Room')
test('POST', f'/hotel/{HID}/search-price', body={'start-date':'2026-06-15','end-date':'2026-06-20','adult':2,'child':0,'currency':'TRY'}, label='Search Price')

# === Reservation endpoints ===
test('GET', f'/hotel/{HID}/reservations', label='Reservations List')
test('POST', f'/hotel/{HID}/reservations', body={}, label='Reservations POST')
test('GET', f'/hotel/{HID}/reservation-list', label='Reservation List')
test('POST', f'/hotel/{HID}/reservation-list', body={}, label='Reservation List POST')

# === Reports / Statistics ===
test('GET', f'/hotel/{HID}/report', label='Report')
test('GET', f'/hotel/{HID}/reports', label='Reports')
test('GET', f'/hotel/{HID}/statistics', label='Statistics')
test('GET', f'/hotel/{HID}/stats', label='Stats')
test('GET', f'/hotel/{HID}/dashboard', label='Dashboard')
test('GET', f'/hotel/{HID}/occupancy', label='Occupancy')
test('GET', f'/hotel/{HID}/revenue', label='Revenue')
test('GET', f'/hotel/{HID}/sales', label='Sales')

# === Channel / OTA ===
test('GET', f'/hotel/{HID}/channels', label='Channels')
test('GET', f'/hotel/{HID}/channel-distribution', label='Channel Distribution')
test('GET', f'/hotel/{HID}/channel-manager', label='Channel Manager')

# === Room types ===
test('GET', f'/hotel/{HID}/room-types', label='Room Types')
test('GET', f'/hotel/{HID}/rooms', label='Rooms')
test('GET', f'/hotel/{HID}/room-type-list', label='Room Type List')

# === Payment / POS ===
test('GET', f'/hotel/{HID}/payment', label='Payment')
test('GET', f'/hotel/{HID}/payment-methods', label='Payment Methods')
test('GET', f'/hotel/{HID}/pos', label='POS')
test('GET', f'/hotel/{HID}/virtual-pos', label='Virtual POS')

# === Content ===
test('GET', f'/hotel/{HID}/content', label='Content')
test('GET', f'/hotel/{HID}/images', label='Images')
test('GET', f'/hotel/{HID}/info', label='Hotel Info v2')
test('GET', f'/hotel/{HID}/details', label='Details')
test('GET', f'/hotel/{HID}/facilities', label='Facilities')

# === Create booking (dry test, no actual booking) ===
test('POST', f'/hotel/{HID}/createReservation', body={}, label='Create Reservation (empty)')

# === Misc endpoints ===
test('GET', '/countries', params={'language':'TR'}, label='Countries')
test('GET', f'/get-login-data', params={'hotel-id':HID}, label='Login Data')
test('GET', f'/hotel/{HID}/create-hotel-call', label='Create Hotel Call')
test('POST', f'/hotel/{HID}/create-hotel-call', body={'name':'test','phone':'test'}, label='Create Hotel Call POST')

# === Alternative API base ===
try:
    r2 = requests.get('https://4001.hoteladvisor.net/', headers=H, timeout=10)
    results.append(f'### HotelAdvisor Base — Status: {r2.status_code}\n{r2.text[:300]}\n')
except Exception as e:
    results.append(f'### HotelAdvisor Base — ERROR: {e}\n')

# Write results
with open('elektra_full_api_test.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))

# Summary: which endpoints returned non-404
print('=== Working endpoints (non-404) ===')
for r in results:
    if '404' not in r and 'Cannot' not in r:
        lines = r.split('\n')
        print(f'  {lines[0]}')

print(f'\nTotal: {len(results)} endpoints tested')
print('Full results: elektra_full_api_test.txt')
