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
    
    db_cid = '7b196ff456e5'
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d blue_dreams_v2 -t -c "SELECT id FROM \\"Page\\" WHERE slug=\'home\' AND locale=\'tr\' LIMIT 1;"')
    page_id = out.strip()
    results.append(f"Page ID: {page_id}")
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    
    # Test the editor endpoint, get only HTTP status and check for errors
    out, _ = run(c, f'docker exec {cid} curl -s -o /tmp/editor_response.html -w "%{{http_code}}" "http://localhost:3000/tr/admin/pages/{page_id}/editor" 2>&1')
    results.append(f"HTTP Status: {out}")
    
    # Check the response for error messages
    out, _ = run(c, f'docker exec {cid} grep -i "error\\|exception\\|bulunamad" /tmp/editor_response.html | head -5')
    results.append(f"Error in response: {out or 'None'}")
    
    # Check for widget-editor content in reponse
    out, _ = run(c, f'docker exec {cid} grep -i "widget\\|editor\\|page-header" /tmp/editor_response.html | head -5')
    results.append(f"Widget content found: {out[:200] if out else 'None'}")
    
    # Get container logs AFTER the request
    out, _ = run(c, f'docker logs {cid} --tail 10 2>&1')
    results.append(f"\nRecent logs:\n{out}")
    
    result_text = '\n'.join(results)
    with open('editor_test_result.txt', 'w', encoding='utf-8') as f:
        f.write(result_text)
    print(result_text)

except Exception as e:
    print(f"Error: {e}")
