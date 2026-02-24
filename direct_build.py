import paramiko
import time
import sys
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')

CID = 'a8b3075aba34'

# Clear old log
_, so, _ = c.exec_command('rm -f /tmp/inplace_build.txt')
so.read()

# Run build synchronously (writing to file) 
build_cmd = f'docker exec -u root {CID} sh -c "cd /app && npm install bcryptjs tsx typescript @types/node @types/react 2>&1 && npx prisma db push --accept-data-loss 2>&1 && npx prisma generate 2>&1 && NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=\'--max-old-space-size=4096\' npm run build 2>&1 && echo BUILD_COMPLETE_MARKER" > /tmp/inplace_build.txt 2>&1 &'

print("Starting build...")
_, so, se = c.exec_command(build_cmd)
so.read()  # wait for command to dispatch
print("Build dispatched in background")

# Wait and poll
for i in range(120):  # 20 min max
    time.sleep(10)
    _, so2, _ = c.exec_command('tail -n 3 /tmp/inplace_build.txt 2>/dev/null')
    tail = so2.read().decode('utf-8', errors='replace').strip()
    if 'BUILD_COMPLETE_MARKER' in tail:
        print(f"\n✅ BUILD SUCCEEDED after {(i+1)*10}s!")
        break
    if 'Build error' in tail or 'Static worker exited' in tail or "doesn't have a root layout" in tail:
        print(f"\n❌ BUILD FAILED after {(i+1)*10}s!")
        _, so3, _ = c.exec_command('tail -n 20 /tmp/inplace_build.txt')
        out = so3.read()
        with open('build_error.txt', 'wb') as f:
            f.write(out)
        print("Error saved to build_error.txt")
        break
    if i % 6 == 0:
        print(f"  ⏳ {(i+1)*10}s... last: {tail[-80:] if tail else '(empty)'}")
else:
    print("⏰ Build timed out after 20 min")
    _, so3, _ = c.exec_command('tail -n 20 /tmp/inplace_build.txt')
    out = so3.read()
    with open('build_error.txt', 'wb') as f:
        f.write(out)

c.close()
