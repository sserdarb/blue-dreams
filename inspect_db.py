import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

output_lines = []

def run(cmd, timeout=15):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    # Find container
    out, _ = run('docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    output_lines.append(f"Container: {cid}")
    
    # Check tables
    out, err = run(f'docker exec {cid} sqlite3 /app/data/database.sqlite ".tables"')
    output_lines.append(f"Tables: {out}")
    if err:
        output_lines.append(f"Tables Error: {err}")
    
    # Get schema
    out, _ = run(f'docker exec {cid} sqlite3 /app/data/database.sqlite ".schema"')
    output_lines.append(f"Schema:\n{out}")
    
    # Count pages
    out, err = run(f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT COUNT(*) FROM Page;"')
    output_lines.append(f"Page count: {out}")
    
    # List pages
    out, _ = run(f'docker exec {cid} sqlite3 -header -column /app/data/database.sqlite "SELECT id, slug, locale, title FROM Page LIMIT 20;"')
    output_lines.append(f"Pages:\n{out}")
    
    # Count widgets
    out, _ = run(f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT COUNT(*) FROM Widget;"')
    output_lines.append(f"Widget count: {out}")
    
    # List widgets
    out, _ = run(f'docker exec {cid} sqlite3 -header -column /app/data/database.sqlite "SELECT id, type, pageId FROM Widget LIMIT 20;"')
    output_lines.append(f"Widgets:\n{out}")
    
    # Check other tables
    for table in ['Admin', 'Setting', 'MenuItem', 'CtaBar', 'Room', 'Activity']:
        out, err = run(f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT COUNT(*) FROM {table};" 2>&1')
        output_lines.append(f"{table} count: {out}")
    
    c.close()
    
    result = '\n'.join(output_lines)
    with open('db_state.txt', 'w', encoding='utf-8') as f:
        f.write(result)
    print(result)

except Exception as e:
    print(f"Error: {e}")
