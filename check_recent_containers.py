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
    
    print("\n=== Recent Containers (Last 2 hours) ===")
    # Docker doesn't have a simple 'since 2h' filter for ps, so we'll list and filter by text in python or just show latest
    stdin, stdout, stderr = c.exec_command('docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.CreatedAt}}" | head -n 20')
    print(stdout.read().decode())
    
    # Also grep for 'blue' again just in case
    print("\n=== Containers matching 'blue/dream' ===")
    stdin, stdout, stderr = c.exec_command('docker ps -a | grep -iE "blue|dream"')
    print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
