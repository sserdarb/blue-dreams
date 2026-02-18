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
    
    # Find coolify-db container
    out, _ = run(c, 'docker ps --filter "name=coolify-db" --format "{{.ID}}"')
    db_cid = out.split('\n')[0].strip()
    print(f"DB Container: {db_cid}")
    
    # Get page IDs from PostgreSQL
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d blue_dreams_v2 -t -c "SELECT id, slug, locale FROM \\"Page\\" WHERE slug=\'home\' ORDER BY locale LIMIT 4;"')
    print(f"Home pages:\n{out}")
    
    # Get a specific page ID for TR
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d blue_dreams_v2 -t -c "SELECT id FROM \\"Page\\" WHERE slug=\'home\' AND locale=\'tr\' LIMIT 1;"')
    page_id = out.strip()
    print(f"\nHome TR page ID: '{page_id}'")
    
    # Check widgets for this page
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d blue_dreams_v2 -t -c "SELECT id, type, length(data::text) as data_len FROM \\"Widget\\" WHERE \\"pageId\\"=\'{page_id}\' ORDER BY \\\"order\\\";"')
    print(f"\nWidgets for home/tr:\n{out}")
    
    # Check the widget data format
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d blue_dreams_v2 -t -c "SELECT type, substr(data::text, 1, 200) FROM \\"Widget\\" WHERE \\"pageId\\"=\'{page_id}\' ORDER BY \\\"order\\\" LIMIT 3;"')
    print(f"\nWidget data samples:\n{out}")
    
    c.close()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
