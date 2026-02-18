import paramiko, sys, time, json
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=60):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip()

out = run('docker ps -a --filter "name=vgk8" --format "{{.ID}} {{.Status}}"')
cid = out.split()[0]
print(f"Container: {out}")

# The container keeps restarting. We need to catch it in a running state to rebuild.
# Docker exec can still work on restarting containers if we catch the window.
# Better approach: stop and start properly.

# First, stop the container to prevent restart loops
print("\n1. Stopping container...")
run(f'docker stop {cid}', t=30)
time.sleep(3)

# Start it with a different command that won't fail
print("2. Starting container with sleep...")
run(f'docker start {cid}', t=10)
time.sleep(5)

# Wait for it to be running
for i in range(10):
    out = run(f'docker ps -a --filter "id={cid}" --format "{{{{.Status}}}}"')
    print(f"   Status: {out}")
    if 'Up' in out and 'Restarting' not in out:
        break
    time.sleep(3)

# Apply fixes to source
print("\n3. Applying fixes...")
run(f"""docker exec {cid} sed -i "s/gemini-2.0-flash-exp/gemini-2.0-flash/g" /app/app/api/ai/chat/route.ts""")
m = run(f'docker exec {cid} grep "model:" /app/app/api/ai/chat/route.ts')
print(f"   Model: {m}")

# Fix analytics SQL  
run(f"""docker exec {cid} sed -i 's/SELECT DATE(createdAt)/SELECT "createdAt"::date/g' /app/app/api/analytics/data/route.ts""")
run(f"""docker exec {cid} sed -i 's/FROM PageView/FROM "PageView"/g' /app/app/api/analytics/data/route.ts""")
run(f"""docker exec {cid} sed -i "s/WHERE createdAt >= ?/WHERE \\"createdAt\\" >= \\$1/g" /app/app/api/analytics/data/route.ts""")
run(f"""docker exec {cid} sed -i 's/GROUP BY DATE(createdAt)/GROUP BY "createdAt"::date/g' /app/app/api/analytics/data/route.ts""")

# Upload the settings route via base64
print("4. Uploading settings route via scp...")
sftp = c.open_sftp()
sftp.put(r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\api\ai\settings\route.ts', '/tmp/ai_settings_route.ts')
sftp.put(r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\admin\ai-training\page.tsx', '/tmp/ai_training_page.tsx')
sftp.close()

run(f'docker cp /tmp/ai_settings_route.ts {cid}:/app/app/api/ai/settings/route.ts')
run(f'docker cp /tmp/ai_training_page.tsx {cid}:/app/app/admin/ai-training/page.tsx')

m = run(f'docker exec {cid} grep "maskApiKey" /app/app/api/ai/settings/route.ts | head -1')
print(f"   Settings masking: {m.strip()}")

# Rebuild
print("\n5. Building Next.js...")
out = run(f'docker exec -w /app -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" {cid} npx next build 2>&1', t=300)
last = out[-300:] if len(out) > 300 else out
print(f"   Build result:\n{last}")

# Check build
has_build = run(f'docker exec {cid} ls /app/.next/BUILD_ID 2>&1')
print(f"\n   BUILD_ID: {has_build}")

if 'No such file' not in has_build:
    # Restart clean
    print("\n6. Restarting container...")
    run(f'docker restart {cid}', t=30)
    time.sleep(15)
    
    out = run(f'docker ps --filter "id={cid}" --format "{{{{.ID}}}} {{{{.Status}}}}"')
    print(f"   Container: {out}")
    
    # Test
    print("\n7. Testing...")
    s = run(f'docker exec {cid} curl -s "http://localhost:3000/api/ai/settings?locale=tr" 2>&1', t=15)
    print(f"   Settings: {s[:300]}")
    
    p = json.dumps({"messages":[{"role":"user","text":"Merhaba"}],"locale":"tr"})
    ch = run(f"""docker exec {cid} curl -s -X POST "http://localhost:3000/api/ai/chat" -H "Content-Type: application/json" -d '{p}' 2>&1""", t=30)
    print(f"   Chat: {ch[:300]}")
else:
    print("BUILD FAILED - no BUILD_ID found")

c.close()
