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
    
    # 1. Check Coolify Logs (Last 100 lines)
    print("\n=== Coolify Logs (Last 100) ===")
    cmd = 'docker logs --tail 100 3fe99f2525ce'
    stdin, stdout, stderr = c.exec_command(cmd)
    # Coolify uses stderr for most logs.
    logs = stderr.read().decode() + stdout.read().decode()
    print(logs[-2000:]) # Last 2000 chars

    c.close()

except Exception as e:
    print(f"Error: {e}")
