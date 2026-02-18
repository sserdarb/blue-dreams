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
    app_path = f'{mountpoint}/applications'
    
    print(f"\n=== Listing {app_path} ===")
    stdin, stdout, stderr = c.exec_command(f'ls -F {app_path}')
    app_dirs_raw = stdout.read().decode()
    print(app_dirs_raw)
    
    app_dirs = [d.strip() for d in app_dirs_raw.split('\n') if d.strip().endswith('/')]
    
    for d in app_dirs:
        full_d = f'{app_path}/{d}'
        print(f"\n--- Checking {full_d} ---")
        # Check for .git
        stdin, stdout, stderr = c.exec_command(f'[ -d "{full_d}.git" ] && echo "GIT FOUND" || echo "NO GIT"')
        if "GIT FOUND" in stdout.read().decode():
            print("Git found. Checking log...")
            stdin, stdout, stderr = c.exec_command(f'cd {full_d} && git log -1 --format="%h - %s (%ci)"')
            print(stdout.read().decode().strip())
        else:
             print("No .git found.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
