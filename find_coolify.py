import paramiko, sys, time
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=60):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip()

# Find the Coolify application UUID and webhook
print("=== Looking for Coolify API ===")

# Check Coolify database for application info
db = run('docker ps --filter "name=coolify-db" --format "{{.ID}} {{.Names}}"')
print(f"Coolify DB containers: {db}")

# Find Coolify containers
cool = run('docker ps --filter "name=coolify" --format "{{.ID}} {{.Names}} {{.Status}}"')
print(f"\nCoolify containers:\n{cool}")

# Find the application UUID from Coolify DB
print("\n=== Application UUID ===")
out = run('docker exec $(docker ps -q --filter "name=coolify-db") psql -U coolify -d coolify -t -c "SELECT uuid, name, fqdn FROM applications WHERE name LIKE \'%blue%\' OR fqdn LIKE \'%blue%\' OR name LIKE \'%vgk8%\';"')
print(f"App: {out}")

# Also check by looking for webhook endpoints  
print("\n=== Webhook info ===")
out = run('docker exec $(docker ps -q --filter "name=coolify-db") psql -U coolify -d coolify -t -c "SELECT uuid, manual_webhook_secret_github, git_branch FROM applications LIMIT 5;"')
print(f"Webhooks:\n{out}")

# Try to trigger rebuild via Coolify API
print("\n=== Checking Coolify API ===")
out = run('curl -s http://localhost:8000/api/v1/deploy 2>&1 | head -5')
print(f"API test: {out}")

# Check for Coolify env or tokens
out = run('docker exec $(docker ps -q --filter "name=coolify") env | grep -i "api\\|token\\|key" | head -5 2>/dev/null')
print(f"\nCoolify env: {out}")

c.close()
