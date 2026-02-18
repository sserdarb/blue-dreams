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
    
    # 1. Check git version
    stdin, stdout, stderr = c.exec_command('git --version')
    print(f"Git Version: {stdout.read().decode().strip()}")
    
    # 2. Find .git dirs
    # We use a broad search but limit depth to avoid scanning everything
    print("\n=== Finding .git dirs (max depth 4 in /data) ===")
    stdin, stdout, stderr = c.exec_command('find /data -maxdepth 4 -name ".git" -type d')
    git_dirs = stdout.read().decode().strip().split('\n')
    
    for git_dir in git_dirs:
        if not git_dir: continue
        repo_path = git_dir.replace('/.git', '')
        print(f"\n--- Checking {repo_path} ---")
        stdin, stdout, stderr = c.exec_command(f'cd {repo_path} && git log -1 --format="%h - %s (%ci)"')
        print(stdout.read().decode().strip())
        
    c.close()

except Exception as e:
    print(f"Error: {e}")
