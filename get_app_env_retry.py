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
    
    db_container = '7b196ff456e5'
    
    # Describe table
    print("\n=== Describe Env Vars ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "\\d environment_variables"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # Query blindly for App 5 if columns look right
    # Usually key, value, application_id, is_build_time, is_preview ...
    
    print("\n=== App 5 Env Vars ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "SELECT key, value FROM environment_variables WHERE application_id = 5"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
