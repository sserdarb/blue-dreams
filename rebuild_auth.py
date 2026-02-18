import paramiko, sys, time, os
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)
sftp = c.open_sftp()

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

IMAGE = 'vgk8cscos8os8wwsogkss004:276bda8908fbac1a4fd202fbe26d1ee0d5cf320e'
BASE = r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix'
CNAME = 'vgk8cscos8os8wwsogkss004-222918143524'
DB_URL = 'postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2'

# Full cleanup
print("=== Cleanup ===")
for n in ['blue-dreams-temp', 'bdb', CNAME]:
    run(f'docker rm -f {n} 2>/dev/null')
for img in ['blue-dreams-build:latest', 'blue-dreams-final:latest']:
    run(f'docker rmi {img} 2>/dev/null')

# Step 1: Create temp container, inject files
print("\n=== Step 1: Inject files ===")
o, _ = run(f'docker create --name blue-dreams-temp --entrypoint /bin/bash {IMAGE} -c "sleep 1"')
print(f"Temp: {o[:16]}")

files = [
    'prisma/schema.prisma',
    'app/actions/auth.ts',
    'app/api/admin/users/route.ts',
    'app/admin/users/page.tsx',
    'app/admin/login/page.tsx',
    'app/admin/layout.tsx',
    'app/api/ai/chat/route.ts',
    'app/api/ai/settings/route.ts',
    'app/admin/ai-training/page.tsx',
    'app/api/analytics/data/route.ts',
    'components/admin/widget-editors/widget-types.ts',
    'components/admin/widget-editors/index.tsx',
    'nixpacks.toml',
    'prisma/seed.js',
    'package.json',
]
for rel in files:
    local = os.path.join(BASE, rel.replace('/', '\\'))
    if os.path.exists(local):
        tmp = f'/tmp/bdf_{os.path.basename(local)}'
        sftp.put(local, tmp)
        run(f'docker cp {tmp} blue-dreams-temp:/app/{rel}')
        print(f"  + {rel}")

# Verify schema
run('docker cp blue-dreams-temp:/app/prisma/schema.prisma /tmp/vs.prisma')
cnt, _ = run('grep -c "model AdminUser" /tmp/vs.prisma')
print(f"\nAdminUser count: {cnt}")
sftp.close()

if cnt.strip() != '1':
    print("SCHEMA ERROR!")
    run('docker rm -f blue-dreams-temp')
    c.close()
    sys.exit(1)

# Step 2: Commit
print("\n=== Step 2: Commit ===")
o, _ = run('docker commit blue-dreams-temp blue-dreams-build:latest')
run('docker rm -f blue-dreams-temp')
print(f"Image: {o[:30]}")

# Step 3: Install bcryptjs + Build
print("\n=== Step 3: Install bcryptjs + Build (3-5 min) ===")
o, e = run(
    f'docker run --name bdb --entrypoint /bin/bash --network coolify '
    f'-e DATABASE_URL="{DB_URL}" -w /app blue-dreams-build:latest '
    f'-c "npm install bcryptjs 2>&1 && npx prisma generate 2>&1 && npm run build 2>&1"',
    t=600
)
lines = o.split('\n')
print(f"Output: {len(lines)} lines")
for l in lines[-10:]:
    print(f"  {l}")

# Check BUILD_ID via docker cp
run('docker cp bdb:/app/.next/BUILD_ID /tmp/bid 2>/dev/null')
bid, _ = run('cat /tmp/bid 2>/dev/null')
print(f"\nBUILD_ID: {bid}")

if not bid or len(bid) < 5:
    print("BUILD FAILED!")
    # Show more output for debugging
    for l in lines[-30:]:
        print(f"  > {l}")
    if e:
        print(f"Stderr: {e[-500:]}")
    run('docker rm -f bdb')
    run('docker rmi blue-dreams-build:latest 2>/dev/null')
    c.close()
    sys.exit(1)

print("BUILD OK!")

# Step 4: Commit built image
print("\n=== Step 4: Commit built image ===")
o, _ = run('docker commit bdb blue-dreams-final:latest')
run('docker rm -f bdb')
run('docker rmi blue-dreams-build:latest 2>/dev/null')
print(f"Final: {o[:30]}")

# Step 5: Deploy
print("\n=== Step 5: Deploy ===")
create_cmd = (
    f'docker run -d --name {CNAME} --network coolify '
    f'--restart unless-stopped '
    f'-e DATABASE_URL="{DB_URL}" '
    f'-e ADMIN_EMAIL="sserdarb@gmail.com" '
    f'-e ADMIN_PASSWORD="Tuba@2015Tuana" '
    f'-e NODE_ENV="production" '
    f'-e PORT="3000" '
    f'--label "traefik.enable=true" '
    f'--label "coolify.applicationId=vgk8cscos8os8wwsogkss004" '
    f"""--label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-http.rule=Host(\\`new.bluedreamsresort.com\\`)" """
    f'--label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-http.entryPoints=http" '
    f'--label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-http.middlewares=redirect-to-https@docker" '
    f"""--label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-https.rule=Host(\\`new.bluedreamsresort.com\\`)" """
    f'--label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-https.entryPoints=https" '
    f'--label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-https.tls=true" '
    f'--label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-https.tls.certresolver=letsencrypt" '
    f'--label "traefik.http.services.vgk8cscos8os8wwsogkss004-0.loadbalancer.server.port=3000" '
    f'--entrypoint /bin/bash '
    f'blue-dreams-final:latest '
    f'-c "cd /app && npx prisma db push --accept-data-loss 2>&1 && node prisma/seed.js 2>/dev/null; npm start"'
)
o, e = run(create_cmd, t=30)
print(f"Container: {o[:16]}")
if e:
    print(f"Err: {e[:200]}")

# Wait for startup
print("Waiting 40s...")
time.sleep(40)

st, _ = run(f'docker ps --filter "name={CNAME}" --format "{{{{.Status}}}}"')
print(f"Status: {st}")

if st and 'Up' in st:
    logs, _ = run(f'docker logs {CNAME} --tail 8 2>&1')
    print(f"\nLogs:\n{logs}")
    
    s, _ = run(f'docker exec {CNAME} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1', t=15)
    print(f"\nInternal: {s}")
    
    time.sleep(5)
    s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
    print(f"External: {s}")

    # Test login API with DB user
    print("\n=== Test Login ===")
    s, _ = run(f'''docker exec {CNAME} curl -s "http://localhost:3000/api/admin/users" \
        -H "Cookie: admin_session=%7B%22email%22%3A%22sserdarb%40gmail.com%22%2C%22role%22%3A%22superadmin%22%2C%22name%22%3A%22Admin%22%7D" 2>&1 | head -c 300''', t=10)
    print(f"Users API: {s[:200]}")

    # Check DB users
    out, _ = run('''docker exec coolify-db psql -U coolify -d blue_dreams_v2 -c "SELECT email, \\\"isActive\\\", substring(password, 1, 10) as pwd_prefix FROM \\\"AdminUser\\\";" 2>&1''', t=10)
    print(f"\nDB Users:\n{out}")
    
    print("\n=== DONE ===")
else:
    logs, _ = run(f'docker logs {CNAME} --tail 20 2>&1')
    print(f"\nFailed:\n{logs}")

run('docker rmi blue-dreams-final:latest 2>/dev/null')
c.close()
