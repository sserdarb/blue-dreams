import requests, json

# Login first
r = requests.post('https://bookingapi.elektraweb.com/login',
    json={'hotel-id': 33264, 'usercode': 'asis', 'password': 'Bdr.2025'},
    headers={'Content-Type': 'application/json'}, timeout=10)
jwt = r.json()['jwt']
headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {jwt}'}

results = {}

# Test 1: Hotel info
r1 = requests.get('https://bookingapi.elektraweb.com/hotel/33264', headers=headers, timeout=10)
results['hotel_info'] = {'status': r1.status_code, 'body': r1.text[:3000]}

# Test 2: Availability  
r2 = requests.get('https://bookingapi.elektraweb.com/hotel/33264/availability',
    params={'currency': 'TRY', 'fromdate': '2026-02-15', 'todate': '2026-02-20', 'adult': 2, 'child': 0},
    headers=headers, timeout=10)
results['availability'] = {'status': r2.status_code, 'body': r2.text[:3000]}

# Test 3: Price list
r3 = requests.get('https://bookingapi.elektraweb.com/hotel/33264/hotel-price-list', headers=headers, timeout=10)
results['price_list'] = {'status': r3.status_code, 'body': r3.text[:3000]}

# Test 4: Login data
r4 = requests.get('https://bookingapi.elektraweb.com/get-login-data', 
    params={'hotel-id': 33264}, headers=headers, timeout=10)
results['login_data'] = {'status': r4.status_code, 'body': r4.text[:3000]}

with open('elektra_real_data.txt', 'w', encoding='utf-8') as f:
    for key, val in results.items():
        status = val['status']
        body = val['body']
        f.write(f'=== {key} (Status: {status}) ===\n')
        f.write(body)
        f.write('\n\n')
print('Done')
