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
    
    vol_name = 'coolify_coolify-data'
    print(f"\n=== Inspecting Volume {vol_name} ===")
    
    # We can inspect volume mountpoint first
    stdin, stdout, stderr = c.exec_command(f'docker volume inspect {vol_name} --format "{{{{.Mountpoint}}}}"')
    mountpoint = stdout.read().decode().strip()
    
    if mountpoint:
        print(f"Mountpoint: {mountpoint}")
        # List contents of coolify data
        stdin, stdout, stderr = c.exec_command(f'ls -F {mountpoint}')
        print(stdout.read().decode())
        
        # Check for ssh keys or app data
        if 'applications' in stdout.read().decode() or True: # Force check
             stdin, stdout, stderr = c.exec_command(f'ls -F {mountpoint}/applications')
             print(f"Applications in volume:\n{stdout.read().decode()}")

    c.close()

except Exception as e:
    print(f"Error: {e}")
