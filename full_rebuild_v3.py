import paramiko, sys, time, json
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

CID = '3815dea559c9'

# Clean up
run('docker rm -f blue-dreams-builder3 2>/dev/null')

# Key fix: override entrypoint to /bin/bash so our commands work
print("=== Quick test with --entrypoint override ===")
out, _ = run('docker run --rm --entrypoint /bin/bash blue-dreams-rebuild:latest -c "cat /app/package.json | head -5" 2>&1', t=15)
print(f"package.json: {out[:200]}")

out, _ = run('docker run --rm --entrypoint /bin/bash blue-dreams-rebuild:latest -c "head -5 /app/prisma/schema.prisma" 2>&1', t=15)
print(f"schema.prisma: {out[:200]}")

out, _ = run('docker run --rm --entrypoint /bin/bash blue-dreams-rebuild:latest -c "grep AdminUser /app/prisma/schema.prisma" 2>&1', t=15)
print(f"AdminUser in schema: {out[:200]}")

print("\n=== Running full build with --entrypoint override ===")
build_cmd = '''docker run --name blue-dreams-builder3 \
    --entrypoint /bin/bash \
    --network coolify \
    -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" \
    -w /app \
    blue-dreams-rebuild:latest \
    -c "npx prisma generate 2>&1 && npm run build 2>&1"'''

print("Building... (3-5 min)")
out, err = run(build_cmd, t=600)
total = out + "\n" + err
lines = total.split('\n')
if len(lines) > 30:
    print("First 10 lines:")
    for l in lines[:10]:
        print(f"  {l}")
    print(f"\n  ... ({len(lines)} total lines) ...\n")
    print("Last 15 lines:")
    for l in lines[-15:]:
        print(f"  {l}")
else:
    print(total)

# Check BUILD_ID
bid, _ = run('docker exec blue-dreams-builder3 cat /app/.next/BUILD_ID 2>&1')
if bid and 'Error' not in bid and 'No such' not in bid:
    print(f"\n✅ BUILD SUCCEEDED! BUILD_ID: {bid}")
    
    # Copy .next from builder to original container
    print("\nCopying .next to original container...")
    run('rm -rf /tmp/next_build')
    run('docker cp blue-dreams-builder3:/app/.next /tmp/next_build')
    
    # Also copy prisma client
    run('docker cp blue-dreams-builder3:/app/node_modules/.prisma /tmp/prisma_client 2>/dev/null')
    
    # Copy to original  
    run(f'docker cp /tmp/next_build {CID}:/app/.next')
    run(f'docker cp /tmp/prisma_client {CID}:/app/node_modules/.prisma 2>/dev/null')
    print("  ✓ .next copied")
    
    # Cleanup builder
    run('docker rm -f blue-dreams-builder3')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    
    # Start container
    print("\n=== Starting container ===")
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}', t=15)
    
    print("Waiting 20s for Next.js to start...")
    time.sleep(20)
    
    status, _ = run(f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
    print(f"Status: {status}")
    
    if 'Up' in status and 'Restarting' not in status:
        # Run prisma db push
        print("\n=== Running prisma db push ===")
        out, _ = run(f'docker exec -w /app {CID} npx prisma db push --accept-data-loss 2>&1', t=60)
        print(f"Prisma push: {out[-200:]}")
        
        # Test
        print("\n=== Testing ===")
        s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1', t=15)
        print(f"Homepage: {s}")
        
        s, _ = run('curl -s -o /dev/null -w "%{http_code}" https://new.bluedreamsresort.com/tr 2>&1', t=15)
        print(f"External: {s}")
        
        print("\n✅ ALL DONE!")
    else:
        logs, _ = run(f'docker logs {CID} --tail 15 2>&1')
        print(f"Container issues:\n{logs}")
else:
    print(f"\n❌ BUILD FAILED, BUILD_ID: {bid}")
    logs, _ = run('docker logs blue-dreams-builder3 --tail 30 2>&1')
    print(f"Builder logs:\n{logs}")
    run('docker rm -f blue-dreams-builder3 2>/dev/null')
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    run(f'docker update --restart=unless-stopped {CID}')
    run(f'docker start {CID}')

c.close()
