import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')
SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "***REDACTED_SSH_PASSWORD***"

def run(c, cmd, timeout=30):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='replace').strip(), stderr.read().decode('utf-8', errors='replace').strip()

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    print("=== Triggering deployment ===")
    out, err = run(c, 'curl -s -X POST "http://localhost:8080/api/v1/applications/vgk8cscos8os8wwsogkss004/deploy?force=true" -H "Authorization: Bearer 2|E5H1n3Ys97aCYpAbWnSA5bJV7APpuKzpEpMmIjwE077a9e55" -H "Accept: application/json"', timeout=30)
    print(f"Deploy Response: {out}")
    c.close()

except Exception as e:
    print(f"Error: {e}")
