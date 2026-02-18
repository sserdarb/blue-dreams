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
    cmd = 'docker ps --filter "name=vgk8" --format "{{.ID}} {{.CreatedAt}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode().strip()
    print(f"Container: {out}")
    
    container_id = out.split()[0] if out else None
    
    if container_id:
        # Check DATABASE_URL
        cmd = f'docker inspect {container_id} --format "{{{{range .Config.Env}}}}{{{{println .}}}}{{{{end}}}}" | grep DATABASE'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"DB ENV: {stdout.read().decode().strip()}")
        
        # Check Prisma schema provider in production
        cmd = f'docker exec {container_id} head -10 /app/node_modules/.prisma/client/schema.prisma 2>/dev/null'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"\nPrisma Schema:\n{stdout.read().decode()}")
        
        # Check server logs
        cmd = f'docker logs --tail 10 {container_id} 2>&1'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"\nLogs:\n{stdout.read().decode()}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
