import paramiko
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

SSH_HOST = '76.13.0.113'
SSH_USER = 'root'
SSH_PASSWORD = "tvONwId?Z.nm'c/M-k7N"

HOTEL_ID = 33264
USER_CODE = 'asis'
PASSWORD = 'Bdr.2025'

ERP_BASE = 'https://api.elektraweb.com'

def ssh_exec(ssh, cmd, timeout=15):
    try:
        stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
        out = stdout.read().decode('utf-8', errors='replace').strip()
        return out
    except Exception as e:
        return f'ERROR: {e}'

def main():
    print("Connecting...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SSH_HOST, username=SSH_USER, password=SSH_PASSWORD, timeout=60, look_for_keys=False, allow_agent=False)
    print("Connected!\n")

    # The ERP API uses a single endpoint with Action field in POST body!
    # Valid actions: Function,Select,Execute,Insert,Update,Delete,Login,SSO,Logout,
    #   RemoteLogin,GetConfig,SetConfig,ListConfig,Schema,SchemaList,GetReportConfig,
    #   GetLog,GetEndpoint,Echo,Proxy,ReportMail,SendEmail

    # ---- TEST 1: Login with Action field ----
    print("=" * 60)
    print("TEST 1: ERP Login with Action field")
    print("=" * 60)
    
    login_variants = [
        ("Action+hotel-id+usercode+password", {
            "Action": "Login",
            "hotel-id": HOTEL_ID,
            "usercode": USER_CODE,
            "password": PASSWORD
        }),
        ("Action+HotelCode+UserCode+Password", {
            "Action": "Login",
            "HotelCode": str(HOTEL_ID),
            "UserCode": USER_CODE,
            "Password": PASSWORD
        }),
        ("Action+HotelId+UserCode+Password", {
            "Action": "Login",
            "HotelId": HOTEL_ID,
            "UserCode": USER_CODE,
            "Password": PASSWORD
        }),
        ("Action+all variants", {
            "Action": "Login",
            "hotel-id": HOTEL_ID,
            "HotelId": HOTEL_ID,
            "HotelCode": str(HOTEL_ID),
            "usercode": USER_CODE,
            "UserCode": USER_CODE,
            "password": PASSWORD,
            "Password": PASSWORD
        }),
    ]
    
    erp_jwt = None
    for name, payload in login_variants:
        cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE} -H "Content-Type: application/json" -d '{json.dumps(payload)}' '''
        out = ssh_exec(ssh, cmd)
        
        try:
            parts = out.rsplit('\nHTTP_CODE:', 1)
            body = parts[0]
            http_code = parts[1].strip() if len(parts) > 1 else '?'
            print(f"\n  [{name}]")
            print(f"  HTTP {http_code}: {body[:400]}")
            
            try:
                data = json.loads(body)
                if data.get('jwt') or data.get('token') or data.get('Token') or data.get('JWT'):
                    erp_jwt = data.get('jwt') or data.get('token') or data.get('Token') or data.get('JWT')
                    print(f"\n  >>> ERP JWT OBTAINED! Length={len(erp_jwt)} <<<")
                    break
                if data.get('success') == True:
                    print(f"  >>> Success=true, keys: {list(data.keys())}")
                    # Maybe JWT is nested
                    for key in data:
                        if isinstance(data[key], str) and len(data[key]) > 50:
                            print(f"  >>> Possible token in '{key}': {data[key][:80]}...")
                            erp_jwt = data[key]
                            break
                    if erp_jwt:
                        break
            except json.JSONDecodeError:
                pass
        except:
            print(f"  {out[:400]}")
    print()

    # ---- TEST 2: Try Echo to verify API is responding ----
    print("=" * 60)
    print("TEST 2: Echo (verify API responds)")
    print("=" * 60)
    cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE} -H "Content-Type: application/json" -d '{json.dumps({"Action": "Echo"})}' '''
    out = ssh_exec(ssh, cmd)
    parts = out.rsplit('\nHTTP_CODE:', 1)
    print(f"  HTTP {parts[1].strip() if len(parts) > 1 else '?'}: {parts[0][:300]}")
    print()

    # ---- TEST 3: Try GetIp ----
    print("=" * 60)
    print("TEST 3: GetIp")
    print("=" * 60)
    cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE} -H "Content-Type: application/json" -d '{json.dumps({"Action": "GetIp"})}' '''
    out = ssh_exec(ssh, cmd)
    parts = out.rsplit('\nHTTP_CODE:', 1)
    print(f"  HTTP {parts[1].strip() if len(parts) > 1 else '?'}: {parts[0][:300]}")
    print()

    # ---- TEST 4: Try SchemaList (no auth needed?) ----
    print("=" * 60)
    print("TEST 4: SchemaList (no auth)")
    print("=" * 60)
    cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE} -H "Content-Type: application/json" -d '{json.dumps({"Action": "SchemaList"})}' '''
    out = ssh_exec(ssh, cmd)
    parts = out.rsplit('\nHTTP_CODE:', 1)
    print(f"  HTTP {parts[1].strip() if len(parts) > 1 else '?'}: {parts[0][:500]}")
    print()

    # ---- TEST 5: If we have JWT, try Select with proper Action ----
    if erp_jwt:
        print("=" * 60)
        print("TEST 5: Select with ERP JWT")
        print("=" * 60)
        
        test_objects = [
            'StockCard', 'Material', 'Supplier', 'PurchaseOrder',
            'Warehouse', 'Invoice', 'Stock', 'Product',
        ]
        
        for obj in test_objects:
            payload = {"Action": "Select", "Object": obj}
            cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE} -H "Content-Type: application/json" -H "Authorization: Bearer {erp_jwt}" -d '{json.dumps(payload)}' '''
            out = ssh_exec(ssh, cmd)
            parts = out.rsplit('\nHTTP_CODE:', 1)
            body = parts[0]
            http_code = parts[1].strip() if len(parts) > 1 else '?'
            print(f"  {obj:20s} -> HTTP {http_code}: {body[:250]}")
            
            if http_code == '200':
                try:
                    data = json.loads(body)
                    if isinstance(data, list):
                        print(f"    => {len(data)} items!")
                        if data:
                            print(f"    => Keys: {list(data[0].keys())[:15]}")
                    elif isinstance(data, dict):
                        for key in ['items', 'data', 'rows', 'result']:
                            if key in data:
                                items = data[key]
                                if isinstance(items, list):
                                    print(f"    => {len(items)} items in '{key}'")
                                    if items:
                                        print(f"    => Keys: {list(items[0].keys())[:15]}")
                                break
                        else:
                            print(f"    => Response keys: {list(data.keys())[:15]}")
                except:
                    pass
        print()

        # Try Schema for stock objects
        print("=" * 60)
        print("TEST 6: Schema for stock-related objects")
        print("=" * 60)
        for obj in ['StockCard', 'Material', 'Supplier', 'Stock']:
            payload = {"Action": "Schema", "Object": obj}
            cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE} -H "Content-Type: application/json" -H "Authorization: Bearer {erp_jwt}" -d '{json.dumps(payload)}' '''
            out = ssh_exec(ssh, cmd)
            parts = out.rsplit('\nHTTP_CODE:', 1)
            http_code = parts[1].strip() if len(parts) > 1 else '?'
            print(f"  Schema({obj}) -> HTTP {http_code}: {parts[0][:300]}")
    else:
        print("NO ERP JWT obtained - cannot test Select/Schema actions")
        print()
        
        # Try with booking JWT
        print("=" * 60)
        print("TEST 5b: Try Login action using booking JWT as auth")
        print("=" * 60)
        
        # First get booking JWT
        from test_erp_api import BOOKING_BASE  # won't work, inline it
        bk_cmd = f'''curl -s -X POST https://bookingapi.elektraweb.com/login -H "Content-Type: application/json" -d '{json.dumps({"hotel-id": HOTEL_ID, "usercode": USER_CODE, "password": PASSWORD})}' '''
        bk_out = ssh_exec(ssh, bk_cmd)
        try:
            bk_data = json.loads(bk_out)
            booking_jwt = bk_data.get('jwt', '')
        except:
            booking_jwt = ''
        
        if booking_jwt:
            print(f"  Got booking JWT, trying Select with it...")
            
            test_objects = ['StockCard', 'Material', 'Supplier', 'Stock', 'Product']
            for obj in test_objects:
                payload = {"Action": "Select", "Object": obj}
                cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE} -H "Content-Type: application/json" -H "Authorization: Bearer {booking_jwt}" -d '{json.dumps(payload)}' '''
                out = ssh_exec(ssh, cmd)
                parts = out.rsplit('\nHTTP_CODE:', 1)
                http_code = parts[1].strip() if len(parts) > 1 else '?'
                print(f"  Select({obj:15s}) -> HTTP {http_code}: {parts[0][:300]}")
            
            print()
            print("=" * 60)
            print("TEST 6: SchemaList with booking JWT")
            print("=" * 60)
            payload = {"Action": "SchemaList"}
            cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE} -H "Content-Type: application/json" -H "Authorization: Bearer {booking_jwt}" -d '{json.dumps(payload)}' '''
            out = ssh_exec(ssh, cmd)
            parts = out.rsplit('\nHTTP_CODE:', 1)
            http_code = parts[1].strip() if len(parts) > 1 else '?'
            print(f"  HTTP {http_code}: {parts[0][:500]}")
            
            print()
            print("=" * 60)
            print("TEST 7: GetEndpoint with booking JWT")
            print("=" * 60)
            payload = {"Action": "GetEndpoint"}
            cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE} -H "Content-Type: application/json" -H "Authorization: Bearer {booking_jwt}" -d '{json.dumps(payload)}' '''
            out = ssh_exec(ssh, cmd)
            parts = out.rsplit('\nHTTP_CODE:', 1)
            http_code = parts[1].strip() if len(parts) > 1 else '?'
            print(f"  HTTP {http_code}: {parts[0][:500]}")
            
            print()
            print("=" * 60)
            print("TEST 8: Schema action with booking JWT")
            print("=" * 60)
            for obj in ['StockCard', 'Material', 'Stock']:
                payload = {"Action": "Schema", "Object": obj}
                cmd = f'''curl -s -w "\\nHTTP_CODE:%{{http_code}}" -X POST {ERP_BASE} -H "Content-Type: application/json" -H "Authorization: Bearer {booking_jwt}" -d '{json.dumps(payload)}' '''
                out = ssh_exec(ssh, cmd)
                parts = out.rsplit('\nHTTP_CODE:', 1)
                http_code = parts[1].strip() if len(parts) > 1 else '?'
                print(f"  Schema({obj:15s}) -> HTTP {http_code}: {parts[0][:300]}")
    
    ssh.close()
    print("\nAll tests complete!")

if __name__ == '__main__':
    main()
