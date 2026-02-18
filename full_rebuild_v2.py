import paramiko, sys, time, json
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

CID = '3815dea559c9'

# First check: is the committed image still there?
out, _ = run('docker images blue-dreams-rebuild --format "{{.ID}}" 2>/dev/null')
print(f"Existing rebuild image: {out}")

# Check container status
status, _ = run(f'docker ps -a --filter "id={CID}" --format "{{{{.Status}}}}"')
print(f"Container status: {status}")

# Get database URL from container env 
envs, _ = run(f'docker inspect {CID} --format "{{{{json .Config.Env}}}}"')
env_list = json.loads(envs) if envs else []
db_url = ''
for e in env_list:
    if e.startswith('DATABASE_URL='):
        db_url = e.split('=', 1)[1]
        break
print(f"DATABASE_URL: {db_url[:40]}..." if db_url else "DATABASE_URL: not found")

# Get the REAL network
nets, _ = run(f'docker inspect {CID} --format "{{{{json .NetworkSettings.Networks}}}}"')
print(f"Networks JSON: {nets[:200]}")
net_data = json.loads(nets) if nets else {}
network = list(net_data.keys())[0] if net_data else 'bridge'
print(f"Using network: {network}")

# If no rebuild image, recommit
if not out:
    print("\nRe-committing container...")
    out, _ = run(f'docker commit {CID} blue-dreams-rebuild:latest')
    print(f"Committed: {out[:30]}")

# Cleanup old builder
run('docker rm -f blue-dreams-builder2 2>/dev/null')

# Build with correct network
print(f"\n=== Building in temp container (network: {network}) ===")
build_cmd = f'docker run --name blue-dreams-builder2 --network {network} -e DATABASE_URL="{db_url}" -w /app blue-dreams-rebuild:latest /bin/bash -c "npx prisma generate && npx next build"'
print(f"Command: {build_cmd[:200]}...")

out, err = run(build_cmd, t=600)
last_400 = out[-400:] if len(out) > 400 else out
print(f"\nBuild output (last 400 chars):\n{last_400}")
if err:
    print(f"\nBuild stderr (last 200 chars):\n{err[-200:]}")

# Check build success
bid, _ = run('docker exec blue-dreams-builder2 cat /app/.next/BUILD_ID 2>&1')
print(f"\nBUILD_ID: {bid}")

if bid and 'Error' not in bid and 'No such' not in bid:
    print("\n✅ BUILD SUCCEEDED!")
    
    # Copy .next from builder to host, then to original container
    print("Copying .next to original container...")
    run('rm -rf /tmp/next_build')
    run('docker cp blue-dreams-builder2:/app/.next /tmp/next_build')
    
    # Also copy prisma client
    run('docker cp blue-dreams-builder2:/app/node_modules/.prisma /tmp/prisma_client 2>/dev/null')
    
    # Copy to original container
    run(f'docker cp /tmp/next_build {CID}:/app/.next')
    run(f'docker cp /tmp/prisma_client {CID}:/app/node_modules/.prisma 2>/dev/null')
    print("  ✓ .next copied")
    
    # Cleanup builder
    run('docker rm -f blue-dreams-builder2')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    
    # Start container
    print("\n=== Starting container ===")
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)
    
    # Wait for Next.js to boot (health check)
    print("Waiting 20s for Next.js to start...")
    time.sleep(20)
    
    status, _ = run(f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
    print(f"Status: {status}")
    
    if 'Up' in status:
        # Run prisma db push to create AdminUser table
        print("\n=== Running prisma db push ===")
        out, _ = run(f'docker exec -w /app {CID} npx prisma db push --accept-data-loss 2>&1', t=60)
        print(f"Prisma push:\n{out[-300:]}")
        
        # Test
        print("\n=== Testing APIs ===")
        s, _ = run(f'docker exec {CID} curl -s "http://localhost:3000/tr" 2>&1 | head -c 200', t=15)
        print(f"Homepage: {s[:150]}")
        
        s, _ = run(f'docker exec {CID} curl -s "http://localhost:3000/tr/admin/login" 2>&1 | head -c 200', t=15)
        print(f"Login page: {s[:150]}")
        
        # Test external URL
        s, _ = run('curl -s -o /dev/null -w "%{http_code}" https://new.bluedreamsresort.com/tr 2>&1', t=15)
        print(f"External status: {s}")
        
        print("\n✅ ALL DONE!")
    else:
        logs, _ = run(f'docker logs {CID} --tail 15 2>&1')
        print(f"Container issues:\n{logs}")
else:
    print(f"\n❌ BUILD FAILED")
    # Show more error details
    logs, _ = run('docker logs blue-dreams-builder2 --tail 30 2>&1')
    print(f"Full builder logs:\n{logs}")
    
    # Cleanup
    run('docker rm -f blue-dreams-builder2 2>/dev/null')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}')

c.close()
