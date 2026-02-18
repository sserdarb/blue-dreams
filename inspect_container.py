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
    
    container_id = 'c9a09c7f9a16'
    
    print("\n=== Inspecting Container ===")
    cmd = f'docker inspect {container_id}'
    stdin, stdout, stderr = c.exec_command(cmd)
    data = json.loads(stdout.read().decode())
    
    env = data[0]['Config']['Env']
    print("ENV PATH:", [e for e in env if e.startswith('PATH=')])
    print("WorkingDir:", data[0]['Config']['WorkingDir'])
    print("Cmd:", data[0]['Config']['Cmd'])
    print("Entrypoint:", data[0]['Config']['Entrypoint'])
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
