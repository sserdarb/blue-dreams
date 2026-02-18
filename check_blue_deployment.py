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
    print("Connected successfully.")
    
    print("\n=== 1. Listing Docker Containers ===")
    stdin, stdout, stderr = c.exec_command('docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"')
    print(stdout.read().decode())
    
    print("\n=== 2. Checking Coolify/App Logs (tail) ===")
    # Try to find a container that looks like the app
    stdin, stdout, stderr = c.exec_command('docker ps --format "{{.Names}}" | grep -iE "blue|dreams|next"')
    container_names = stdout.read().decode().strip().split('\n')
    
    if container_names and container_names[0]:
        for name in container_names:
            if not name: continue
            print(f"\n--- Logs for {name} ---")
            stdin, stdout, stderr = c.exec_command(f'docker logs --tail 20 {name}')
            print(stdout.read().decode())
            print(stderr.read().decode())
    else:
        print("No specific 'blue' or 'dreams' containers found. Listing all names:")
        stdin, stdout, stderr = c.exec_command('docker ps --format "{{.Names}}"')
        print(stdout.read().decode())

    c.close()
    
except Exception as e:
    print(f"Error: {e}")
