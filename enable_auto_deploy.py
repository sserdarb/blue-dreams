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
    
    db_container = '7b196ff456e5' 
    app_id = 5
    
    # Check current status
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT is_auto_deploy FROM applications WHERE id = {app_id}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    current_status = stdout.read().decode().strip()
    print(f"Current Auto Deploy: '{current_status}'")
    
    if current_status != 't':
        print("Enabling Auto Deploy...")
        cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "UPDATE applications SET is_auto_deploy = true WHERE id = {app_id}"'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(stdout.read().decode())
        
        # Verify
        cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT is_auto_deploy FROM applications WHERE id = {app_id}"'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(f"New Auto Deploy: '{stdout.read().decode().strip()}'")
    else:
        print("Auto Deploy is already enabled.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
