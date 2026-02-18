import paramiko, sys, time, json
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

CID = '3815dea559c9'

print("=== STEP 1: Stop container and set restart=no ===")
run(f'docker update --restart=no {CID}')
run(f'docker stop {CID}', t=30)
time.sleep(2)
out, _ = run(f'docker ps -a --filter "id={CID}" --format "{{{{.Status}}}}"')
print(f"Status: {out}")

print("\n=== STEP 2: Copy latest source files into stopped container ===")
sftp = c.open_sftp()
files = [
    (r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\api\ai\chat\route.ts', '/tmp/chat_route.ts', '/app/app/api/ai/chat/route.ts'),
    (r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\api\ai\settings\route.ts', '/tmp/settings_route.ts', '/app/app/api/ai/settings/route.ts'),
    (r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\admin\ai-training\page.tsx', '/tmp/ai_training.tsx', '/app/app/admin/ai-training/page.tsx'),
    (r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\api\admin\users\route.ts', '/tmp/admin_users_route.ts', '/app/app/api/admin/users/route.ts'),
    (r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\admin\users\page.tsx', '/tmp/admin_users_page.tsx', '/app/app/admin/users/page.tsx'),
    (r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\admin\login\page.tsx', '/tmp/login_page.tsx', '/app/app/admin/login/page.tsx'),
    (r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\admin\layout.tsx', '/tmp/admin_layout.tsx', '/app/app/admin/layout.tsx'),
    (r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\actions\auth.ts', '/tmp/auth.ts', '/app/app/actions/auth.ts'),
    (r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\prisma\schema.prisma', '/tmp/schema.prisma', '/app/prisma/schema.prisma'),
    (r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\api\analytics\data\route.ts', '/tmp/analytics_route.ts', '/app/app/api/analytics/data/route.ts'),
]

for local, remote_tmp, container_path in files:
    sftp.put(local, remote_tmp)
    # Ensure target directory exists
    dir_path = '/'.join(container_path.rsplit('/', 1)[:-1])
    run(f'docker exec {CID} mkdir -p {dir_path} 2>/dev/null || true')
    run(f'docker cp {remote_tmp} {CID}:{container_path}')
    print(f"  ✓ {container_path.split('/')[-1]}")
sftp.close()

print("\n=== STEP 3: Commit container as new image ===")
out, _ = run(f'docker commit {CID} blue-dreams-rebuild:latest')
print(f"Committed: {out[:30]}")

print("\n=== STEP 4: Get env vars and network from original ===")
# Get network
net, _ = run(f'docker inspect {CID} --format "{{{{range $k, $v := .NetworkSettings.Networks}}}}{{{{$k}}}}{{{{end}}}}"')
print(f"Network: {net}")

# Get env vars
envs_json, _ = run(f'docker inspect {CID} --format "{{{{json .Config.Env}}}}"')
env_list = json.loads(envs_json) if envs_json else []
# Filter to just the ones we need
env_flags = ' '.join([f'-e "{e}"' for e in env_list if not e.startswith('PATH=') and not e.startswith('HOME=')])
print(f"Env vars: {len(env_list)} total")

print("\n=== STEP 5: Run build in temp container ===")
# Run a temp container from the committed image, on the same network, with the build command
build_cmd = f'''docker run --rm --name blue-dreams-builder \
    --network {net} \
    -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" \
    -w /app \
    blue-dreams-rebuild:latest \
    /bin/bash -c "npx prisma generate && npx next build" 2>&1'''

print(f"Building... (this takes 3-5 min)")
out, err = run(build_cmd, t=600)
last_400 = out[-400:] if len(out) > 400 else out
print(f"Build result:\n{last_400}")

# Check if build succeeded
if 'Error' in last_400 and 'linting' not in last_400.lower():
    print(f"\n⚠️ Build may have errors. Full stderr: {err[-200:]}")

print("\n=== STEP 6: Copy .next from builder to original ===")
# The temp container was --rm so it's gone. We need to build within a non-rm container
# Let me re-run without --rm
print("Re-running builder (non-rm) to copy .next...")
build_cmd2 = f'''docker run --name blue-dreams-builder2 \
    --network {net} \
    -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" \
    -w /app \
    blue-dreams-rebuild:latest \
    /bin/bash -c "npx prisma generate && npx next build" 2>&1'''

# Remove if exists
run('docker rm -f blue-dreams-builder2 2>/dev/null')
out, _ = run(build_cmd2, t=600)
last_300 = out[-300:] if len(out) > 300 else out
print(f"Build:\n{last_300}")

# Check for BUILD_ID in the builder
bid, _ = run('docker exec blue-dreams-builder2 cat /app/.next/BUILD_ID 2>&1')
if bid and 'Error' not in bid and 'No such' not in bid:
    print(f"\n✅ BUILD_ID: {bid}")
    
    # Copy .next from builder to host, then to original container
    print("\nCopying .next...")
    run('rm -rf /tmp/next_build && mkdir -p /tmp/next_build')
    run('docker cp blue-dreams-builder2:/app/.next /tmp/next_build/.next')
    
    # Also copy generated prisma client
    run('docker cp blue-dreams-builder2:/app/node_modules/.prisma /tmp/next_build/.prisma 2>/dev/null')
    
    # Copy into original container
    run(f'docker cp /tmp/next_build/.next {CID}:/app/.next')
    run(f'docker cp /tmp/next_build/.prisma {CID}:/app/node_modules/.prisma 2>/dev/null')
    
    print("  ✓ .next copied to original container")
    
    # Cleanup builder
    run('docker rm -f blue-dreams-builder2')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    
    # STEP 7: Start the original container
    print("\n=== STEP 7: Start original container ===")
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)
    time.sleep(15)
    
    out, _ = run(f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
    print(f"Status: {out}")
    
    if 'Up' in out and 'Restarting' not in out:
        print("\n=== STEP 8: Test APIs ===")
        # Settings
        s, _ = run(f'docker exec {CID} curl -s "http://localhost:3000/api/ai/settings?locale=tr" 2>&1', t=15)
        print(f"Settings: {s[:300]}")
        
        # Users
        u, _ = run(f'docker exec {CID} curl -s "http://localhost:3000/api/admin/users" 2>&1', t=15)
        print(f"Users API: {u[:200]}")
        
        # Prisma push (create AdminUser table)
        print("\nRunning prisma db push...")
        out, _ = run(f'docker exec -w /app -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" {CID} npx prisma db push --accept-data-loss 2>&1', t=60)
        print(f"Prisma push: {out[-200:]}")
        
        print("\n✅ DONE!")
    else:
        logs, _ = run(f'docker logs {CID} --tail 10 2>&1')
        print(f"Container still not up. Logs:\n{logs}")
else:
    print(f"\n❌ BUILD FAILED - no BUILD_ID")
    # Cleanup
    run('docker rm -f blue-dreams-builder2 2>/dev/null')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    # Restore restart policy so container can at least try
    run(f'docker update --restart=unless-stopped {CID}')

c.close()
