import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    # 1. Install git if missing
    print("\n=== Checking Git Installation ===")
    stdin, stdout, stderr = c.exec_command('git --version')
    if stdout.channel.recv_exit_status() != 0:
        print("Git not found. Installing...")
        # Check OS type first
        stdin, stdout, stderr = c.exec_command('cat /etc/os-release')
        os_info = stdout.read().decode()
        if 'Alpine' in os_info:
            print("Detected Alpine. Installing git...")
            c.exec_command('apk update && apk add git')
        elif 'Debian' in os_info or 'Ubuntu' in os_info:
             print("Detected Debian/Ubuntu. Installing git...")
             c.exec_command('apt-get update && apt-get install -y git')
        # wait a bit
        time.sleep(5)
    
    # 2. Search for ANY .git directory under /data/coolify
    print("\n=== Searching for .git directories in /data/coolify ===")
    stdin, stdout, stderr = c.exec_command('find /data/coolify -name ".git" -type d 2>/dev/null | head -n 5')
    git_dirs = stdout.read().decode().strip().split('\n')
    
    for git_dir in git_dirs:
        if not git_dir: continue
        repo_path = git_dir.replace('/.git', '')
        print(f"\n--- Repo: {repo_path} ---")
        stdin, stdout, stderr = c.exec_command(f'cd {repo_path} && git log -1 --format="%h - %s (%ci)"')
        print(f"Latest Commit: {stdout.read().decode().strip()}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
