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
    
    for i in range(60):  # 5 min
        cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT id, status, created_at FROM application_deployment_queues WHERE application_id = 5 ORDER BY id DESC LIMIT 1"'
        stdin, stdout, stderr = c.exec_command(cmd)
        out = stdout.read().decode().strip()
        
        if out:
            parts = [p.strip() for p in out.split('|')]
            qid = parts[0] if len(parts) > 0 else '?'
            status = parts[1] if len(parts) > 1 else '?'
            created = parts[2] if len(parts) > 2 else '?'
            
            print(f"[{i}] Queue {qid}: {status} (created: {created})")
            
            if status in ('finished', 'failed'):
                print(f"\nBuild {status}!")
                break
        else:
            print(f"[{i}] No queue entries found")
            
        time.sleep(5)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
