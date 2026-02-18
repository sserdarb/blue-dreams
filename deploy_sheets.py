"""
Blue Dreams - In-container build deploy
Files already injected from previous step.
Builds directly inside the running container — no commit needed.
"""
import paramiko, sys, time, os, tarfile, io
print("DEBUG: Starting deploy script...", flush=True)
sys.stdout.reconfigure(encoding='utf-8')

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
CID = '15609eb83e88'
DB_URL = 'postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2'

def ssh():
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"DEBUG: Connecting to {SERVER}...", flush=True)
    try:
        c.connect(SERVER, username=USER, password=PASSWORD, timeout=60, look_for_keys=False, allow_agent=False)
        print("DEBUG: Connected!", flush=True)
    except Exception as e:
        print(f"DEBUG: Connection failed: {e}", flush=True)
        raise e
    c.get_transport().set_keepalive(15)
    return c

def run(c, cmd, t=30):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8','replace').strip(), se.read().decode('utf-8','replace').strip()

def bg_run(cmd, logfile, done_marker, max_wait=600, interval=10, label=""):
    """Run via nohup, poll log for done marker"""
    c = ssh()
    run(c, f'nohup bash -c {repr(cmd)} > {logfile} 2>&1 &')
    c.close()
    
    start_time = time.time()
    for i in range(max_wait // interval):
        time.sleep(interval)
        try:
            c = ssh()
            o, _ = run(c, f'tail -3 {logfile} 2>/dev/null', t=10)
            c.close()
            elapsed = int(time.time() - start_time)
            if done_marker in o:
                print(f"  ✓ {label} done ({elapsed}s)")
                return True
            if elapsed % 30 == 0:
                print(f"  ⏳ {label}... ({elapsed}s)")
        except Exception as e:
            print(f"  ⚠ Poll err: {e}")
    print(f"  ✗ {label} timeout")
    return False

def step(n, msg):
    print(f"\n{'='*3} Step {n}: {msg} {'='*3}")

# ═══════════════════════════════════════════════════════════
step(1, "Verify container state & source files")
c = ssh()
# Start container if stopped
run(c, f'docker update --restart=unless-stopped {CID}')
run(c, f'docker start {CID} 2>/dev/null', t=10)
time.sleep(5)
st, _ = run(c, f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
print(f"  Container: {st}")

# Always inject latest source files
print("  Injecting source files...")
c.close()

BASE = r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix'
FILES = [
    # Core services
    'app/globals.css',
    'lib/services/google-sheets.ts',
    'lib/services/elektra.ts',
    'lib/admin-translations.ts',
    'lib/ai-config.ts',
    'prisma/schema.prisma',
    'app/actions/auth.ts',
    # AI APIs
    'app/api/ai/chat/route.ts',
    'app/api/ai/settings/route.ts',
    'app/api/ai/training/route.ts',
    'app/api/ai/sheets/route.ts',
    'app/api/admin/ai-interpret/route.ts',
    'app/api/admin/users/route.ts',
    'app/api/admin/users/route.ts',
    'app/api/admin/cache-reports/route.ts',
    # Scripts
    'scripts/migrate_home_content.ts',
    # Admin pages (locale-based)
    'app/[locale]/admin/layout.tsx',
    'app/[locale]/admin/ai-training/page.tsx',
    'app/[locale]/admin/extras/page.tsx',
    'app/[locale]/admin/statistics/ReportsClient.tsx',
    'app/[locale]/admin/statistics/page.tsx',
    'app/[locale]/admin/users/page.tsx',
    'app/[locale]/admin/crm/ReviewsClient.tsx',
    'app/[locale]/admin/reservations/ReservationsClient.tsx',
    'app/[locale]/admin/reservations/page.tsx',
    'app/[locale]/admin/extras/ExtrasClient.tsx',
    'app/[locale]/admin/chat/page.tsx',
    'app/[locale]/admin/activities/page.tsx',
    # === NEW: Management Reports ===
    'app/[locale]/admin/reports/page.tsx',
    'app/[locale]/admin/reports/ManagementReportsClient.tsx',
    # === NEW: Restaurant QR Menus ===
    'app/[locale]/admin/integrations/restaurants/page.tsx',
    # === NEW: Social Media Dashboard ===
    'app/[locale]/admin/social/page.tsx',
    # === NEW: Public QR Menu Page ===
    'app/[locale]/(public)/menu/[id]/page.tsx',
    'public/bdr-logo-dark.png',
    # Components
    'components/admin/charts/CRMCharts.tsx',
    'components/admin/StatCard.tsx',
    'components/admin/charts/SalesChart.tsx',
    'components/admin/AdminSidebar.tsx',
    'components/admin/ThemeProvider.tsx',
    'components/chat/BlueConciergeFull.tsx',
    'components/chat/ChatWidget.tsx',
    'components/widgets/PageHeaderWidget.tsx',
    'components/widgets/HeroWidget.tsx',
    'components/shared/PageHeader.tsx',
    # Old admin (keep for backwards compat)
    'app/admin/ai-training/page.tsx',
    # === NEW: Social Media AI Content Generator ===
    'app/api/admin/social-content/route.ts',
    'app/[locale]/admin/social/content/page.tsx',
    # === Theme-fixed pages ===
    'app/[locale]/admin/rooms/RoomsClient.tsx',
    'app/[locale]/admin/marketing/MarketingClient.tsx',
    'app/[locale]/admin/analytics/page.tsx',
    'app/[locale]/admin/page.tsx',
    # === NEW: Item 15 — Room Pricing & Booking Engine ===
    'app/api/rooms/pricing/route.ts',
    'components/shared/LivePricing.tsx',
    'app/[locale]/(public)/odalar/club/page.tsx',
    'app/[locale]/(public)/odalar/deluxe/page.tsx',
    'app/[locale]/(public)/odalar/aile/page.tsx',
    # === NEW: Item 16 — Elektra Cache & Cron ===
    'lib/services/elektra-cache.ts',
    'app/api/admin/elektra-cache/route.ts',
    'instrumentation.ts',
    # === NEW: Item 17 — Yield Management Module ===
    'app/[locale]/admin/yield/page.tsx',
    'app/[locale]/admin/yield/YieldManagementClient.tsx',
    'app/api/admin/yield-analysis/route.ts',
    # === NEW: Phase 2 — Booking Engine Config ===
    'app/[locale]/admin/integrations/booking/page.tsx',
    'app/api/admin/booking-test/route.ts',
    # === NEW: Phase 3 — Blue Concierge, Sustainability, Meeting Rooms ===
    'components/AiAssistant.tsx',
    'components/sections/Footer.tsx',
    'app/[locale]/(public)/surdurulebilirlik/page.tsx',
    'app/[locale]/(public)/kvkk/page.tsx',
    # === FIX: Missing export-pdf utility ===
    'lib/export-pdf.ts',
    'app/[locale]/admin/crm/ReviewsClient.tsx',
    # === Phase 4 — Bug Fixes: Menu, Currency, YoY, Booking, Rooms ===
    'app/[locale]/admin/content/meeting/page.tsx',
    'app/[locale]/admin/content/dining/page.tsx',
    'app/[locale]/admin/statistics/ReportsClient.tsx',
    'app/[locale]/admin/reservations/ReservationsClient.tsx',
    'app/[locale]/admin/reservations/page.tsx',
    'app/[locale]/admin/integrations/booking/page.tsx',
    'app/[locale]/(public)/odalar/page.tsx',
    # === NEW: Purchasing Reports Module ===
    'lib/services/purchasing.ts',
    'app/[locale]/admin/purchasing/page.tsx',
    'app/[locale]/admin/purchasing/PurchasingClient.tsx',
    # === NEW: Big Data Analytics Module ===
    'lib/services/bigdata.ts',
    'app/[locale]/admin/bigdata/page.tsx',
    'app/[locale]/admin/bigdata/charts.tsx',
    'app/[locale]/admin/bigdata/BigDataClient.tsx',
    'components/admin/AdminSidebar.tsx',
    # === NEW: Accounting (Muhasebe) Module ===
    'lib/services/accounting.ts',
    'app/[locale]/admin/accounting/page.tsx',
    'app/[locale]/admin/accounting/AccountingClient.tsx',
    # === NEW: 2026 Budget Integration ===
    'lib/services/budget-2026.ts',
    'app/[locale]/admin/statistics/ReportsClient.tsx',
    # === NEW: Market Filter, YTD Comparison & Online Booking ===
    'lib/services/booking-service.ts',
    'app/api/booking/availability/route.ts',
    'components/booking/BookingWidget.tsx',
    # === FIX: Missing report client modules ===
    'lib/services/finance.ts',
    'lib/services/hr.ts',
    'app/[locale]/admin/reports/FinanceReportsClient.tsx',
    'app/[locale]/admin/reports/HRReportsClient.tsx',
    'app/[locale]/admin/reports/PurchasingReportsClient.tsx',
    'app/[locale]/admin/reports/ReportGroupNav.tsx',
    # === NEW: Room Booking Widget (integrated booking on rooms page) ===
    'components/widgets/RoomBookingWidget.tsx',
    'components/widgets/WidgetRenderer.tsx',
    # === FIX: Missing analytics components ===
    'components/admin/analytics/PlatformRadar.tsx',
    'components/admin/analytics/AIInsights.tsx',
    'components/admin/analytics/RecentVisitors.tsx',
]
buf = io.BytesIO()
with tarfile.open(fileobj=buf, mode='w:gz') as tar:
    for rel in FILES:
        local = os.path.join(BASE, rel)
        if os.path.exists(local):
            tar.add(local, arcname=rel)
            print(f"    + {rel}")
        else:
            print(f"    ⚠ SKIP (not found): {rel}")
buf.seek(0)

c = ssh()
sftp = c.open_sftp()
with sftp.file('/tmp/deploy_src.tar.gz', 'wb') as f:
    f.write(buf.read())
sftp.close()
run(c, 'rm -rf /tmp/deploy_src && mkdir -p /tmp/deploy_src')
run(c, 'cd /tmp/deploy_src && tar xzf /tmp/deploy_src.tar.gz')
run(c, f'cd /tmp/deploy_src && tar cf - . | docker exec -i {CID} tar xf - -C /app')
print("  ✓ Files injected!")
c.close()

# ═══════════════════════════════════════════════════════════
step(2, "Build inside container (nohup, ~5 min)")

# Build directly inside the running container
build_cmd = f'''docker exec {CID} bash -c "cd /app && npm install bcryptjs tsx 2>&1 && npx prisma db push --accept-data-loss 2>&1 && npx prisma generate 2>&1 && npx tsx scripts/migrate_home_content.ts 2>&1 && npm run build 2>&1 && echo BUILD_COMPLETE_MARKER"'''

ok = bg_run(
    cmd=build_cmd,
    logfile='/tmp/inplace_build.txt',
    done_marker='BUILD_COMPLETE_MARKER',
    max_wait=1800,
    interval=10,
    label="Build"
)

# Check build output
c = ssh()
bid, _ = run(c, f'docker exec {CID} cat /app/.next/BUILD_ID 2>/dev/null || echo NO_BUILD')
print(f"  BUILD_ID: {bid}")

if bid == 'NO_BUILD' or len(bid) < 5:
    print("  ✗ BUILD FAILED")
    o, _ = run(c, 'tail -30 /tmp/inplace_build.txt 2>/dev/null')
    print(f"  Build log:\n{o}")
    c.close()
    sys.exit(1)

print("  ★ BUILD SUCCEEDED ★")
c.close()

# ═══════════════════════════════════════════════════════════
step(3, "Restart container")
c = ssh()
run(c, f'docker stop {CID}', t=15)
time.sleep(2)
run(c, f'docker update --restart=unless-stopped {CID}')
run(c, f'docker start {CID}', t=15)
print("  Waiting 35s for warmup...")
c.close()
time.sleep(35)

# ═══════════════════════════════════════════════════════════
step(4, "Smoke test")
c = ssh()
st, _ = run(c, f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
print(f"  Status: {st}")

if 'Up' in st and 'Restarting' not in st:
    time.sleep(5)
    tests = [
        ('Homepage', f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1'),
        ('Statistics', f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/statistics" 2>&1'),
        ('AI Training', f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/ai-training" 2>&1'),
        ('Extras', f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/extras" 2>&1'),
        ('Reports', f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/reports" 2>&1'),
        ('Social', f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/social" 2>&1'),
        ('Restaurants', f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/integrations/restaurants" 2>&1'),
        ('Booking Engine', f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr/admin/integrations/booking" 2>&1'),
        ('AI Interpret API', f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/api/admin/ai-interpret" 2>&1'),
        ('Sheets API', f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/api/ai/sheets" 2>&1'),
        ('External', 'curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1'),
    ]
    for name, cmd in tests:
        s, _ = run(c, cmd, t=15)
        status = '✓' if s in ['200', '307', '403'] else '✗'
        print(f"  {status} {name}: {s}")
    
    o, _ = run(c, f'docker exec {CID} find /app/.next/server -path "*sheets*" -type f 2>&1 | head -3')
    print(f"  Sheets in build: {o}")
    
    print("\n  ★ ALL DONE! ★")
else:
    logs, _ = run(c, f'docker logs {CID} --tail 20 2>&1')
    print(f"\n  ✗ Issues:\n{logs}")

c.close()
print("\nDeploy finished.")
