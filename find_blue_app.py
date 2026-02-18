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
    
    print("\n=== Finding 'Blue Dreams' App ===")
    # Filtered query
    cmd = f'''docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT row_to_json(t) FROM (SELECT id, uuid, name, git_repository, git_branch, build_pack, fqdn, status FROM applications WHERE name ILIKE '%blue%' OR git_repository ILIKE '%blue%' OR fqdn ILIKE '%blue%' OR name ILIKE '%dream%' OR fqdn ILIKE '%dream%') t"'''
    
    stdin, stdout, stderr = c.exec_command(cmd)
    output = stdout.read().decode()
    if output.strip():
        print(output)
    else:
        print("No matching app found.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
