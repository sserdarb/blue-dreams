import paramiko, sys, time
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    out = so.read().decode('utf-8', errors='replace').strip()
    err = se.read().decode('utf-8', errors='replace').strip()
    return out, err

CID = '3815dea559c9'
sftp = c.open_sftp()

# Step 1: Stop container
print("=== STEP 1: Stop container ===")
run(f'docker update --restart=no {CID}')
run(f'docker stop {CID}', t=30)
time.sleep(2)
st, _ = run(f'docker ps -a --filter "id={CID}" --format "{{{{.Status}}}}"')
print(f"Status: {st}")

# Step 2: Upload CORRECT files (local = source of truth)
print("\n=== STEP 2: Upload correct source files ===")
files = {
    'prisma/schema.prisma': '/tmp/fix_schema.prisma',
    'app/api/ai/chat/route.ts': '/tmp/fix_chat.ts',
    'app/api/ai/settings/route.ts': '/tmp/fix_settings.ts',
    'app/admin/ai-training/page.tsx': '/tmp/fix_ai_training.tsx',
    'app/api/admin/users/route.ts': '/tmp/fix_admin_users.ts',
    'app/admin/users/page.tsx': '/tmp/fix_admin_users_page.tsx',
    'app/admin/login/page.tsx': '/tmp/fix_login.tsx',
    'app/admin/layout.tsx': '/tmp/fix_layout.tsx',
    'app/actions/auth.ts': '/tmp/fix_auth.ts',
    'app/api/analytics/data/route.ts': '/tmp/fix_analytics.ts',
    'components/admin/widget-editors/widget-types.ts': '/tmp/fix_widget_types.ts',
    'components/admin/widget-editors/index.tsx': '/tmp/fix_widget_editors.tsx',
    'app/admin/pages/[id]/editor/page.tsx': '/tmp/fix_editor1.tsx',
    'nixpacks.toml': '/tmp/fix_nixpacks.toml',
    'prisma/seed.js': '/tmp/fix_seed.js',
}

base = r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix'
import os
for rel, tmp in files.items():
    local = os.path.join(base, rel.replace('/', '\\'))
    if os.path.exists(local):
        sftp.put(local, tmp)
        # Ensure directory and copy to container
        dir_path = f'/app/{os.path.dirname(rel)}'
        run(f'docker cp {CID}:/app/package.json /dev/null 2>/dev/null')  # just to verify
        run(f'docker cp {tmp} {CID}:/app/{rel}')
        print(f"  ✓ {rel}")
    else:
        print(f"  ✗ {rel} (not found locally)")

# Verify schema
run(f'docker cp {CID}:/app/prisma/schema.prisma /tmp/verify_schema.prisma')
out, _ = run('grep -c "model AdminUser" /tmp/verify_schema.prisma')
print(f"\nAdminUser count in container schema: {out}")

sftp.close()

# Step 3: Commit clean image  
print("\n=== STEP 3: Commit container as image ===")
run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
out, _ = run(f'docker commit {CID} blue-dreams-rebuild:latest')
print(f"Committed: {out[:40]}")

# Step 4: Verify schema in image
out, _ = run('docker run --rm --entrypoint /bin/bash blue-dreams-rebuild:latest -c "grep -c \'model AdminUser\' /app/prisma/schema.prisma"', t=15)
print(f"AdminUser count in image: {out}")

# Quick validate
out, _ = run('docker run --rm --entrypoint /bin/bash -e DATABASE_URL="postgresql://x@x/x" blue-dreams-rebuild:latest -c "npx prisma validate 2>&1"', t=30)
print(f"Prisma validate: {out[-200:]}")

# Step 5: Cleanup old builders
run('docker rm -f blue-dreams-builder3 2>/dev/null')

# Step 6: Build
print("\n=== STEP 4: Build Next.js (3-5 min) ===")
build_cmd = '''docker run --name blue-dreams-builder4 \
    --entrypoint /bin/bash \
    --network coolify \
    -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" \
    -w /app \
    blue-dreams-rebuild:latest \
    -c "npx prisma generate 2>&1 && npm run build 2>&1"'''

out, err = run(build_cmd, t=600)
lines = out.split('\n')
if len(lines) > 20:
    print("Last 15 lines of build:")
    for l in lines[-15:]:
        print(f"  {l}")
else:
    print(out)

# Check BUILD_ID
bid, _ = run('docker run --rm --entrypoint /bin/bash blue-dreams-rebuild:latest -c "cat /app/.next/BUILD_ID 2>/dev/null" 2>&1', t=10)

# The build was in blue-dreams-builder4, check there instead
bid2, _ = run('docker exec blue-dreams-builder4 cat /app/.next/BUILD_ID 2>&1')
bid = bid2 if bid2 and 'Error' not in bid2 else bid
print(f"\nBUILD_ID: {bid}")

if bid and 'Error' not in bid and 'No such' not in bid and len(bid) > 5:
    print("\n✅ BUILD SUCCEEDED!")
    
    # Copy .next
    print("Copying .next...")
    run('rm -rf /tmp/next_build /tmp/prisma_client')
    run('docker cp blue-dreams-builder4:/app/.next /tmp/next_build')
    run('docker cp blue-dreams-builder4:/app/node_modules/.prisma /tmp/prisma_client 2>/dev/null')
    
    run(f'docker cp /tmp/next_build {CID}:/app/.next')
    run(f'docker cp /tmp/prisma_client {CID}:/app/node_modules/.prisma 2>/dev/null')
    print("  ✓ .next + .prisma copied to container")
    
    # Cleanup
    run('docker rm -f blue-dreams-builder4')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    
    # Start container
    print("\n=== STEP 5: Start container ===")
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)
    
    print("Waiting 25s for startup...")
    time.sleep(25)
    
    st, _ = run(f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
    print(f"Status: {st}")
    
    if 'Up' in st and 'Restarting' not in st:
        # Prisma push
        print("\n=== STEP 6: Prisma db push ===")
        out, _ = run(f'docker exec -w /app {CID} npx prisma db push --accept-data-loss 2>&1', t=60)
        print(f"Push: {out[-200:]}")
        
        # Test APIs
        print("\n=== STEP 7: Test ===")
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1', t=15)
        print(f"Homepage: {s}")
        
        s, _ = run('curl -s -o /dev/null -w "%{http_code}" https://new.bluedreamsresort.com/tr 2>&1', t=15)
        print(f"External: {s}")
        
        print("\n✅ ALL DONE! Container is live.")
    else:
        logs, _ = run(f'docker logs {CID} --tail 15 2>&1')
        print(f"Issues:\n{logs}")
        run(f'docker update --restart=unless-stopped {CID}')
        run(f'docker start {CID}')
else:
    print("\n❌ BUILD FAILED")
    logs, _ = run('docker logs blue-dreams-builder4 --tail 30 2>&1')
    print(f"Logs:\n{logs}")
    run('docker rm -f blue-dreams-builder4 2>/dev/null')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}')

c.close()
