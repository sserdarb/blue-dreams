import paramiko
import sys
import time
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

results = []

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    results.append(f"Container: {cid}")
    
    # Test the /api/ai/chat endpoint
    results.append("\n=== Testing /api/ai/chat ===")
    test_payload = json.dumps({
        "messages": [{"role": "user", "text": "Merhaba"}],
        "locale": "tr"
    })
    out, _ = run(c, f"""docker exec {cid} curl -s -X POST "http://localhost:3000/api/ai/chat" -H "Content-Type: application/json" -d '{test_payload}' 2>&1""", timeout=30)
    results.append(f"Response: {out[:1000]}")
    
    # Check if GEMINI_API_KEY env is set
    results.append("\n=== Checking GEMINI_API_KEY ===")
    out, _ = run(c, f'docker exec {cid} printenv GEMINI_API_KEY 2>&1')
    results.append(f"Env GEMINI_API_KEY: {'SET: ' + out[:20] + '...' if out else 'NOT SET'}")
    
    # Check aiSettings table
    db_cid = '7b196ff456e5'
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d blue_dreams_v2 -t -c "SELECT id, language, LEFT(\\"apiKey\\", 20) as key_prefix, LEFT(\\"systemPrompt\\", 50) as prompt FROM \\"AiSettings\\";"')
    results.append(f"\nAiSettings table:\n{out}")
    
    # Check container logs for the error 
    results.append("\n=== Recent AI-related logs ===")
    out, _ = run(c, f'docker logs {cid} --tail 30 2>&1 | grep -i "ai\\|error\\|gemini\\|chat"')
    results.append(out or "No AI-related logs found")
    
    c.close()
    
    result_text = '\n'.join(results)
    with open('concierge_test.txt', 'w', encoding='utf-8') as f:
        f.write(result_text)
    print(result_text[:3000])

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
