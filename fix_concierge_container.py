import paramiko
import sys
import time
import json

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
    results.append(f"Container: {cid}")
    
    # 1. Fix the Gemini model name in the chat API route
    results.append("\n=== Fixing AI chat route ===")
    run(c, f"""docker exec {cid} sed -i "s/gemini-2.0-flash-exp/gemini-2.0-flash/g" /app/app/api/ai/chat/route.ts""")
    
    # Verify the fix
    out, _ = run(c, f'docker exec {cid} grep "model:" /app/app/api/ai/chat/route.ts')
    results.append(f"Model line: {out.strip()}")
    
    # 2. Fix the analytics SQL query
    results.append("\n=== Fixing analytics SQL ===")
    # Replace SQLite-style query with PostgreSQL syntax
    run(c, f"""docker exec {cid} sed -i 's/SELECT DATE(createdAt)/SELECT "createdAt"::date/g' /app/app/api/analytics/data/route.ts""")
    run(c, f"""docker exec {cid} sed -i 's/FROM PageView/FROM "PageView"/g' /app/app/api/analytics/data/route.ts""")
    run(c, f"""docker exec {cid} sed -i 's/WHERE createdAt >= ?/WHERE "createdAt" >= $1/g' /app/app/api/analytics/data/route.ts""")
    run(c, f"""docker exec {cid} sed -i 's/GROUP BY DATE(createdAt)/GROUP BY "createdAt"::date/g' /app/app/api/analytics/data/route.ts""")
    
    out, _ = run(c, f'docker exec {cid} grep -A4 "queryRawUnsafe" /app/app/api/analytics/data/route.ts')
    results.append(f"Analytics query: {out.strip()}")
    
    # 3. Rebuild Next.js
    results.append("\n=== Rebuilding Next.js ===")
    out, err = run(c, f'docker exec -w /app -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" {cid} npm run build 2>&1', timeout=300)
    
    if 'error' in out.lower()[-200:] or 'failed' in out.lower()[-200:]:
        results.append(f"Build might have errors: {out[-500:]}")
    else:
        results.append(f"Build completed! Last: {out[-200:]}")
    
    # 4. Restart
    results.append("\n=== Restarting ===")
    run(c, f'docker exec {cid} pkill -f "next start" 2>&1')
    time.sleep(5)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}} {{.Status}}"')
    results.append(f"Container: {out}")
    
    # Wait for app to start
    time.sleep(8)
    
    # 5. Test chat again
    results.append("\n=== Re-testing /api/ai/chat ===")
    test_payload = json.dumps({"messages": [{"role": "user", "text": "Merhaba"}], "locale": "tr"})
    out, _ = run(c, f"""docker exec {cid} curl -s -X POST "http://localhost:3000/api/ai/chat" -H "Content-Type: application/json" -d '{test_payload}' 2>&1""", timeout=30)
    results.append(f"Response: {out[:500]}")
    
    c.close()
    
    result_text = '\n'.join(results)
    with open('concierge_fix_result.txt', 'w', encoding='utf-8') as f:
        f.write(result_text)
    print(result_text[:3000])

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
