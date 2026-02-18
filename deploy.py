"""
Blue Dreams Resort - Fixed Deploy Script
Uses tar pipe to inject ALL files directly into the builder container.
"""
import paramiko, sys, time, os, tarfile, io
sys.stdout.reconfigure(encoding='utf-8')

# ─── Connection ──────────────────────────────────────────
SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
CID = '15609eb83e88'  # Blue Dreams Next.js Container (v2)
BASE = r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix'
DB_URL = 'postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2'

# ─── Files to deploy ────────────────────────────────────
FILES = [
    # Widget editors
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
    'components/admin/AdminSidebar.tsx',
    # Analytics components (CRITICAL - were missing before)
    'components/admin/analytics/PlatformRadar.tsx',
    'components/admin/analytics/AIInsights.tsx',
    'components/admin/analytics/RecentVisitors.tsx',
    'components/admin/SiteSettingsForm.tsx',
    # UI Components
    'components/ui/card.tsx',
    'components/ui/button.tsx',
    'components/ui/badge.tsx',
    'components/ui/table.tsx',
    'components/ui/input.tsx',
    # Admin pages
    'app/admin/pages/[id]/editor/page.tsx',
    'app/[locale]/admin/pages/[id]/editor/page.tsx',
    'app/admin/layout.tsx',
    'app/actions/admin.ts',
    'app/admin/page.tsx',
    'app/[locale]/admin/page.tsx',
    'app/[locale]/admin/layout.tsx',
    # Reservations
    'app/[locale]/admin/reservations/page.tsx',
    'app/[locale]/admin/reservations/ReservationsClient.tsx',
    'app/api/admin/reservations/route.ts',
    # Statistics / Reports
    'app/[locale]/admin/statistics/page.tsx',
    'app/[locale]/admin/statistics/ReportsClient.tsx',
    # Rooms / Pricing
    'app/[locale]/admin/rooms/page.tsx',
    'app/[locale]/admin/rooms/RoomsClient.tsx',
    'app/api/admin/availability/route.ts',
    # Services
    'lib/services/elektra.ts',
    'lib/services/marketing.ts',
    'lib/services/google-sheets.ts',
    'lib/ai-config.ts',
    'lib/admin-translations.ts',
    # Extras
    'app/[locale]/admin/extras/page.tsx',
    'app/[locale]/admin/extras/ExtrasClient.tsx',
    # CRM
    'app/[locale]/admin/crm/page.tsx',
    'app/[locale]/admin/crm/ReviewsClient.tsx',
    # Marketing
    'app/[locale]/admin/marketing/page.tsx',
    'app/[locale]/admin/marketing/MarketingClient.tsx',
    # Users
    'app/[locale]/admin/users/page.tsx',
    'app/api/admin/users/route.ts',
    # AI / Concierge
    'app/actions/auth.ts',
    'app/api/ai/chat/route.ts',
    'app/api/ai/settings/route.ts',
    'app/api/ai/training/route.ts',
    'app/api/ai/sheets/route.ts',
    'app/admin/ai-training/page.tsx',
    # Analytics & Settings
    'app/[locale]/admin/analytics/page.tsx',
    'app/[locale]/admin/settings/page.tsx',
    'app/api/settings/analytics/route.ts',
    'app/actions/settings.ts',
    # File Manager
    'app/[locale]/admin/files/page.tsx',
    'app/[locale]/admin/files/FileManager.tsx',
    # Prisma schema & Config files
    'prisma/schema.prisma',
    'package.json',
    'next.config.ts',
    'tsconfig.json',
    'postcss.config.mjs',
    'eslint.config.mjs',
    'middleware.ts',
    'lib/utils.ts',
]

# ─── SSH Helpers ─────────────────────────────────────────
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(SERVER, username=USER, password=PASSWORD, timeout=60)
transport = c.get_transport()
transport.set_keepalive(60)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    o = so.read().decode('utf-8', errors='replace').strip()
    e = se.read().decode('utf-8', errors='replace').strip()
    return o, e

def step(n, msg):
    print(f"\n{'='*3} Step {n}: {msg} {'='*3}")

# ═══════════════════════════════════════════════════════════
#  STEP 1: Create tar.gz of source files
# ═══════════════════════════════════════════════════════════
step(1, f"Create tar.gz ({len(FILES)} files)")

buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    count = 0
    for rel in FILES:
        local = os.path.join(BASE, rel)
        if not os.path.exists(local):
            print(f"  SKIP (not found): {rel}")
            continue
        tar.add(local, arcname=rel)
        count += 1
buf.seek(0)
print(f"  ✓ {count} files in tar.gz ({len(buf.getvalue())} bytes)")

# Upload tar
sftp = c.open_sftp()
with sftp.file('/tmp/deploy_src.tar.gz', 'wb') as f:
    f.write(buf.read())
sftp.close()
print("  ✓ Uploaded to server")

# ═══════════════════════════════════════════════════════════
#  STEP 2: Stop container, commit image, create builder
# ═══════════════════════════════════════════════════════════
step(2, "Stop container & create builder")
run(f'docker update --restart=no {CID}')
run(f'docker stop {CID} 2>/dev/null', t=15)
time.sleep(3)

# Remove old builder
run('docker rm -f blue-builder 2>/dev/null')
run('docker rmi blue-builder-img:latest 2>/dev/null')

# Commit current container
out, _ = run(f'docker commit {CID} blue-builder-img:latest')
print(f"  Committed: {out[:40]}...")

# Create builder with sleep so it stays alive
run(
    'docker run -d --name blue-builder '
    '--network coolify '
    '-w /app '
    'blue-builder-img:latest '
    'sleep 900'
)
time.sleep(3)
print("  ✓ Builder container created")

# ═══════════════════════════════════════════════════════════
#  STEP 3: Inject ALL files into BUILDER container via tar
# ═══════════════════════════════════════════════════════════
step(3, "Inject source files into builder via tar pipe")

# Extract tar on host first
run('rm -rf /tmp/deploy_src && mkdir -p /tmp/deploy_src')
run('cd /tmp/deploy_src && tar xzf /tmp/deploy_src.tar.gz')

# Copy into builder container
out, err = run('docker cp /tmp/deploy_src/. blue-builder:/app/', t=60)
if err and 'Error' in err:
    print(f"  ⚠ docker cp error: {err[:200]}")
else:
    print("  ✓ Files copied to builder")

# Verify critical files exist in builder
for check_file in [
    'components/admin/analytics/PlatformRadar.tsx',
    'components/admin/analytics/AIInsights.tsx',
    'components/admin/analytics/RecentVisitors.tsx',
    'app/\\[locale\\]/admin/rooms/page.tsx',
    'components/admin/AdminSidebar.tsx',
]:
    out, _ = run(f'docker exec blue-builder ls /app/{check_file} 2>&1')
    ok = 'No such file' not in out
    print(f"  {check_file.split('/')[-1]}: {'✓' if ok else '✗ MISSING'}")

# ═══════════════════════════════════════════════════════════
#  STEP 4: Install dependencies & build
# ═══════════════════════════════════════════════════════════
step(4, "Install dependencies & build")
out, _ = run(f'docker exec -e DATABASE_URL="{DB_URL}" blue-builder npm install 2>&1', t=600)
print("  ✓ npm install done")

out, _ = run(f'docker exec -e DATABASE_URL="{DB_URL}" blue-builder npx prisma db push --accept-data-loss 2>&1', t=120)
out, _ = run(f'docker exec -e DATABASE_URL="{DB_URL}" blue-builder npx prisma generate 2>&1', t=120)
print("  ✓ prisma ready")

# Remove old .next to force clean build
run('docker exec blue-builder rm -rf /app/.next', t=30)

print("  Building Next.js (3-5 min)...")
out, err = run(f'docker exec -e DATABASE_URL="{DB_URL}" -e NODE_ENV=production blue-builder /bin/sh -c "npm run build 2>&1"', t=600)
lines = out.split('\n')

has_error = False
for l in lines[-30:]:
    if 'Build error' in l or 'Module not found' in l or 'webpack errors' in l:
        has_error = True
    print(f"  {l}")

# ═══════════════════════════════════════════════════════════
#  STEP 5: Verify build
# ═══════════════════════════════════════════════════════════
step(5, "Verify build")
bid, _ = run('docker exec blue-builder cat /app/.next/BUILD_ID')
print(f"  BUILD_ID: {bid}")

manifest, _ = run('docker exec blue-builder ls /app/.next/prerender-manifest.json 2>&1')
print(f"  prerender-manifest: {'✓' if 'prerender' in manifest else '✗ MISSING'}")

if bid and len(bid) > 5 and not has_error:
    print("\n  ★ BUILD SUCCEEDED ★")
    
    # Copy build artifacts back to original container
    step(6, "Copy artifacts to original container")
    run('docker cp blue-builder:/app/.next /tmp/blue_next', t=120)
    run('docker cp blue-builder:/app/node_modules /tmp/blue_nm', t=120)
    print("  ✓ Copied to host")
    
    # Inject into original container
    run(f'docker cp /tmp/blue_next/.next {CID}:/app/', t=120)
    run(f'docker cp /tmp/blue_nm/node_modules {CID}:/app/', t=120)
    # Also copy the source files
    run(f'docker cp /tmp/deploy_src/. {CID}:/app/', t=60)
    print("  ✓ Injected into original container")
    
    # Cleanup
    run('docker rm -f blue-builder')
    run('docker rmi blue-builder-img:latest 2>/dev/null')
    run('rm -rf /tmp/blue_next /tmp/blue_nm /tmp/deploy_src')
    
    # Restart
    step(7, "Restart container")
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)
    print("  Waiting 30s for warmup...")
    time.sleep(30)
    
    # Smoke test
    step(8, "Smoke test")
    status, _ = run(f'docker ps --filter id={CID} --format "{{{{.Status}}}}"')
    print(f"  Container: {status}")
    
    if 'Up' in str(status):
        bid2, _ = run(f'docker exec {CID} cat /app/.next/BUILD_ID')
        print(f"  BUILD_ID: {bid2}")
        
        for path in ['/tr', '/tr/admin/statistics', '/tr/admin/rooms']:
            s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000{path}" 2>&1', t=15)
            print(f"  {path}: {s}")
        
        s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
        print(f"  External: {s}")
        
        print("\n  ★ ALL DONE! ★")
    else:
        logs, _ = run(f'docker logs {CID} --tail 20 2>&1')
        print(f"  Container not running! Logs:\n{logs[:500]}")
else:
    print("\n  ✗ BUILD FAILED")
    # Cleanup and restart original
    run('docker rm -f blue-builder')
    run('docker rmi blue-builder-img:latest 2>/dev/null')
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)

c.close()
