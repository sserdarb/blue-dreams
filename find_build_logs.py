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
    
    print("\n=== Finding build logs in /data/coolify ===")
    # Look for files with 'log' in the name within applications dir
    stdin, stdout, stderr = c.exec_command('find /data/coolify/applications -name "*log*" | head -n 10')
    files = stdout.read().decode().strip().split('\n')
    
    for f in files:
        if not f: continue
        print(f"\n--- Content of {f} (tail 20) ---")
        stdin, stdout, stderr = c.exec_command(f'tail -n 20 {f}')
        print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
