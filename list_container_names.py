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
    
    print("\n=== All Container Names ===")
    stdin, stdout, stderr = c.exec_command('docker ps -a --format "{{.Names}}"')
    
    # Read and clean up the output
    names = stdout.read().decode().strip().split('\n')
    for name in names:
        if name:
            print(f"- {name.strip()}")
            
    c.close()

except Exception as e:
    print(f"Error: {e}")
