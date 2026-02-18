import paramiko
import sys
import time
import json

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    # Find the app container
    cmd = 'docker ps --filter "name=vgk8" --format "{{.ID}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    container_id = stdout.read().decode().strip().split('\n')[0]
    print(f"Container: {container_id}")
    
    # Check if DB file exists
    print("\n=== Checking DB file ===")
    cmd = f'docker exec {container_id} ls -la /app/data/ 2>&1'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode().strip())
    
    # Check env vars
    print("\n=== DATABASE_URL ===")
    cmd = f'docker exec {container_id} sh -c "echo \\$DATABASE_URL"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode().strip())
    
    # Use Node.js with Prisma to check DB
    print("\n=== Using Prisma to check DB ===")
    node_script = """
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Count pages
        const pageCount = await prisma.page.count();
        console.log('Page count:', pageCount);
        
        // List pages
        const pages = await prisma.page.findMany({
            select: { id: true, slug: true, locale: true, title: true }
        });
        console.log('Pages:', JSON.stringify(pages, null, 2));
        
        // Count widgets
        const widgetCount = await prisma.widget.count();
        console.log('Widget count:', widgetCount);
        
        // List widgets  
        const widgets = await prisma.widget.findMany({
            select: { id: true, type: true, pageId: true },
            take: 10
        });
        console.log('Widgets:', JSON.stringify(widgets, null, 2));
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
"""
    
    # Write script to container
    import base64
    b64 = base64.b64encode(node_script.encode('utf-8')).decode('utf-8')
    cmd = f'docker exec {container_id} sh -c "echo {b64} | base64 -d > /tmp/check_db.js"'
    c.exec_command(cmd)
    time.sleep(1)
    
    # Run it
    cmd = f'docker exec {container_id} node /tmp/check_db.js'
    stdin, stdout, stderr = c.exec_command(cmd, timeout=15)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    print(f"STDOUT:\n{out}")
    if err:
        print(f"STDERR:\n{err[:500]}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
