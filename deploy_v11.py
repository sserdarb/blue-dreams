"""
Blue Dreams - Builder Deploy v2 (with DB access)
Stop CID → commit → create builder ON coolify network → inject files → build → copy .next back
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

# ═══ STEP 1: Create tar ═══
step(1, "Create & upload tar")
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
sftp = c.open_sftp()
with sftp.file('/tmp/blue_full.tar.gz', 'wb') as f:
    f.write(buf.read())
sftp.close()
print(f"  ✓ {count} files uploaded")

# ═══ STEP 2: Stop container completely ═══
step(2, "Stop container")
run(f"docker update --restart=no {CID}")
run(f"docker stop {CID} 2>/dev/null", t=15)
time.sleep(3)
run("docker rm -f blue-builder 2>/dev/null")
run("docker rmi blue-builder-img:latest 2>/dev/null")

# Commit image
out, _ = run(f"docker commit {CID} blue-builder-img:latest")
print(f"  Committed: {out[:40]}...")

# ═══ STEP 3: Create builder on COOLIFY network ═══
step(3, "Create builder on coolify network")
run(
    'docker run -d --name blue-builder '
    '--network coolify '  # ← THIS IS KEY - gives DB access
    '-w /app '
    '-e DATABASE_URL="' + DB_URL + '" '
    '-e NODE_ENV=production '
    '-e SKIP_ENV_VALIDATION=1 '
    '-e NODE_OPTIONS="--max-old-space-size=2048" '
    'blue-builder-img:latest '
    'sleep 1200'
)
time.sleep(3)

# Verify builder running
st, _ = run("docker ps --filter name=blue-builder --format '{{.Status}}'")
print(f"  Builder: {st}")

# Verify DB access
out, _ = run('docker exec blue-builder sh -c "nc -z coolify-db 5432 && echo OK || echo FAIL" 2>&1')
print(f"  DB access: {out}")

# ═══ STEP 4: Inject source files ═══
step(4, "Inject files into builder")
run("rm -rf /tmp/blue_src && mkdir -p /tmp/blue_src")
run("cd /tmp/blue_src && tar xzf /tmp/blue_full.tar.gz")
run("docker cp /tmp/blue_src/. blue-builder:/app/", t=60)
# Verify
out, _ = run("docker exec blue-builder ls /app/components/admin/analytics/ 2>&1")
print(f"  Analytics: {out}")

# ═══ STEP 5: Build ═══
step(5, "Install deps & build")
print("  npm install...")
out, _ = run('docker exec blue-builder npm install 2>&1', t=600)
last = out.split('\n')[-2:]
for l in last: print(f"    {l}")

print("  Prisma...")
run('docker exec blue-builder npx prisma generate 2>&1', t=120)
run('docker exec blue-builder npx prisma db push --accept-data-loss 2>&1', t=120)
print("  ✓ Prisma ready")

# Clean old build
run('docker exec blue-builder rm -rf /app/.next', t=30)

print("  Building Next.js (3-5 min)...")
out, _ = run('docker exec blue-builder sh -c "npm run build 2>&1"', t=600)
lines = out.split('\n')

has_error = False
for l in lines[-30:]:
    if any(x in l for x in ['Build error', 'Module not found', 'webpack errors', 'Static worker exited']):
        has_error = True
    print(f"  {l}")

# ═══ STEP 6: Verify ═══
step(6, "Verify build")
bid, _ = run('docker exec blue-builder cat /app/.next/BUILD_ID 2>&1')
print(f"  BUILD_ID: {bid}")

if bid and len(bid) > 5 and not has_error:
    print("\n  ★ BUILD SUCCEEDED ★")
    
    # Copy .next + node_modules back to host
    step(7, "Copy back to original container")
    run("rm -rf /tmp/blue_next /tmp/blue_nm")
    run("docker cp blue-builder:/app/.next /tmp/blue_next", t=120)
    run("docker cp blue-builder:/app/node_modules /tmp/blue_nm", t=180)
    
    # Also copy source files + .next into original container
    run(f"docker cp /tmp/blue_src/. {CID}:/app/", t=60)
    run(f"docker cp /tmp/blue_next {CID}:/app/.next", t=120)
    run(f"docker cp /tmp/blue_nm {CID}:/app/node_modules", t=180)
    print("  ✓ Injected")
    
    # Cleanup builder
    run("docker rm -f blue-builder")
    run("docker rmi blue-builder-img:latest 2>/dev/null")
    run("rm -rf /tmp/blue_next /tmp/blue_nm /tmp/blue_src /tmp/blue_full.tar.gz")
    
    # Restart
    step(8, "Restart")
    run(f"docker update --restart=unless-stopped {CID}")
    run(f"docker start {CID}", t=15)
    print("  Waiting 30s...")
    time.sleep(30)
    
    st, _ = run(f'docker ps --filter id={CID} --format "{{{{.Status}}}}"')
    print(f"  Status: {st}")
    
    if 'Up' in str(st) and 'Restarting' not in str(st):
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
        print(f"  Issues:\n{logs[:500]}")
else:
    print("\n  ✗ BUILD FAILED")
    run("docker rm -f blue-builder")
    run("docker rmi blue-builder-img:latest 2>/dev/null")
    run(f"docker update --restart=unless-stopped {CID}")
    run(f"docker start {CID} 2>/dev/null", t=10)

c.close()
