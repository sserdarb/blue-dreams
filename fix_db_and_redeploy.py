import paramiko
import sys
import base64
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    coolify_container = '3fe99f2525ce'
    db_container = '7b196ff456e5'
    
    new_url = 'postgresql://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2'
    
    # 1. Read current env vars for app 5
    print("\n=== Current Env Vars for App ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "SELECT id, key, is_preview, is_build_time FROM environment_variables WHERE resourceable_id = 5 AND resourceable_type LIKE \'%Application%\'"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 2. Update via PHP to properly encrypt
    print("\n=== Updating DATABASE_URL ===")
    php_code = f"""<?php
require '/var/www/html/vendor/autoload.php';
$app = require_once '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\EnvironmentVariable;

// Find the DATABASE_URL env var for app 5
$envVar = EnvironmentVariable::where('key', 'DATABASE_URL')
    ->where('resourceable_id', 5)
    ->where('resourceable_type', 'LIKE', '%Application%')
    ->first();

if ($envVar) {{
    $envVar->value = encrypt('{new_url}');
    $envVar->save();
    echo "Updated existing DATABASE_URL (ID: " . $envVar->id . ")\\n";
}} else {{
    // Create new one
    echo "Creating new DATABASE_URL...\\n";
    $envVar = EnvironmentVariable::create([
        'key' => 'DATABASE_URL',
        'value' => encrypt('{new_url}'),
        'resourceable_id' => 5,
        'resourceable_type' => 'App\\\\Models\\\\Application',
        'is_build_time' => true,
        'is_preview' => false,
    ]);
    echo "Created DATABASE_URL (ID: " . $envVar->id . ")\\n";
}}

// Verify
echo "Decrypted value: " . decrypt($envVar->value) . "\\n";
"""
    
    b64_php = base64.b64encode(php_code.encode('utf-8')).decode('utf-8')
    
    cmd = f'docker exec {coolify_container} sh -c "echo {b64_php} | base64 -d > /tmp/fix_db_url.php"'
    c.exec_command(cmd)
    
    cmd = f'docker exec {coolify_container} php /tmp/fix_db_url.php'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode()[:200])
    
    # 3. Trigger Redeploy
    print("\n=== Triggering Redeploy ===")
    # Get API token
    cmd = f'docker exec {coolify_container} php artisan tinker --execute "echo \\App\\Models\\User::first()->createToken(\\"fix\\", [\\"*\\"])->plainTextToken;"'
    stdin, stdout, stderr = c.exec_command(cmd)
    token_raw = stdout.read().decode().strip()
    lines = [l.strip() for l in token_raw.split('\n') if '|' in l]
    token = lines[-1] if lines else token_raw
    
    uuid = 'vgk8cscos8os8wwsogks004'
    cmd = f'docker exec {coolify_container} curl -s -X POST "http://localhost:8000/api/v1/deploy?uuid={uuid}&force=true" -H "Authorization: Bearer {token}" -H "Accept: application/json"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("Deploy Response:", stdout.read().decode())
    
    # 4. Monitor
    print("\n=== Monitoring ===")
    for i in range(90):
        cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT id, status FROM application_deployment_queues ORDER BY id DESC LIMIT 1"'
        stdin, stdout, stderr = c.exec_command(cmd)
        out = stdout.read().decode().strip()
        
        if out:
            parts = [p.strip() for p in out.split('|')]
            qid = parts[0] if parts else '?'
            status = parts[1] if len(parts) > 1 else '?'
            print(f"[{i:3d}] Queue {qid}: {status}")
            
            if status == 'finished':
                print("\n*** BUILD FINISHED ***")
                break
            if status == 'failed':
                print("\n*** BUILD FAILED ***")
                cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT logs FROM application_deployment_queues WHERE id = {qid}"'
                stdin, stdout, stderr = c.exec_command(cmd)
                logs = stdout.read().decode()
                print("LOGS (last 2000):", logs[-2000:])
                break
        else:
            print(f"[{i:3d}] No queue found")
        time.sleep(5)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
