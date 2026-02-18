import paramiko
import sys
import json

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
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    
    # Test the chat API
    test_payload = json.dumps({"messages": [{"role": "user", "text": "Merhaba"}], "locale": "tr"})
    out, _ = run(c, f"""docker exec {cid} curl -s -X POST "http://localhost:3000/api/ai/chat" -H "Content-Type: application/json" -d '{test_payload}' 2>&1""", timeout=30)
    print(f"Chat response: {out}")
    
    # Get full container logs after this request
    print("\n=== Container logs (last 30 lines) ===")
    out, _ = run(c, f'docker logs {cid} --tail 30 2>&1')
    print(out)
    
    # Check if the prisma schema has Room, Dining, AiSettings models
    db_cid = '7b196ff456e5'
    print("\n=== Check DB tables ===")
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d blue_dreams_v2 -t -c "SELECT tablename FROM pg_tables WHERE schemaname=\'public\' ORDER BY tablename;"')
    print(out)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
