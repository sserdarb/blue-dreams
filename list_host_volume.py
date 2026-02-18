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
    
    # Try to access the volume via host path
    # Usually /var/lib/docker/volumes/coolify_coolify-data/_data
    # But let's check exact mountpoint from volume inspect first
    
    stdin, stdout, stderr = c.exec_command('docker volume inspect coolify_coolify-data --format "{{.Mountpoint}}"')
    mountpoint = stdout.read().decode().strip()
    
    if mountpoint:
        print(f"Mountpoint: {mountpoint}")
        # List recursively to find .git
        cmd = f'find {mountpoint} -maxdepth 4 -name ".git" -type d'
        print(f"\n=== Searching for .git in {mountpoint} ===")
        stdin, stdout, stderr = c.exec_command(cmd)
        git_dirs = stdout.read().decode().strip().split('\n')
        
        for d in git_dirs:
            if not d: continue
            repo_path = d.replace('/.git', '')
            print(f"\n--- Repo: {repo_path} ---")
            # Check git log
            stdin, stdout, stderr = c.exec_command(f'cd {repo_path} && git log -1 --format="%h - %s (%ci)"')
            print(stdout.read().decode().strip())
    else:
        print("Could not get mountpoint")

    c.close()

except Exception as e:
    print(f"Error: {e}")
