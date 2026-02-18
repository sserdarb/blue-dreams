import paramiko
import sys
import base64

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    # We need to find the APP container now, not coolify container.
    # The app container is where the DB URL points to internal DB (or configured) and where prisma client is generated.
    # The new container created in previous step.
    
    # Get latest container with image name matching blue-dreams or similar
    # We know image start with sserdarb/blue-dreams
    
    cmd = 'docker ps --filter "ancestor=sserdarb/blue-dreams:latest" --format "{{.ID}}"'
    # Or just list all and sort
    cmd = 'docker ps --format "table {{.ID}}\t{{.Image}}\t{{.CreatedAt}}" | grep blue'
    
    print("\n=== Finding App Container ===")
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode()
    print(out)
    
    container_id = out.strip().split()[0] if out.strip() else None
    
    if container_id:
        print(f"App Container: {container_id}")
        
        # Read local seed file
        with open(r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\prisma\seed-static-pages.ts', 'r', encoding='utf-8') as f:
            seed_content = f.read()
            
        b64_seed = base64.b64encode(seed_content.encode('utf-8')).decode('utf-8')
        
        # Upload to /app/prisma/seed-static-pages.ts (Next.js app usually in /app or /var/www/html ?)
        # Nixpacks usually uses /app
        
        print("Uploading seed script...")
        cmd = f'docker exec {container_id} sh -c "echo {b64_seed} | base64 -d > /app/prisma/seed-static-pages.ts"'
        # Make sure dir exists?
        # Check layout first
        check_cmd = f'docker exec {container_id} ls -F /app/prisma'
        stdin, stdout, stderr = c.exec_command(check_cmd)
        ls_out = stdout.read().decode()
        
        if 'schema.prisma' not in ls_out:
            print("Prisma dir not found in /app. Trying /var/www/html...")
             # ... Logic to find path if needed ...
        
        c.exec_command(cmd) # Write file
        
        # Run seed
        print("Running Seed...")
        # Need ts-node. usually present if devDependencies installed? 
        # Or use `npx tsx` or `node` if compiled?
        # Let's try npx tsx first
        
        seed_cmd = f'docker exec {container_id} npx tsx /app/prisma/seed-static-pages.ts'
        stdin, stdout, stderr = c.exec_command(seed_cmd)
        
        print("STDOUT:", stdout.read().decode())
        print("STDERR:", stderr.read().decode())
        
    else:
        print("App container not found.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
