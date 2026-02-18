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
    
    print("\n=== Finding Node ===")
    cmd = f'docker exec {container_id} find / -name node -type f -executable -maxdepth 6 2>/dev/null'
    stdin, stdout, stderr = c.exec_command(cmd)
    nodes = stdout.read().decode().strip().split('\n')
    
    print("Found nodes:")
    for n in nodes:
        print(n)
        
    # Also check /app/.nix-profile/bin
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
