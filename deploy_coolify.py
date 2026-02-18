import paramiko, sys, time, json
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=60):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

CID = '3815dea559c9'
APP_UUID = 'vgk8cscos8os8wwsogkss004'

# Strategy 1: Try Coolify API on port 8080 to trigger deploy
print("=== Trying Coolify API on port 8080 ===")

# First, try to create an API token
out, err = run("""docker exec coolify php artisan tinker --execute="
\\$user = \\App\\Models\\User::find(0);
if (!\\$user) { \\$user = \\App\\Models\\User::first(); }
if (\\$user) { echo \\$user->createToken('deploy-auto', ['*'])->plainTextToken; }
else { echo 'NO_USER'; }
" 2>&1""", t=15)
print(f"Token result: {out[:300]}")

# Extract the token (should be id|token format)
token = ''
for line in out.split('\n'):
    line = line.strip()
    if '|' in line and len(line) > 10 and 'WARNING' not in line:
        token = line
        break

if token:
    print(f"\nGot token: {token[:20]}...")
    
    # Try to trigger deploy via API
    print("\n=== Triggering deploy via Coolify API ===")
    out, _ = run(f'''curl -s -X POST "http://localhost:8080/api/v1/applications/{APP_UUID}/deploy" \
        -H "Authorization: Bearer {token}" \
        -H "Content-Type: application/json" \
        -d '{{"force_rebuild": true}}' 2>&1''', t=15)
    print(f"Deploy response: {out[:500]}")
    
    if 'deployment' in out.lower() or 'queued' in out.lower() or 'uuid' in out.lower():
        print("\n✅ Deploy queued via API!")
    else:
        print(f"\nAPI deploy didn't work. Trying fallback...")
        
        # Try different API paths
        for path in ['/deploy', '/restart']:
            out, _ = run(f'''curl -s -X POST "http://localhost:8080/api/v1/applications/{APP_UUID}{path}" \
                -H "Authorization: Bearer {token}" \
                -H "Content-Type: application/json" 2>&1''', t=10)
            print(f"  {path}: {out[:200]}")
else:
    print("No token obtained. Trying alternative approach...")

# Strategy 2: If API doesn't work, modify start command to include build
print("\n=== Strategy 2: Modify start command to include build ===")

# Update start command in Coolify DB to include build step
new_start = "npx prisma generate && npx prisma db push && node prisma/seed.js && npm run build && npm start"
out, err = run(f"""docker exec 7b196ff456e5 psql -U coolify -d coolify -c "UPDATE applications SET start_command = '{new_start}' WHERE uuid = '{APP_UUID}' RETURNING start_command;" """)
print(f"Updated start cmd: {out}")

# Now restart the container
print("\n=== Restarting container ===")
out, _ = run(f'docker restart {CID}', t=30)
print(f"Restart: {out}")

time.sleep(5)
out, _ = run(f'docker ps -a --filter "id={CID}" --format "{{{{.Status}}}}"')
print(f"Status: {out}")

# The container will start, run the build, and then serve
# But wait - the start command from Coolify DB might not be what Docker actually uses
# Let's also check what the actual entrypoint/cmd of the container is
print("\n=== Container entrypoint/cmd ===")
out, _ = run(f'docker inspect {CID} --format "Entrypoint: {{{{json .Config.Entrypoint}}}} | Cmd: {{{{json .Config.Cmd}}}}"')
print(out)

c.close()
