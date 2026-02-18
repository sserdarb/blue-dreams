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
    
    # Find the LATEST container
    cmd = 'docker ps --filter "name=vgk8" --format "{{.ID}} {{.CreatedAt}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode().strip()
    print(f"Container: {out}")
    
    container_id = out.split()[0] if out else None
    
    if container_id:
        # Get full env
        cmd = f'docker inspect {container_id} --format "{{{{json .Config.Env}}}}"'
        stdin, stdout, stderr = c.exec_command(cmd)
        env_json = stdout.read().decode().strip()
        
        try:
            env_list = json.loads(env_json)
            for e in env_list:
                if 'DATABASE' in e:
                    print(f"  DB: {e}")
                if 'NODE_ENV' in e:
                    print(f"  ENV: {e}")
        except:
            print(f"Raw: {env_json[:200]}")
        
        # Check container logs for prisma errors
        cmd = f'docker logs --tail 20 {container_id} 2>&1'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"\nLogs:\n{stdout.read().decode()}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
