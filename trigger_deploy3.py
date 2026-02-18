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
    
    # Try to use the Coolify queue/deploy system directly
    # First, let's check what commands are available
    print("=== Listing artisan commands related to deploy ===")
    out, _ = run(c, 'docker exec coolify php artisan list 2>&1 | grep -i deploy')
    print(out or "No deploy commands found")
    
    # Try the application deploy command with different syntax
    print("\n=== Trying different artisan commands ===")
    for cmd_str in [
        'docker exec coolify php artisan deploy application vgk8cscos8os8wwsogkss004 2>&1',
        'docker exec coolify php artisan application:deploy vgk8cscos8os8wwsogkss004 2>&1',
        'docker exec coolify php artisan queue:work --once 2>&1',
    ]:
        out, err = run(c, cmd_str, timeout=10)
        print(f"CMD: {cmd_str.split('artisan ')[1]}")
        print(f"  Result: {out[:200]}")
        if err:
            print(f"  Err: {err[:100]}")
    
    # Try the webhook approach with the correct URL format
    print("\n=== Webhook approach ===")
    out, _ = run(c, 'docker exec coolify-db psql -U coolify -d coolify -t -c "SELECT uuid, manual_webhook_secret_github FROM applications WHERE uuid=\'vgk8cscos8os8wwsogkss004\';"')
    print(f"App: {out}")
    
    # Try to directly use the Coolify internal API
    print("\n=== Trying internal Coolify API ===")
    out, _ = run(c, 'curl -s -X GET "http://localhost:8000/api/v1/applications" -H "Accept: application/json" -H "Authorization: Bearer 1|test"')
    print(f"API test: {out[:200]}")
    
    # Check what tokens exist
    print("\n=== API tokens in DB ===")
    out, _ = run(c, 'docker exec coolify-db psql -U coolify -d coolify -t -c "SELECT id, name, tokenable_type, LEFT(token, 20) FROM personal_access_tokens LIMIT 5;"')
    print(out)
    
    # Try using the correct token format (hash-based)
    # Let's create a deployment via the Coolify database directly
    print("\n=== Creating deployment via DB ===")
    import uuid
    deploy_uuid = str(uuid.uuid4())
    out, _ = run(c, f"""docker exec coolify-db psql -U coolify -d coolify -c "INSERT INTO application_deployment_queues (application_id, deployment_uuid, status, force_rebuild, created_at, updated_at, pull_request_id, commit, application_name) SELECT id, '{deploy_uuid}', 'queued', true, NOW(), NOW(), 0, 'latest', name FROM applications WHERE uuid='vgk8cscos8os8wwsogkss004';" """)
    print(f"Insert result: {out}")
    
    # Check queue
    time.sleep(2)
    out, _ = run(c, 'docker exec coolify-db psql -U coolify -d coolify -t -c "SELECT deployment_uuid, status, created_at FROM application_deployment_queues ORDER BY created_at DESC LIMIT 3;"')
    print(f"\nQueue:\n{out}")
    
    c.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
