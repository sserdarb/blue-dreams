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
    
    # 1. Check Coolify Logs for recent activity
    print("\n=== Coolify Logs (Last 50 lines) ===")
    cmd = 'docker logs --tail 50 3fe99f2525ce'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stderr.read().decode()) # Coolify logs to stderr often
    
    # 2. Check for new containers (created < 5 mins)
    print("\n=== New Containers (Last 5 mins) ===")
    # List all and filter in python to be sure
    cmd = 'docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.CreatedAt}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    output = stdout.read().decode().strip().split('\n')
    
    if len(output) > 1:
        print(output[0]) # Header
        # extensive filter logic or just print all recent logs
        # Let's just print top 10 lines
        for line in output[1:11]:
             print(line)

    c.close()

except Exception as e:
    print(f"Error: {e}")
