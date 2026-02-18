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
    
    # Based on previous output, the container with ID starting with 88-055... seems to be the candidate
    target_container = '88-055128813859o' 
    
    print(f"\n=== Logs for {target_container} ===")
    stdin, stdout, stderr = c.exec_command(f'docker logs --tail 100 {target_container}')
    print(stdout.read().decode())
    print(stderr.read().decode())

    print(f"\n=== Docker Inspect {target_container} ===")
    stdin, stdout, stderr = c.exec_command(f'docker inspect {target_container}')
    print(stdout.read().decode())
    
    c.close()
    
except Exception as e:
    print(f"Error: {e}")
