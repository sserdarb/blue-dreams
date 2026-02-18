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
    
    # 2. Decrypt
    # Use standard shell echo with single quotes around the PHP code string
    # And double quotes around the payload in PHP
    
    php_code = f"echo 'DECRYPTED_START' . decrypt('{encrypted_val}') . 'DECRYPTED_END';"
    
    cmd = f'docker exec {app_container} sh -c "echo \\"{php_code}\\" | php artisan tinker"'
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode()
    
    start = out.find('DECRYPTED_START')
    end = out.find('DECRYPTED_END')
    
    if start != -1 and end != -1:
        print("Decrypted URL:", out[start+15:end])
    else:
        print("Decryption failed. Output:")
        print(out)
        print("STDERR:", stderr.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
