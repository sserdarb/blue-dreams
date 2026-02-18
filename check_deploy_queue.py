import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def run(c, cmd, timeout=30):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    # Check deploy queue
    print("=== Deploy Queue ===")
    out, _ = run(c, 'docker exec coolify-db psql -U coolify -d coolify -t -c "SELECT deployment_uuid, status, force_rebuild, created_at FROM application_deployment_queues ORDER BY created_at DESC LIMIT 5;"')
    print(out)
    
    # Check if any deployment is running
    print("\n=== Currently Running ===")
    out, _ = run(c, 'docker exec coolify-db psql -U coolify -d coolify -t -c "SELECT deployment_uuid, status FROM application_deployment_queues WHERE status IN (\'queued\', \'in_progress\') ORDER BY created_at DESC;"')
    print(out or "None")
    
    # Monitor the latest deployment
    print("\n=== Latest deploy status ===")
    out, _ = run(c, 'docker exec coolify-db psql -U coolify -d coolify -t -c "SELECT deployment_uuid, status, commit FROM application_deployment_queues WHERE status != \'failed\' ORDER BY created_at DESC LIMIT 1;"')
    print(out)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
