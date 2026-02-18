import paramiko
import sys
import json

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
    
    # 1. Check git_repository and git_branch for app
    print("\n=== App Git Config ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "SELECT id, name, git_repository, git_branch, git_commit_sha FROM applications WHERE id = 5"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 2. Check latest deployment logs (first 500 chars)
    print("\n=== Latest Deploy Logs ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT substring(logs from 1 for 500) FROM application_deployment_queues ORDER BY id DESC LIMIT 1"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
