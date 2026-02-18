import paramiko
import sys
import time
import json

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def run(c, cmd, timeout=30):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

results = []

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    results.append(f"App Container: {cid}")
    
    # Try using Prisma inside the container to query a page like the app would
    node_check = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Check if Page and Widget tables exist
        const pageCount = await prisma.page.count();
        console.log('PAGE_COUNT:', pageCount);
        
        // Get home TR page with widgets
        const page = await prisma.page.findFirst({
            where: { slug: 'home', locale: 'tr' },
            include: { widgets: { orderBy: { order: 'asc' } } }
        });
        
        if (page) {
            console.log('PAGE_FOUND:', page.id);
            console.log('PAGE_TITLE:', page.title);
            console.log('WIDGET_COUNT:', page.widgets.length);
            
            // Check widget data type
            if (page.widgets.length > 0) {
                const w = page.widgets[0];
                console.log('WIDGET_0_TYPE:', w.type);
                console.log('WIDGET_0_DATA_TYPEOF:', typeof w.data);
                console.log('WIDGET_0_DATA_PREVIEW:', String(w.data).substring(0, 200));
                
                // Try to JSON parse the data (like WidgetEditor does)
                try {
                    const parsed = JSON.parse(w.data);
                    console.log('JSON_PARSE_OK:', typeof parsed);
                } catch (e) {
                    console.log('JSON_PARSE_ERROR:', e.message);
                }
            }
        } else {
            console.log('PAGE_NOT_FOUND');
            
            // List all pages
            const allPages = await prisma.page.findMany({ select: { id: true, slug: true, locale: true } });
            console.log('ALL_PAGES:', JSON.stringify(allPages));
        }
        
        // Also try getPageById style query
        const pages = await prisma.page.findMany({
            where: { locale: 'tr' },
            select: { id: true, slug: true, title: true },
            take: 5
        });
        console.log('TR_PAGES:', JSON.stringify(pages));
        
    } catch(e) {
        console.log('QUERY_ERROR:', e.message);
        console.log('ERROR_CODE:', e.code);
    } finally {
        await prisma.$disconnect();
    }
}
main();
"""
    
    import base64
    b64 = base64.b64encode(node_check.encode('utf-8')).decode('utf-8')
    run(c, f'docker exec {cid} sh -c "echo {b64} | base64 -d > /tmp/check_query.js"')
    time.sleep(0.5)
    
    out, err = run(c, f'docker exec -w /app {cid} node /tmp/check_query.js 2>&1', timeout=15)
    results.append(f"\n=== Prisma Query Test ===")
    results.append(out)
    if err:
        results.append(f"STDERR: {err[:500]}")
    
    # Also get container error logs from recent requests
    results.append(f"\n=== Container logs (last 50 lines) ===")
    out, _ = run(c, f'docker logs {cid} --tail 50 2>&1')
    results.append(out)
    
    c.close()
    
    result = '\n'.join(results)
    with open('query_test_output.txt', 'w', encoding='utf-8') as f:
        f.write(result)
    print(result[:3000])
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
