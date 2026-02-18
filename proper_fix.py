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
    
    # 1. Update DATABASE_URL through Eloquent (proper encryption)
    print("\n=== Updating DATABASE_URL via Eloquent Model ===")
    
    php_code = f"""<?php
require '/var/www/html/vendor/autoload.php';
$app = require_once '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\EnvironmentVariable;

// Find the DATABASE_URL for the app
$envVar = EnvironmentVariable::where('key', 'DATABASE_URL')
    ->where('resourceable_type', 'LIKE', '%Application%')
    ->first();

if ($envVar) {{
    echo "Found env var ID: " . $envVar->id . "\\n";
    echo "Old decrypted value: " . $envVar->real_value . "\\n";
    
    // Update using Eloquent setter (auto-encrypts)
    $envVar->value = '{new_url}';
    $envVar->is_build_time = true;
    $envVar->save();
    
    // Verify
    $envVar->refresh();
    echo "New decrypted value: " . $envVar->real_value . "\\n";
}} else {{
    echo "DATABASE_URL env var not found!\\n";
    
    // Create it
    $envVar = new EnvironmentVariable();
    $envVar->key = 'DATABASE_URL';
    $envVar->value = '{new_url}';
    $envVar->resourceable_id = 5;
    $envVar->resourceable_type = 'App\\\\Models\\\\Application';
    $envVar->is_build_time = true;
    $envVar->is_preview = false;
    $envVar->save();
    
    echo "Created new env var ID: " . $envVar->id . "\\n";
    echo "Decrypted value: " . $envVar->real_value . "\\n";
}}
"""
    
    b64 = base64.b64encode(php_code.encode('utf-8')).decode('utf-8')
    cmd = f'docker exec {coolify_container} sh -c "echo {b64} | base64 -d > /tmp/update_db_url.php"'
    c.exec_command(cmd)
    time.sleep(1)
    
    cmd = f'docker exec {coolify_container} php /tmp/update_db_url.php'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("STDOUT:", stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print("STDERR:", err[:500])
    
    # 2. Trigger deploy with fresh git pull
    print("\n=== Triggering Deploy ===")
    cmd = f'docker exec {coolify_container} php artisan tinker --execute "echo \\App\\Models\\User::first()->createToken(\\"fix3\\", [\\"*\\"])->plainTextToken;"'
    stdin, stdout, stderr = c.exec_command(cmd)
    token_raw = stdout.read().decode().strip()
    lines = [l.strip() for l in token_raw.split('\n') if '|' in l]
    token = lines[-1] if lines else token_raw
    
    uuid = 'vgk8cscos8os8wwsogkss004'
    cmd = f'docker exec {coolify_container} curl -s -X POST "http://localhost:8000/api/v1/deploy?uuid={uuid}&force=true" -H "Authorization: Bearer {token}" -H "Accept: application/json"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("Deploy:", stdout.read().decode())
    
    # 3. Monitor
    print("\n=== Monitoring ===")
    for i in range(120):
        cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT id, status FROM application_deployment_queues ORDER BY id DESC LIMIT 1"'
        stdin, stdout, stderr = c.exec_command(cmd)
        out = stdout.read().decode().strip()
        
        if out:
            parts = [p.strip() for p in out.split('|')]
            qid = parts[0] if parts else '?'
            status = parts[1] if len(parts) > 1 else '?'
            if i % 6 == 0:
                print(f"[{i:3d}] Queue {qid}: {status}")
            
            if status == 'finished':
                print(f"\n*** BUILD FINISHED ***")
                
                # Check new container env
                time.sleep(5)
                cmd = 'docker ps --filter "name=vgk8" --format "{{.ID}}"'
                stdin, stdout, stderr = c.exec_command(cmd)
                cid = stdout.read().decode().strip()
                
                cmd = f'docker inspect {cid} --format "{{{{range .Config.Env}}}}{{{{println .}}}}{{{{end}}}}" | grep DATABASE'
                stdin, stdout, stderr = c.exec_command(cmd)
                print(f"NEW DATABASE_URL: {stdout.read().decode().strip()}")
                
                cmd = f'docker exec {cid} head -5 /app/node_modules/.prisma/client/schema.prisma 2>/dev/null'
                stdin, stdout, stderr = c.exec_command(cmd)
                print(f"Prisma schema:\n{stdout.read().decode()}")
                break
            
            if status == 'failed':
                print(f"\n*** BUILD FAILED ***")
                break
        time.sleep(5)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
