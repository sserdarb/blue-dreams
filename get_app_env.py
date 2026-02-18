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
    
    db_container = '7b196ff456e5' # Coolify DB
    
    # Query environment_variables for application_id = 5 (or similar linkage)
    # Schema check needed?
    # Let's list tables again or guessed query
    # Usually `environment_variables` table has `application_id`, `key`, `value`
    
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "SELECT key, value FROM environment_variables WHERE application_id = 5"'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    out = stdout.read().decode()
    print(out)
    
    # Also check if it's in `applications` table columns
    # ...
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
