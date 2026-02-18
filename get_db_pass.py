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
    
    # Inspect
    cmd = f'docker inspect {db_container}'
    stdin, stdout, stderr = c.exec_command(cmd)
    data = json.loads(stdout.read().decode())
    
    env = data[0]['Config']['Env']
    print("Found Env:")
    for e in env:
        if 'POSTGRES_PASSWORD' in e:
            print(e)
            
    c.close()

except Exception as e:
    print(f"Error: {e}")
