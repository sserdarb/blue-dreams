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
    
    print("\n=== Inspecting Coolify Env Vars ===")
    stdin, stdout, stderr = c.exec_command('docker inspect coolify --format "{{range .Config.Env}}{{println .}}{{end}}"')
    env_vars = stdout.read().decode().strip().split('\n')
    
    for kv in env_vars:
        if 'DB_' in kv or 'POSTGRES' in kv or 'DATABASE' in kv:
            print(kv)

    c.close()

except Exception as e:
    print(f"Error: {e}")
