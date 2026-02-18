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
    
    # 1. Get token
    cmd = f'docker exec {coolify_container} php artisan tinker --execute "echo \\App\\Models\\User::first()->createToken(\\"final\\", [\\"*\\"])->plainTextToken;"'
    stdin, stdout, stderr = c.exec_command(cmd)
    token_raw = stdout.read().decode().strip()
    lines = [l.strip() for l in token_raw.split('\n') if '|' in l]
    token = lines[-1] if lines else token_raw
    print(f"Token: {token[:30]}...")
    
    # 2. Deploy
    uuid = 'vgk8cscos8os8wwsogks004'
    cmd = f'docker exec {coolify_container} curl -s -X POST "http://localhost:8000/api/v1/deploy?uuid={uuid}&force=true" -H "Authorization: Bearer {token}" -H "Accept: application/json"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("Deploy:", stdout.read().decode())
    
    # 3. Monitor
    print("\n=== Monitoring Build ===")
    for i in range(120):  # 10 min max
        cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT id, status FROM application_deployment_queues ORDER BY id DESC LIMIT 1"'
        stdin, stdout, stderr = c.exec_command(cmd)
        out = stdout.read().decode().strip()
        
        if out:
            parts = [p.strip() for p in out.split('|')]
            qid = parts[0] if parts else '?'
            status = parts[1] if len(parts) > 1 else '?'
            if i % 3 == 0:  # Print every 3rd iteration
                print(f"[{i:3d}] Queue {qid}: {status}")
            
            if status == 'finished':
                print(f"\n*** BUILD FINISHED (Queue {qid}) ***")
                break
            if status == 'failed':
                print(f"\n*** BUILD FAILED (Queue {qid}) ***")
                cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT logs FROM application_deployment_queues WHERE id = {qid}"'
                stdin, stdout, stderr = c.exec_command(cmd)
                logs = stdout.read().decode()
                print(f"LOGS (last 2000):\n{logs[-2000:]}")
                break
        else:
            if i % 3 == 0:
                print(f"[{i:3d}] Waiting...")
        time.sleep(5)
    
    # 4. Verify new container env
    time.sleep(3)
    cmd = 'docker ps --filter "name=vgk8" --format "{{.ID}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    new_container = stdout.read().decode().strip()
    print(f"\nNew Container: {new_container}")
    
    if new_container:
        cmd = f'docker inspect {new_container} --format "{{{{range .Config.Env}}}}{{{{println .}}}}{{{{end}}}}" | grep DATABASE'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"DB ENV: {stdout.read().decode().strip()}")
        
        cmd = f'docker exec {new_container} head -10 /app/node_modules/.prisma/client/schema.prisma 2>/dev/null'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"\nPrisma Schema:\n{stdout.read().decode()}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
