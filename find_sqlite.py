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
    
    print("\n=== Finding .db Files ===")
    cmd = f'docker exec {container_id} find /app -name "*.db"'
    stdin, stdout, stderr = c.exec_command(cmd)
    files = stdout.read().decode().strip()
    
    print("Found DB files:")
    print(files)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
