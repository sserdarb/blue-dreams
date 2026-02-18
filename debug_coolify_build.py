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
    
    # Coolify core container ID from previous steps
    container_id = '3fe99f2525ce' 
    
    print(f"\n=== Logs for Coolify ({container_id}) - Last 45m ===")
    # timestamps to verify recent activity
    stdin, stdout, stderr = c.exec_command(f'docker logs --since 45m {container_id}')
    logs = stdout.read().decode()
    err_logs = stderr.read().decode()
    
    if not logs and not err_logs:
        print("No logs found in the last 45 minutes.")
    else:
        print("--- STDOUT ---")
        print(logs[-2000:]) # Print last 2000 chars to avoid overflow
        print("\n--- STDERR ---")
        print(err_logs[-2000:])

    c.close()

except Exception as e:
    print(f"Error: {e}")
