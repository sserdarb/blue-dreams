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
    
    # Get IP of coolify container again
    cmd = "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 3fe99f2525ce" 
    stdin, stdout, stderr = c.exec_command(cmd)
    container_ip = stdout.read().decode().strip()
    
    if container_ip:
        print(f"Target IP: {container_ip}")
        
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
        
        # Try port 80 (standard internal) and 3000 (app specific)
        for port in [80, 3000, 8000]:
            print(f"\n=== Triggering Webhook ({container_ip}:{port}) ===")
            cmd = f"""curl -v -X POST \\
              -H "Content-Type: application/json" \\
              -H "X-GitHub-Event: push" \\
              -H "X-Hub-Signature-256: {signature}" \\
              -d '{json_payload}' \\
              http://{container_ip}:{port}/webhooks/source/github/events"""
              
            stdin, stdout, stderr = c.exec_command(cmd)
            out = stdout.read().decode()
            err = stderr.read().decode()
            print("STDOUT:", out)
            print("STDERR:", err)
            
            if "accepted" in out.lower() or "queued" in out.lower() or "200 OK" in err:
                print("SUCCESS: Webhook accepted!")
                break
    else:
        print("Could not get IP")

    c.close()

except Exception as e:
    print(f"Error: {e}")
