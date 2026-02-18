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
    
    # Run psql inside the coolify-db container
    # Username: coolify, DB: coolify (from previous step)
    
    # We need to find the exact container name or ID for the DB first, just in case
    # Previous logs showed 'coolify-dbdbstack-app-1' or similar, but let's try 'coolify-db' first or find it.
    
    # Try finding container with name containing 'coolify' and 'db' or 'postgres'
    print("\n=== Finding DB Container ===")
    stdin, stdout, stderr = c.exec_command("docker ps --format '{{.Names}}' | grep -iE 'coolify.*db|postgres'")
    db_container = stdout.read().decode().strip()
    
    if not db_container:
        # Fallback to 'coolify-db' if grep fails (e.g. if name is just 'coolify-db')
        # Or check previous output: '7b196ff456e5 coolify-db'
        db_container = '7b196ff456e5' 
        print(f"Grep failed, trying hardcoded/known ID: {db_container}")
    else:
        print(f"Found DB Container: {db_container}")

    print("\n=== Listing Tables ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "\\dt"'
    stdin, stdout, stderr = c.exec_command(cmd)
    output = stdout.read().decode()
    error = stderr.read().decode()
    
    if output:
        print(output)
    else:
        print("No output from psql.")
        print(f"Error: {error}")

    c.close()

except Exception as e:
    print(f"Error: {e}")
