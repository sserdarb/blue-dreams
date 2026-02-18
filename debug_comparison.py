"""Write results to file to avoid truncation"""
import requests, json, sys

API = "https://bookingapi.elektraweb.com"
r = requests.post(f"{API}/login", json={"hotel-id": 33264, "usercode": "asis", "password": "Bdr.2025"})
jwt = r.json()["jwt"]
HDR = {"Authorization": f"Bearer {jwt}"}

out = []

# Test 1: from-lastupdate-date
url1 = f"{API}/hotel/33264/reservation-list?from-lastupdate-date=2025-01-15&to-lastupdate-date=2025-02-15"
r1 = requests.get(url1, headers=HDR)
out.append(f"Test 1 (from-lastupdate-date): {r1.status_code}")
if r1.status_code == 200:
    d = r1.json()
    out.append(f"  Results: {len(d) if isinstance(d, list) else str(d)[:200]}")

# Test 2: from-reservation-date
url2 = f"{API}/hotel/33264/reservation-list?from-reservation-date=2025-01-15&to-reservation-date=2025-02-15"
r2 = requests.get(url2, headers=HDR)
out.append(f"Test 2 (from-reservation-date): {r2.status_code}")
if r2.status_code == 200:
    d = r2.json()
    out.append(f"  Results: {len(d) if isinstance(d, list) else str(d)[:200]}")

# Test 3: from-booking-date
url3 = f"{API}/hotel/33264/reservation-list?from-booking-date=2025-01-15&to-booking-date=2025-02-15"
r3 = requests.get(url3, headers=HDR)
out.append(f"Test 3 (from-booking-date): {r3.status_code}")
if r3.status_code == 200:
    d = r3.json()
    out.append(f"  Results: {len(d) if isinstance(d, list) else str(d)[:200]}")

# Test 4: reservation by ID (detail)
url4a = f"{API}/hotel/33264/reservation-list?from-check-in=2025-06-01&to-check-in=2025-06-01&reservation-status=CheckOut"
r4a = requests.get(url4a, headers=HDR)
if r4a.status_code == 200:
    data = r4a.json()
    if data:
        rid = data[0]["reservation-id"]
        out.append(f"\nTest 4 (detail): reservation-id={rid}")
        for path in [f"reservation/{rid}", f"reservation-detail/{rid}", f"reservation-list?reservation-id={rid}"]:
            detail_url = f"{API}/hotel/33264/{path}"
            rd = requests.get(detail_url, headers=HDR)
            out.append(f"  {path}: status={rd.status_code}")
            if rd.status_code == 200:
                detail = rd.json()
                if isinstance(detail, list) and detail:
                    detail = detail[0]
                if isinstance(detail, dict):
                    out.append(f"  Keys: {sorted(detail.keys())}")
                    for k,v in sorted(detail.items()):
                        if any(x in k.lower() for x in ['date','time','created','entry','insert','book']):
                            out.append(f"    DATE FIELD: {k} = {v}")
                    with open("detail_output.json","w",encoding="utf-8") as f:
                        json.dump(detail, f, indent=2, ensure_ascii=False, default=str)

# Test 5: Future reservations (status=Reservation) for 2026 June
url5 = f"{API}/hotel/33264/reservation-list?from-check-in=2026-06-01&to-check-in=2026-06-30&reservation-status=Reservation"
r5 = requests.get(url5, headers=HDR)
if r5.status_code == 200:
    data = r5.json()
    out.append(f"\nTest 5 (2026 June Reservation status): {len(data) if isinstance(data, list) else data}")
    if isinstance(data, list) and data:
        lu_months = {}
        for res in data:
            lu = str(res.get("lastupdate-date",""))[:7]
            lu_months[lu] = lu_months.get(lu, 0) + 1
        out.append("  lastUpdate dist:")
        for k in sorted(lu_months.keys()): out.append(f"    {k}: {lu_months[k]}")
        for res in data[:5]:
            ci = str(res.get("check-in-date",""))[:10]
            lu = str(res.get("lastupdate-date",""))[:19]
            p = res.get("reservation-total-price", 0)
            ag = str(res.get("agency",""))[:20]
            out.append(f"    CI:{ci} lastUpd:{lu} price:{p} ag:{ag}")

with open("api_test_results.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))
print("Results written to api_test_results.txt")
