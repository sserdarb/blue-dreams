import paramiko
import sys
import time
import json

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "***REDACTED_SSH_PASSWORD***"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    coolify_container = '3fe99f2525ce'
    db_container = '7b196ff456e5'
    
    # 1. Get token
    cmd = f'docker exec {coolify_container} php artisan tinker --execute "echo \\App\\Models\\User::first()->createToken(\\"final\\", [\\"*\\"])->plainTextToken;"'
    stdin, stdout, stderr = c.exec_command(cmd)
    token_raw = stdout.read().decode().strip()
    print("--- RAW TOKEN OUTPUT ---")
    print(token_raw)
    print("------------------------")
    import re
    match = re.search(r'\d+\|[a-zA-Z0-9]+', token_raw)
    token = match.group(0) if match else token_raw
    print(f"Token: {token[:30]}...")
    
    # 2. Deploy
    uuid = 'vgk8cscos8os8wwsogkss004'
    cmd = f'docker exec {coolify_container} curl -s -X POST "http://localhost:80/api/v1/deploy?uuid={uuid}&force=true" -H "Authorization: Bearer {token}" -H "Accept: application/json"'
    stdin, stdout, stderr = c.exec_command(cmd)
    deploy_res = stdout.read().decode().strip()
    print("Deploy:", deploy_res)
    
    # Check if we need port 8080 instead
    if not deploy_res or 'Not Found' in deploy_res:
        print("Trying port 8080...")
        cmd = f'docker exec {coolify_container} curl -s -X POST "http://localhost:8080/api/v1/deploy?uuid={uuid}&force=true" -H "Authorization: Bearer {token}" -H "Accept: application/json"'
        stdin, stdout, stderr = c.exec_command(cmd)
        deploy_res = stdout.read().decode().strip()
        print("Deploy (8080):", deploy_res)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
