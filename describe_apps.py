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
    
    # DB Container
    db_container = '7b196ff456e5' 
    
    print("\n=== Describing 'applications' table ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "\\d applications"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    print("\n=== Selecting recent applications (limit 5) ===")
    # Select specific columns to avoid massive output
    cols = "id, name, git_repository, git_branch, build_pack, domain" # Guessing columns
    # Actually, let's just select * limit 1 first to see columns if \d fails or is hard to parse
    # But \d should work.
    
    # Valid columns might be: repository, git_repository, name, description, fqdn, build_pack
    # Let's try to get columns from \d output first or just try a catch-all but truncated
    
    # Safe query: select columns usually present
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "SELECT id, name, git_repository, git_branch, build_pack, fqdn, status FROM applications LIMIT 5"'
    # Note: fqdn is common in Coolify for domain.
    
    stdin, stdout, stderr = c.exec_command(cmd)
    output = stdout.read().decode()
    if "ERROR" in output:
         print(f"Query failed: {output}")
         print("Falling back to select * limit 1")
         cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "SELECT * FROM applications LIMIT 1"'
         stdin, stdout, stderr = c.exec_command(cmd)
         print(stdout.read().decode())
    else:
        print(output)

    c.close()

except Exception as e:
    print(f"Error: {e}")
