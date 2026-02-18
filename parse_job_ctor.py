import paramiko
import sys
import base64
import re

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
    file_path = '/var/www/html/app/Jobs/ApplicationDeploymentJob.php'
    
    cmd = f'docker exec {container_id} sh -c "base64 {file_path}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    b64_content = stdout.read().decode().strip().replace('\n', '').replace('\r', '')
    
    if b64_content:
        content = base64.b64decode(b64_content).decode('utf-8', errors='replace')
        
        # Regex to find constructor
        match = re.search(r'public function __construct\((.*?)\)', content, re.DOTALL)
        if match:
            print(f"CONSTRUCTOR ARGS: {match.group(1)}")
        else:
            print("Constructor not found in content.")
            print(content[:500]) # Print head if not found
            
    else:
        print("No content.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
