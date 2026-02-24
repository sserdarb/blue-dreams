import paramiko
import time
import sys
import os
import tarfile
import io

sys.stdout.reconfigure(encoding='utf-8')

BASE = r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix'
CID = 'a8b3075aba34'

# Directories to fully sync
DIRS = ['app', 'components', 'lib', 'prisma']
# Individual config files
CONFIGS = [
    'next.config.ts', 'tsconfig.json', 'postcss.config.mjs',
    'middleware.ts', 'instrumentation.ts',
    'package.json',
]
# Exclude patterns
SKIP = {'.next', 'node_modules', '.git', '__pycache__', '.agent'}

print("Building full source tar...")
buf = io.BytesIO()
count = 0
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    # Add directories recursively
    for d in DIRS:
        full_dir = os.path.join(BASE, d)
        for root, dirs, files in os.walk(full_dir):
            # Skip excluded directories
            dirs[:] = [x for x in dirs if x not in SKIP]
            for f in files:
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, BASE)
                tar.add(full_path, arcname=rel_path)
                count += 1
    # Add config files
    for cf in CONFIGS:
        full_path = os.path.join(BASE, cf)
        if os.path.exists(full_path):
            tar.add(full_path, arcname=cf)
            count += 1

buf.seek(0)
size_mb = len(buf.getvalue()) / 1024 / 1024
print(f"  {count} files, {size_mb:.1f} MB")

# Connect
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')

def run(c, cmd, t=60):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=t)
    return stdout.read().decode('utf-8','replace').strip(), stderr.read().decode('utf-8','replace').strip()

# Upload
print("Uploading to server...")
sftp = c.open_sftp()
with sftp.file('/tmp/full_src.tar.gz', 'wb') as f:
    f.write(buf.getvalue())
sftp.close()
print("  Uploaded!")

# Extract on host then pipe into container
print("Injecting into container...")
run(c, 'rm -rf /tmp/full_src && mkdir -p /tmp/full_src')
run(c, 'cd /tmp/full_src && tar xzf /tmp/full_src.tar.gz')
out, err = run(c, f'cd /tmp/full_src && tar cf - . | docker exec -u root -i {CID} sh -c "tar xf - -C /app"')
if err:
    print(f"  Warning: {err[:200]}")
print("  Files injected!")

# Verify app directory
out, _ = run(c, f'docker exec {CID} ls /app/app')
print(f"  /app/app contains: {out[:200]}")

# Clear old log and start build
run(c, 'rm -f /tmp/inplace_build.txt')
build_cmd = f'docker exec -u root {CID} sh -c "cd /app && rm -f package-lock.json && npm install --legacy-peer-deps 2>&1 && npm install --legacy-peer-deps 2>&1 && npx prisma generate 2>&1 && NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=\'--max-old-space-size=4096\' npm run build 2>&1 && echo BUILD_COMPLETE_MARKER" > /tmp/inplace_build.txt 2>&1 &'
c.exec_command(build_cmd)
print("Build started! Polling...")

# Poll
for i in range(180):  # 30 min max
    time.sleep(10)
    _, so2, _ = c.exec_command('tail -n 5 /tmp/inplace_build.txt 2>/dev/null')
    tail = so2.read().decode('utf-8', errors='replace').strip()

    if 'BUILD_COMPLETE_MARKER' in tail:
        print(f"\n=== BUILD SUCCEEDED after {(i+1)*10}s! ===")
        break
    if 'Build error' in tail or 'Static worker exited' in tail or 'Build failed' in tail:
        print(f"\n=== BUILD FAILED after {(i+1)*10}s ===")
        _, so3, _ = c.exec_command('tail -n 30 /tmp/inplace_build.txt')
        out = so3.read()
        with open('build_error.txt', 'wb') as f:
            f.write(out)
        print("Error saved to build_error.txt")
        break
    if i % 6 == 0:
        safe = tail.replace('\n', ' | ')[-100:] if tail else '(empty)'
        print(f"  [{(i+1)*10}s] {safe}")
else:
    print("Build timed out after 30 min")
    _, so3, _ = c.exec_command('tail -n 30 /tmp/inplace_build.txt')
    out = so3.read()
    with open('build_error.txt', 'wb') as f:
        f.write(out)

c.close()
