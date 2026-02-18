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
    
    stdin, stdout, stderr = c.exec_command('docker ps -q')
    ids = stdout.read().decode().strip().split('\n')
    
    for container_id in ids:
        if not container_id: continue
        
        stdin, stdout, stderr = c.exec_command(f'docker inspect {container_id}')
        data = stdout.read().decode()
        
        try:
            info = json.loads(data)[0]
            labels = info['Config'].get('Labels', {})
            
            # Check for domain in labels
            found = False
            for k, v in labels.items():
                if 'bluedreamsresort.com' in str(v):
                    found = True
                    break
            
            if found:
                print(f"FOUND: {info['Id'][:12]} | {info['Name']} | {info['State']['Status']} | {info['Created']}")
                
        except Exception:
            pass 

    c.close()

except Exception as e:
    print(f"Error: {e}")
