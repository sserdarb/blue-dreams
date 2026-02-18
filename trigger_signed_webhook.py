import paramiko
import sys
import json
import hashlib
import hmac

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
SECRET = 'k8cscos8os8wwsogkss0' # Retrieved earlier

def create_signature(secret, payload):
    return 'sha256=' + hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()

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
    
    # Signature (Github uses sha256 or sha1)
    # Coolify might check X-Hub-Signature-256
    signature = create_signature(SECRET, json_payload)
    
    print("\n=== Triggering Webhook (localhost:8000) ===")
    
    # We use internal IP or localhost. 
    # If localhost fails, we try 127.0.0.1
    # We also include X-Hub-Signature-256
    
    cmd = f"""curl -v -X POST \\
      -H "Content-Type: application/json" \\
      -H "X-GitHub-Event: push" \\
      -H "X-Hub-Signature-256: {signature}" \\
      -d '{json_payload}' \\
      http://127.0.0.1:8000/webhooks/source/github/events"""
      
    stdin, stdout, stderr = c.exec_command(cmd)
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
