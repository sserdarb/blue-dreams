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
    
    # Check logs of 'coolify' container
    container = 'coolify'  # Or use ID if name fails which we saw earlier '3fe...'
    
    print(f"\n=== Logs for {container} (tail 100) ===")
    stdin, stdout, stderr = c.exec_command(f'docker logs --tail 100 {container}')
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
