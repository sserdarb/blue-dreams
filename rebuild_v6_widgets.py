"""
Rebuild v6b - Fixed Widget Editors
Handles builder container exit properly
"""
import paramiko, sys, time, os
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

CID = 'f15c4f581451'
BASE = r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix'

FILES = [
    'components/admin/widget-editors/HeroEditor.tsx',
    'components/admin/widget-editors/GalleryEditor.tsx',
    'components/admin/widget-editors/TextEditor.tsx',
    'components/admin/widget-editors/FeaturesEditor.tsx',
    'components/admin/widget-editors/PageHeaderEditor.tsx',
    'components/admin/widget-editors/TextBlockEditor.tsx',
    'components/admin/widget-editors/TextImageEditor.tsx',
    'components/admin/widget-editors/StatsEditor.tsx',
    'components/admin/widget-editors/IconGridEditor.tsx',
    'components/admin/widget-editors/ImageGridEditor.tsx',
    'components/admin/widget-editors/CTAEditor.tsx',
    'components/admin/widget-editors/ContactEditor.tsx',
    'components/admin/widget-editors/MapEditor.tsx',
    'components/admin/widget-editors/YoutubeEditor.tsx',
    'components/admin/widget-editors/TableEditor.tsx',
    'components/admin/widget-editors/ReviewsEditor.tsx',
    'components/admin/widget-editors/WeatherEditor.tsx',
    'components/admin/widget-editors/ExperienceEditor.tsx',
    'components/admin/widget-editors/RoomListEditor.tsx',
    'components/admin/widget-editors/DividerEditor.tsx',
    'components/admin/widget-editors/index.tsx',
    'components/admin/widget-editors/widget-types.ts',
    'components/admin/DraggableWidgetList.tsx',
    'components/admin/AdminErrorBoundary.tsx',
    'app/admin/pages/[id]/editor/page.tsx',
    'app/[locale]/admin/pages/[id]/editor/page.tsx',
    'app/admin/layout.tsx',
    'app/actions/admin.ts',
    'lib/services/elektra.ts',
    'app/admin/page.tsx',
    'app/[locale]/admin/page.tsx',
    'app/[locale]/admin/reservations/page.tsx',
    'app/[locale]/admin/reservations/ReservationsClient.tsx',
    'app/api/admin/reservations/route.ts',
    'app/[locale]/admin/statistics/page.tsx',
    'app/[locale]/admin/statistics/ReportsClient.tsx',
    'app/[locale]/admin/rooms/page.tsx',
    'app/[locale]/admin/rooms/RoomsClient.tsx',
    'app/[locale]/admin/layout.tsx',
    'app/actions/auth.ts',
    'app/api/ai/chat/route.ts',
]

# Stop running container
print("=== Step 1: Stopping container ===")
run(f'docker update --restart=no {CID}')
run(f'docker stop {CID} 2>/dev/null', t=10)
time.sleep(2)

# Transfer files
print(f"\n=== Step 2: SFTP Transfer ({len(FILES)} files) ===")
sftp = c.open_sftp()
transferred = 0
for rel in FILES:
    local = os.path.join(BASE, rel)
    if not os.path.exists(local):
        print(f"  SKIP: {rel}")
        continue
    remote_dir = f'/tmp/wu/{os.path.dirname(rel)}'
    parts = remote_dir.split('/')
    cur = ''
    for p in parts:
        if not p: cur = '/'; continue
        cur = cur + p + '/'
        try: sftp.stat(cur)
        except FileNotFoundError: sftp.mkdir(cur)
    sftp.put(local, f'/tmp/wu/{rel}')
    transferred += 1
sftp.close()
print(f"  {transferred} files transferred")

# Copy to container
print("\n=== Step 3: Copy to container ===")
for rel in FILES:
    local = os.path.join(BASE, rel)
    if not os.path.exists(local): continue
    run(f'docker cp /tmp/wu/{rel} {CID}:/app/{rel}')
print("  Done")

# Commit to image
print("\n=== Step 4: Commit image ===")
run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
run('docker rm -f blue-dreams-builder6 2>/dev/null')
out, _ = run(f'docker commit {CID} blue-dreams-rebuild:latest')
print(f"  {out[:50]}")

# Build in a builder container (it exits after build)
print("\n=== Step 5: Build (3-5 min) ===")
build_cmd = '''docker run --name blue-dreams-builder6 \
    --entrypoint /bin/bash \
    --network coolify \
    -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" \
    -w /app \
    blue-dreams-rebuild:latest \
    -c "npx prisma generate 2>&1 && npm run build 2>&1"'''

out, err = run(build_cmd, t=600)
lines = out.split('\n')
last = lines[-25:]
for l in last:
    print(f"  {l}")

# Builder exits = normal. Use docker cp to read BUILD_ID
print("\n=== Step 6: Extract BUILD_ID via docker cp ===")
run('docker cp blue-dreams-builder6:/app/.next/BUILD_ID /tmp/BUILD_ID 2>/dev/null')
bid, _ = run('cat /tmp/BUILD_ID 2>/dev/null')
print(f"  BUILD_ID: {bid}")

if bid and len(bid) > 5 and 'Error' not in bid:
    print("\n=== BUILD SUCCEEDED ===")

    # Copy build artifacts
    print("  Copying build artifacts...")
    run('rm -rf /tmp/next_build /tmp/prisma_client')
    run('docker cp blue-dreams-builder6:/app/.next /tmp/next_build')
    run('docker cp blue-dreams-builder6:/app/node_modules/.prisma /tmp/prisma_client 2>/dev/null')
    run(f'docker cp /tmp/next_build {CID}:/app/.next')
    run(f'docker cp /tmp/prisma_client {CID}:/app/node_modules/.prisma 2>/dev/null')
    print("  Build copied!")

    # Cleanup builder
    run('docker rm -f blue-dreams-builder6')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')

    # Start
    print("\n=== Step 7: Start container ===")
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)
    
    print("  Waiting 25s...")
    time.sleep(25)
    
    st, _ = run(f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
    print(f"  Status: {st}")
    
    if 'Up' in st and 'Restarting' not in st:
        print("\n=== Step 8: Smoke test ===")
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1', t=15)
        print(f"  Homepage: {s}")
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/admin" 2>&1', t=15)
        print(f"  Admin: {s}")
        s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
        print(f"  External: {s}")
        print("\n ALL DONE!")
    else:
        logs, _ = run(f'docker logs {CID} --tail 15 2>&1')
        print(f"\n  Issues:\n{logs}")
else:
    print("\n BUILD FAILED")
    if err: print(f"  {err[-500:]}")
    run('docker rm -f blue-dreams-builder6 2>/dev/null')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}')

run('rm -rf /tmp/wu')
c.close()
