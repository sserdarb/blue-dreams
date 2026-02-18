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
    
    coolify_container = '3fe99f2525ce'
    
    # Check Horizon status
    print("\n=== Horizon Status ===")
    cmd = f'docker exec {coolify_container} php artisan horizon:status'
    stdin, stdout, stderr = c.exec_command(cmd)
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    
    # Check running processes in coolify container
    print("\n=== Coolify Processes ===")
    cmd = f'docker exec {coolify_container} ps aux | grep -E "horizon|queue|worker"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
