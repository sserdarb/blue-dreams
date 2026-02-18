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
    
    print("\n=== Listing Commands to File ===")
    cmd = f'docker exec {container_id} sh -c "php artisan list > /tmp/artisan_list.txt"'
    stdin, stdout, stderr = c.exec_command(cmd)
    # Wait for completion
    time.sleep(2)
    
    print("\n=== Reading File (Grep deploy) ===")
    cmd = f'docker exec {container_id} grep -i deploy /tmp/artisan_list.txt'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    print("\n=== Reading File (Grep app) ===")
    cmd = f'docker exec {container_id} grep -i app /tmp/artisan_list.txt'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
