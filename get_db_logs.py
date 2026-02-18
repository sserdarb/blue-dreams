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
    
    # Copy logs to file
    print("\n=== Getting Logs ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "COPY (SELECT logs FROM application_deployment_queues WHERE id = {queue_id}) TO \'/tmp/logs_{queue_id}.txt\'"'
    c.exec_command(cmd)
    
    # Read file (tail 50 lines)
    cmd = f'docker exec {db_container} tail -n 50 /tmp/logs_{queue_id}.txt'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    output = stdout.read().decode()
    if output:
        print(output)
    else:
        print("Empty logs.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
