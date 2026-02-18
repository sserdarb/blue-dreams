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
    
    # Connect to postgres DB to create new DB
    print("\n=== Creating Database blue_dreams_v2 ===")
    cmd = f'docker exec {db_container} psql -U coolify -d postgres -c "CREATE DATABASE blue_dreams_v2;"'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    out = stdout.read().decode()
    err = stderr.read().decode()
    
    print("STDOUT:", out)
    print("STDERR:", err)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
