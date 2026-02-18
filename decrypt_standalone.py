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
    
    db_container = '7b196ff456e5'
    app_container = '3fe99f2525ce'
    
    # 1. Get Encrypted
    sql = "SELECT value FROM environment_variables WHERE resourceable_id = 5 AND resourceable_type = 'App\\\\Models\\\\Application' AND key = 'DATABASE_URL'"
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "{sql}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    encrypted_val = stdout.read().decode().strip()
    
    if not encrypted_val:
        print("No value found.")
        sys.exit(1)
    
    # PHP Code - Bootstrap and Decrypt
    # Assuming standard Laravel path /var/www/html
    
    php_code = f"""
    <?php
    require '/var/www/html/vendor/autoload.php';
    $app = require_once '/var/www/html/bootstrap/app.php';
    $kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
    $kernel->bootstrap();
    
    echo 'DECRYPTED: ' . decrypt('{encrypted_val}');
    """
    
    b64_php = base64.b64encode(php_code.encode('utf-8')).decode('utf-8')
    
    # Upload
    cmd = f'docker exec {app_container} sh -c "echo {b64_php} | base64 -d > /tmp/decrypt_standalone.php"'
    c.exec_command(cmd)
    
    # Exec with php
    cmd = f'docker exec {app_container} php /tmp/decrypt_standalone.php'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
