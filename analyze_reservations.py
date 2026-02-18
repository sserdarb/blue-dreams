"""
Analyze reservation data for sales/channel insights
"""
import requests, json
from collections import Counter

API = 'https://bookingapi.elektraweb.com'
HID = 33264

# Login
r = requests.post(f'{API}/login',
    json={'hotel-id': HID, 'usercode': 'asis', 'password': 'Bdr.2025'},
    headers={'Content-Type': 'application/json'}, timeout=10)
jwt = r.json()['jwt']
H = {'Content-Type': 'application/json', 'Authorization': f'Bearer {jwt}'}

# Get ALL statuses
all_reservations = []
for status in ['Waiting', 'Reservation', 'InHouse', 'CheckOut', 'Cancelled']:
    url = f'{API}/hotel/{HID}/reservation-list'
    params = {
        'from-check-in': '2025-06-01',
        'to-check-in': '2026-12-31',
        'reservation-status': status
    }
    r1 = requests.get(url, params=params, headers=H, timeout=30)
    if r1.status_code == 200:
        data = r1.json()
        for d in data:
            d['_status'] = status
        all_reservations.extend(data)
        print(f'  {status}: {len(data)} reservations')
    else:
        print(f'  {status}: HTTP {r1.status_code}')

print(f'\nTotal: {len(all_reservations)} reservations')

# Analyze
agencies = Counter()
room_types = Counter()
rate_types = Counter()
board_types = Counter()
currencies = Counter()
total_revenue = 0
total_paid = 0

for res in all_reservations:
    agencies[res.get('agency', 'Unknown')] += 1
    room_types[res.get('room-type', 'Unknown')] += 1
    rate_types[res.get('rate-type', 'Unknown')] += 1
    board_types[res.get('board-type', 'Unknown')] += 1
    currencies[res.get('reservation-currency', 'Unknown')] += 1
    price = res.get('reservation-total-price', 0) or 0
    paid = res.get('reservation-paid-price', 0) or 0
    if res.get('reservation-currency') == 'TRY':
        total_revenue += price
        total_paid += paid

# Write analysis
output = []
output.append(f'=== RESERVATION ANALYSIS ===')
output.append(f'Total reservations: {len(all_reservations)}')
output.append(f'Total revenue (TRY): ₺{total_revenue:,.0f}')
output.append(f'Total paid (TRY): ₺{total_paid:,.0f}')
output.append('')

output.append('--- AGENCIES (Channel Distribution) ---')
for ag, cnt in agencies.most_common():
    output.append(f'  {ag}: {cnt}')

output.append('\n--- ROOM TYPES ---')
for rt, cnt in room_types.most_common():
    output.append(f'  {rt}: {cnt}')

output.append('\n--- RATE TYPES ---')
for rt, cnt in rate_types.most_common():
    output.append(f'  {rt}: {cnt}')

output.append('\n--- BOARD TYPES ---')
for bt, cnt in board_types.most_common():
    output.append(f'  {bt}: {cnt}')

output.append('\n--- CURRENCIES ---')
for c, cnt in currencies.most_common():
    output.append(f'  {c}: {cnt}')

output.append('\n--- SAMPLE RESERVATION ---')
if all_reservations:
    output.append(json.dumps(all_reservations[0], indent=2, ensure_ascii=False))

# Monthly distribution  
from collections import defaultdict
monthly = defaultdict(int)
monthly_rev = defaultdict(float)
for res in all_reservations:
    ci = res.get('check-in-date', '')[:7]  # YYYY-MM
    if ci:
        monthly[ci] += 1
        if res.get('reservation-currency') == 'TRY':
            monthly_rev[ci] += res.get('reservation-total-price', 0) or 0

output.append('\n--- MONTHLY DISTRIBUTION ---')
for month in sorted(monthly.keys()):
    output.append(f'  {month}: {monthly[month]} reservations, ₺{monthly_rev.get(month, 0):,.0f}')

text = '\n'.join(output)
with open('elektra_analysis.txt', 'w', encoding='utf-8') as f:
    f.write(text)
print(text)
