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
    
    container_name = 'w088-055128813859'
    print(f"\n=== Inspect {container_name} ===")
    stdin, stdout, stderr = c.exec_command(f'docker inspect {container_name}')
    data = stdout.read().decode()
    
    try:
        info = json.loads(data)[0]
        print(f"Name: {info['Name']}")
        print(f"Created: {info['Created']}")
        print(f"State: {info['State']['Status']}")
        print(f"RestartCount: {info['RestartCount']}")
    except Exception as parse_err:
        print(f"Failed to parse JSON: {parse_err}")
        print(data[:500]) # Print first 500 chars if parsing fails

    c.close()

except Exception as e:
    print(f"Error: {e}")
