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

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    # Trigger deploy via Coolify API
    print("=== Triggering deployment ===")
    out, err = run(c, 'curl -s -X POST "http://localhost:8000/api/v1/applications/vgk8cscos8os8wwsogkss004/restart?force=true" -H "Authorization: Bearer 2|E5H1n3Ys97aCYpAbWnSA5bJV7APpuKzpEpMmIjwE077a9e55" -H "Accept: application/json"', timeout=30)
    print(f"API Response: {out}")
    if err:
        print(f"Error: {err[:200]}")
    
    # Also try deploy endpoint
    out, err = run(c, 'curl -s -X POST "http://localhost:8000/api/v1/applications/vgk8cscos8os8wwsogkss004/deploy?force=true" -H "Authorization: Bearer 2|E5H1n3Ys97aCYpAbWnSA5bJV7APpuKzpEpMmIjwE077a9e55" -H "Accept: application/json"', timeout=30)
    print(f"Deploy Response: {out}")
    
    # Wait a bit and check deploy status
    time.sleep(5)
    out, _ = run(c, 'curl -s "http://localhost:8000/api/v1/applications/vgk8cscos8os8wwsogkss004" -H "Authorization: Bearer 2|E5H1n3Ys97aCYpAbWnSA5bJV7APpuKzpEpMmIjwE077a9e55" -H "Accept: application/json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get(\'status\'), d.get(\'last_deployment_uuid\'))"')
    print(f"Status: {out}")
    
    c.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
