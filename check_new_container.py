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
    
    container_id = 'c9a09c7f9a16' 
    print(f"\n=== Logs for {container_id} (tail 100) ===")
    
    cmd = f'docker logs --tail 100 {container_id}'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    # Check both
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    
    # Inspect to see if it's a build container or running?
    print(f"\n=== Inspect {container_id} Image/Labels ===")
    cmd = f'docker inspect {container_id} --format "{{{{.Config.Image}}}} Labels: {{{{json .Config.Labels}}}} Status: {{{{json .State.Status}}}}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
