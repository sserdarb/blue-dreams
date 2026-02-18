"""
Deploy v9 - Uses tar pipe for ALL file operations to handle [locale] brackets
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

# Step 1: Create local tar and upload to server
print(f"=== Step 1: Upload source files ({len(FILES)} files) ===")
buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    count = 0
    for rel in FILES:
        local = os.path.join(BASE, rel)
        if not os.path.exists(local):
            print(f"  SKIP: {rel}")
            continue
        tar.add(local, arcname=rel)
        count += 1
buf.seek(0)

sftp = c.open_sftp()
with sftp.file('/tmp/deploy_src.tar.gz', 'wb') as f:
    f.write(buf.read())
sftp.close()
print(f"  Uploaded {count} files")

# Step 2: Stop container, extract tar INTO container via host temp + import
print("\n=== Step 2: Stop container ===")
run(f'docker update --restart=no {CID}')
run(f'docker stop {CID} 2>/dev/null', t=15)
time.sleep(2)

# Step 3: Extract on host, then use docker import approach
# First extract to /tmp/deploy_src
print("\n=== Step 3: Copy source files into container ===")
run('rm -rf /tmp/deploy_src && mkdir -p /tmp/deploy_src')
run('cd /tmp/deploy_src && tar xzf /tmp/deploy_src.tar.gz')

# Start container briefly just so we can use docker exec
run(f'docker start {CID}', t=10)
time.sleep(3)

# Use tar pipe to copy into RUNNING container (this handles [locale] perfectly)
out, err = run(f'cd /tmp/deploy_src && tar cf - . | docker exec -i {CID} tar xf - -C /app')
if err and 'Error' in err:
    print(f"  ERROR: {err[:200]}")
else:
    print("  Source files injected via tar pipe")

# Verify rooms exists
out, _ = run(f'docker exec {CID} ls /app/app/\\[locale\\]/admin/rooms/page.tsx 2>&1')
print(f"  Verify rooms: {out}")
out, _ = run(f'docker exec {CID} grep "Oda" /app/app/\\[locale\\]/admin/layout.tsx 2>&1')
print(f"  Verify layout: {out[:80]}")

# Stop again for commit
run(f'docker stop {CID} 2>/dev/null', t=10)
time.sleep(2)

# Step 4: Commit image
print("\n=== Step 4: Commit image ===")
run('docker rm -f blue-dreams-builder6 2>/dev/null')
run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
out, _ = run(f'docker commit {CID} blue-dreams-rebuild:latest')
print(f"  {out[:60]}")

# Step 5: Build with bcryptjs install
print("\n=== Step 5: Build (3-5 min) ===")
build_cmd = f'''docker run --name blue-dreams-builder6 \
    --entrypoint /bin/bash \
    --network coolify \
    -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" \
    -w /app \
    blue-dreams-rebuild:latest \
    -c "npm install bcryptjs 2>&1 && rm -rf .next 2>&1 && npx prisma generate 2>&1 && npm run build 2>&1"'''

out, err = run(build_cmd, t=600)
lines = out.split('\n')

# Print last 30 lines of build output
has_error = False
for l in lines[-30:]:
    if 'Build error' in l or 'Module not found' in l:
        has_error = True
    print(f"  {l}")

# Step 6: Check BUILD_ID
print("\n=== Step 6: Check BUILD_ID ===")
run('docker cp blue-dreams-builder6:/app/.next/BUILD_ID /tmp/BUILD_ID 2>/dev/null')
bid, _ = run('cat /tmp/BUILD_ID 2>/dev/null')
print(f"  BUILD_ID: {bid}")

# Check routes in build output
rooms_route = any('/admin/rooms' in l for l in lines)
stats_route = any('/admin/statistics' in l for l in lines)
print(f"  /admin/rooms in build: {rooms_route}")
print(f"  /admin/statistics in build: {stats_route}")

if bid and len(bid) > 5 and 'Error' not in bid and not has_error:
    print("\n=== BUILD SUCCEEDED ===")

    # Copy .next and bcryptjs from builder
    print("  Extracting build artifacts...")
    
    # Use tar pipe from builder to copy .next to host
    run('rm -rf /tmp/next_build_dir && mkdir -p /tmp/next_build_dir')
    out, err = run('docker cp blue-dreams-builder6:/app/.next /tmp/next_build_dir/dot_next', t=120)
    # Copy bcryptjs
    run('docker cp blue-dreams-builder6:/app/node_modules/bcryptjs /tmp/bcryptjs_mod 2>/dev/null')
    # Copy prisma
    run('docker cp blue-dreams-builder6:/app/node_modules/.prisma /tmp/prisma_mod 2>/dev/null')
    
    verify, _ = run('cat /tmp/next_build_dir/dot_next/BUILD_ID')
    print(f"  Host BUILD_ID: {verify}")
    
    # Start container, then use tar pipe to overwrite .next
    run(f'docker start {CID}', t=10)
    time.sleep(3)
    
    # Remove old .next inside container
    run(f'docker exec {CID} rm -rf /app/.next', t=30)
    
    # Copy new .next using tar pipe (rename dot_next -> .next)
    out, err = run(f'cd /tmp/next_build_dir && mv dot_next .next && tar cf - .next | docker exec -i {CID} tar xf - -C /app', t=120)
    if err and 'Error' in err:
        print(f"  WARNING: {err[:200]}")
    
    # Copy bcryptjs
    run(f'cd /tmp && tar cf - bcryptjs_mod | docker exec -i {CID} bash -c "cd /app/node_modules && tar xf - && mv bcryptjs_mod bcryptjs" 2>/dev/null')
    # Simpler approach for bcryptjs
    run(f'docker exec {CID} rm -rf /app/node_modules/bcryptjs 2>/dev/null')
    run(f'docker cp /tmp/bcryptjs_mod {CID}:/app/node_modules/bcryptjs')
    
    # Copy prisma
    run(f'docker exec {CID} rm -rf /app/node_modules/.prisma 2>/dev/null')
    run(f'docker cp /tmp/prisma_mod {CID}:/app/node_modules/.prisma 2>/dev/null')
    
    # Verify
    verify2, _ = run(f'docker exec {CID} cat /app/.next/BUILD_ID')
    print(f"  Container BUILD_ID: {verify2}")
    
    # Cleanup builder
    run('docker rm -f blue-dreams-builder6')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    
    # Restart container
    print("\n=== Step 7: Restart container ===")
    run(f'docker stop {CID}', t=10)
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
        
        # Final checks
        print("\n=== Step 9: Final verification ===")
        bid2, _ = run(f'docker exec {CID} cat /app/.next/BUILD_ID')
        print(f"  BUILD_ID: {bid2}")
        out, _ = run(f'docker exec {CID} find /app/.next/server -path "*rooms*page*" -not -path "*content*" -type f 2>&1 | head -3')
        print(f"  Admin rooms route: {out}")
        out, _ = run(f'docker exec {CID} ls /app/node_modules/bcryptjs/index.js 2>&1')
        print(f"  bcryptjs: {out}")
        
        print("\n ALL DONE!")
    else:
        logs, _ = run(f'docker logs {CID} --tail 20 2>&1')
        print(f"\n  Container issues:\n{logs}")
else:
    print(f"\n BUILD FAILED (has_error={has_error})")
    for l in lines[-15:]:
        print(f"  {l}")
    run('docker rm -f blue-dreams-builder6 2>/dev/null')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)

c.close()
