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
    
    # Find container
    cmd = 'docker ps --filter "name=vgk8" --format "{{.ID}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    container_id = stdout.read().decode().strip()
    print(f"Container: {container_id}")
    
    if container_id:
        # Use docker inspect to get env
        cmd = f'docker inspect {container_id} --format "{{{{json .Config.Env}}}}"'
        stdin, stdout, stderr = c.exec_command(cmd)
        env_json = stdout.read().decode().strip()
        
        try:
            env_list = json.loads(env_json)
            for e in env_list:
                if 'DATABASE' in e or 'DB_' in e or 'PRISMA' in e:
                    print(f"  {e}")
        except:
            print(f"Raw env: {env_json[:500]}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
