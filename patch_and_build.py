import paramiko
import time
import sys
import os
import tarfile
import io

sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')

CID = 'a8b3075aba34'
BASE = r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix'

# Inject missing files
MISSING = [
    'components/admin/ModuleOffline.tsx',
    'lib/utils/price-mode.tsx',
    'app/[locale]/admin/social/content/DesignTool.tsx',
    'app/[locale]/admin/social/content/VideoEditor.tsx',
    'lib/widgets/widget-catalog.ts',
    'lib/widgets/widget-descriptions.ts',
    'lib/modules/module-context.tsx',
]

buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    for rel in MISSING:
        local = os.path.join(BASE, rel)
        if os.path.exists(local):
            tar.add(local, arcname=rel)
            print(f"  + {rel}")
        else:
            print(f"  SKIP: {rel}")
buf.seek(0)

sftp = c.open_sftp()
with sftp.file('/tmp/patch.tar.gz', 'wb') as f:
    f.write(buf.read())
sftp.close()

def run(c, cmd, t=60):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=t)
    return stdout.read().decode('utf-8','replace').strip(), stderr.read().decode('utf-8','replace').strip()

run(c, 'rm -rf /tmp/patch_src && mkdir -p /tmp/patch_src')
run(c, 'cd /tmp/patch_src && tar xzf /tmp/patch.tar.gz')
out, err = run(c, f'cd /tmp/patch_src && tar cf - . | docker exec -u root -i {CID} sh -c "tar xf - -C /app"')
print(f"Injected! err={err}")

# Clear old log and start build
run(c, 'rm -f /tmp/inplace_build.txt')
build_cmd = f'docker exec -u root {CID} sh -c "cd /app && NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=\'--max-old-space-size=4096\' npm run build 2>&1 && echo BUILD_COMPLETE_MARKER" > /tmp/inplace_build.txt 2>&1 &'
c.exec_command(build_cmd)
print("Build started!")

# Poll
for i in range(120):
    time.sleep(10)
    _, so2, _ = c.exec_command('tail -n 3 /tmp/inplace_build.txt 2>/dev/null')
    tail = so2.read().decode('utf-8', errors='replace').strip()
    if 'BUILD_COMPLETE_MARKER' in tail:
        print(f"\nBUILD SUCCEEDED after {(i+1)*10}s!")
        break
    if 'Build error' in tail or 'Static worker exited' in tail or "doesn't have a root layout" in tail or 'Build failed' in tail:
        print(f"\nBUILD FAILED after {(i+1)*10}s!")
        _, so3, _ = c.exec_command('tail -n 30 /tmp/inplace_build.txt')
        out = so3.read()
        with open('build_error.txt', 'wb') as f:
            f.write(out)
        print("Error saved to build_error.txt")
        break
    if i % 6 == 0:
        safe = tail.replace('\n', ' ')[-80:] if tail else '(empty)'
        print(f"  [{(i+1)*10}s] {safe}")
else:
    print("Build timed out")
    _, so3, _ = c.exec_command('tail -n 30 /tmp/inplace_build.txt')
    out = so3.read()
    with open('build_error.txt', 'wb') as f:
        f.write(out)

c.close()
