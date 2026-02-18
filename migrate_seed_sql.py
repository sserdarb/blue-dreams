import paramiko
import sys
import base64

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
    
    # Read local SQL
    with open("full_db_init.sql", "r", encoding="utf-8") as f:
        sql_content = f.read()
        
    b64_sql = base64.b64encode(sql_content.encode('utf-8')).decode('utf-8')
    
    print(f"Uploading SQL ({len(sql_content)} bytes)...")
    # Upload to host /tmp/full_db_init.sql
    cmd = f'echo {b64_sql} | base64 -d > /tmp/full_db_init.sql'
    c.exec_command(cmd)
    
    # Run against DB
    print("Executing SQL against blue_dreams_v2...")
    # Using docker exec -i with input redirection from HOST file involves:
    # cat /tmp/full_db_init.sql | docker exec -i CONTAINER psql ...
    
    cmd = f'cat /tmp/full_db_init.sql | docker exec -i {db_container} psql -U coolify -d blue_dreams_v2'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    out = stdout.read().decode()
    err = stderr.read().decode()
    
    print("STDOUT:", out)
    print("STDERR:", err)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
