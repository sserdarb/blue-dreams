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
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    print(f"Container: {cid}")
    
    # Check if PostgreSQL has data
    db_cid = '7b196ff456e5'
    print("=== Checking PostgreSQL data ===")
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d blue_dreams_v2 -t -c "SELECT COUNT(*) FROM \\"Page\\";"')
    page_count = out.strip()
    print(f"Page count: {page_count}")
    
    if int(page_count) == 0:
        print("\n=== Re-seeding PostgreSQL ===")
        # Ensure Prisma is set to postgresql
        out, _ = run(c, f'docker exec {cid} head -8 /app/prisma/schema.prisma')
        print(f"Schema: {out}")
        
        PG_URL = "postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2"
        
        # Generate Prisma client for PG
        out, _ = run(c, f'docker exec -w /app -e DATABASE_URL="{PG_URL}" {cid} npx prisma generate 2>&1', timeout=60)
        print(f"Generate: {out[-100:]}")
        
        # Push schema
        out, _ = run(c, f'docker exec -w /app -e DATABASE_URL="{PG_URL}" {cid} npx prisma db push --accept-data-loss 2>&1', timeout=60)
        print(f"Push: {out[-100:]}")
        
        # Run seed
        out, err = run(c, f'docker exec -w /app -e DATABASE_URL="{PG_URL}" {cid} node prisma/seed.js 2>&1', timeout=120)
        print(f"Seed: {out[-200:]}")
        
        # Verify
        out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d blue_dreams_v2 -t -c "SELECT COUNT(*) FROM \\"Page\\";"')
        print(f"Page count after seed: {out.strip()}")
    else:
        print(f"Data exists ({page_count} pages)")
    
    # Check container logs for errors
    print("\n=== Container logs (last 20 lines) ===")
    out, _ = run(c, f'docker logs {cid} --tail 20 2>&1')
    print(out)
    
    c.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
