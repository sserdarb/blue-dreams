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
    
    # 1. Check schemas
    print("\n=== Schemas in Coolify DB ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "\\dn"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 2. Check tables in public
    print("\n=== Tables in public (grep Page) ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "\\dt" | grep Page'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 3. Host search for .db
    print("\n=== Host Search for .db ===")
    # This might be slow
    cmd = "find /var/lib/docker/volumes -name '*.db' -type f 2>/dev/null | head -n 10"
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
