import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    # Find the app container
    cmd = 'docker ps --filter "name=vgk8" --format "{{.ID}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    container_id = stdout.read().decode().strip().split('\n')[0]
    print(f"Container: {container_id}")
    
    # Check if DB file exists and get path
    print("\n=== DB file exists? ===")
    cmd = f'docker exec {container_id} ls -la /app/data/ 2>&1'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode().strip())
    
    # Check the Prisma schema inside container
    print("\n=== Prisma Schema ===")
    cmd = f'docker exec {container_id} cat /app/prisma/schema.prisma 2>/dev/null || cat /app/node_modules/.prisma/client/schema.prisma 2>/dev/null'
    stdin, stdout, stderr = c.exec_command(cmd)
    schema = stdout.read().decode().strip()
    print(schema[:500])
    
    # Install sqlite3 - the container uses nix, try nix-env or apt
    print("\n=== Installing sqlite3 ===")
    cmd = f'docker exec {container_id} sh -c "apt-get update > /dev/null 2>&1; apt-get install -y sqlite3 > /dev/null 2>&1 && echo SUCCESS || echo FAILED"'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=60)
    result = stdout.read().decode().strip()
    print(f"apt install: {result}")
    
    if 'FAILED' in result:
        # Try nix-env
        cmd = f'docker exec {container_id} sh -c "nix-env -iA nixpkgs.sqlite && echo SUCCESS || echo FAILED"'
        stdin, stdout, stderr = c.exec_command(cmd, timeout=60)
        result = stdout.read().decode().strip()
        print(f"nix install: {result}")
    
    if 'FAILED' in result:
        # Try downloading static binary
        print("Trying static binary...")
        cmd = f'docker exec {container_id} sh -c "curl -L https://www.sqlite.org/2024/sqlite-tools-linux-x64-3470000.zip -o /tmp/sqlite.zip && cd /tmp && unzip sqlite.zip && chmod +x sqlite-tools-linux-x64-3470000/sqlite3 && cp sqlite-tools-linux-x64-3470000/sqlite3 /usr/local/bin/ && echo SUCCESS"'
        stdin, stdout, stderr = c.exec_command(cmd, timeout=30)
        result = stdout.read().decode().strip()
        print(f"Static binary: {result}")
    
    # Verify sqlite3 works
    print("\n=== Verifying sqlite3 ===")
    cmd = f'docker exec {container_id} sqlite3 /app/data/database.sqlite ".tables"'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=10)
    tables = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    print(f"Tables: {tables}")
    if err:
        print(f"Error: {err}")
    
    if tables:
        # Check schema
        print("\n=== Page Schema ===")
        cmd = f'docker exec {container_id} sqlite3 /app/data/database.sqlite ".schema Page"'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(stdout.read().decode())
        
        cmd = f'docker exec {container_id} sqlite3 /app/data/database.sqlite ".schema Widget"'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(stdout.read().decode())
        
        # Check existing data
        print("\n=== Existing Pages ===")
        cmd = f'docker exec {container_id} sqlite3 /app/data/database.sqlite "SELECT id, slug, locale, title FROM Page;"'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
