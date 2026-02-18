import paramiko
import sys
import json
import hashlib
import hmac

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
    json_payload = json.dumps(payload)
    signature = create_signature(SECRET, json_payload)
    
    print("\n=== Triggering Webhook INSIDE container (localhost:80) ===")
    
    # We construct the curl command to run inside docker exec
    # Need to escape quotes carefully for shell -> docker -> sh -> curl
    # Simplest way is to write payload to file inside container and cat it
    
    # 1. Write payload to /tmp/payload.json inside container
    cmd = f"docker exec {container_id} sh -c 'echo \'{json_payload}\' > /tmp/payload.json'"
    c.exec_command(cmd)
    
    # 2. Run curl
    curl_cmd = f"""curl -v -X POST \\
      -H "Content-Type: application/json" \\
      -H "X-GitHub-Event: push" \\
      -H "X-Hub-Signature-256: {signature}" \\
      -d @/tmp/payload.json \\
      http://127.0.0.1:80/webhooks/source/github/events"""
      
    cmd = f"docker exec {container_id} {curl_cmd}"
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    print("STDOUT:", out)
    print("STDERR:", err)

    c.close()

except Exception as e:
    print(f"Error: {e}")
