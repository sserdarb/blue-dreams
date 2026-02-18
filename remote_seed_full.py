import paramiko
import sys
import base64

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    # Identify container
    cmd = 'docker ps --format "table {{.ID}}\t{{.Image}}\t{{.CreatedAt}}" | grep blue'
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode()
    print("Containers:\n" + out)
    
    container_id = out.strip().split()[0] if out.strip() else None
    
    if container_id:
        print(f"Target Container: {container_id}")
        
        # Read local file
        local_path = r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\prisma\seed-static-pages-full.ts'
        with open(local_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        b64 = base64.b64encode(content.encode('utf-8')).decode('utf-8')
        
        # Upload
        print("Uploading seed script...")
        cmd = f'docker exec {container_id} sh -c "echo {b64} | base64 -d > /app/prisma/seed-static-pages-full.ts"'
        c.exec_command(cmd)
        
        # Run
        print("Executing seed...")
        cmd = f'docker exec {container_id} npx tsx /app/prisma/seed-static-pages-full.ts'
        stdin, stdout, stderr = c.exec_command(cmd)
        
        print("STDOUT:", stdout.read().decode())
        print("STDERR:", stderr.read().decode())
        
    else:
        print("No container found.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
