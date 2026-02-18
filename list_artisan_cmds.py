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
    
    container_id = '3fe99f2525ce'
    
    print("\n=== Artisan Command List ===")
    cmd = f'docker exec {container_id} php artisan list > /tmp/artisan_list.txt'
    # Execute inside container, so > works inside container shell if wrapped in sh -c
    # But wait, docker exec ... > local_file redirects stdout to local file on host server? No, to client.
    # Actually, easiest is just to run it and read stdout.
    
    cmd = f'docker exec {container_id} php artisan list'
    stdin, stdout, stderr = c.exec_command(cmd)
    output = stdout.read().decode()
    print(output)

    c.close()

except Exception as e:
    print(f"Error: {e}")
