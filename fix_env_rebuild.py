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
    
    db_container = '7b196ff456e5'
    coolify_container = '3fe99f2525ce'
    
    new_url = 'postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2'
    
    # 1. Check if network "coolify" connects both containers
    print("\n=== Docker Networks ===")
    cmd = 'docker network ls --format "{{.Name}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 2. Check what network the DB container is on
    cmd = f'docker inspect {db_container} --format "{{{{json .NetworkSettings.Networks}}}}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(list(d.keys()))"'
    stdin, stdout, stderr = c.exec_command(cmd)
    db_networks = stdout.read().decode().strip()
    print(f"DB Networks: {db_networks}")
    
    # 3. Check what network the app container is on  
    cmd = 'docker ps --filter "name=vgk8" --format "{{.ID}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    app_container = stdout.read().decode().strip()
    
    cmd = f'docker inspect {app_container} --format "{{{{json .NetworkSettings.Networks}}}}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(list(d.keys()))"'
    stdin, stdout, stderr = c.exec_command(cmd)
    app_networks = stdout.read().decode().strip()
    print(f"App Networks: {app_networks}")
    
    # 4. Update DATABASE_URL directly in Coolify DB as plaintext
    print("\n=== Updating DATABASE_URL (plaintext) ===")
    cmd = f"""docker exec {db_container} psql -U coolify -d coolify -c "UPDATE environment_variables SET value = '{new_url}', is_build_time = true WHERE key = 'DATABASE_URL' AND resourceable_id = 5 AND resourceable_type LIKE '%Application%' RETURNING id, key, value" """
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 5. Trigger redeploy
    print("\n=== Triggering Redeploy ===")
    cmd = f'docker exec {coolify_container} php artisan tinker --execute "echo \\App\\Models\\User::first()->createToken(\\"fix2\\", [\\"*\\"])->plainTextToken;"'
    stdin, stdout, stderr = c.exec_command(cmd)
    token_raw = stdout.read().decode().strip()
    lines = [l.strip() for l in token_raw.split('\n') if '|' in l]
    token = lines[-1] if lines else token_raw
    
    uuid = 'vgk8cscos8os8wwsogks004'
    cmd = f'docker exec {coolify_container} curl -s -X POST "http://localhost:8000/api/v1/deploy?uuid={uuid}&force=true" -H "Authorization: Bearer {token}" -H "Accept: application/json"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("Deploy:", stdout.read().decode())
    
    # Monitor
    print("\n=== Monitoring ===")
    for i in range(90):
        cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT id, status FROM application_deployment_queues ORDER BY id DESC LIMIT 1"'
        stdin, stdout, stderr = c.exec_command(cmd)
        out = stdout.read().decode().strip()
        
        if out:
            parts = [p.strip() for p in out.split('|')]
            qid = parts[0] if parts else '?'
            status = parts[1] if len(parts) > 1 else '?'
            print(f"[{i:3d}] Queue {qid}: {status}")
            
            if status == 'finished':
                print("\n*** BUILD FINISHED ***")
                break
            if status == 'failed':
                print("\n*** BUILD FAILED ***")
                break
        time.sleep(5)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
