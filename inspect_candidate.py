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
    
    container_id = 'a71a1dfce9cc'
    print(f"\n=== Inspect {container_id} ===")
    stdin, stdout, stderr = c.exec_command(f'docker inspect {container_id}')
    data = stdout.read().decode()
    
    try:
        info = json.loads(data)[0]
        print(f"Name: {info['Name']}")
        print(f"Image: {info['Config']['Image']}")
        print(f"Created: {info['Created']}")
        print(f"State: {info['State']['Status']}")
        # Check labels for project name
        if 'Labels' in info['Config']:
            print("Labels:")
            for k, v in info['Config']['Labels'].items():
                if 'coolify' in k:
                    print(f"  {k}: {v}")
    except Exception as parse_err:
        print(f"Failed to parse JSON: {parse_err}")

    c.close()

except Exception as e:
    print(f"Error: {e}")
