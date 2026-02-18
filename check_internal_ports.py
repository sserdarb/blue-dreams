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
    print(f"\n=== Netstat/Ports inside {container_id} ===")
    
    # Try netstat if available
    cmd = f'docker exec {container_id} netstat -tulpn'
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode()
    if out:
        print(out)
    else:
        # Try ss
        cmd = f'docker exec {container_id} ss -tulpn'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(stdout.read().decode())
        
        # Try ps to see command arguments
        cmd = f'docker exec {container_id} ps aux'
        stdin, stdout, stderr = c.exec_command(cmd)
        print("\n--- PS AUX ---\n" + stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
