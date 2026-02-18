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
    print(f"\n=== Coolify Logs (Last 100 lines) ===")
    # Pipe to file first to ensure we get output
    stdin, stdout, stderr = c.exec_command(f'docker logs --tail 100 {container_id} > /tmp/coolify_logs.txt 2>&1')
    stdout.channel.recv_exit_status()
    
    stdin, stdout, stderr = c.exec_command('cat /tmp/coolify_logs.txt')
    print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
