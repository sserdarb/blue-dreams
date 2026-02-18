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
    
    # Locate file again to be sure
    cmd = f'docker exec {container_id} find /var/www/html/app/Jobs -name "ApplicationDeploymentJob.php"'
    stdin, stdout, stderr = c.exec_command(cmd)
    file_path = stdout.read().decode().strip()
    
    if file_path:
        print(f"\n=== Reading {file_path} ===")
        # Use simple cat
        cmd = f'docker exec {container_id} cat {file_path}'
        stdin, stdout, stderr = c.exec_command(cmd)
        content = stdout.read().decode()
        
        # Filter for construct
        for line in content.split('\n'):
            if '__construct' in line:
                print(f"CONSTRUCTOR: {line.strip()}")
                
        # Also print first 50 lines just in case
        print("\n--- File Head ---")
        print("\n".join(content.split('\n')[:50]))
    else:
        print("File not found.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
