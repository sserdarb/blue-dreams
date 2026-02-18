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
    
    coolify_container = '3fe99f2525ce'
    db_container = '7b196ff456e5'
    
    # 1. Check the Redis queue keys
    print("\n=== Redis Queues ===")
    cmd = f'docker exec {coolify_container} php artisan tinker --execute "echo implode(PHP_EOL, app(\'redis\')->keys(\'*queue*\'));"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("STDOUT:", stdout.read().decode())
    
    # 2. Check Horizon config for queue names
    print("\n=== Horizon Config ===")
    cmd = f'docker exec {coolify_container} cat /var/www/html/config/horizon.php | head -80'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 3. Check jobs table
    print("\n=== Jobs Table ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "SELECT id, queue, payload::text LIKE \'%Deployment%\' as is_deploy FROM jobs ORDER BY id DESC LIMIT 5"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
