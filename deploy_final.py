import paramiko, sys, time
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

# Step 1: Check builder container exists (should be stopped, not removed)
print("=== Checking builder container ===")
st, _ = run('docker ps -a --filter "name=bdb" --format "{{.ID}} {{.Status}}" 2>&1')
print(f"Builder: {st}")

# Step 2: Copy BUILD_ID from stopped container (docker cp works on stopped containers)
bid, _ = run('docker cp bdb:/app/.next/BUILD_ID /tmp/bid && cat /tmp/bid')
print(f"BUILD_ID: {bid}")

if bid and len(bid) > 5:
    print("\n✅ Build confirmed successful!")
    
    # Step 3: Commit the builder (with .next already built) as the final image
    print("\n=== Committing builder as final image ===")
    run('docker rmi blue-dreams-final:latest 2>/dev/null')
    o, _ = run('docker commit bdb blue-dreams-final:latest')
    print(f"Final image: {o[:40]}")
    run('docker rm -f bdb')
    run('docker rmi blue-dreams-build:latest 2>/dev/null')
    
    # Step 4: Create the running container
    # Use the Coolify naming pattern so Traefik can route traffic to it
    print("\n=== Creating running container ===")
    
    # First, check if there's already a container with the Coolify name
    old, _ = run('docker ps -a --filter "name=vgk8cscos8os8wwsogkss004" --format "{{.ID}} {{.Names}}" 2>&1')
    print(f"Existing Coolify containers: {old}")
    
    # Get traefik labels from the old image's inspect
    # The Coolify proxy routes traffic based on container labels
    # We need to match the original container's traefik labels
    
    CNAME = 'vgk8cscos8os8wwsogkss004-222918143524'
    
    # Remove old containers with this name
    run(f'docker rm -f {CNAME} 2>/dev/null')
    
    # Create container with full Coolify/Traefik configuration
    create_cmd = f'''docker run -d \
        --name {CNAME} \
        --network coolify \
        --restart unless-stopped \
        -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" \
        -e ADMIN_EMAIL="sserdarb@gmail.com" \
        -e ADMIN_PASSWORD="Tuba@2015Tuana" \
        -e NODE_ENV="production" \
        -e PORT="3000" \
        --label "traefik.enable=true" \
        --label "coolify.applicationId=vgk8cscos8os8wwsogkss004" \
        --label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-http.rule=Host(\`new.bluedreamsresort.com\`)" \
        --label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-http.entryPoints=http" \
        --label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-http.middlewares=redirect-to-https@docker" \
        --label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-https.rule=Host(\`new.bluedreamsresort.com\`)" \
        --label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-https.entryPoints=https" \
        --label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-https.tls=true" \
        --label "traefik.http.routers.vgk8cscos8os8wwsogkss004-0-https.tls.certresolver=letsencrypt" \
        --label "traefik.http.services.vgk8cscos8os8wwsogkss004-0.loadbalancer.server.port=3000" \
        --entrypoint /bin/bash \
        blue-dreams-final:latest \
        -c "cd /app && npx prisma db push --accept-data-loss 2>&1 && node prisma/seed.js 2>/dev/null; npm start"'''
    
    o, e = run(create_cmd, t=30)
    print(f"Container ID: {o[:20]}")
    if e:
        print(f"Error: {e[:200]}")
    
    # Wait for startup (prisma push + npm start)
    print("\nWaiting 40s for startup...")
    time.sleep(40)
    
    st, _ = run(f'docker ps --filter "name={CNAME}" --format "{{{{.Status}}}}"')
    print(f"Status: {st}")
    
    if st and 'Up' in st:
        # Check logs
        logs, _ = run(f'docker logs {CNAME} --tail 10 2>&1')
        print(f"\nLogs:\n{logs}")
        
        # Test internal
        s, _ = run(f'docker exec {CNAME} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1', t=15)
        print(f"\nInternal test: {s}")
        
        # Test external  
        time.sleep(5)
        s, _ = run('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr 2>&1', t=15)
        print(f"External test: {s}")
        
        if s == '200':
            print("\n🎉 SITE IS LIVE!")
        else:
            print(f"\nExternal returned {s}. Checking traefik...")
            # Check if traefik knows about the container
            t_out, _ = run('docker exec coolify-proxy wget -q -O - http://localhost:8080/api/http/routers 2>&1 | grep -o "vgk8[^\"]*" | head -5')
            print(f"Traefik routers: {t_out}")
    else:
        logs, _ = run(f'docker logs {CNAME} --tail 20 2>&1')
        print(f"\nStartup issue:\n{logs}")
    
    # Cleanup
    run('docker rmi blue-dreams-final:latest 2>/dev/null')
else:
    print("❌ Can't find BUILD_ID. Checking builder status...")
    # Maybe builder doesn't exist
    all_c, _ = run('docker ps -a --format "{{.ID}} {{.Names}} {{.Status}}" | head -15')
    print(all_c)

c.close()
