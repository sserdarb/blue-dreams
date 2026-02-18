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
    
    # Check if git is installed
    stdin, stdout, stderr = c.exec_command('git --version')
    if stdout.channel.recv_exit_status() != 0:
        print("Git not found. Installing...")
        # Try apk (Alpine) first, then apt-get (Debian/Ubuntu)
        stdin, stdout, stderr = c.exec_command('apk add git || (apt-get update && apt-get install -y git)')
        print(stdout.read().decode())
        print(stderr.read().decode())
    else:
        print(f"Git version: {stdout.read().decode().strip()}")

    # navigate to app dir and check git log
    # We saw two app dirs earlier: vgk8cscos8os8wwsogkss00 and focw448cg0gg4wckko04csc
    app_dirs = ['vgk8cscos8os8wwsogkss00', 'focw448cg0gg4wckko04csc']
    base_path = '/data/coolify/applications'
    
    for app in app_dirs:
        path = f"{base_path}/{app}"
        print(f"\n=== Checking Git in {path} ===")
        # Check if .git exists
        stdin, stdout, stderr = c.exec_command(f'[ -d "{path}/.git" ] && echo "Git Repo Found" || echo "No Git Repo"')
        if "Git Repo Found" in stdout.read().decode():
            # Check latest commit
            stdin, stdout, stderr = c.exec_command(f'cd {path} && git log -1 --format="%h - %s (%ci)"')
            print(f"Latest Commit: {stdout.read().decode().strip()}")
            stdin, stdout, stderr = c.exec_command(f'cd {path} && git status')
            print(f"Status:\n{stdout.read().decode()}")
        else:
            print("Not a git repository.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
