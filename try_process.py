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
    
    # 1. Check available artisan commands related to deploy
    print("\n=== Artisan Deploy Commands ===")
    cmd = f'docker exec {coolify_container} php artisan list | grep -i deploy'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 2. Check failed_jobs table
    print("\n=== Failed Jobs ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "SELECT id, queue, failed_at FROM failed_jobs ORDER BY id DESC LIMIT 5"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 3. Check jobs table properly  
    print("\n=== Jobs in Queue ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "SELECT id, queue, attempts, created_at FROM jobs ORDER BY id DESC LIMIT 5"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())

    # 4. Try to run queue:work on long-running queue
    print("\n=== Queue Work (long-running) ===")
    cmd = f'docker exec {coolify_container} timeout 10 php artisan queue:work --once --queue=long-running 2>&1'
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode()
    print("Output:", out[:500])
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
