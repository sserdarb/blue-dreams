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
    
    # List running containers
    print("\n=== Running Containers (Top 10) ===")
    cmd = 'docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.CreatedAt}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    # Only show top 10
    output = stdout.read().decode().strip().split('\n')
    for line in output[:11]:
        print(line)

    c.close()

except Exception as e:
    print(f"Error: {e}")
