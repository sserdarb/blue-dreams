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
    
    print("\n=== Docker Volumes ===")
    cmd = 'docker volume ls --format "{{.Name}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    vols = stdout.read().decode().strip().split('\n')
    for v in vols:
        if 'coolify' in v:
            print(v)
            
    print("\n=== Find dev.db/prod.db ===")
    cmd = 'find /var/lib/docker/volumes -name "dev.db" -o -name "prod.db" 2>/dev/null'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
