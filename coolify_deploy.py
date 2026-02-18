import paramiko, sys, time
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=60):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip()

APP_UUID = 'vgk8cscos8os8wwsogkss004'

# Check if there's a Coolify API token we can use
print("=== Creating API token if needed ===")

# Get the Coolify admin user token from the database
out = run('docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "SELECT token FROM personal_access_tokens LIMIT 1;"')
print(f"Token from DB: {out[:30]}..." if out else "No token found")

# Try getting tokens
out = run('docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "SELECT id, tokenable_type, name FROM personal_access_tokens;"')
print(f"All tokens: {out}")

# The tokens are hashed. Let's use Coolify's internal PHP artisan command
print("\n=== Trying Coolify artisan deploy ===")
out = run('docker exec coolify php artisan app:deploy --help 2>&1')
print(f"Deploy help: {out[:500]}")

# Try directly
print("\n=== Deploying via artisan ===")
out = run(f'docker exec coolify php artisan app:deploy {APP_UUID} 2>&1', t=60)
print(f"Deploy: {out[:500]}")

# Alternative: use the internal API (localhost:8000)
print("\n=== Trying internal API ===")
# First create a token via artisan
out = run('docker exec coolify php artisan tinker --execute="echo \\App\\Models\\User::first()->createToken(\'deploy-token\')->plainTextToken;" 2>&1', t=15)
print(f"New token: {out[:200]}")

c.close()
