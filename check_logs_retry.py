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
    
    # Check logs for "webhook"
    print("\n=== Coolify Logs (Webhook Check) ===")
    cmd = 'docker logs --tail 50 3fe99f2525ce 2>&1 | grep -i webhook'
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    
    # Retry curl with 127.0.0.1
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
    
    print("\n=== Retrying Webhook to 127.0.0.1:8000 ===")
    cmd = f"curl -v -X POST -H 'Content-Type: application/json' -H 'X-GitHub-Event: push' -d '{json_payload}' http://127.0.0.1:8000/webhooks/source/github/events"
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    print(stderr.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
