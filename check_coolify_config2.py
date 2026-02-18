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
    
    # Get the current start_command from Coolify
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d coolify -t -c "SELECT start_command FROM applications WHERE uuid=\'vgk8cscos8os8wwsogkss004\';"')
    print(f"start_command: [{out.strip()}]")
    
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d coolify -t -c "SELECT build_command FROM applications WHERE uuid=\'vgk8cscos8os8wwsogkss004\';"')
    print(f"build_command: [{out.strip()}]")
    
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d coolify -t -c "SELECT install_command FROM applications WHERE uuid=\'vgk8cscos8os8wwsogkss004\';"')
    print(f"install_command: [{out.strip()}]")
    
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d coolify -t -c "SELECT build_pack FROM applications WHERE uuid=\'vgk8cscos8os8wwsogkss004\';"')
    print(f"build_pack: [{out.strip()}]")
    
    # Check Dockerfile
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d coolify -t -c "SELECT dockerfile FROM applications WHERE uuid=\'vgk8cscos8os8wwsogkss004\';"')
    print(f"dockerfile: [{out.strip()[:200]}]")
    
    # Check if there's a Dockerfile in the repo
    app_cid = '3815dea559c9'
    out, _ = run(c, f'docker exec {app_cid} ls -la /app/Dockerfile 2>&1')
    print(f"\nDockerfile in app: {out}")
    
    out, _ = run(c, f'docker exec {app_cid} cat /app/entrypoint.sh 2>&1')
    print(f"\nEntrypoint: {out}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
