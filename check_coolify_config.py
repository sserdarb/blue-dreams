import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def run(c, cmd, timeout=30):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    db_cid = '7b196ff456e5'
    
    # Get current Coolify build and start commands
    print("=== Coolify App Config ===")
    cols = ['build_command', 'start_command', 'install_command', 'base_directory', 'docker_compose_location']
    for col in cols:
        out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d coolify -t -c "SELECT {col} FROM applications WHERE uuid=\'vgk8cscos8os8wwsogkss004\';"')
        print(f"  {col}: {out.strip()}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
