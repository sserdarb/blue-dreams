import paramiko
import sys
import base64

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    app_container = '3fe99f2525ce' # Coolify
    target_container = 'c9a09c7f9a16' # Blue Dreams App
    
    # New URL
    # postgres://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2
    new_url = 'postgres://coolify:coolifypassword@coolify-db:5432/blue_dreams_v2'
    
    print("\n=== Updating DATABASE_URL ===")
    
    # PHP Code
    # $app = App\Models\Application::find(5);
    # $app->environment_variables()->where('key', 'DATABASE_URL')->update(['value' => encrypt('...')]);
    # echo "Updated.";
    
    php_code = f"""
    <?php
    require '/var/www/html/vendor/autoload.php';
    $app = require_once '/var/www/html/bootstrap/app.php';
    $kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
    $kernel->bootstrap();
    
    use App\\Models\\Application;
    
    $app = Application::find(5);
    if ($app) {{
        $count = $app->environment_variables()->where('key', 'DATABASE_URL')->update(['value' => encrypt('{new_url}')]);
        echo "Updated $count rows.";
    }} else {{
        echo "App 5 not found.";
    }}
    """
    
    b64_php = base64.b64encode(php_code.encode('utf-8')).decode('utf-8')
    
    cmd = f'docker exec {app_container} sh -c "echo {b64_php} | base64 -d > /tmp/update_db.php"'
    c.exec_command(cmd)
    
    cmd = f'docker exec {app_container} php /tmp/update_db.php'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    
    print("\n=== Restarting App Container ===")
    cmd = f'docker restart {target_container}'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("Restart cmd output:", stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
