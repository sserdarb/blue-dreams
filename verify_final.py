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

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}} {{.Status}}"')
    cid = out.split()[0].strip()
    print(f"Container: {out}")
    
    # Check if model fix is in the built output
    out, _ = run(c, f'docker exec {cid} grep -c "gemini-2.0-flash" /app/.next/server/chunks/*.js 2>/dev/null | grep -v ":0$" | head -3')
    print(f"\nModel references in built chunks: {out or 'CHECKING...'}")
    
    # Check if the source files have the fix
    out, _ = run(c, f'docker exec {cid} grep "model:" /app/app/api/ai/chat/route.ts')
    print(f"Source model line: {out.strip()}")
    
    out, _ = run(c, f'docker exec {cid} grep "maskApiKey" /app/app/api/ai/settings/route.ts 2>&1 | head -1')
    print(f"Settings has masking: {out.strip() or 'NO'}")
    
    # Test the settings endpoint
    print("\n=== Test settings ===")
    out, _ = run(c, f'docker exec {cid} curl -s "http://localhost:3000/api/ai/settings?locale=tr" 2>&1', timeout=15)
    print(f"Response: {out[:500]}")
    
    # Test chat
    print("\n=== Test chat ===")
    payload = json.dumps({"messages": [{"role": "user", "text": "Merhaba"}], "locale": "tr"})
    out, _ = run(c, f"""docker exec {cid} curl -s -X POST "http://localhost:3000/api/ai/chat" -H "Content-Type: application/json" -d '{payload}' 2>&1""", timeout=30)
    print(f"Chat: {out[:500]}")
    
    # Check latest error log
    print("\n=== Last logs ===")
    out, _ = run(c, f'docker logs {cid} --tail 10 2>&1')
    print(out)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
