import paramiko
import sys
import time
import json
import os
import tempfile

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
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    print(f"Container: {cid}")
    
    # Check container status
    out, _ = run(c, f'docker ps --filter "id={cid}" --format "{{{{.Status}}}}"')
    print(f"Status: {out}")
    
    # Check if maskApiKey exists in the built code  
    out, _ = run(c, f'docker exec {cid} grep -r "maskApiKey" /app/.next/ 2>&1 | head -3')
    print(f"\nmaskApiKey in built code: {out[:300] or 'NOT FOUND'}")
    
    # Check the model name in built code
    out, _ = run(c, f'docker exec {cid} grep -r "gemini-2.0-flash" /app/.next/ 2>&1 | head -3')
    print(f"\nModel in built code: {out[:300] or 'NOT FOUND'}")
    
    # Test settings API
    print("\n=== Testing settings API ===")
    out, _ = run(c, f'docker exec {cid} curl -s "http://localhost:3000/api/ai/settings?locale=tr" 2>&1', timeout=15)
    print(f"Settings: {out[:500]}")
    
    # Check container logs
    print("\n=== Recent logs ===")
    out, _ = run(c, f'docker logs {cid} --tail 15 2>&1')
    print(out)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
