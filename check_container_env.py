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
    
    # 1. Find the NEW container (after rebuild)
    print("\n=== Current Containers ===")
    cmd = 'docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.CreatedAt}}" | head -15'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 2. Check the app container env  
    print("\n=== App Container Env ===")
    # First find by name
    cmd = 'docker ps --filter "name=vgk8" --format "{{.ID}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    container_id = stdout.read().decode().strip()
    print(f"Container ID: {container_id}")
    
    if container_id:
        # Check DATABASE_URL
        cmd = f'docker exec {container_id} env | grep DATABASE_URL'
        stdin, stdout, stderr = c.exec_command(cmd)
        db_url = stdout.read().decode().strip()
        print(f"DATABASE_URL: {db_url}")
        
        # Check processes
        cmd = f'docker exec {container_id} ps aux'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"\nProcesses:\n{stdout.read().decode()}")
        
        # Check if node or nginx
        cmd = f'docker exec {container_id} which node 2>/dev/null || echo "no node"'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"Node: {stdout.read().decode().strip()}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
