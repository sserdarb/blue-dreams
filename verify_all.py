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
    
    # 1. Check latest deployment queue entries
    print("\n=== Latest Deployment Queues ===")
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "SELECT id, application_id, status, created_at FROM application_deployment_queues ORDER BY created_at DESC LIMIT 5"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 2. Check containers
    print("\n=== Running Containers ===")
    cmd = 'docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Image}}" | head -15'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # 3. Verify DB content
    print("\n=== Pages in blue_dreams_v2 ===")
    cmd = f'docker exec {db_container} psql -U coolify -d blue_dreams_v2 -c "SELECT slug, locale, title FROM \\"Page\\" ORDER BY locale, slug"'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
