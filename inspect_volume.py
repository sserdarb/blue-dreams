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
    
    vol_name = 'yckowcccgg844g0c0o8sc'
    print(f"\n=== Inspecting Volume {vol_name} ===")
    
    # We can inspect volume mountpoint first
    stdin, stdout, stderr = c.exec_command(f'docker volume inspect {vol_name} --format "{{{{.Mountpoint}}}}"')
    mountpoint = stdout.read().decode().strip()
    
    if mountpoint:
        print(f"Mountpoint: {mountpoint}")
        # Try to list it directly (as root usually can)
        stdin, stdout, stderr = c.exec_command(f'ls -F {mountpoint}')
        print(stdout.read().decode())
        
        # Check for git
        stdin, stdout, stderr = c.exec_command(f'[ -d "{mountpoint}/.git" ] && echo "GIT FOUND" || echo "NO GIT"')
        if "GIT FOUND" in stdout.read().decode():
             stdin, stdout, stderr = c.exec_command(f'cd {mountpoint} && git log -1 --format="%h - %s (%ci)"')
             print(f"Latest Commit: {stdout.read().decode().strip()}")
    else:
        print("Could not get mountpoint")
        
    c.close()

except Exception as e:
    print(f"Error: {e}")
