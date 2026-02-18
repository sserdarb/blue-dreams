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
    
    print("\n=== Non-Coolify Containers ===")
    stdin, stdout, stderr = c.exec_command('docker ps -a --format "{{.ID}} {{.Names}} {{.Image}}" | grep -vE "coolify|stalwart"')
    print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
