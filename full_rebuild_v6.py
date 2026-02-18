import paramiko, sys, time, os
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

CID = '3815dea559c9'
sftp = c.open_sftp()

# Container is already stopped from previous scripts
st, _ = run(f'docker ps -a --filter "id={CID}" --format "{{{{.Status}}}}"')
print(f"Container: {st}")

# Step 1: Upload the schema via SFTP to /tmp/schema.prisma (exact filename)
local = r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\prisma\schema.prisma'
sftp.put(local, '/tmp/schema.prisma')

# Verify on server
out, _ = run('grep -c "model AdminUser" /tmp/schema.prisma')
print(f"Server /tmp/schema.prisma AdminUser count: {out}")
out, _ = run('wc -l /tmp/schema.prisma') 
print(f"Line count: {out}")

# Step 2: docker cp with the same filename
print("\n=== Copying to container ===")
# Remove existing file first
run(f'docker cp {CID}:/app/prisma/schema.prisma /tmp/old_schema_backup.prisma 2>/dev/null')
out, _ = run('grep -c "model AdminUser" /tmp/old_schema_backup.prisma 2>/dev/null')
print(f"Old schema AdminUser count: {out}")

# docker cp replaces the file
run(f'docker cp /tmp/schema.prisma {CID}:/app/prisma/schema.prisma')

# Verify the copy by extracting the file again
run(f'docker cp {CID}:/app/prisma/schema.prisma /tmp/schema_verify.prisma')
out, _ = run('grep -c "model AdminUser" /tmp/schema_verify.prisma')
print(f"After copy - AdminUser count: {out}")

if out.strip() == '1':
    print("✅ Schema is correct!")

    # Clean up old images and builders
    run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
    run('docker rm -f blue-dreams-builder4 blue-dreams-builder5 2>/dev/null')

    # Commit
    print("\n=== Committing ===")
    o, _ = run(f'docker commit {CID} blue-dreams-rebuild:latest')
    print(f"Committed: {o[:40]}")

    # Validate schema in committed image
    o, _ = run('docker run --rm --entrypoint /bin/bash blue-dreams-rebuild:latest -c "grep -c \'model AdminUser\' /app/prisma/schema.prisma"', t=15)
    print(f"Image schema AdminUser count: {o}")

    # Build
    print("\n=== Building (3-5 min) ===")
    run('docker rm -f bdb 2>/dev/null')
    o, e = run(
        'docker run --name bdb --entrypoint /bin/bash --network coolify '
        '-e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" '
        '-w /app blue-dreams-rebuild:latest '
        '-c "npx prisma generate 2>&1 && npm run build 2>&1"',
        t=600
    )
    lines = o.split('\n')
    print(f"Build lines: {len(lines)}")
    for l in lines[-12:]:
        print(f"  {l}")

    # Check BUILD_ID
    bid, _ = run('docker exec bdb cat /app/.next/BUILD_ID 2>&1')
    print(f"\nBUILD_ID: {bid}")

    if bid and 'Error' not in bid and len(bid) > 5:
        print("\n✅ BUILD OK!")

        # Copy to original container
        run('rm -rf /tmp/next_build /tmp/prisma_cl')
        run('docker cp bdb:/app/.next /tmp/next_build')
        run('docker cp bdb:/app/node_modules/.prisma /tmp/prisma_cl 2>/dev/null')
        run(f'docker cp /tmp/next_build {CID}:/app/.next')
        run(f'docker cp /tmp/prisma_cl {CID}:/app/node_modules/.prisma 2>/dev/null')
        print("  ✓ Copied")

        run('docker rm -f bdb')
        run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')

        # Start
        print("\n=== Starting ===")
        run(f'docker update --restart=unless-stopped {CID}')
        run(f'docker start {CID}', t=15)
        print("Waiting 25s...")
        time.sleep(25)

        st, _ = run(f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"')
        print(f"Status: {st}")

        if 'Up' in st and 'Restarting' not in st:
            # Prisma push
            o, _ = run(f'docker exec -w /app {CID} npx prisma db push --accept-data-loss 2>&1', t=60)
            print(f"Prisma push: {o[-200:]}")

            # Test
            s, _ = run(f'docker exec {CID} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1', t=15)
            print(f"Homepage: {s}")

            s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
            print(f"External: {s}")

            print("\n✅ ALL DONE!")
        else:
            logs, _ = run(f'docker logs {CID} --tail 15 2>&1')
            print(f"Startup issue:\n{logs}")
    else:
        print(f"\n❌ BUILD FAILED")
        logs, _ = run('docker logs bdb --tail 30 2>&1')
        print(f"Logs: {logs[-400:]}")
        run('docker rm -f bdb 2>/dev/null')
        run('docker rmi blue-dreams-rebuild:latest 2>/dev/null')
        run(f'docker update --restart=unless-stopped {CID}')
        run(f'docker start {CID}')
else:
    print(f"❌ Schema issue persists: count={out}")

sftp.close()
c.close()
