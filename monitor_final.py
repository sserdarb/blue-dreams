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
    
    for i in range(60):
        cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT id, status FROM application_deployment_queues WHERE application_id = 5 ORDER BY id DESC LIMIT 1"'
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
                # Get logs
                cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT logs FROM application_deployment_queues WHERE id = {qid}"'
                stdin, stdout, stderr = c.exec_command(cmd)
                logs = stdout.read().decode()
                print("LOGS (last 1000 chars):", logs[-1000:])
                break
        else:
            print(f"[{i:3d}] No queue found")
        
        time.sleep(5)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
