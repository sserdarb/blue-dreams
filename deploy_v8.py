"""
Deploy v8 - Fixed: install bcryptjs, use docker cp for files (not tar pipe), proper .next copy
"""
import paramiko, sys, time, os, tarfile, io
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=15)

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

# Step 1: Create tar archive and upload
print(f"=== Step 1: Create tar archive ({len(FILES)} files) ===")
buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    for rel in FILES:
        local = os.path.join(BASE, rel)
        if not os.path.exists(local):
            print(f"  SKIP: {rel}")
            continue
        tar.add(local, arcname=rel)
buf.seek(0)
archive_size = buf.tell()
buf.seek(0)

sftp = c.open_sftp()
with sftp.file('/tmp/deploy_update.tar.gz', 'wb') as f:
    f.write(buf.read())
sftp.close()
print(f"  Archive uploaded ({archive_size} bytes, {len(FILES)} files)")

# Step 2: Extract on host and use docker cp (works on stopped container)
print("\n=== Step 2: Extract and copy to container ===")
# Stop container
run(f'docker update --restart=no {CID}')
run(f'docker stop {CID} 2>/dev/null', t=15)
time.sleep(2)

# Extract to temp dir on host
run('rm -rf /tmp/deploy_extract && mkdir -p /tmp/deploy_extract')
run('cd /tmp/deploy_extract && tar xzf /tmp/deploy_update.tar.gz')

# Use docker cp file by file (works on stopped containers, handles brackets)
for rel in FILES:
    local = os.path.join(BASE, rel)
    if not os.path.exists(local):
        continue
    # Ensure directory exists in container
    dir_path = os.path.dirname(rel)
    if dir_path:
        run(f'docker exec {CID} mkdir -p /app/{dir_path} 2>/dev/null')
    run(f'docker cp /tmp/deploy_extract/{rel} {CID}:/app/{rel}')

# docker cp doesn't work well with brackets in paths on some Docker versions
# Alternative: start container briefly, copy via tar pipe, stop again
print("  Files copied, verifying...")
# Verify a key new file exists
out, _ = run(f'docker diff {CID} | grep rooms')
print(f"  Docker diff rooms: {out[:200]}")

# Step 3: Commit image
print("\n=== Step 3: Commit image ===")
run('docker rm -f blue-dreams-builder6 2>/dev/null')
run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
out, _ = run(f'docker commit {CID} blue-dreams-rebuild:latest')
print(f"  {out[:60]}")

# Step 4: Build with bcryptjs install
print("\n=== Step 4: Build (3-5 min) ===")
build_cmd = f'''docker run --name blue-dreams-builder6 \
    --entrypoint /bin/bash \
    --network coolify \
    -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" \
    -w /app \
    blue-dreams-rebuild:latest \
    -c "npm install bcryptjs 2>&1 && rm -rf .next/cache && npx prisma generate 2>&1 && npm run build 2>&1"'''

out, err = run(build_cmd, t=600)
lines = out.split('\n')

# Check for build error
has_error = False
for l in lines[-30:]:
    if 'Build error' in l or 'Module not found' in l:
        has_error = True
    print(f"  {l}")

# Step 5: Extract BUILD_ID
print("\n=== Step 5: Extract BUILD_ID ===")
run('docker cp blue-dreams-builder6:/app/.next/BUILD_ID /tmp/BUILD_ID 2>/dev/null')
bid, _ = run('cat /tmp/BUILD_ID 2>/dev/null')
print(f"  BUILD_ID: {bid}")

# Also check the builder had rooms route
out, _ = run('docker exec blue-dreams-builder6 find /app/.next/server -path "*rooms*page*" -type f 2>&1 | head -3')
print(f"  Rooms route in builder: {out}")

if bid and len(bid) > 5 and 'Error' not in bid and not has_error:
    print("\n=== BUILD SUCCEEDED ===")

    # Copy .next from builder to host
    print("  Copying .next from builder...")
    run('rm -rf /tmp/next_build /tmp/prisma_client')
    run('docker cp blue-dreams-builder6:/app/.next /tmp/next_build')
    run('docker cp blue-dreams-builder6:/app/node_modules/.prisma /tmp/prisma_client 2>/dev/null')
    # Also copy node_modules/bcryptjs from builder
    run('docker cp blue-dreams-builder6:/app/node_modules/bcryptjs /tmp/bcryptjs_pkg 2>/dev/null')

    # Verify host copy
    verify, _ = run('cat /tmp/next_build/BUILD_ID')
    print(f"  Host copy BUILD_ID: {verify}")

    # Copy to running container
    # First remove old .next
    run(f'docker exec {CID} rm -rf /app/.next 2>/dev/null')  # This fails if stopped, we handle below
    
    # docker cp works on stopped containers
    run(f'docker cp /tmp/next_build {CID}:/app/.next')
    run(f'docker cp /tmp/prisma_client {CID}:/app/node_modules/.prisma 2>/dev/null')
    run(f'docker cp /tmp/bcryptjs_pkg {CID}:/app/node_modules/bcryptjs 2>/dev/null')

    # Verify in container  
    verify2, _ = run(f'docker diff {CID} | grep BUILD_ID')
    print(f"  Container BUILD_ID diff: {verify2[:100]}")

    # Cleanup builder
    run('docker rm -f blue-dreams-builder6')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')

    # Start container
    print("\n=== Step 6: Start container ===")
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)

    print("  Waiting 30s for warmup...")
    time.sleep(30)

    st, _ = run(f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
    print(f"  Status: {st}")

    if 'Up' in st and 'Restarting' not in st:
        print("\n=== Step 7: Smoke test ===")
        time.sleep(10)  # Extra warmup
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1', t=15)
        print(f"  Homepage: {s}")
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/statistics" 2>&1', t=15)
        print(f"  Statistics: {s}")
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/rooms" 2>&1', t=15)
        print(f"  Rooms: {s}")
        s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
        print(f"  External: {s}")
        
        # Final verification
        print("\n=== Step 8: Final verification ===")
        bid2, _ = run(f'docker exec {CID} cat /app/.next/BUILD_ID')
        print(f"  BUILD_ID: {bid2}")
        out, _ = run(f'docker exec {CID} ls /app/node_modules/bcryptjs/index.js 2>&1')
        print(f"  bcryptjs: {out}")
        out, _ = run(f'docker exec {CID} find /app/.next/server -path "*rooms*page*" -type f 2>&1 | head -3')
        print(f"  Rooms route: {out}")

        print("\n ALL DONE!")
    else:
        logs, _ = run(f'docker logs {CID} --tail 15 2>&1')
        print(f"\n  Issues:\n{logs}")
else:
    print("\n BUILD FAILED")
    for l in lines[-15:]:
        print(f"  {l}")
    run('docker rm -f blue-dreams-builder6 2>/dev/null')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)

c.close()
