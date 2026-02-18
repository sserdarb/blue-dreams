import paramiko, sys, time, base64, os
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

CID = '3815dea559c9'

# Make sure container is stopped
run(f'docker update --restart=no {CID}')
run(f'docker stop {CID} 2>/dev/null', t=10)
time.sleep(2)

# Read the local schema.prisma
local_schema = r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\prisma\schema.prisma'
with open(local_schema, 'rb') as f:
    schema_bytes = f.read()

# Encode as base64 to safely transfer
b64_schema = base64.b64encode(schema_bytes).decode('ascii')
print(f"Schema size: {len(schema_bytes)} bytes, base64 length: {len(b64_schema)}")

# Step 1: Write schema directly to server filesystem via base64
print("\n=== Writing schema to server ===")
# Use heredoc approach to avoid shell quoting issues
run(f'echo "{b64_schema}" | base64 -d > /tmp/clean_schema.prisma')

# Verify it was written correctly
out, _ = run('grep -c "model AdminUser" /tmp/clean_schema.prisma')
print(f"AdminUser count on server: {out}")
out, _ = run('wc -l /tmp/clean_schema.prisma')
print(f"Line count: {out}")

if out.strip().split()[0] == '0':
    print("Write failed, trying SFTP instead...")
    sftp = c.open_sftp()
    sftp.put(local_schema, '/tmp/clean_schema.prisma')
    sftp.close()
    out, _ = run('grep -c "model AdminUser" /tmp/clean_schema.prisma')
    print(f"AdminUser count after SFTP: {out}")
    out, _ = run('wc -l /tmp/clean_schema.prisma')
    print(f"Line count: {out}")

# Step 2: docker cp to container (overwrite existing file)
# First remove the existing file from container
print("\n=== Replacing schema in container ===")
# Use docker cp with the right filename
run('cp /tmp/clean_schema.prisma /tmp/schema.prisma')
run(f'docker cp /tmp/schema.prisma {CID}:/app/prisma/schema.prisma')

# Verify inside container
verify, _ = run(f'docker cp {CID}:/app/prisma/schema.prisma /tmp/verify_schema.prisma && grep -c "model AdminUser" /tmp/verify_schema.prisma')
print(f"Verification - AdminUser count in container: {verify}")

if verify.strip() == '1':
    print("✅ Schema is clean!")
    
    # Clean old images
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    run('docker rm -f blue-dreams-builder4 2>/dev/null')
    
    # Recommit with clean schema
    print("\n=== Committing clean image ===")
    out, _ = run(f'docker commit {CID} blue-dreams-rebuild:latest')
    print(f"Committed: {out[:40]}")
    
    # Build
    print("\n=== Building... (3-5 min) ===")
    run('docker rm -f blue-dreams-builder5 2>/dev/null')
    build_cmd = '''docker run --name blue-dreams-builder5 \
        --entrypoint /bin/bash \
        --network coolify \
        -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" \
        -w /app \
        blue-dreams-rebuild:latest \
        -c "npx prisma generate 2>&1 && npm run build 2>&1"'''
    
    out, err = run(build_cmd, t=600)
    lines = out.split('\n')
    if len(lines) > 15:
        print("Last 12 lines:")
        for l in lines[-12:]:
            print(f"  {l}")
    else:
        print(out)
    
    # Check BUILD_ID
    bid, _ = run('docker exec blue-dreams-builder5 cat /app/.next/BUILD_ID 2>&1')
    print(f"\nBUILD_ID: {bid}")
    
    if bid and 'Error' not in bid and 'No such' not in bid and len(bid) > 5:
        print("\n✅ BUILD SUCCEEDED!")
        
        # Copy .next and .prisma back to original
        run('rm -rf /tmp/next_build /tmp/prisma_client')
        run('docker cp blue-dreams-builder5:/app/.next /tmp/next_build')
        run('docker cp blue-dreams-builder5:/app/node_modules/.prisma /tmp/prisma_client 2>/dev/null')
        
        run(f'docker cp /tmp/next_build {CID}:/app/.next')
        run(f'docker cp /tmp/prisma_client {CID}:/app/node_modules/.prisma 2>/dev/null')
        print("  ✓ Build copied to container")
        
        # Cleanup
        run('docker rm -f blue-dreams-builder5')
        run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
        
        # Start
        print("\n=== Starting container ===")
        run(f'docker update --restart=unless-stopped {CID}')
        run(f'docker start {CID}', t=15)
        
        print("Waiting 25s...")
        time.sleep(25)
        
        st, _ = run(f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
        print(f"Status: {st}")
        
        if 'Up' in st and 'Restarting' not in st:
            # Prisma push (create AdminUser table)
            print("\n=== Prisma db push ===")
            out, _ = run(f'docker exec -w /app {CID} npx prisma db push --accept-data-loss 2>&1', t=60)
            print(f"Push: {out[-200:]}")
            
            # Test
            print("\n=== Testing ===")
            s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1', t=15)
            print(f"Homepage: {s}")
            
            s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
            print(f"External: {s}")
            
            print("\n✅ ALL DONE!")
        else:
            logs, _ = run(f'docker logs {CID} --tail 15 2>&1')
            print(f"Issues:\n{logs}")
    else:
        print("\n❌ BUILD FAILED")
        logs, _ = run('docker logs blue-dreams-builder5 --tail 30 2>&1')
        print(f"Logs:\n{logs[-400:]}")
        run('docker rm -f blue-dreams-builder5 2>/dev/null')
        run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
        run(f'docker update --restart=unless-stopped {CID}')
        run(f'docker start {CID}')
else:
    print(f"❌ Schema still has duplicates: {verify}")
    # The docker cp isn't working. Let me try to fix it by using docker exec on a started container
    print("Trying alternative: start container briefly to fix the schema...")
    run(f'docker start {CID}', t=10)
    time.sleep(3)
    # Send the base64 content directly via docker exec
    run(f'echo "{b64_schema}" | docker exec -i {CID} bash -c "base64 -d > /app/prisma/schema.prisma"')
    verify2, _ = run(f'docker exec {CID} grep -c "model AdminUser" /app/prisma/schema.prisma')
    print(f"After exec fix: AdminUser count = {verify2}")
    run(f'docker stop {CID}', t=10)

c.close()
