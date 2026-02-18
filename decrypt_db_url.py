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
    
    container_id = '3fe99f2525ce' # Coolify app container
    
    # Value from previous step (truncated in output, so I must fetch it again inside the script to be safe)
    # Using psql inside tinker? No.
    # I'll fetch it via python then pass to tinker.
    
    db_container = '7b196ff456e5'
    sql = "SELECT value FROM environment_variables WHERE resourceable_id = 5 AND resourceable_type = 'App\\\\Models\\\\Application' AND key = 'DATABASE_URL'"
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "{sql}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    encrypted_val = stdout.read().decode().strip()
    
    print(f"Encrypted: {encrypted_val[:20]}...")
    
    # Decrypt in Tinker
    # valid php string require quotes
    php_code = f"echo decrypt('{encrypted_val}');"
    
    # Escape single quotes if any in encrypted_val? Base64 usually safe but might have chars.
    # Better: echo "val" | php artisan tinker
    
    cmd_decrypt = f'docker exec {container_id} sh -c "echo \\"{php_code}\\" | php artisan tinker"'
    stdin, stdout, stderr = c.exec_command(cmd_decrypt)
    
    decrypted = stdout.read().decode().strip()
    print("Decrypted:", decrypted)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
