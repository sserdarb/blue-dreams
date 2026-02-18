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
    
    mountpoint = '/var/lib/docker/volumes/coolify_coolify-data/_data'
    print(f"\n=== Contents of {mountpoint} ===")
    
    # Simple LS
    stdin, stdout, stderr = c.exec_command(f'ls -F {mountpoint}')
    print(stdout.read().decode())
    
    # Check applications
    if True:
        app_path = f'{mountpoint}/applications'
        print(f"\n=== {app_path} ===")
        stdin, stdout, stderr = c.exec_command(f'ls -F {app_path}')
        print(stdout.read().decode())
        
        # Check subdirs if any
        dirs_out = stdout.read().decode() # Wait, read consumes buffer. Correct logic below.
        
    c.close()

except Exception as e:
    print(f"Error: {e}")
