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
    print(f"\n=== Mounting {vol_name} and listing /data/applications ===")
    
    # Try ls -R but limit depth
    cmd = f'docker run --rm -v {vol_name}:/data alpine ls -F /data/applications'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    # Check if we get output
    output = stdout.read().decode()
    if not output:
        # Maybe applications dir does not exist at root of volume?
        print("No output for /data/applications. Listing root /data:")
        cmd = f'docker run --rm -v {vol_name}:/data alpine ls -F /data'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(stdout.read().decode())
    else:
        print(output)
        # Parse directories
        dirs = [d.strip() for d in output.split('\n') if d.strip().endswith('/')]
        for d in dirs:
             app_path = f'/data/applications/{d}'
             print(f"\n--- Checking {d} for git ---")
             # Check for .git
             cmd = f'docker run --rm -v {vol_name}:/data alpine sh -c "test -d {app_path}.git && echo GIT_FOUND || echo NO_GIT"'
             stdin, stdout, stderr = c.exec_command(cmd)
             if "GIT_FOUND" in stdout.read().decode():
                 print(f"Git repo found in {d}")
                 # We need git to check log. Alpine container might not have git installed by default.
                 # install git in temp container is slow. 
                 # We can try to use the host's git if we mount it, but host path is hard.
                 # Let's just install git in the temp container.
                 cmd = f'docker run --rm -v {vol_name}:/data alpine sh -c "apk add --no-cache git && cd {app_path} && git log -1 --format=\'%h - %s (%ci)\'"'
                 stdin, stdout, stderr = c.exec_command(cmd)
                 print(f"Latest Commit: {stdout.read().decode()}")

    c.close()

except Exception as e:
    print(f"Error: {e}")
