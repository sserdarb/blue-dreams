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
    
    print("\n=== 1. Searching Coolify logs for keywords (webhook, build, error) ===")
    # We use grep on the logs output. Docker logs -> stdout/stderr -> grep
    # We look at the last 2000 lines to be safe
    cmd = 'docker logs --tail 2000 3fe99f2525ce 2>&1 | grep -iE "webhook|build|error|exception" | tail -n 20'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    print("\n=== 2. Checking specifically for containers created < 1 hour ago ===")
    # Valid docker format to see creation time relative
    cmd = 'docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.CreatedAt}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    # We will process this in python to filter, because date parsing in shell is annoying
    output = stdout.read().decode().strip().split('\n')
    header = output[0]
    print(header)
    
    # Simple heuristic: look for "minutes ago" or "seconds ago" in the output
    # But CreatedAt is usually absolute timestamp in newer dockers or "2026-02-09..."
    # Let's just print top 10 recent ones based on the rough sort or python filtering
    
    # Actually, let's just grep for today's date/time if possible or "minutes ago" if format allows
    # The previous output showed "2026-02-09 07:41:26..."
    
    # Let's just print the raw lines that match the current date "2026-02-09" and time "15:" or "16:" (approx current time)
    # Server time might be UTC. 16:00 TRT is 13:00 UTC. So we look for "13:"
    
    for line in output[1:]:
        if "2026-02-09 13:" in line or "2026-02-09 12:" in line or "Up Less than a second" in line:
             print(line)

    c.close()

except Exception as e:
    print(f"Error: {e}")
