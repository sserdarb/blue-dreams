import paramiko
import sys
import json
import hashlib
import hmac
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
SECRET = 'k8cscos8os8wwsogkss0' 

def create_signature(secret, payload):
    return 'sha256=' + hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    container_id = '3fe99f2525ce'

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
    json_payload = json.dumps(payload, separators=(',', ':'))
    signature = create_signature(SECRET, json_payload)
    
    
    # Try multiple endpoints
    endpoints = [
        "http://127.0.0.1:80/webhooks/source/github/events",
        "http://localhost:80/webhooks/source/github/events",
        "http://localhost:8000/webhooks/source/github/events",
        "http://0.0.0.0:80/webhooks/source/github/events"
    ]
    
    print("\n=== Triggering Webhook INSIDE container (Multiple Endpoints) ===")
    
    for url in endpoints:
        print(f"\n--- Trying {url} ---")
        curl_cmd = f"""curl -v -X POST \\
          -H "Content-Type: application/json" \\
          -H "X-GitHub-Event: push" \\
          -H "X-Hub-Signature-256: {signature}" \\
          -d '{json_payload}' \\
          {url}"""
          
        cmd = f"docker exec {container_id} {curl_cmd}"
        stdin, stdout, stderr = c.exec_command(cmd)
        out = stdout.read().decode()
        err = stderr.read().decode()
        print("STDOUT:", out)
        print("STDERR:", err)
        
        if "200 OK" in err or "accepted" in out.lower():
            print("SUCCESS!")
            break

    c.close()

except Exception as e:
    print(f"Error: {e}")
