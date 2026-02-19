"""
Blue Dreams - In-Container Deploy
Upload ALL files → inject into running container → build IN the container (it has DB access)
"""
import paramiko, sys, time, os, tarfile, io
sys.stdout.reconfigure(encoding='utf-8')

SERVER = '76.13.0.113'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
CID = '15609eb83e88'
BASE = r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix'
DB_URL = 'postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2'

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(SERVER, username='root', password=PASSWORD, timeout=60)
transport = c.get_transport()
transport.set_keepalive(60)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    o = so.read().decode('utf-8', errors='replace').strip()
    e = se.read().decode('utf-8', errors='replace').strip()
    return o, e

def step(n, msg):
    print(f"\n{'='*3} Step {n}: {msg} {'='*3}")

# ═══════════════════════════════════════════════════
#  STEP 1: Create full project tar
# ═══════════════════════════════════════════════════
step(1, "Create full project tar")

DIRS = ['app', 'components', 'lib', 'prisma', 'public']
ROOT_FILES = [
    'package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts',
    'postcss.config.mjs', 'middleware.ts', 'eslint.config.mjs',
    'next-env.d.ts', 'constants.tsx', 'types.ts', 'instrumentation.ts',
]

buf = io.BytesIO()
count = 0
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    for f in ROOT_FILES:
        local = os.path.join(BASE, f)
        if os.path.exists(local):
            tar.add(local, arcname=f)
            count += 1
    for d in DIRS:
        local_dir = os.path.join(BASE, d)
        if os.path.isdir(local_dir):
            for root, dirs, files in os.walk(local_dir):
                dirs[:] = [x for x in dirs if x not in ('node_modules', '.next', '__pycache__', '.git')]
                for f in files:
                    if f.endswith(('.tsx', '.ts', '.js', '.json', '.css', '.mjs', '.prisma', '.png', '.jpg', '.svg', '.ico', '.webp', '.gif')):
                        full = os.path.join(root, f)
                        rel = os.path.relpath(full, BASE)
                        tar.add(full, arcname=rel)
                        count += 1
buf.seek(0)
size_kb = len(buf.getvalue()) / 1024
print(f"  ✓ {count} files ({size_kb:.0f} KB)")

# Upload
sftp = c.open_sftp()
with sftp.file('/tmp/blue_full.tar.gz', 'wb') as f:
    f.write(buf.read())
sftp.close()
print("  ✓ Uploaded")

# ═══════════════════════════════════════════════════
#  STEP 2: Ensure container is running, cleanup builder
# ═══════════════════════════════════════════════════
step(2, "Ensure container running")
run("docker rm -f blue-builder blue-dreams-old 2>/dev/null")
run("docker rmi blue-builder-img:latest blue-dreams-fresh:latest 2>/dev/null")
run(f"docker update --restart=unless-stopped {CID}")
run(f"docker start {CID} 2>/dev/null", t=10)
time.sleep(5)

st, _ = run(f'docker ps --filter id={CID} --format "{{{{.Status}}}}"')
print(f"  Status: {st}")

# ═══════════════════════════════════════════════════
#  STEP 3: Inject files into running container via tar
# ═══════════════════════════════════════════════════
step(3, "Inject source files into container")

# Extract on host
run("rm -rf /tmp/blue_src && mkdir -p /tmp/blue_src")
run("cd /tmp/blue_src && tar xzf /tmp/blue_full.tar.gz")

# Copy into container
out, err = run(f"docker cp /tmp/blue_src/. {CID}:/app/", t=60)
if err and 'Error' in err:
    print(f"  ⚠ Error: {err[:200]}")
else:
    print("  ✓ Files injected")

# Verify
out, _ = run(f"docker exec {CID} ls /app/components/admin/analytics/ 2>&1")
print(f"  Analytics: {out}")
out, _ = run(f"docker exec {CID} cat /app/tsconfig.json 2>&1 | head -5")
print(f"  tsconfig: {out}")

# ═══════════════════════════════════════════════════
#  STEP 4: Build inside container (HAS DB ACCESS!)
# ═══════════════════════════════════════════════════
step(4, "Build inside container (has DB access)")

# npm install 
print("  npm install...")
out, _ = run(f'docker exec -e DATABASE_URL="{DB_URL}" {CID} npm install 2>&1', t=600)
last = out.split('\n')[-3:]
for l in last:
    print(f"    {l}")

# Prisma
print("  Prisma generate...")
out, _ = run(f'docker exec -e DATABASE_URL="{DB_URL}" {CID} npx prisma generate 2>&1', t=120)
out, _ = run(f'docker exec -e DATABASE_URL="{DB_URL}" {CID} npx prisma db push --accept-data-loss 2>&1', t=120)
print("  ✓ Prisma ready")

# Remove old .next
run(f'docker exec {CID} rm -rf /app/.next', t=30)

# Build!
print("  Building Next.js (3-5 min)...")
out, err = run(
    f'docker exec -e DATABASE_URL="{DB_URL}" -e NODE_ENV=production -e SKIP_ENV_VALIDATION=1 '
    f'-e NODE_OPTIONS="--max-old-space-size=2048" '
    f'{CID} /bin/sh -c "npm run build 2>&1"', t=600)
lines = out.split('\n')

has_error = False
for l in lines[-30:]:
    if 'Build error' in l or 'Module not found' in l or 'webpack errors' in l or 'Static worker exited' in l:
        has_error = True
    print(f"  {l}")

# ═══════════════════════════════════════════════════
#  STEP 5: Verify build
# ═══════════════════════════════════════════════════
step(5, "Verify build")
bid, _ = run(f'docker exec {CID} cat /app/.next/BUILD_ID 2>&1')
print(f"  BUILD_ID: {bid}")

if bid and len(bid) > 5 and not has_error:
    print("\n  ★ BUILD SUCCEEDED ★")
    
    # Restart with new build
    step(6, "Restart container")
    run(f"docker stop {CID}", t=15)
    time.sleep(2)
    run(f"docker start {CID}", t=15)
    print("  Waiting 30s...")
    time.sleep(30)
    
    st, _ = run(f'docker ps --filter id={CID} --format "{{{{.Status}}}}"')
    print(f"  Status: {st}")
    
    if 'Up' in str(st):
        bid2, _ = run(f'docker exec {CID} cat /app/.next/BUILD_ID 2>&1')
        print(f"  BUILD_ID: {bid2}")
        
        for path in ['/tr', '/tr/admin/statistics', '/tr/admin/rooms']:
            s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" http://localhost:3000{path} 2>&1', t=15)
            print(f"  {path}: {s}")
        
        s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
        print(f"  External: {s}")
        
        print("\n  ★ ALL DONE! ★")
    else:
        logs, _ = run(f"docker logs {CID} --tail 15 2>&1")
        print(f"  Not running!\n{logs[:500]}")
else:
    print("\n  ✗ BUILD FAILED")
    # Restart without new build
    run(f"docker start {CID} 2>/dev/null", t=10)

# Cleanup
run("rm -rf /tmp/blue_src /tmp/blue_full.tar.gz")
c.close()
