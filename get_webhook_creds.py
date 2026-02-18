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
    
    queries = {
        "UUID": f"SELECT uuid FROM applications WHERE id = {app_id}",
        "Secret": f"SELECT manual_webhook_secret_github FROM applications WHERE id = {app_id}",
        "AutoDeploy": f"SELECT is_auto_deploy FROM applications WHERE id = {app_id}"
    }
    
    print(f"\n=== App ID {app_id} Webhook Details ===")
    
    for label, sql in queries.items():
        cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "{sql}"'
        stdin, stdout, stderr = c.exec_command(cmd)
        result = stdout.read().decode().strip()
        print(f"{label}: {result}")

    c.close()

except Exception as e:
    print(f"Error: {e}")
