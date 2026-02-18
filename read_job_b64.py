import paramiko
import sys
import base64

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
    
    # Path found earlier: /var/www/html/app/Jobs/ApplicationDeploymentJob.php
    file_path = '/var/www/html/app/Jobs/ApplicationDeploymentJob.php'
    
    print(f"\n=== Reading {file_path} (Base64) ===")
    cmd = f'docker exec {container_id} cat {file_path} | base64'
    # Or cleaner: docker exec {container_id} sh -c "base64 {file_path}"
    cmd = f'docker exec {container_id} sh -c "base64 {file_path}"'
    
    stdin, stdout, stderr = c.exec_command(cmd)
    b64_content = stdout.read().decode().strip().replace('\n', '')
    
    if b64_content:
        content = base64.b64decode(b64_content).decode('utf-8', errors='replace')
        print(content)
    else:
        print("No content returned.")
        print("STDERR:", stderr.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
