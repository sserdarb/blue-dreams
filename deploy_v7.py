"""
Deploy v7 - Fixed bracket path handling + proper .next copy
Uses tar archive to transfer files with [locale] in paths
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

# Step 1: Stop container
print("=== Step 1: Stopping container ===")
run(f'docker update --restart=no {CID}')
run(f'docker stop {CID} 2>/dev/null', t=15)
time.sleep(2)

# Step 2: Create tar archive locally and upload
print(f"\n=== Step 2: Create tar archive ({len(FILES)} files) ===")
buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    for rel in FILES:
        local = os.path.join(BASE, rel)
        if not os.path.exists(local):
            print(f"  SKIP: {rel}")
            continue
        tar.add(local, arcname=rel)
        print(f"  + {rel}")
buf.seek(0)

sftp = c.open_sftp()
with sftp.file('/tmp/deploy_update.tar.gz', 'wb') as f:
    f.write(buf.read())
sftp.close()
print(f"  Archive uploaded ({buf.tell()} bytes)")

# Step 3: Extract into container
print("\n=== Step 3: Extract into container ===")
# Extract to temp dir first, then docker cp the whole thing
run('rm -rf /tmp/deploy_extract && mkdir -p /tmp/deploy_extract')
run('cd /tmp/deploy_extract && tar xzf /tmp/deploy_update.tar.gz')
# Use docker cp with tar to preserve bracket paths
out, err = run(f'cd /tmp/deploy_extract && tar cf - . | docker exec -i {CID} tar xf - -C /app')
if err:
    print(f"  Warning: {err[:200]}")
else:
    print("  Files extracted successfully")

# Verify files exist
print("\n=== Step 3b: Verify key files ===")
out, _ = run(f'docker exec {CID} ls /app/app/\\[locale\\]/admin/rooms/page.tsx 2>&1')
print(f"  rooms/page.tsx: {out}")
out, _ = run(f'docker exec {CID} grep -c "Oda" /app/app/\\[locale\\]/admin/layout.tsx 2>&1')
print(f"  layout.tsx 'Oda' count: {out}")

# Step 4: Commit to image
print("\n=== Step 4: Commit image ===")
run('docker rm -f blue-dreams-builder6 2>/dev/null')
run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
out, _ = run(f'docker commit {CID} blue-dreams-rebuild:latest')
print(f"  {out[:60]}")

# Step 5: Build in builder container
print("\n=== Step 5: Build (3-5 min) ===")
build_cmd = f'''docker run --name blue-dreams-builder6 \
    --entrypoint /bin/bash \
    --network coolify \
    -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" \
    -w /app \
    blue-dreams-rebuild:latest \
    -c "rm -rf .next/cache && npx prisma generate 2>&1 && npm run build 2>&1"'''

out, err = run(build_cmd, t=600)
lines = out.split('\n')
last = lines[-25:]
for l in last:
    print(f"  {l}")

# Step 6: Extract BUILD_ID
print("\n=== Step 6: Extract BUILD_ID ===")
run('docker cp blue-dreams-builder6:/app/.next/BUILD_ID /tmp/BUILD_ID 2>/dev/null')
bid, _ = run('cat /tmp/BUILD_ID 2>/dev/null')
print(f"  BUILD_ID: {bid}")

if bid and len(bid) > 5 and 'Error' not in bid:
    print("\n=== BUILD SUCCEEDED ===")

    # Copy build artifacts via tar (handles .next properly)
    print("  Copying build artifacts via tar...")
    run('rm -rf /tmp/next_build')
    
    # Use tar to copy .next from builder to host to container
    run('docker cp blue-dreams-builder6:/app/.next /tmp/next_build')
    
    # Verify BUILD_ID exists in the copy
    verify, _ = run('cat /tmp/next_build/BUILD_ID')
    print(f"  Copied BUILD_ID: {verify}")
    
    # Copy .next to running container (overwrite entirely)
    run(f'docker exec {CID} rm -rf /app/.next')
    run(f'docker cp /tmp/next_build {CID}:/app/.next')
    
    # Verify BUILD_ID in container
    verify2, _ = run(f'docker exec {CID} cat /app/.next/BUILD_ID')
    print(f"  Container BUILD_ID: {verify2}")
    
    # Copy prisma
    run('docker cp blue-dreams-builder6:/app/node_modules/.prisma /tmp/prisma_client 2>/dev/null')
    run(f'docker cp /tmp/prisma_client {CID}:/app/node_modules/.prisma 2>/dev/null')
    print("  Build artifacts copied!")

    # Cleanup builder
    run('docker rm -f blue-dreams-builder6')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')

    # Start container
    print("\n=== Step 7: Start container ===")
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)
    
    print("  Waiting 30s for warmup...")
    time.sleep(30)
    
    st, _ = run(f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
    print(f"  Status: {st}")
    
    if 'Up' in st and 'Restarting' not in st:
        print("\n=== Step 8: Smoke test ===")
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1', t=15)
        print(f"  Homepage: {s}")
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/statistics" 2>&1', t=15)
        print(f"  Statistics: {s}")
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/rooms" 2>&1', t=15)
        print(f"  Rooms: {s}")
        s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
        print(f"  External: {s}")
        
        # Final verification
        print("\n=== Step 9: Verify BUILD_ID still present ===")
        bid2, _ = run(f'docker exec {CID} cat /app/.next/BUILD_ID')
        print(f"  BUILD_ID: {bid2}")
        
        # Check for rooms route in built output
        out, _ = run(f'docker exec {CID} ls /app/.next/server/app/\\[locale\\]/admin/rooms/ 2>&1')
        print(f"  Rooms route: {out[:100]}")
        
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
    run(f'docker start {CID}', t=15)

c.close()
