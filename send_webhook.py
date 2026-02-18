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
    
    print("\n=== Sending Webhook to Port 8000 ===")
    cmd = f"curl -v -X POST -H 'Content-Type: application/json' -H 'X-GitHub-Event: push' -d '{json_payload}' http://localhost:8000/webhooks/source/github/events"
    stdin, stdout, stderr = c.exec_command(cmd)
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    
    print("\n=== Sending Webhook to Port 3000 ===")
    cmd = f"curl -v -X POST -H 'Content-Type: application/json' -H 'X-GitHub-Event: push' -d '{json_payload}' http://localhost:3000/webhooks/source/github/events"
    stdin, stdout, stderr = c.exec_command(cmd)
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
