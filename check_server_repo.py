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
    
    db_container = '7b196ff456e5' 
    app_id = 5
    
    # Query ONLY git_repository
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT git_repository FROM applications WHERE id = {app_id}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    repo = stdout.read().decode().strip()
    
    print(f"Server Repo: {repo}")

    # Query ONLY git_branch
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT git_branch FROM applications WHERE id = {app_id}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    branch = stdout.read().decode().strip()
    
    print(f"Server Branch: {branch}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
