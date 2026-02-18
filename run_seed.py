import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def run(c, cmd, timeout=30):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    # Find container
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    print(f"Container: {cid}")
    
    # Check if seed files exist in container
    print("\n=== Checking seed files ===")
    out, _ = run(c, f'docker exec {cid} ls -la /app/prisma/ 2>&1')
    print(out)
    
    # Check if node_modules/@prisma/client exists
    print("\n=== Checking Prisma client ===")
    out, _ = run(c, f'docker exec {cid} ls /app/node_modules/@prisma/client/index.js 2>&1')
    print(f"Prisma client: {out}")
    
    out, _ = run(c, f'docker exec {cid} ls /app/node_modules/.prisma/client/index.js 2>&1')
    print(f".prisma client: {out}")
    
    # Check the actual working directory and file structure
    print("\n=== App structure ===")
    out, _ = run(c, f'docker exec {cid} ls /app/ 2>&1')
    print(out)
    
    # Check if there's a .next directory (standalone)
    print("\n=== .next directory ===")
    out, _ = run(c, f'docker exec {cid} ls /app/.next/ 2>&1')
    print(out)
    
    # Check if package.json has prisma seed config
    print("\n=== Package.json prisma config ===")
    out, _ = run(c, f'docker exec {cid} cat /app/package.json 2>&1 | grep -A5 prisma')
    print(out)
    
    # Try running npx prisma db seed
    print("\n=== Running seed ===")
    out, err = run(c, f'docker exec -e DATABASE_URL="file:/app/data/database.sqlite" {cid} npx prisma db seed 2>&1', timeout=60)
    print(f"Output: {out}")
    if err:
        print(f"Error: {err[:500]}")
    
    # Check if pages were created
    print("\n=== After seed: Page count ===")
    out, _ = run(c, f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT COUNT(*) FROM Page;"')
    print(f"Page count: {out}")
    
    out, _ = run(c, f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT slug, locale FROM Page LIMIT 20;"')
    print(f"Pages: {out}")
    
    c.close()
    
except Exception as e:
    print(f"Error: {e}")
