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
    
    # Query column names
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = \'applications\'"'
    stdin, stdout, stderr = c.exec_command(cmd)
    columns = stdout.read().decode().strip().split('\n')
    
    print("\n=== Application Columns ===")
    for col in columns:
        if col.strip():
            print(col.strip())

    c.close()

except Exception as e:
    print(f"Error: {e}")
