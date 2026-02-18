"""
Blue Dreams - Fresh Docker Build on Server
Upload entire project, build fresh image from Dockerfile, swap container.
"""
import paramiko, sys, time, os, tarfile, io
sys.stdout.reconfigure(encoding='utf-8')

SERVER = '76.13.0.113'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
CID = '15609eb83e88'  # Current running container
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

# ═════════════════════════════════════════════════
#  STEP 1: Create full project tar (everything)
# ═════════════════════════════════════════════════
step(1, "Create full project tar")

DIRS = ['app', 'components', 'lib', 'prisma', 'public']
ROOT_FILES = [
    'package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts',
    'postcss.config.mjs', 'middleware.ts', 'eslint.config.mjs',
    'next-env.d.ts', 'constants.tsx', 'types.ts', 'instrumentation.ts',
    'Dockerfile', '.dockerignore', '.npmrc',
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
with sftp.file('/tmp/blue_dreams_full.tar.gz', 'wb') as f:
    f.write(buf.read())
sftp.close()
print("  ✓ Uploaded")

# ═════════════════════════════════════════════════
#  STEP 2: Extract on server and build Docker image
# ═════════════════════════════════════════════════
step(2, "Extract and prepare build context on server")
run("rm -rf /tmp/blue_build && mkdir -p /tmp/blue_build")
run("cd /tmp/blue_build && tar xzf /tmp/blue_dreams_full.tar.gz")

# Verify key files
out, _ = run("ls /tmp/blue_build/Dockerfile /tmp/blue_build/tsconfig.json /tmp/blue_build/package.json 2>&1")
print(f"  Build files: {out}")
out, _ = run("ls /tmp/blue_build/components/admin/analytics/ 2>&1")
print(f"  Analytics: {out}")

# Create .env file for build
run(f'echo "DATABASE_URL={DB_URL}" > /tmp/blue_build/.env')
run('echo "SKIP_ENV_VALIDATION=1" >> /tmp/blue_build/.env')

# ═════════════════════════════════════════════════
#  STEP 3: Docker build
# ═════════════════════════════════════════════════
step(3, "Docker build (5-8 min) - fresh from Dockerfile")
print("  Building...")
out, err = run("cd /tmp/blue_build && docker build -t blue-dreams-fresh:latest --no-cache --network coolify . 2>&1", t=600)
lines = out.split('\n')

has_error = False
for l in lines[-25:]:
    if 'error' in l.lower() or 'fatal' in l.lower() or 'failed' in l.lower():
        has_error = True
    print(f"  {l}")

if has_error or 'Successfully' not in out:
    print("\n  ✗ DOCKER BUILD FAILED")
    # Print more context
    for l in lines:
        if 'Module not found' in l or 'Build error' in l or 'webpack' in l:
            print(f"  ERR: {l}")
    # Restore container
    run(f"docker update --restart=unless-stopped {CID}")
    run(f"docker start {CID}", t=15)
    c.close()
    sys.exit(1)

print("\n  ★ DOCKER BUILD SUCCEEDED ★")

# ═════════════════════════════════════════════════
#  STEP 4: Get network and labels from old container
# ═════════════════════════════════════════════════
step(4, "Get old container config")
# Get labels
labels_out, _ = run(f"docker inspect {CID} --format '{{{{json .Config.Labels}}}}'")
print(f"  Labels: {labels_out[:200]}...")

# Get network
network_out, _ = run(f"docker inspect {CID} --format '{{{{range $k,$v := .NetworkSettings.Networks}}}}{{{{$k}}}}{{{{end}}}}'")
print(f"  Network: {network_out}")

# Get env vars
env_out, _ = run(f"docker inspect {CID} --format '{{{{json .Config.Env}}}}'")
print(f"  Env: {env_out[:200]}...")

# ═════════════════════════════════════════════════
#  STEP 5: Stop old, start new  
# ═════════════════════════════════════════════════
step(5, "Swap containers")

# Stop old container
run(f"docker update --restart=no {CID}")
run(f"docker stop {CID}", t=15)
run(f"docker rename {CID} blue-dreams-old")

# Get the name of old container
old_name, _ = run(f"docker inspect blue-dreams-old --format '{{{{.Name}}}}'")
old_name = old_name.strip('/')
print(f"  Old container name: {old_name}")

# Start new container with same network and labels
import json
try:
    labels = json.loads(labels_out)
    label_args = ' '.join([f'--label "{k}={v}"' for k, v in labels.items()])
except:
    label_args = ''

try:
    envs = json.loads(env_out)
    env_args = ' '.join([f'-e "{e}"' for e in envs if '=' in e])
except:
    env_args = f'-e DATABASE_URL="{DB_URL}"'

# Use coolify network
network = network_out.strip() or 'coolify'

run_cmd = (
    f'docker run -d '
    f'--name {old_name} '
    f'--network {network} '
    f'--restart unless-stopped '
    f'{env_args} '
    f'{label_args} '
    f'blue-dreams-fresh:latest'
)

out, err = run(run_cmd, t=30)
new_cid = out.strip()
print(f"  New container: {new_cid[:12] if new_cid else 'FAILED'}")
if err:
    print(f"  Error: {err[:200]}")

if not new_cid:
    # Restore old container
    print("  ✗ Failed to start new container, restoring old...")
    run(f"docker rename blue-dreams-old {old_name}")
    run(f"docker update --restart=unless-stopped {CID}")
    run(f"docker start {CID}", t=15)
    c.close()
    sys.exit(1)

# Wait for startup
print("  Waiting 30s for warmup...")
time.sleep(30)

# ═════════════════════════════════════════════════
#  STEP 6: Smoke test
# ═════════════════════════════════════════════════
step(6, "Smoke test")
status, _ = run(f"docker ps --filter name={old_name} --format '{{{{.Status}}}}'")
print(f"  Status: {status}")

if 'Up' in str(status):
    bid, _ = run(f"docker exec {new_cid[:12]} cat /app/.next/BUILD_ID 2>&1")
    print(f"  BUILD_ID: {bid}")
    
    for path in ['/tr', '/tr/admin/statistics']:
        s, _ = run(f'docker exec {new_cid[:12]} curl -s -o /dev/null -w "%{{http_code}}" http://localhost:3000{path} 2>&1', t=15)
        print(f"  {path}: {s}")
    
    # External test
    s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
    print(f"  External: {s}")
    
    # Cleanup
    run("docker rm -f blue-dreams-old 2>/dev/null")
    run("rm -rf /tmp/blue_build /tmp/blue_dreams_full.tar.gz")
    
    print("\n  ★ ALL DONE! ★")
else:
    logs, _ = run(f"docker logs {new_cid[:12]} --tail 20 2>&1")
    print(f"  Not running! Logs:\n{logs[:500]}")
    # Restore
    run(f"docker rm -f {new_cid[:12]}")
    run(f"docker rename blue-dreams-old {old_name}")
    run(f"docker update --restart=unless-stopped {CID}")
    run(f"docker start {CID}", t=15)

c.close()
