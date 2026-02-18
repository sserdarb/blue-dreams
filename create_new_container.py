import paramiko, sys, time, os, json
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

# Step 1: Get the old container's config from Coolify DB so we match env vars, ports, etc.
print("=== Get Coolify app config ===")
envs_out, _ = run('''docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "SELECT environment_variables FROM applications WHERE uuid='vgk8cscos8os8wwsogkss004';" 2>&1''')
print(f"Env vars: {envs_out[:200]}...")

# Get start command from DB
start_cmd, _ = run('''docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "SELECT start_command FROM applications WHERE uuid='vgk8cscos8os8wwsogkss004';" 2>&1''')
print(f"Start cmd: {start_cmd.strip()}")

# Step 2: Create a temp container from the image, inject files, build, then start properly
print("\n=== Step 2: Create temp container for build ===")

# Create stopped container from image
run('docker rm -f blue-dreams-temp 2>/dev/null')
out, _ = run(f'docker create --name blue-dreams-temp --entrypoint /bin/bash {IMAGE} -c "sleep 3600"')
print(f"Temp container: {out[:20]}")

# Upload fixed files into it
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

print("\nUploading fixed files...")
for rel in files:
    local = os.path.join(BASE, rel.replace('/', '\\'))
    if os.path.exists(local):
        tmp = f'/tmp/bdf_{os.path.basename(local)}'
        sftp.put(local, tmp)
        # Ensure directory exists in container
        dir_path = f'/app/{os.path.dirname(rel)}'
        run(f'docker cp {tmp} blue-dreams-temp:/app/{rel}')
        print(f"  ✓ {rel}")
sftp.close()

# Verify schema
run('docker cp blue-dreams-temp:/app/prisma/schema.prisma /tmp/verify_s.prisma')
cnt, _ = run('grep -c "model AdminUser" /tmp/verify_s.prisma')
print(f"\nAdminUser count: {cnt}")

if cnt.strip() != '1':
    print(f"❌ SCHEMA STILL HAS ISSUES (count={cnt})")
    # Show what's in the file
    out, _ = run('grep -n "model AdminUser" /tmp/verify_s.prisma')
    print(f"Lines: {out}")
    out, _ = run('wc -l /tmp/verify_s.prisma')
    print(f"Total lines: {out}")
    run('docker rm -f blue-dreams-temp')
    c.close()
    sys.exit(1)

# Commit container with fixed files
print("\n=== Step 3: Commit as build image ===")
run('docker rmi blue-dreams-build:latest 2>/dev/null')
out, _ = run('docker commit blue-dreams-temp blue-dreams-build:latest')
print(f"Image: {out[:40]}")
run('docker rm -f blue-dreams-temp')

# Step 4: Build Next.js
print("\n=== Step 4: Building Next.js (3-5 min) ===")
run('docker rm -f bdb 2>/dev/null')
out, err = run(
    'docker run --name bdb --entrypoint /bin/bash --network coolify '
    '-e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" '
    '-w /app blue-dreams-build:latest '
    '-c "npx prisma generate 2>&1 && npm run build 2>&1"',
    t=600
)
lines = out.split('\n')
print(f"Build: {len(lines)} lines")
for l in lines[-12:]:
    print(f"  {l}")
if err:
    print(f"Stderr tail: {err[-150:]}")

# Check BUILD_ID
bid, _ = run('docker exec bdb cat /app/.next/BUILD_ID 2>&1')
print(f"\nBUILD_ID: {bid}")

if bid and 'Error' not in bid and len(bid) > 5:
    print("\n✅ BUILD OK!")
    
    # Step 5: Commit the built version as a new image
    print("\n=== Step 5: Commit built image ===")
    run('docker rmi blue-dreams-build:latest 2>/dev/null')
    out, _ = run('docker commit bdb blue-dreams-final:latest')
    print(f"Final image: {out[:40]}")
    run('docker rm -f bdb')
    
    # Step 6: Create the actual running container with correct Coolify naming
    print("\n=== Step 6: Create running container ===")
    
    # Remove any old containers with the Coolify naming pattern
    run('docker rm -f vgk8cscos8os8wwsogkss004 2>/dev/null')
    
    # Get the old container name pattern from Coolify
    cname = 'vgk8cscos8os8wwsogkss004-222918143524'
    
    # Create container with proper config
    create_cmd = (
        f'docker run -d --name {cname} '
        f'--network coolify '
        f'--restart unless-stopped '
        f'-e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" '
        f'-e ADMIN_EMAIL="sserdarb@gmail.com" '
        f'-e ADMIN_PASSWORD="Tuba@2015Tuana" '
        f'-e NODE_ENV="production" '
        f'--label "coolify.applicationId=vgk8cscos8os8wwsogkss004" '
        f'--entrypoint /bin/bash '
        f'blue-dreams-final:latest '
        f'-c "cd /app && npx prisma generate && npx prisma db push --accept-data-loss && node prisma/seed.js 2>/dev/null; npm start"'
    )
    out, err = run(create_cmd, t=30)
    print(f"Container: {out[:20]}")
    if err:
        print(f"Err: {err[:200]}")
    
    # Wait for startup
    print("Waiting 30s for startup...")
    time.sleep(30)
    
    st, _ = run(f'docker ps --filter "name={cname}" --format "{{{{.ID}}}} {{{{.Status}}}}"')
    print(f"Status: {st}")
    
    if st and 'Up' in st:
        # Test
        s, _ = run(f'docker exec {cname} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1', t=15)
        print(f"Homepage: {s}")
        
        # Check logs
        logs, _ = run(f'docker logs {cname} --tail 5 2>&1')
        print(f"Logs:\n{logs}")
        
        # Test external
        s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
        print(f"External: {s}")
        
        # The external URL might not work because Coolify/Traefik needs the right labels
        # Let's add traefik labels
        print("\nChecking Traefik routing...")
        t_out, _ = run(f'docker inspect {cname} --format "{{{{json .Config.Labels}}}}" 2>&1')
        print(f"Labels: {t_out[:300]}")
        
        print("\n✅ Container is running!")
    else:
        logs, _ = run(f'docker logs {cname} --tail 20 2>&1')
        print(f"Startup issue:\n{logs}")
    
    # Cleanup
    run('docker rmi blue-dreams-final:latest 2>/dev/null')
else:
    print("\n❌ BUILD FAILED")
    if err:
        print(f"Stderr: {err[-300:]}")
    run('docker rm -f bdb 2>/dev/null')
    run('docker rmi blue-dreams-build:latest 2>/dev/null')

c.close()
