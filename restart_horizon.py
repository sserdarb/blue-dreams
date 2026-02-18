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
    
    # 1. Restart Horizon
    print("\n=== Restarting Horizon ===")
    cmd = f'docker exec {coolify_container} php artisan horizon:terminate'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("Terminate:", stdout.read().decode().strip())
    
    time.sleep(3)
    
    # 2. Check queue status for our entry
    print("\n=== Queue Entry Check ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT id, status, deployment_uuid FROM application_deployment_queues ORDER BY id DESC LIMIT 3"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 3. Try to run the job synchronously
    print("\n=== Running Queue Worker (sync) ===")
    cmd = f'docker exec {coolify_container} php artisan queue:work --once --queue=default 2>&1'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("Worker:", stdout.read().decode()[:500])
    print("STDERR:", stderr.read().decode()[:200])
    
    time.sleep(2)
    
    # 4. Check status again
    print("\n=== Queue Status After ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT id, status FROM application_deployment_queues ORDER BY id DESC LIMIT 3"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
