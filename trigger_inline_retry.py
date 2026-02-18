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
    # Minify JSON for safely passing in shell
    json_payload = json.dumps(payload, separators=(',', ':'))
    signature = create_signature(SECRET, json_payload)
    
    print("\n=== Triggering Webhook INSIDE container (Inline Payload) ===")
    
    # We need to single-quote the payload for shell, so we must escape single quotes inside the payload
    # JSON dump shouldn't have single quotes, only double.
    # But it might be safe. 
    # Curl command: curl -X POST -H ... -d 'PAYLOAD' URL
    
    curl_cmd = f"""curl -v -X POST \\
      -H "Content-Type: application/json" \\
      -H "X-GitHub-Event: push" \\
      -H "X-Hub-Signature-256: {signature}" \\
      -d '{json_payload}' \\
      http://127.0.0.1:80/webhooks/source/github/events"""
      
    # Execute inside container
    cmd = f"docker exec {container_id} {curl_cmd}"
    
    stdin, stdout, stderr = c.exec_command(cmd)
    
    # Wait for output
    out = stdout.read().decode()
    err = stderr.read().decode()
    print("STDOUT:", out)
    print("STDERR:", err)

    c.close()

except Exception as e:
    print(f"Error: {e}")
