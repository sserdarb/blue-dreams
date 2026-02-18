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
    print(f"\n=== Mounting {vol_name} to alpine container ===")
    
    # Run a temporary container to list the volume
    cmd = f'docker run --rm -v {vol_name}:/data alpine ls -F /data'
    stdin, stdout, stderr = c.exec_command(cmd)
    output = stdout.read().decode()
    print(output)
    
    if 'applications/' in output:
        print("\n--- Listing applications ---")
        cmd = f'docker run --rm -v {vol_name}:/data alpine ls -F /data/applications'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
