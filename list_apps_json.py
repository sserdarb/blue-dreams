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
    
    print("\n=== Applications (JSON) ===")
    # Use row_to_json for cleaner output
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT row_to_json(t) FROM (SELECT id, name, git_repository, git_branch, build_pack, fqdn, status FROM applications) t"'
    
    stdin, stdout, stderr = c.exec_command(cmd)
    
    # Read output
    output = stdout.read().decode()
    if output:
        print(output)
    else:
        print("No output.")
        print(f"Stderr: {stderr.read().decode()}")

    c.close()

except Exception as e:
    print(f"Error: {e}")
