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
    
    # Find the container
    cmd = 'docker ps --filter "name=vgk8" --format "{{.ID}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    container_id = stdout.read().decode().strip()
    print(f"Container: {container_id}")
    
    if container_id:
        # Get ALL env vars that contain DATABASE
        cmd = f'docker inspect {container_id} --format "{{{{range .Config.Env}}}}{{{{println .}}}}{{{{end}}}}" | grep -i database'
        stdin, stdout, stderr = c.exec_command(cmd)
        db_envs = stdout.read().decode().strip()
        print(f"DATABASE envs:\n{db_envs}")
        
        # Also check .env file inside container
        cmd = f'docker exec {container_id} cat /app/.env 2>/dev/null || echo "no .env"'
        stdin, stdout, stderr = c.exec_command(cmd)
        env_file = stdout.read().decode().strip()
        print(f"\n.env file:\n{env_file}")
        
        # Check if Prisma client exists
        cmd = f'docker exec {container_id} ls /app/node_modules/.prisma/client/schema.prisma 2>/dev/null || echo "no prisma client"'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"\nPrisma client: {stdout.read().decode().strip()}")
        
        # Check the Prisma schema in production
        cmd = f'docker exec {container_id} cat /app/node_modules/.prisma/client/schema.prisma 2>/dev/null | head -10'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"\nPrisma schema (prod):\n{stdout.read().decode()}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
