"""
Deploy v10 - Source files already in container from v9
Just need to: commit, build with bcryptjs, copy .next back, start
"""
import paramiko, sys, time
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=15)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    o = so.read().decode('utf-8', errors='replace').strip()
    e = se.read().decode('utf-8', errors='replace').strip()
    return o, e

CID = 'f15c4f581451'

# Step 1: Verify source files still exist
print("=== Step 1: Verify source files ===")
out, _ = run(f'docker exec {CID} ls /app/app/\\[locale\\]/admin/rooms/page.tsx 2>&1')
print(f"  rooms/page.tsx: {out}")
out, _ = run(f'docker exec {CID} grep "Oda Fiy" /app/app/\\[locale\\]/admin/layout.tsx 2>&1')
print(f"  layout has Oda: {out[:60]}")
out, _ = run(f'docker exec {CID} head -1 /app/app/\\[locale\\]/admin/statistics/ReportsClient.tsx 2>&1')
print(f"  ReportsClient: {out}")

# Step 2: Stop container
print("\n=== Step 2: Stop container ===")
run(f'docker update --restart=no {CID}')
out, err = run(f'docker stop {CID} 2>/dev/null', t=30)
print(f"  Stop: {out or err}")
time.sleep(3)

# Step 3: Commit image
print("\n=== Step 3: Commit image ===")
run('docker rm -f blue-dreams-builder6 2>/dev/null')
run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
out, _ = run(f'docker commit {CID} blue-dreams-rebuild:latest')
print(f"  {out[:60]}")

# Step 4: Build (clean build with bcryptjs)
print("\n=== Step 4: Build (3-5 min, clean .next) ===")
build_cmd = f'''docker run --name blue-dreams-builder6 \
    --entrypoint /bin/bash \
    --network coolify \
    -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" \
    -w /app \
    blue-dreams-rebuild:latest \
    -c "npm install bcryptjs 2>&1 && rm -rf .next 2>&1 && npx prisma generate 2>&1 && npm run build 2>&1"'''

out, err = run(build_cmd, t=600)
lines = out.split('\n')

# Print last 30 lines
has_error = False
for l in lines[-30:]:
    if 'Build error' in l or 'Module not found' in l:
        has_error = True
    print(f"  {l}")

# Step 5: Check BUILD_ID and routes
print("\n=== Step 5: Check BUILD_ID ===")
run('docker cp blue-dreams-builder6:/app/.next/BUILD_ID /tmp/BUILD_ID 2>/dev/null')
bid, _ = run('cat /tmp/BUILD_ID 2>/dev/null')
print(f"  BUILD_ID: {bid}")

rooms_in_build = any('/admin/rooms' in l and 'content' not in l for l in lines)
stats_in_build = any('/admin/statistics' in l for l in lines)
print(f"  /admin/rooms in build: {rooms_in_build}")
print(f"  /admin/statistics in build: {stats_in_build}")

if bid and len(bid) > 5 and not has_error:
    print("\n=== BUILD SUCCEEDED ===")

    # Step 6: Copy .next from builder to host
    print("  Copying .next to host...")
    run('rm -rf /tmp/next_new')
    run('docker cp blue-dreams-builder6:/app/.next /tmp/next_new', t=120)
    verify, _ = run('cat /tmp/next_new/BUILD_ID')
    print(f"  Host BUILD_ID: {verify}")

    # Copy bcryptjs
    run('docker cp blue-dreams-builder6:/app/node_modules/bcryptjs /tmp/bcryptjs_mod 2>/dev/null')
    # Copy prisma 
    run('docker cp blue-dreams-builder6:/app/node_modules/.prisma /tmp/prisma_mod 2>/dev/null')

    # Cleanup builder
    run('docker rm -f blue-dreams-builder6')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')

    # Step 7: Start container, inject .next via tar pipe
    print("\n=== Step 6: Inject .next via tar pipe ===")
    run(f'docker start {CID}', t=10)
    time.sleep(3)

    # Remove old .next
    run(f'docker exec {CID} rm -rf /app/.next', t=30)
    
    # Copy .next via tar pipe
    out, err = run(f'cd /tmp && tar cf - next_new | docker exec -i {CID} bash -c "cd /app && tar xf - && mv next_new .next"', t=120)
    if err and 'Error' in err:
        print(f"  WARNING tar: {err[:200]}")
    else:
        print("  .next injected via tar pipe")

    # Copy bcryptjs
    run(f'docker exec {CID} rm -rf /app/node_modules/bcryptjs 2>/dev/null')
    run(f'docker cp /tmp/bcryptjs_mod {CID}:/app/node_modules/bcryptjs')
    # Copy prisma
    run(f'docker cp /tmp/prisma_mod {CID}:/app/node_modules/.prisma 2>/dev/null')

    # Verify
    bid2, _ = run(f'docker exec {CID} cat /app/.next/BUILD_ID')
    print(f"  Container BUILD_ID: {bid2}")

    # Step 8: Restart
    print("\n=== Step 7: Restart container ===")
    run(f'docker stop {CID}', t=15)
    time.sleep(2)
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)

    print("  Waiting 35s for warmup...")
    time.sleep(35)

    st, _ = run(f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
    print(f"  Status: {st}")

    if 'Up' in st and 'Restarting' not in st:
        print("\n=== Step 8: Smoke test ===")
        time.sleep(5)
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1', t=15)
        print(f"  Homepage: {s}")
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/statistics" 2>&1', t=15)
        print(f"  Statistics: {s}")
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/rooms" 2>&1', t=15)
        print(f"  Rooms: {s}")
        s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
        print(f"  External: {s}")

        # Final
        print("\n=== Step 9: Final checks ===")
        bid3, _ = run(f'docker exec {CID} cat /app/.next/BUILD_ID')
        print(f"  BUILD_ID: {bid3}")
        out, _ = run(f'docker exec {CID} find /app/.next/server -path "*rooms*page*" -not -path "*content*" -type f 2>&1 | head -3')
        print(f"  Rooms route: {out}")
        out, _ = run(f'docker exec {CID} ls /app/node_modules/bcryptjs/index.js 2>&1')
        print(f"  bcryptjs: {out}")

        print("\n ALL DONE!")
    else:
        logs, _ = run(f'docker logs {CID} --tail 20 2>&1')
        print(f"\n  Issues:\n{logs}")
else:
    print(f"\n BUILD FAILED")
    run('docker rm -f blue-dreams-builder6 2>/dev/null')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)

c.close()
