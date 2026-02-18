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
    
    container_id = '3fe99f2525ce'
    
    # Check logs for "131" or "Job"
    print("\n=== Coolify Logs (Grep 131) ===")
    cmd = f'docker logs {container_id} 2>&1 | grep 131'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # Check for new containers
    print("\n=== New Containers (Last 2 mins) ===")
    cmd = 'docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.CreatedAt}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    output = stdout.read().decode().strip().split('\n')
    
    print(output[0])
    for line in output[1:6]:
        print(line)

    c.close()

except Exception as e:
    print(f"Error: {e}")
