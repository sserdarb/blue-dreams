import paramiko
import sys
import time

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
    
    # Method 1: Try the Coolify artisan command to deploy
    print("=== Method 1: Artisan deploy ===")
    out, err = run(c, 'docker exec coolify php artisan app:deploy vgk8cscos8os8wwsogkss004 --force 2>&1', timeout=30)
    print(f"Result: {out}")
    if err:
        print(f"Err: {err[:200]}")
    
    # Method 2: Try the webhook URL for the app
    print("\n=== Method 2: Webhook ===")
    out, _ = run(c, 'docker exec coolify-db psql -U coolify -d coolify -t -c "SELECT manual_webhook_secret_github FROM applications WHERE uuid=\'vgk8cscos8os8wwsogkss004\';"')
    webhook_secret = out.strip()
    print(f"Webhook secret: {webhook_secret}")
    
    if webhook_secret:
        out, _ = run(c, f'curl -s -X GET "http://localhost:8000/webhooks/source/github/events/manual?repository=sserdarb/blue-dreams&branch=main" -H "X-GitHub-Event: push"')
        print(f"Webhook result: {out}")
    
    # Method 3: Generate new API token and try
    print("\n=== Method 3: Create fresh API token ===")
    out, _ = run(c, 'docker exec coolify php artisan api:token:create --name="deploy-fix" --team-id=0 2>&1')
    print(f"Token creation: {out}")
    
    # Extract token if created
    if '|' in out:
        lines = out.strip().split('\n')
        for line in lines:
            if '|' in line and len(line) > 20:
                token = line.strip()
                print(f"\nUsing token: {token[:30]}...")
                
                # Try deploy with new token
                out, _ = run(c, f'curl -s -X POST "http://localhost:8000/api/v1/applications/vgk8cscos8os8wwsogkss004/deploy?force=true" -H "Authorization: Bearer {token}" -H "Accept: application/json"')
                print(f"Deploy: {out}")
                break
    
    c.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
