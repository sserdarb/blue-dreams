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
    
    container_id = 'c9a09c7f9a16'
    
    print("\n=== Checking Node ===")
    cmd = f'docker exec {container_id} node -v'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("Node:", stdout.read().decode().strip())
    print("Error:", stderr.read().decode().strip())
    
    print("\n=== Checking .bin ===")
    cmd = f'docker exec {container_id} ls -F /app/node_modules/.bin'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
