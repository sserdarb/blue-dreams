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
    
    # 1. Fix the Gemini model name
    results.append("\n=== Fixing AI chat route ===")
    run(c, f"""docker exec {cid} sed -i "s/gemini-2.0-flash-exp/gemini-2.0-flash/g" /app/app/api/ai/chat/route.ts""")
    out, _ = run(c, f'docker exec {cid} grep "model:" /app/app/api/ai/chat/route.ts')
    results.append(f"Model line: {out.strip()}")
    
    # 2. Fix analytics SQL
    results.append("\n=== Fixing analytics SQL ===")
    run(c, f"""docker exec {cid} sed -i 's/SELECT DATE(createdAt)/SELECT "createdAt"::date/g' /app/app/api/analytics/data/route.ts""")
    run(c, f"""docker exec {cid} sed -i 's/FROM PageView/FROM "PageView"/g' /app/app/api/analytics/data/route.ts""")
    run(c, f"""docker exec {cid} sed -i "s/WHERE createdAt >= ?/WHERE \\"createdAt\\" >= \\$1/g" /app/app/api/analytics/data/route.ts""")
    run(c, f"""docker exec {cid} sed -i 's/GROUP BY DATE(createdAt)/GROUP BY "createdAt"::date/g' /app/app/api/analytics/data/route.ts""")
    out, _ = run(c, f'docker exec {cid} grep -A5 "queryRawUnsafe" /app/app/api/analytics/data/route.ts | head -8')
    results.append(f"Analytics query:\n{out.strip()}")
    
    # 3. Rebuild
    results.append("\n=== Rebuilding Next.js (this takes ~3min) ===")
    out, err = run(c, f'docker exec -w /app -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" {cid} npm run build 2>&1', timeout=300)
    
    # Check for errors
    last_500 = out[-500:] if len(out) > 500 else out
    if 'error' in last_500.lower() and 'linting' not in last_500.lower():
        results.append(f"Build might have errors:\n{last_500}")
    else:
        results.append(f"Build result (last 300 chars):\n{out[-300:]}")
    
    # 4. Restart
    results.append("\n=== Restarting ===")
    run(c, f'docker exec {cid} pkill -f "next start" 2>&1')
    time.sleep(8)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}} {{.Status}}"')
    results.append(f"Container: {out}")
    
    time.sleep(10)
    
    # 5. Test
    results.append("\n=== Testing /api/ai/chat ===")
    test_payload = json.dumps({"messages": [{"role": "user", "text": "Merhaba"}], "locale": "tr"})
    out, _ = run(c, f"""docker exec {cid} curl -s -X POST "http://localhost:3000/api/ai/chat" -H "Content-Type: application/json" -d '{test_payload}' 2>&1""", timeout=30)
    results.append(f"Chat response: {out[:800]}")
    
    c.close()
    
    result_text = '\n'.join(results)
    with open('concierge_fix2.txt', 'w', encoding='utf-8') as f:
        f.write(result_text)
    print(result_text)

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
