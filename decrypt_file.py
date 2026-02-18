import paramiko
import sys

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
    
    # Write php file
    php_content = f"echo 'START_KEY' . decrypt('{encrypted_val}') . 'END_KEY';"
    
    # Upload via echo to file (escaping quotes in php_content)
    # php_content has single quotes around val.
    # We can wrap in double quotes for echo.
    
    # Safe upload:
    # Use python to escape or just be careful.
    # encrypted_val is base64, so it's alphanumeric + / + =. No quotes.
    
    cmd = f'docker exec {app_container} sh -c "echo \\"{php_content}\\" > /tmp/decrypt_script.php"'
    c.exec_command(cmd)
    
    # Cat and pipe
    cmd = f'docker exec {app_container} sh -c "cat /tmp/decrypt_script.php | php artisan tinker"'
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode()
    
    start = out.find('START_KEY')
    end = out.find('END_KEY')
    
    if start != -1 and end != -1:
        print("Decrypted URL:", out[start+9:end])
    else:
        print("Decryption failed. Output:")
        print(out)

    c.close()

except Exception as e:
    print(f"Error: {e}")
