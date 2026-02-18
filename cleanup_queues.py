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
    
    # 1. Show ALL recent queues regardless of app_id
    print("\n=== ALL Recent Queues ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "SELECT id, application_id, status, force_rebuild, created_at FROM application_deployment_queues ORDER BY id DESC LIMIT 10"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 2. Show applications table  
    print("\n=== Applications ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "SELECT id, name, uuid FROM applications ORDER BY id"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 3. Clean stuck entries
    print("\n=== Cleaning Stuck Queues ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "DELETE FROM application_deployment_queues WHERE status = \'queued\' RETURNING id"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
