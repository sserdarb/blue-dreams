import paramiko, sys, time
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=60):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip()

cid = run('docker ps -a --filter "name=vgk8" --format "{{.ID}}"').split('\n')[0]
print(f"Container: {cid}")

# First, restore the restart policy
print("1. Restoring restart policy...")
run(f'docker update --restart=unless-stopped {cid}')

# Get the image used by this container to run a build
img = run(f'docker inspect {cid} --format "{{{{.Config.Image}}}}"')
print(f"2. Image: {img}")

# Get all env vars and volumes from the container
envs = run(f'docker inspect {cid} --format "{{{{json .Config.Env}}}}"')
print(f"3. Env vars count: {envs.count(',') + 1}")

# Strategy: commit the container with our source changes, then start it
# First, docker cp the fixed files into the stopped container
print("4. Copying fixed files into stopped container...")
sftp = c.open_sftp()
sftp.put(r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\api\ai\settings\route.ts', '/tmp/settings_route.ts')
sftp.put(r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\admin\ai-training\page.tsx', '/tmp/ai_training.tsx')
sftp.put(r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\api\ai\chat\route.ts', '/tmp/chat_route.ts')
sftp.put(r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\api\analytics\data\route.ts', '/tmp/analytics_route.ts')
sftp.close()

# docker cp works on stopped containers
run(f'docker cp /tmp/settings_route.ts {cid}:/app/app/api/ai/settings/route.ts')
run(f'docker cp /tmp/ai_training.tsx {cid}:/app/app/admin/ai-training/page.tsx')
run(f'docker cp /tmp/chat_route.ts {cid}:/app/app/api/ai/chat/route.ts')
run(f'docker cp /tmp/analytics_route.ts {cid}:/app/app/api/analytics/data/route.ts')
print("   Files copied.")

# Now we need to rebuild. Run the build in a separate container using the same image
# but with a build command instead of start
print("\n5. Running build in a temporary container...")
build_cmd = f"""docker run --rm \
    --volumes-from {cid} \
    --network $(docker inspect {cid} --format '{{{{range .NetworkSettings.Networks}}}}{{{{.NetworkID}}}}{{{{end}}}}' | head -c 12) \
    -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" \
    -w /app \
    {img} \
    sh -c "npx next build" 2>&1"""

out = run(build_cmd, t=600)
last = out[-600:] if len(out) > 600 else out
print(f"   Build result:\n{last}")

# Check if build was written to the container's volume
print("\n6. Starting the main container...")
out = run(f'docker start {cid}', t=15)
print(f"   Start: {out}")
time.sleep(15)

out = run(f'docker ps -a --filter "id={cid}" --format "{{{{.Status}}}}"')
print(f"   Status: {out}")

if 'Up' in out:
    print("\n7. Container is up! Testing...")
    s = run(f'docker exec {cid} curl -s "http://localhost:3000/api/ai/settings?locale=tr" 2>&1', t=15)
    print(f"   Settings: {s[:400]}")
else:
    # Check logs 
    logs = run(f'docker logs {cid} --tail 10 2>&1')
    print(f"   Logs:\n{logs}")

c.close()
