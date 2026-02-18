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
    queue_id = 131
    
    # Query status and logs (limit logs)
    # Using json output for safety
    print(f"\n=== Queue {queue_id} Status ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT row_to_json(t) FROM (SELECT id, status, created_at, updated_at, logs FROM application_deployment_queues WHERE id = {queue_id}) t"'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    output = stdout.read().decode().strip()
    if output:
        print(output[:2000]) # First 2000 chars to avoid truncation of critical json structure
        if len(output) > 2000:
            print("... (truncated)")
    else:
        print("No record found.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
