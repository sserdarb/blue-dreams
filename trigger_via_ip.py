import paramiko
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    # Get IP of coolify container
    cmd = "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 3fe99f2525ce" 
    # Or just 'coolify' if name works, but ID 3fe99f2525ce is safer
    stdin, stdout, stderr = c.exec_command(cmd)
    container_ip = stdout.read().decode().strip()
    print(f"Coolify IP: {container_ip}")
    
    if container_ip:
        # Payload
        payload = {
            "ref": "refs/heads/main",
            "repository": {
                "full_name": "sserdarb/blue-dreams",
                "clone_url": "https://github.com/sserdarb/blue-dreams.git"
            },
            "pusher": {
                "name": "sserdarb",
                "email": "admin@bluedreams.com"
            }
        }
        json_payload = json.dumps(payload)
        
        # Try port 80 (internal) and 3000 (often used by SvelteKit app inside)
        for port in [80, 3000]:
            print(f"\n=== Sending Webhook to {container_ip}:{port} ===")
            cmd = f"curl -v -X POST -H 'Content-Type: application/json' -H 'X-GitHub-Event: push' -d '{json_payload}' http://{container_ip}:{port}/webhooks/source/github/events"
            stdin, stdout, stderr = c.exec_command(cmd)
            print("STDOUT:", stdout.read().decode())
            print("STDERR:", stderr.read().decode())
    else:
        print("Could not get Container IP")

    c.close()

except Exception as e:
    print(f"Error: {e}")
