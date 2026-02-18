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
    
    keywords = ['deploy', 'app', 'coolify', 'resource', 'provision']
    print("\n=== Grepping Artisan Commands ===")
    
    for kw in keywords:
        print(f"\n--- Keyword: {kw} ---")
        cmd = f'docker exec {container_id} php artisan list | grep -i {kw}'
        # pipe to cat to avoid weird tty issues?
        # cmd = f"docker exec {container_id} sh -c 'php artisan list | grep -i {kw}'"
        stdin, stdout, stderr = c.exec_command(cmd)
        print(stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
