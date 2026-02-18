import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    container_id = '3fe99f2525ce' # Coolify core
    print(f"\n=== Coolify Logs (Tail 50) ===")
    stdin, stdout, stderr = c.exec_command(f'docker logs --tail 50 {container_id}')
    print(stderr.read().decode()) # Coolify often logs to stderr
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
