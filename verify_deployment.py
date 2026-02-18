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
    
    # 1. List containers sorted by creation time
    print("\n=== New Containers (Last 10 mins) ===")
    cmd = 'docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.CreatedAt}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    output = stdout.read().decode().strip().split('\n')
    # Filter for very recent
    # Just show top 5
    for line in output[:6]:
        print(line)
        
    # 2. Check site
    print("\n=== Checking Site Content (Localhost) ===")
    # Try localhost:3000 inside container if possible, or public URL via proxy
    # Curl localhost:80 on host might just hit Traefik default page or configured site
    cmd = 'curl -I http://localhost'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
