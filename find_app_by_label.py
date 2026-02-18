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
    
    # Get all IDs
    stdin, stdout, stderr = c.exec_command('docker ps -q')
    ids = stdout.read().decode().strip().split('\n')
    
    print(f"Scanning {len(ids)} containers...")
    
    for container_id in ids:
        if not container_id: continue
        
        # Inspect
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
                print(f"\n*** FOUND APP CONTAINER ***")
                print(f"ID: {info['Id'][:12]}")
                print(f"Name: {info['Name']}")
                print(f"Image: {info['Config']['Image']}")
                print(f"State: {info['State']['Status']}")
                print(f"Created: {info['Created']}")
                print("Labels:")
                for k, v in labels.items():
                   if 'coolify' in k or 'traefik' in k:
                       print(f"  {k}: {v}")
                
        except Exception as e:
            pass # Ignore parse errors

    c.close()

except Exception as e:
    print(f"Error: {e}")
