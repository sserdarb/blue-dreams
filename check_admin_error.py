import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def run(c, cmd, timeout=30):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

results = []

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    results.append(f"Container: {cid}")
    
    # Get full container logs looking for errors
    results.append("\n=== Server logs (last 100 lines) ===")
    out, _ = run(c, f'docker logs {cid} --tail 100 2>&1')
    results.append(out)
    
    # Also check for the specific digest error
    results.append("\n=== Searching for Digest error ===")
    out, _ = run(c, f'docker logs {cid} 2>&1 | grep -i -A5 "error\\|exception\\|digest\\|1294641813" | tail -60')
    results.append(out)
    
    c.close()
    
    result = '\n'.join(results)
    with open('admin_error_log.txt', 'w', encoding='utf-8') as f:
        f.write(result)
    print(result[:3000])

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
