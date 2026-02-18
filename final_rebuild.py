import paramiko, sys, time, os
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)
sftp = c.open_sftp()

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

CID = '3815dea559c9'
BASE = r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix'

# Step 1: Stop container
print("=== STOP ===")
run(f'docker update --restart=no {CID}')
run(f'docker stop {CID} 2>/dev/null', t=10)
st, _ = run(f'docker ps -a --filter "id={CID}" --format "{{{{.Status}}}}"')
print(f"Container: {st}")

# Step 2: Upload ALL fixed files via SFTP
print("\n=== UPLOAD FILES ===")
files = [
    'prisma/schema.prisma',
    'app/api/ai/chat/route.ts',
    'app/api/ai/settings/route.ts',
    'app/admin/ai-training/page.tsx',
    'app/api/admin/users/route.ts',
    'app/admin/users/page.tsx',
    'app/admin/login/page.tsx',
    'app/admin/layout.tsx',
    'app/actions/auth.ts',
    'app/api/analytics/data/route.ts',
    'components/admin/widget-editors/widget-types.ts',
    'components/admin/widget-editors/index.tsx',
    'nixpacks.toml',
    'prisma/seed.js',
]

for rel in files:
    local = os.path.join(BASE, rel.replace('/', '\\'))
    if os.path.exists(local):
        tmp = f'/tmp/fix_{rel.replace("/", "_")}'
        sftp.put(local, tmp)
        run(f'docker cp {tmp} {CID}:/app/{rel}')
        print(f"  ✓ {rel}")

# Verify schema
run(f'docker cp {CID}:/app/prisma/schema.prisma /tmp/check_schema.prisma')
cnt, _ = run('grep -c "model AdminUser" /tmp/check_schema.prisma')
print(f"\nAdminUser count: {cnt}")
assert cnt.strip() == '1', f"STILL DUPLICATE: {cnt}"
sftp.close()

# Step 3: Clean old images/builders and commit
print("\n=== COMMIT ===")
run('docker rm -f bdb 2>/dev/null')
run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
o, _ = run(f'docker commit {CID} blue-dreams-rebuild:latest')
print(f"Image: {o[:40]}")

# Verify in image too
cnt, _ = run('docker run --rm --entrypoint /bin/bash blue-dreams-rebuild:latest -c "grep -c \'model AdminUser\' /app/prisma/schema.prisma"', t=15)
print(f"AdminUser in image: {cnt}")

# Step 4: Build
print("\n=== BUILD (3-5 min) ===")
run('docker rm -f bdb 2>/dev/null')
o, e = run(
    'docker run --name bdb --entrypoint /bin/bash --network coolify '
    '-e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" '
    '-w /app blue-dreams-rebuild:latest '
    '-c "npx prisma generate 2>&1 && npm run build 2>&1"',
    t=600
)
lines = o.split('\n')
print(f"Build: {len(lines)} lines")
for l in lines[-12:]:
    print(f"  {l}")

# Check
bid, _ = run('docker exec bdb cat /app/.next/BUILD_ID 2>&1')
print(f"\nBUILD_ID: {bid}")

if bid and 'Error' not in bid and len(bid) > 5:
    print("\n✅ BUILD OK!")
    
    # Copy .next to original
    run('rm -rf /tmp/next_build /tmp/prisma_cl')
    run('docker cp bdb:/app/.next /tmp/next_build')
    run('docker cp bdb:/app/node_modules/.prisma /tmp/prisma_cl 2>/dev/null')
    run(f'docker cp /tmp/next_build {CID}:/app/.next')
    run(f'docker cp /tmp/prisma_cl {CID}:/app/node_modules/.prisma 2>/dev/null')
    
    run('docker rm -f bdb')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    
    # Start
    print("\n=== START ===")
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)
    print("Waiting 25s...")
    time.sleep(25)
    
    st, _ = run(f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
    print(f"Status: {st}")
    
    if 'Up' in st and 'Restarting' not in st:
        # Prisma push
        o, _ = run(f'docker exec -w /app {CID} npx prisma db push --accept-data-loss 2>&1', t=60)
        print(f"Prisma: {o[-200:]}")
        
        # Test
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1', t=15)
        print(f"Homepage: {s}")
        
        s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
        print(f"External: {s}")
        
        print("\n✅ TAMAM!")
    else:
        logs, _ = run(f'docker logs {CID} --tail 15 2>&1')
        print(f"Sorun:\n{logs}")
else:
    print("\n❌ BUILD BAŞARISIZ")
    if e:
        print(f"Stderr: {e[-300:]}")
    run('docker rm -f bdb 2>/dev/null')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}')

c.close()
