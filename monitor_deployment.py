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
    
    print("\n=== Monitoring Queue ===")
    
    # Poll for status
    for i in range(30): # 30 * 5s = 2.5 mins
        cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT id, status FROM application_deployment_queues WHERE application_id = 5 ORDER BY created_at DESC LIMIT 1"'
        stdin, stdout, stderr = c.exec_command(cmd)
        out = stdout.read().decode().strip()
        
        if not out:
            print("No queue found.")
            break
            
        parts = out.split('|')
        qid = parts[0].strip()
        status = parts[1].strip() if len(parts) > 1 else 'unknown'
        
        print(f"Queue {qid}: {status}")
        
        if status == 'finished':
            print("Deployment Finished Successfully!")
            break
        if status == 'failed':
            print("Deployment Failed!")
            # Fetch logs?
            break
            
        time.sleep(5)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
