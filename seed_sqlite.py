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
    
    # 1. Find the app container
    print("\n=== Finding App Container ===")
    cmd = 'docker ps --filter "name=vgk8" --format "{{.ID}} {{.Names}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    container_info = stdout.read().decode().strip()
    print(f"Container: {container_info}")
    container_id = container_info.split()[0] if container_info else None
    
    if not container_id:
        print("No container found!")
        c.close()
        sys.exit(1)
    
    # 2. Check the SQLite DB exists
    print("\n=== Checking SQLite DB ===")
    cmd = f'docker exec {container_id} ls -la /app/data/database.sqlite'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode().strip())
    print(stderr.read().decode().strip())
    
    # 3. Check existing tables
    print("\n=== Tables in SQLite DB ===")
    cmd = f'docker exec {container_id} sqlite3 /app/data/database.sqlite ".tables"'
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    print(f"Tables: {out}")
    if err:
        print(f"Error: {err}")
        # Try with npx prisma instead
        print("\n=== Trying with node ===")
        cmd = f'docker exec {container_id} which sqlite3 2>/dev/null || echo "no sqlite3"'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"sqlite3: {stdout.read().decode().strip()}")
        
        # Try installing sqlite3
        cmd = f'docker exec {container_id} apt-get update > /dev/null 2>&1 && apt-get install -y sqlite3 > /dev/null 2>&1 && echo "installed" || echo "failed"'
        stdin, stdout, stderr = c.exec_command(cmd, timeout=30)
        print(f"Install: {stdout.read().decode().strip()}")
    
    # 4. Check schema
    print("\n=== Schema ===")
    cmd = f'docker exec {container_id} sqlite3 /app/data/database.sqlite ".schema Page"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 5. Check existing pages
    print("\n=== Existing Pages ===")
    cmd = f'docker exec {container_id} sqlite3 /app/data/database.sqlite "SELECT id, slug, locale, title FROM Page LIMIT 10"'
    stdin, stdout, stderr = c.exec_command(cmd)
    pages = stdout.read().decode().strip()
    print(f"Pages: {pages}")
    
    # 6. Check existing widgets
    print("\n=== Existing Widgets ===")
    cmd = f'docker exec {container_id} sqlite3 /app/data/database.sqlite "SELECT id, type, pageId FROM Widget LIMIT 10"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode().strip())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
