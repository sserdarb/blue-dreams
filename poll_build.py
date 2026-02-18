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
    
    db_container = '7b196ff456e5'
    queue_id = 131
    
    print(f"\n=== Polling Queue {queue_id} ===")
    
    for i in range(30): # 30 * 10s = 5 mins
        cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT status FROM application_deployment_queues WHERE id = {queue_id}"'
        stdin, stdout, stderr = c.exec_command(cmd)
        status = stdout.read().decode().strip()
        
        print(f"[{i*10}s] Status: {status}")
        
        if status != 'in_progress' and status != 'queued':
            print(f"Build Finished with status: {status}")
            break
            
        time.sleep(10)

    if status == 'in_progress':
        print("Timed out polling.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
