import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def run(c, cmd, timeout=60):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    print(f"Container: {cid}")
    
    # Step 1: Patch the Prisma schema to use SQLite
    print("\n=== Step 1: Patch schema to SQLite ===")
    cmd = f'docker exec {cid} sed -i \'s/provider = "postgresql"/provider = "sqlite"/\' /app/prisma/schema.prisma'
    run(c, cmd)
    
    # Verify
    out, _ = run(c, f'docker exec {cid} head -8 /app/prisma/schema.prisma')
    print(f"Schema:\n{out}")
    
    # Step 2: Regenerate Prisma Client for SQLite
    print("\n=== Step 2: Regenerate Prisma Client ===")
    cmd = f'docker exec -w /app -e DATABASE_URL="file:/app/data/database.sqlite" {cid} npx prisma generate 2>&1'
    out, err = run(c, cmd, timeout=60)
    print(f"Generate: {out}")
    if err:
        print(f"Error: {err[:300]}")
    
    # Step 3: Run the seed
    print("\n=== Step 3: Run seed ===")
    cmd = f'docker exec -w /app -e DATABASE_URL="file:/app/data/database.sqlite" {cid} node prisma/seed.js 2>&1'
    out, err = run(c, cmd, timeout=120)
    
    # Save full output
    with open('seed_final_output.txt', 'w', encoding='utf-8') as f:
        f.write(f"STDOUT:\n{out}\n\nSTDERR:\n{err}\n")
    
    print(f"Output:\n{out}")
    if err:
        print(f"Error:\n{err[:500]}")
    
    # Step 4: Check results
    print("\n=== Results ===")
    for table in ['Page', 'Widget', 'AdminUser', 'Language', 'MenuItem']:
        out, _ = run(c, f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT COUNT(*) FROM {table};"')
        print(f"{table}: {out}")
    
    out, _ = run(c, f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT slug, locale, title FROM Page ORDER BY slug, locale LIMIT 50;"')
    print(f"\nPages:\n{out}")
    
    c.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
