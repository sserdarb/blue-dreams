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
    
    # Check coolify logs again, looking for "Queue" or "Job" related logs
    print("\n=== Coolify Logs (Last 100 lines) ===")
    cmd = 'docker logs --tail 100 3fe99f2525ce'
    stdin, stdout, stderr = c.exec_command(cmd)
    logs = stderr.read().decode()
    if not logs:
        logs = stdout.read().decode()
        
    print(logs)

    c.close()

except Exception as e:
    print(f"Error: {e}")
