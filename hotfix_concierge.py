import paramiko
import sys
import time
import json

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def run(c, cmd, timeout=60):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

def upload_file(sftp_or_ssh, local_path, remote_path, cid):
    """Read local file and write to container via docker exec"""
    with open(local_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Escape for shell
    content_escaped = content.replace("'", "'\\''")
    run(sftp_or_ssh, f"docker exec {cid} sh -c 'cat > {remote_path}' <<'HEREDOC_END'\n{content_escaped}\nHEREDOC_END")

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    print(f"Container: {cid}")
    
    # 1. Fix Gemini model name (simple sed)
    print("\n1. Fixing model name...")
    run(c, f"""docker exec {cid} sed -i "s/gemini-2.0-flash-exp/gemini-2.0-flash/g" /app/app/api/ai/chat/route.ts""")
    
    # 2. Upload the updated settings route
    print("2. Uploading settings route...")
    with open(r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\api\ai\settings\route.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Write via heredoc
    run(c, f"""docker exec {cid} bash -c 'cat > /app/app/api/ai/settings/route.ts << '"'"'ENDOFFILE'"'"'
{content}
ENDOFFILE'""")
    
    out, _ = run(c, f'docker exec {cid} grep "maskApiKey" /app/app/api/ai/settings/route.ts | head -1')
    print(f"   Verify: {out.strip()}")
    
    # 3. Upload the updated AI training page
    print("3. Uploading AI training page...")
    with open(r'c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix\app\admin\ai-training\page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    run(c, f"""docker exec {cid} bash -c 'cat > /app/app/admin/ai-training/page.tsx << '"'"'ENDOFFILE'"'"'
{content}
ENDOFFILE'""")
    
    out, _ = run(c, f'docker exec {cid} grep "apiKeyMasked" /app/app/admin/ai-training/page.tsx | head -1')
    print(f"   Verify: {out.strip()}")
    
    # 4. Fix analytics SQL (already done but verify)
    print("4. Fixing analytics SQL...")
    run(c, f"""docker exec {cid} sed -i 's/SELECT DATE(createdAt)/SELECT "createdAt"::date/g' /app/app/api/analytics/data/route.ts""")
    run(c, f"""docker exec {cid} sed -i 's/FROM PageView/FROM "PageView"/g' /app/app/api/analytics/data/route.ts""")
    run(c, f"""docker exec {cid} sed -i "s/WHERE createdAt >= ?/WHERE \\"createdAt\\" >= \\$1/g" /app/app/api/analytics/data/route.ts""")
    run(c, f"""docker exec {cid} sed -i 's/GROUP BY DATE(createdAt)/GROUP BY "createdAt"::date/g' /app/app/api/analytics/data/route.ts""")
    
    # 5. Rebuild
    print("\n5. Building Next.js (this takes ~3min)...")
    out, _ = run(c, f'docker exec -w /app -e DATABASE_URL="postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2" {cid} npm run build 2>&1', timeout=300)
    last_line = out.split('\n')[-1].strip()
    print(f"   Build finished: {last_line}")
    
    if 'error' in out[-500:].lower() and 'linting' not in out[-500:].lower():
        print(f"   WARNING: {out[-300:]}")
    
    # 6. Restart
    print("\n6. Restarting...")
    run(c, f'docker exec {cid} pkill -f "next start" 2>&1')
    time.sleep(10)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}} {{.Status}}"')
    print(f"   Container: {out}")
    
    time.sleep(5)
    
    # 7. Test settings API
    print("\n7. Testing /api/ai/settings...")
    out, _ = run(c, f'docker exec {cid} curl -s "http://localhost:3000/api/ai/settings?locale=tr" 2>&1')
    print(f"   Settings: {out[:300]}")
    
    print("\n✅ Done!")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
