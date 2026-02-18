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
    
    # Find container
    cmd = 'docker ps --filter "name=vgk8" --format "{{.ID}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    container_id = stdout.read().decode().strip()
    print(f"Container: {container_id}")
    
    if container_id:
        # Check DATABASE_URL specifically
        cmd = f'docker exec {container_id} sh -c "echo $DATABASE_URL"'
        stdin, stdout, stderr = c.exec_command(cmd)
        db_url = stdout.read().decode().strip()
        print(f"DATABASE_URL = {db_url}")
        
        # Check NODE_ENV
        cmd = f'docker exec {container_id} sh -c "echo $NODE_ENV"'
        stdin, stdout, stderr = c.exec_command(cmd)
        node_env = stdout.read().decode().strip()
        print(f"NODE_ENV = {node_env}")
        
        # Check server.js logs (tail)
        cmd = f'docker logs --tail 30 {container_id}'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"\nLogs:\n{stdout.read().decode()}")
        print(f"Stderr:\n{stderr.read().decode()[-500:]}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
