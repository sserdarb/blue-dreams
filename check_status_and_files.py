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
    
    print("\n=== Docker PS (Last 2 minutes) ===")
    stdin, stdout, stderr = c.exec_command('docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.CreatedAt}}" | head -n 10')
    print(stdout.read().decode())
    
    print("\n=== Searching for Coolify Logs on FS ===")
    # Check common locations
    locations = ['/data/coolify', '/var/lib/coolify', '/app/coolify']
    for loc in locations:
        stdin, stdout, stderr = c.exec_command(f'ls -F {loc} 2>/dev/null')
        out = stdout.read().decode()
        if out:
            print(f"Found contents in {loc}:")
            print(out)
            
            # If we find a 'logs' or 'applications' directory, list it
            if 'logs/' in out:
                stdin, stdout, stderr = c.exec_command(f'ls -lt {loc}/logs | head -n 5')
                print(f"Recent logs in {loc}/logs:")
                print(stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
