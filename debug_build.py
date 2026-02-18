"""Try building in existing builder after cleaning .next and injecting ALL files."""
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

# 1. Upload ALL project files (not just the selective list)
print("=== 1. Creating full project tar ===")

# Include everything important
DIRS_TO_INCLUDE = ['app', 'components', 'lib', 'prisma', 'public']
ROOT_FILES = [
    'package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts',
    'postcss.config.mjs', 'middleware.ts', 'eslint.config.mjs',
    'next-env.d.ts', 'constants.tsx', 'types.ts', 'instrumentation.ts',
    'App.tsx', 'index.tsx', 'index.html',
]

buf = io.BytesIO()
count = 0
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    # Add root files
    for f in ROOT_FILES:
        local = os.path.join(BASE, f)
        if os.path.exists(local):
            tar.add(local, arcname=f)
            count += 1
    
    # Add directories recursively
    for d in DIRS_TO_INCLUDE:
        local_dir = os.path.join(BASE, d)
        if os.path.isdir(local_dir):
            for root, dirs, files in os.walk(local_dir):
                # Skip node_modules, .next, __pycache__
                dirs[:] = [x for x in dirs if x not in ('node_modules', '.next', '__pycache__', '.git')]
                for f in files:
                    if f.endswith(('.tsx', '.ts', '.js', '.json', '.css', '.mjs', '.prisma', '.png', '.jpg', '.svg', '.ico', '.webp')):
                        full = os.path.join(root, f)
                        rel = os.path.relpath(full, BASE)
                        tar.add(full, arcname=rel)
                        count += 1

buf.seek(0)
size_kb = len(buf.getvalue()) / 1024
print(f"  ✓ {count} files ({size_kb:.0f} KB)")

# Upload
sftp = c.open_sftp()
with sftp.file('/tmp/full_deploy.tar.gz', 'wb') as f:
    f.write(buf.read())
sftp.close()
print("  ✓ Uploaded")

# 2. Inject into builder
print("\n=== 2. Inject into builder ===")
# Check builder exists
out, _ = run("docker ps --filter name=blue-builder --format '{{.ID}}'")
if not out:
    print("  ✗ No builder!")
    c.close()
    sys.exit(1)

# Clean and inject
run("rm -rf /tmp/full_deploy && mkdir -p /tmp/full_deploy")
run("cd /tmp/full_deploy && tar xzf /tmp/full_deploy.tar.gz")
run("docker cp /tmp/full_deploy/. blue-builder:/app/", t=60)
print("  ✓ Files injected")

# Verify analytics
out, _ = run("docker exec blue-builder find /app/components/admin/analytics -type f 2>&1")
print(f"  Analytics files: {out}")

# 3. Clean .next completely and rebuild
print("\n=== 3. Clean build ===")
run("docker exec blue-builder rm -rf /app/.next /app/.next.bak", t=30)
out, _ = run("docker exec blue-builder ls /app/.next 2>&1")
print(f"  .next after delete: {out}")

# npm install
print("  npm install...")
out, _ = run(f'docker exec -e DATABASE_URL="{DB_URL}" blue-builder npm install 2>&1', t=600)
last_lines = out.split('\n')[-3:]
for l in last_lines:
    print(f"    {l}")

# prisma
run(f'docker exec -e DATABASE_URL="{DB_URL}" blue-builder npx prisma generate 2>&1', t=120)
print("  ✓ prisma ready")

# Build
print("  Building Next.js (3-5 min)...")
out, err = run(f'docker exec -e DATABASE_URL="{DB_URL}" -e NODE_ENV=production blue-builder /bin/sh -c "npm run build 2>&1"', t=600)
lines = out.split('\n')

has_error = False
for l in lines[-40:]:
    if 'Build error' in l or 'Module not found' in l or 'webpack errors' in l:
        has_error = True
    print(f"  {l}")

# 4. Check result
print("\n=== 4. BUILD RESULT ===")
bid, _ = run("docker exec blue-builder cat /app/.next/BUILD_ID 2>&1")
print(f"  BUILD_ID: {bid}")

if bid and len(bid) > 5 and not has_error:
    print("\n  ★ BUILD SUCCEEDED ★")
    
    # Copy to original container
    print("\n=== 5. Copy to original container ===")
    run(f"docker cp blue-builder:/app/.next /tmp/new_next", t=120)
    run(f"docker cp blue-builder:/app/node_modules /tmp/new_nm", t=180)
    
    # Source files too
    run(f"docker cp /tmp/full_deploy/. {CID}:/app/", t=60)
    run(f"docker cp /tmp/new_next/.next {CID}:/app/", t=120)
    run(f"docker cp /tmp/new_nm/node_modules {CID}:/app/", t=180)
    
    # Cleanup
    run("docker rm -f blue-builder")
    run("docker rmi blue-builder-img:latest 2>/dev/null")
    run("rm -rf /tmp/new_next /tmp/new_nm /tmp/full_deploy")
    
    # Restart
    print("\n=== 6. Restart ===")
    run(f"docker update --restart=unless-stopped {CID}")
    run(f"docker start {CID}", t=15)
    print("  Waiting 30s...")
    time.sleep(30)
    
    status, _ = run(f'docker ps --filter id={CID} --format "{{{{.Status}}}}"')
    print(f"  Status: {status}")
    
    if 'Up' in str(status):
        bid2, _ = run(f"docker exec {CID} cat /app/.next/BUILD_ID 2>&1")
        print(f"  BUILD_ID: {bid2}")
        for path in ['/tr', '/tr/admin/statistics']:
            s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" http://localhost:3000{path} 2>&1', t=15)
            print(f"  {path}: {s}")
        print("\n  ★ ALL DONE! ★")
    else:
        logs, _ = run(f"docker logs {CID} --tail 15 2>&1")
        print(f"  Not running! Logs:\n{logs[:500]}")
else:
    print("\n  ✗ BUILD FAILED")
    # Don't cleanup - leave builder for investigation
    run(f"docker update --restart=unless-stopped {CID}")
    run(f"docker start {CID}", t=15)

c.close()
