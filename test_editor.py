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

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    # Get a page ID to test the editor
    db_cid = '7b196ff456e5'
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d blue_dreams_v2 -t -c "SELECT id FROM \\"Page\\" WHERE slug=\'home\' AND locale=\'tr\' LIMIT 1;"')
    page_id = out.strip()
    print(f"Home TR page ID: {page_id}")
    
    # Get the container and test the editor URL internally
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    
    # Try accessing the editor page internally via curl
    print(f"\n=== Testing editor page: /tr/admin/pages/{page_id}/editor ===")
    out, _ = run(c, f'docker exec {cid} curl -s -w "\\n\\nHTTP_CODE:%{{http_code}}" "http://localhost:3000/tr/admin/pages/{page_id}/editor" 2>&1 | tail -5')
    print(out)
    
    # Check for WIDGET_TYPES error in logs
    print("\n=== Checking for errors in logs ===")
    out, _ = run(c, f'docker logs {cid} --tail 30 2>&1 | grep -i "error\\|widget_types\\|TypeError\\|digest"')
    print(f"Errors: {out or 'None found!'}")
    
    c.close()
    
except Exception as e:
    print(f"Error: {e}")
