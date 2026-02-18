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
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    print(f"Container: {cid}")
    
    # 1. Check what Prisma schema the running app uses
    print("\n=== 1. Prisma Schema provider ===")
    out, _ = run(c, f'docker exec {cid} head -10 /app/prisma/schema.prisma')
    print(out)
    
    # 2. Check the generated Prisma client provider
    print("\n=== 2. Generated client config ===")
    out, _ = run(c, f'docker exec {cid} head -10 /app/node_modules/.prisma/client/schema.prisma 2>/dev/null || echo "NOT FOUND"')
    print(out)
    
    # 3. Check DB has data
    print("\n=== 3. Database content ===")
    for table in ['Page', 'Widget', 'AdminUser', 'Language', 'SiteSettings', 'MenuItem']:
        out, _ = run(c, f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT COUNT(*) FROM {table};" 2>&1')
        print(f"  {table}: {out}")
    
    # 4. Check the home page data specifically
    print("\n=== 4. Home page TR ===")
    out, _ = run(c, f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT id, slug, locale, title FROM Page WHERE slug=\'home\' AND locale=\'tr\';"')
    print(f"  Page: {out}")
    
    out, _ = run(c, f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT id, type, substr(data,1,100) FROM Widget WHERE pageId IN (SELECT id FROM Page WHERE slug=\'home\' AND locale=\'tr\') ORDER BY \\\"order\\\";"')
    print(f"  Widgets: {out}")
    
    # 5. Check the app logs for errors
    print("\n=== 5. Container logs (last 30 lines) ===")
    out, _ = run(c, f'docker logs {cid} --tail 30 2>&1')
    print(out)
    
    # 6. Check curl from inside container
    print("\n=== 6. Internal curl test ===")
    out, _ = run(c, f'docker exec {cid} curl -s localhost:3000/tr 2>&1 | head -50')
    print(out[:1000])
    
    # 7. Verify DATABASE_URL env var the app is running with
    print("\n=== 7. Runtime DATABASE_URL ===")
    out, _ = run(c, f'docker exec {cid} sh -c "echo \\$DATABASE_URL"')
    print(f"  DATABASE_URL: {out}")
    
    c.close()
    
    with open('diagnose_output.txt', 'w', encoding='utf-8') as f:
        f.write("Done")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
