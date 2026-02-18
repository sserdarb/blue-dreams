import paramiko, sys, time, json
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=60):
    si, so, se = c.exec_command(cmd, timeout=t)
    out = so.read().decode('utf-8', errors='replace').strip()
    err = se.read().decode('utf-8', errors='replace').strip()
    return out, err

out, _ = run('docker ps -a --filter "name=vgk8" --format "{{.ID}}"')
cid = out.split('\n')[0].strip()
print(f"Container: {cid}")

# 1. Remove restart policy so Docker stops restarting
print("\n1. Updating restart policy to 'no'...")
out, err = run(f'docker update --restart=no {cid}')
print(f"   {out} {err}")

# 2. Stop the container
print("2. Stopping container...")
out, _ = run(f'docker stop {cid}', t=30)
print(f"   {out}")
time.sleep(3)

# 3. Start it
print("3. Starting container...")
out, _ = run(f'docker start {cid}', t=10)
print(f"   {out}")
time.sleep(8)

# Verify it's running
out, _ = run(f'docker ps -a --filter "id={cid}" --format "{{{{.Status}}}}"')
print(f"   Status: {out}")

# 4. Apply source fixes
print("\n4. Applying source fixes...")
out, _ = run(f"""docker exec {cid} sed -i "s/gemini-2.0-flash-exp/gemini-2.0-flash/g" /app/app/api/ai/chat/route.ts""")
m, _ = run(f'docker exec {cid} grep "model:" /app/app/api/ai/chat/route.ts')
print(f"   Model: {m}")

# Upload files via docker cp
print("5. Uploading files via docker cp...")
sftp = c.open_sftp()
sftp.put(r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\api\ai\settings\route.ts', '/tmp/settings_route.ts')
sftp.put(r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\admin\ai-training\page.tsx', '/tmp/ai_training.tsx')
sftp.close()

run(f'docker cp /tmp/settings_route.ts {cid}:/app/app/api/ai/settings/route.ts')
run(f'docker cp /tmp/ai_training.tsx {cid}:/app/app/admin/ai-training/page.tsx')

m, _ = run(f'docker exec {cid} grep -c "maskApiKey" /app/app/api/ai/settings/route.ts')
print(f"   Settings has masking: {m} occurrences")

# Analytics SQL fix
run(f"""docker exec {cid} sed -i 's/SELECT DATE(createdAt)/SELECT "createdAt"::date/g' /app/app/api/analytics/data/route.ts""")
run(f"""docker exec {cid} sed -i 's/FROM PageView/FROM "PageView"/g' /app/app/api/analytics/data/route.ts""")
run(f"""docker exec {cid} sed -i "s/WHERE createdAt >= ?/WHERE \\"createdAt\\" >= \\$1/g" /app/app/api/analytics/data/route.ts""")
run(f"""docker exec {cid} sed -i 's/GROUP BY DATE(createdAt)/GROUP BY "createdAt"::date/g' /app/app/api/analytics/data/route.ts""")

# 6. Build (no healthcheck interference now)
print("\n6. Building Next.js (may take 3-5 min)...")
out, err = run(f'docker exec -w /app -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" {cid} npx next build 2>&1', t=600)
last = out[-400:] if len(out) > 400 else out
print(f"   Build output (last 400):\n{last}")

# Check BUILD_ID
bid, _ = run(f'docker exec {cid} cat /app/.next/BUILD_ID 2>&1')
print(f"\n   BUILD_ID: {bid}")

if bid and 'No such file' not in bid and 'Error' not in bid:
    print("\n7. Build SUCCESS! Restoring restart policy and restarting...")
    run(f'docker update --restart=unless-stopped {cid}')
    run(f'docker restart {cid}', t=30)
    time.sleep(15)
    
    out, _ = run(f'docker ps --filter "id={cid}" --format "{{{{.Status}}}}"')
    print(f"   Status: {out}")
    
    # Test
    if 'Up' in out:
        print("\n8. Testing APIs...")
        s, _ = run(f'docker exec {cid} curl -s "http://localhost:3000/api/ai/settings?locale=tr" 2>&1', t=15)
        print(f"   Settings: {s[:400]}")
        
        p = json.dumps({"messages":[{"role":"user","text":"Merhaba"}],"locale":"tr"})
        ch, _ = run(f"""docker exec {cid} curl -s -X POST "http://localhost:3000/api/ai/chat" -H "Content-Type: application/json" -d '{p}' 2>&1""", t=30)
        print(f"   Chat: {ch[:400]}")
else:
    print("\nBUILD FAILED! Restoring restart policy anyway...")
    run(f'docker update --restart=unless-stopped {cid}')
    print("   Check build errors above")

c.close()
