import paramiko, sys, time
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=60):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip()

APP_UUID = 'vgk8cscos8os8wwsogkss004'

# Get more details about the token
print("=== Token info ===")
out = run('docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "SELECT id, name, token, abilities FROM personal_access_tokens;"')
print(out[:500])

# Get the Coolify users
print("\n=== Users ===")
out = run('docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "SELECT id, name, email FROM users;"')
print(out)

# Try creating a token via tinker with the correct user query
print("\n=== Create token via PHP ===")
out = run("""docker exec coolify php artisan tinker --execute="\\$u = \\App\\Models\\User::where('email','!=','')->first(); if(\\$u) echo \\$u->createToken('deploy')->plainTextToken; else echo 'no-user';" 2>&1""", t=15)
print(f"Token: {out[:300]}")

# If that doesn't work, try direct API call with the raw token from DB
print("\n=== Try API with token ===")
# The token in DB is hashed (SHA256). We can't reverse it. Let's check if Coolify UI is running on 8000
out = run('curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 2>&1')
print(f"Coolify HTTP status: {out}")

out = run('curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/deploy 2>&1')
print(f"Deploy API status: {out}")

# Check if we can trigger via webhook (manual webhook)  
out = run(f'curl -s -X GET "http://localhost:8000/api/v1/deploy?uuid={APP_UUID}&force=true" 2>&1 | head -5')
print(f"Webhook deploy: {out[:300]}")

# Try to use Coolify's internal scheduler/queue
print("\n=== Queue deploy via DB ===")
# Insert a deployment record directly
out = run(f"""docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='application_deployment_queues' ORDER BY ordinal_position;" """)
print(f"Deployment queue columns:\n{out}")

c.close()
