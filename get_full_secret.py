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
    
    print("\n=== Getting Full Secret ===")
    # Copy to file inside container
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "COPY (SELECT manual_webhook_secret_github FROM applications WHERE id = {app_id}) TO \'/tmp/secret.txt\'"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # Cat file
    cmd = f'docker exec {db_container} cat /tmp/secret.txt'
    stdin, stdout, stderr = c.exec_command(cmd)
    secret = stdout.read().decode().strip()
    print(f"SECRET: {secret}")

    c.close()

except Exception as e:
    print(f"Error: {e}")
