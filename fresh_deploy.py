import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    coolify_container = '3fe99f2525ce'
    db_container = '7b196ff456e5'
    
    # 1. Get API token  
    print("\n=== Creating API Token ===")
    cmd = f'docker exec {coolify_container} php artisan tinker --execute "echo \\App\\Models\\User::first()->createToken(\\"deploy\\", [\\"*\\"])->plainTextToken;"'
    stdin, stdout, stderr = c.exec_command(cmd)
    token_raw = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    
    # Token usually looks like: 1|XXXX
    lines = [l.strip() for l in token_raw.split('\n') if '|' in l]
    token = lines[-1] if lines else token_raw
    print(f"Token: {token[:30]}...")
    
    # 2. Get UUID
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT uuid FROM applications WHERE name LIKE \'%blue%\' OR name LIKE \'%Blue%\' OR id = 5 LIMIT 1"'
    stdin, stdout, stderr = c.exec_command(cmd)
    uuid = stdout.read().decode().strip()
    print(f"UUID: {uuid}")
    
    # 3. Deploy via API
    if token and uuid:
        print(f"\n=== Deploying {uuid} ===")
        cmd = f"""docker exec {coolify_container} curl -s -X POST "http://localhost:8000/api/v1/deploy?uuid={uuid}&force=true" -H "Authorization: Bearer {token}" -H "Accept: application/json" """
        stdin, stdout, stderr = c.exec_command(cmd)
        resp = stdout.read().decode()
        print(f"Response: {resp}")
    
    # 4. Wait and monitor
    time.sleep(3)
    print("\n=== Monitoring ===")
    for i in range(60):
        cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT id, status FROM application_deployment_queues ORDER BY id DESC LIMIT 1"'
        stdin, stdout, stderr = c.exec_command(cmd)
        out = stdout.read().decode().strip()
        
        if out:
            parts = [p.strip() for p in out.split('|')]
            qid = parts[0] if parts else '?'
            status = parts[1] if len(parts) > 1 else '?'
            print(f"[{i:3d}] Queue {qid}: {status}")
            
            if status in ('finished', 'failed'):
                print(f"\n*** BUILD {status.upper()} ***")
                if status == 'failed':
                    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT logs FROM application_deployment_queues WHERE id = {qid}"'
                    stdin, stdout, stderr = c.exec_command(cmd)
                    logs = stdout.read().decode()
                    print("LOGS (last 1000):", logs[-1000:])
                break
        else:
            print(f"[{i:3d}] No queue found")
        time.sleep(5)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
