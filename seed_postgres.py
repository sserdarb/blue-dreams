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

results = []

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    results.append(f"App Container: {cid}")
    
    # Step 1: Verify Prisma schema is set to postgresql (it should be from the startup)
    results.append("\n=== Step 1: Verify Prisma schema ===")
    out, _ = run(c, f'docker exec {cid} head -8 /app/prisma/schema.prisma')
    results.append(out)
    
    # If schema says sqlite, change to postgresql 
    if 'sqlite' in out:
        results.append("Schema is sqlite, patching to postgresql...")
        run(c, f'docker exec {cid} sed -i \'s/provider = "sqlite"/provider = "postgresql"/\' /app/prisma/schema.prisma')
        out, _ = run(c, f'docker exec {cid} head -8 /app/prisma/schema.prisma')
        results.append(f"After patch: {out}")
    
    # Step 2: Regenerate Prisma Client for PostgreSQL
    results.append("\n=== Step 2: Regenerate Prisma Client for PostgreSQL ===")
    PG_URL = "postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2"
    out, err = run(c, f'docker exec -w /app -e DATABASE_URL="{PG_URL}" {cid} npx prisma generate 2>&1', timeout=60)
    results.append(f"Generate: {out}")
    if err:
        results.append(f"Err: {err[:300]}")
    
    # Step 3: Push schema to PostgreSQL (in case tables are missing)
    results.append("\n=== Step 3: Push schema to PostgreSQL ===")
    out, err = run(c, f'docker exec -w /app -e DATABASE_URL="{PG_URL}" {cid} npx prisma db push --accept-data-loss 2>&1', timeout=60)
    results.append(f"Push: {out}")
    
    # Step 4: Create the JS seed script for PostgreSQL
    results.append("\n=== Step 4: Running seed against PostgreSQL ===")
    out, err = run(c, f'docker exec -w /app -e DATABASE_URL="{PG_URL}" {cid} node prisma/seed.js 2>&1', timeout=120)
    results.append(f"Seed output:\n{out}")
    if err:
        results.append(f"Seed err: {err[:500]}")
    
    # Step 5: Verify data in PostgreSQL
    results.append("\n=== Step 5: Verify PostgreSQL data ===")
    db_cid = '7b196ff456e5'  # coolify-db container
    
    for table in ['"Page"', '"Widget"', '"AdminUser"', '"Language"', '"SiteSettings"', '"MenuItem"']:
        out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d blue_dreams_v2 -t -c "SELECT COUNT(*) FROM {table};" 2>&1')
        results.append(f"  {table}: {out.strip()}")
    
    # List pages
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d blue_dreams_v2 -t -c "SELECT slug, locale, title FROM \\"Page\\" ORDER BY slug, locale LIMIT 20;"')
    results.append(f"\nPages:\n{out}")
    
    c.close()
    
    result_text = '\n'.join(results)
    with open('pg_seed_output.txt', 'w', encoding='utf-8') as f:
        f.write(result_text)
    print(result_text)
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
