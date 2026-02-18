import paramiko
import sys

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
    
    # 1. Get the app UUID
    print("\n=== App UUID ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT id, uuid, name FROM applications WHERE id = 5"'
    stdin, stdout, stderr = c.exec_command(cmd)
    app_line = stdout.read().decode().strip()
    print(app_line)
    
    # Parse UUID
    parts = [p.strip() for p in app_line.split('|')]
    app_uuid = parts[1] if len(parts) > 1 else None
    app_name = parts[2] if len(parts) > 2 else None
    print(f"UUID: {app_uuid}, Name: {app_name}")
    
    # 2. Try Coolify internal API
    if app_uuid:
        # Use curl from inside coolify container to trigger deploy
        print("\n=== Triggering via internal API ===")
        cmd = f'docker exec {coolify_container} curl -s -X POST http://localhost:8000/api/v1/applications/{app_uuid}/deploy -H "Authorization: Bearer $(docker exec {coolify_container} php artisan tinker --execute \'echo \\App\\Models\\User::first()->createToken(\\"api\\", [\\"*\\"])->plainTextToken;\')" -H "Accept: application/json"'
        stdin, stdout, stderr = c.exec_command(cmd)
        print("API Response:", stdout.read().decode()[:500])
        print("STDERR:", stderr.read().decode()[:200])
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
