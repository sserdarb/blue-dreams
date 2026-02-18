import paramiko
import sys
import time
import json

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
    
    # 1. Get API token from DB
    print("\n=== Getting API Token ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT token FROM personal_access_tokens ORDER BY id DESC LIMIT 1"'
    stdin, stdout, stderr = c.exec_command(cmd)
    token_hash = stdout.read().decode().strip()
    print(f"Token hash (first 20): {token_hash[:20]}...")
    
    # 2. Create a new API token via tinker
    print("\n=== Creating API Token ===")
    cmd = f'docker exec {coolify_container} php artisan tinker --execute "\\$t = \\App\\Models\\User::first()->createToken(\\"deploy-api\\", [\\"*\\"]); echo \\$t->plainTextToken;"'
    stdin, stdout, stderr = c.exec_command(cmd)
    token = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    print(f"Token: {token[:50]}...")
    if err:
        print(f"STDERR: {err[:200]}")
    
    # 3. Get App UUID
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT uuid FROM applications WHERE id = 5"'
    stdin, stdout, stderr = c.exec_command(cmd)
    app_uuid = stdout.read().decode().strip()
    print(f"App UUID: {app_uuid}")
    
    # 4. Trigger Deploy via API
    if token and app_uuid:
        print(f"\n=== Triggering Deploy for {app_uuid} ===")
        cmd = f'docker exec {coolify_container} curl -s -X POST "http://localhost:8000/api/v1/deploy?uuid={app_uuid}&force=true" -H "Authorization: Bearer {token}" -H "Accept: application/json"'
        stdin, stdout, stderr = c.exec_command(cmd)
        resp = stdout.read().decode()
        print(f"Response: {resp}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
