import paramiko
import json
import sys
import os

# Fix encoding for Windows
sys.stdout.reconfigure(encoding='utf-8')

SSH_HOST = '76.13.0.113'
SSH_USER = 'root'
SSH_PASSWORD = "tvONwId?Z.nm'c/M-k7N"

HOTEL_ID = 33264
USER_CODE = 'asis'
PASSWORD = 'Bdr.2025'

ERP_BASE = 'https://api.elektraweb.com'
BOOKING_BASE = 'https://bookingapi.elektraweb.com'

def ssh_exec(ssh, cmd, timeout=15):
    try:
        stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
        out = stdout.read().decode('utf-8', errors='replace').strip()
        err = stderr.read().decode('utf-8', errors='replace').strip()
        return out, err
    except Exception as e:
        return '', str(e)

def main():
    print(f"Connecting to {SSH_HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SSH_HOST, username=SSH_USER, password=SSH_PASSWORD, timeout=60, look_for_keys=False, allow_agent=False)
    print("Connected!\n")

    # ---- TEST 1: Login to booking API ----
    print("=" * 60)
    print("TEST 1: Login to BOOKING API (bookingapi.elektraweb.com)")
    print("=" * 60)
    login_payload = json.dumps({
        "hotel-id": HOTEL_ID,
        "usercode": USER_CODE,
        "password": PASSWORD
    })
    cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {BOOKING_BASE}/login -H "Content-Type: application/json" -d '{login_payload}' '''
    out, err = ssh_exec(ssh, cmd)
    
    booking_jwt = None
    try:
        parts = out.rsplit('\nHTTP_CODE:', 1)
        body = parts[0]
        http_code = parts[1].strip() if len(parts) > 1 else '?'
        data = json.loads(body)
        if data.get('jwt'):
            booking_jwt = data['jwt']
            print(f"[OK] Booking JWT obtained (HTTP {http_code}), length={len(booking_jwt)}")
        else:
            print(f"[FAIL] No JWT. Keys: {list(data.keys())}")
    except Exception as e:
        print(f"[FAIL] Parse error: {e}")
        print(f"Raw: {out[:300]}")
    print()

    # ---- TEST 2: Login to ERP API with same creds ----
    print("=" * 60)
    print("TEST 2: Login to ERP API (api.elektraweb.com)")
    print("=" * 60)
    
    login_variants = [
        ("Standard", {"hotel-id": HOTEL_ID, "usercode": USER_CODE, "password": PASSWORD}),
        ("PascalCase", {"HotelId": HOTEL_ID, "HotelCode": str(HOTEL_ID), "UserCode": USER_CODE, "Password": PASSWORD}),
        ("Mixed", {"hotel-id": HOTEL_ID, "HotelCode": str(HOTEL_ID), "usercode": USER_CODE, "UserCode": USER_CODE, "password": PASSWORD, "Password": PASSWORD}),
        ("StringId", {"hotel-id": str(HOTEL_ID), "usercode": USER_CODE, "password": PASSWORD}),
    ]
    
    erp_jwt = None
    for name, payload in login_variants:
        cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE}/login -H "Content-Type: application/json" -d '{json.dumps(payload)}' '''
        out, err = ssh_exec(ssh, cmd)
        
        try:
            parts = out.rsplit('\nHTTP_CODE:', 1)
            body = parts[0]
            http_code = parts[1].strip() if len(parts) > 1 else '?'
            print(f"  [{name}] HTTP {http_code}: {body[:300]}")
            
            data = json.loads(body)
            if data.get('jwt') or data.get('token') or data.get('Token'):
                erp_jwt = data.get('jwt') or data.get('token') or data.get('Token')
                print(f"  [OK] ERP JWT obtained! Length={len(erp_jwt)}")
                break
        except:
            print(f"  [RAW] {out[:300]}")
    print()

    # ---- TEST 3: Try booking JWT on ERP /select endpoint ----
    jwt_to_use = erp_jwt or booking_jwt
    jwt_source = "ERP" if erp_jwt else "BOOKING"
    
    if jwt_to_use:
        print("=" * 60)
        print(f"TEST 3: Try {jwt_source} JWT on ERP /select endpoint")
        print("=" * 60)
        
        test_objects = [
            'StockCard', 'STOCKCARD', 'StockItem', 'Stock', 'STOCK',
            'STOKKART', 'Material', 'MATERIAL',
            'Supplier', 'SUPPLIER', 'TEDARIKCI',
            'PurchaseOrder', 'PURCHASEORDER', 'SATINALMA',
            'Warehouse', 'WAREHOUSE', 'DEPO',
            'Invoice', 'FATURA',
            'Product', 'PRODUCT', 'URUN',
        ]
        
        for obj in test_objects:
            payload = json.dumps({"Object": obj})
            cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE}/select -H "Content-Type: application/json" -H "Authorization: Bearer {jwt_to_use}" -d '{payload}' '''
            out, err = ssh_exec(ssh, cmd)
            try:
                parts = out.rsplit('\nHTTP_CODE:', 1)
                body = parts[0][:300]
                http_code = parts[1].strip() if len(parts) > 1 else '?'
                print(f"  {obj:20s} -> HTTP {http_code}: {body[:200]}")
                
                if http_code == '200':
                    try:
                        data = json.loads(parts[0])
                        if isinstance(data, list) and len(data) > 0:
                            print(f"    => {len(data)} items! Keys: {list(data[0].keys())[:15]}")
                        elif isinstance(data, dict):
                            for key in ['items', 'data', 'rows', 'result']:
                                if key in data and isinstance(data[key], list):
                                    items = data[key]
                                    if items:
                                        print(f"    => {len(items)} items in '{key}'. Keys: {list(items[0].keys())[:15]}")
                                    break
                            else:
                                print(f"    => Dict keys: {list(data.keys())[:15]}")
                    except:
                        pass
            except:
                print(f"  {obj:20s} -> {out[:200]}")
        print()

    # ---- TEST 4: Try ERP API with different endpoint patterns ----
    if jwt_to_use:
        print("=" * 60)
        print(f"TEST 4: Try various ERP URL patterns with {jwt_source} JWT")
        print("=" * 60)
        
        # POST patterns with action-based body
        action_tests = [
            ("Select StockCard", {"action": "Select", "Object": "StockCard"}),
            ("Select STOKKART", {"action": "Select", "Object": "STOKKART"}),
            ("GetList StockCard", {"action": "GetList", "Object": "StockCard"}),
            ("Query Stock", {"action": "Query", "Object": "Stock"}),
            ("List Materials", {"action": "List", "Object": "Material"}),
            ("Select Supplier", {"action": "Select", "Object": "Supplier"}),
        ]
        
        for label, payload in action_tests:
            cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE}/api -H "Content-Type: application/json" -H "Authorization: Bearer {jwt_to_use}" -d '{json.dumps(payload)}' '''
            out, err = ssh_exec(ssh, cmd)
            try:
                parts = out.rsplit('\nHTTP_CODE:', 1)
                http_code = parts[1].strip() if len(parts) > 1 else '?'
                body = parts[0][:200]
                print(f"  {label:25s} -> HTTP {http_code}: {body}")
            except:
                pass
        print()

    # ---- TEST 5: Try booking API stock-related endpoints ----
    if booking_jwt:
        print("=" * 60)
        print("TEST 5: Stock/purchasing endpoints on BOOKING API")
        print("=" * 60)
        
        booking_paths = [
            '/stock-list', '/stock-cards', '/purchase-orders',
            '/suppliers', '/warehouses', '/materials',
            '/inventory', '/stock', '/procurement',
        ]
        
        for path in booking_paths:
            cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST "{BOOKING_BASE}{path}" -H "Content-Type: application/json" -H "Authorization: Bearer {booking_jwt}" -d '{{"hotel-id": {HOTEL_ID}}}' '''
            out, err = ssh_exec(ssh, cmd)
            try:
                parts = out.rsplit('\nHTTP_CODE:', 1)
                http_code = parts[1].strip() if len(parts) > 1 else '?'
                body = parts[0][:200]
                print(f"  POST {path:25s} -> HTTP {http_code}: {body}")
            except:
                print(f"  POST {path:25s} -> {out[:200]}")
    
    ssh.close()
    print("\nAll tests complete!")

if __name__ == '__main__':
    main()
