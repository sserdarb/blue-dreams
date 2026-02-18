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
        
    print(f"Encrypted (len={len(encrypted_val)})")
    
    # PHP Code - using double quotes for string in PHP to avoid single quote issues if any
    # But base64 is clean.
    
    php_code = f"""
    try {{
        echo 'DECRYPTED: ' . decrypt('{encrypted_val}');
    }} catch (\\Throwable $e) {{
        echo 'ERROR: ' . $e->getMessage();
    }}
    """
    
    # Encode PHP code
    b64_php = base64.b64encode(php_code.encode('utf-8')).decode('utf-8')
    
    # Upload
    cmd = f'docker exec {app_container} sh -c "echo {b64_php} | base64 -d > /tmp/decrypt_robust.php"'
    c.exec_command(cmd)
    
    # Exec
    cmd = f'docker exec {app_container} sh -c "cat /tmp/decrypt_robust.php | php artisan tinker"'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    out = stdout.read().decode()
    print("Output:", out)

    c.close()

except Exception as e:
    print(f"Error: {e}")
