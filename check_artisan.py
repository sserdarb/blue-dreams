import paramiko
import sys
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
    
    container_id = '3fe99f2525ce'
    
    # 1. Check if artisan exists
    print("\n=== Checking for artisan ===")
    cmd = f'docker exec {container_id} ls -F /var/www/html/artisan'
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode()
    if 'artisan' in out:
        print("Artisan found.")
        
        # 2. List commands filtering for deploy
        print("\n=== Artisan Deploy Commands ===")
        cmd = f'docker exec {container_id} php artisan list | grep deploy'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(stdout.read().decode())
    else:
        print("Artisan NOT found in /var/www/html. Searching...")
        cmd = f'docker exec {container_id} find / -name artisan -maxdepth 4 2>/dev/null'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
