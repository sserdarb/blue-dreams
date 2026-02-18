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
    
    # Check the latest deployment status
    print("=== Checking deployment status ===")
    out, _ = run(c, 'docker exec coolify-db psql -U coolify -d coolify -t -c "SELECT deployment_uuid, status, commit, created_at FROM application_deployment_queues ORDER BY created_at DESC LIMIT 5;"')
    print(f"Queue:\n{out}")
    
    # Check if the Coolify worker is processing
    print("\n=== Coolify scheduler check ===") 
    out, _ = run(c, 'docker exec coolify php artisan schedule:list 2>&1 | head -20')
    print(out)
    
    # Try to force run the queue worker
    print("\n=== Force running queue worker ===")
    out, err = run(c, 'docker exec coolify php artisan queue:work --once --queue=high 2>&1', timeout=30)
    print(f"Worker: {out}")
    
    # Check queue again
    time.sleep(3)
    out, _ = run(c, 'docker exec coolify-db psql -U coolify -d coolify -t -c "SELECT deployment_uuid, status FROM application_deployment_queues ORDER BY created_at DESC LIMIT 3;"')
    print(f"\nUpdated queue:\n{out}")
    
    c.close()
    
except Exception as e:
    print(f"Error: {e}")
