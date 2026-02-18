import paramiko, sys, json
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

CNAME = 'vgk8cscos8os8wwsogkss004-222918143524'

def run(cmd, t=30):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

# Session cookie for superadmin
COOKIE = 'admin_session=%7B%22email%22%3A%22sserdarb%40gmail.com%22%2C%22role%22%3A%22superadmin%22%2C%22name%22%3A%22Admin%22%7D'

# Test 1: List existing users
print("=== Test 1: List Users ===")
o, _ = run(f'docker exec {CNAME} curl -s "http://localhost:3000/api/admin/users" -H "Cookie: {COOKIE}" 2>&1 | head -c 500')
print(f"Result: {o[:400]}")

# Test 2: Create a new user via API
print("\n=== Test 2: Create User ===")
o, _ = run(f'''docker exec {CNAME} curl -s -X POST "http://localhost:3000/api/admin/users" \
  -H "Cookie: {COOKIE}" \
  -H "Content-Type: application/json" \
  -d '{{"email":"testapi@bluedreams.com","password":"Test123456","name":"Test API User","role":"admin"}}' 2>&1''')
print(f"Result: {o[:400]}")

try:
    result = json.loads(o)
    if result.get('id'):
        user_id = result['id']
        print(f"Created user ID: {user_id}")
    elif result.get('error'):
        print(f"Error: {result['error']}")
except:
    print(f"Could not parse: {o[:200]}")

# Test 3: Verify user in DB
print("\n=== Test 3: Check DB ===")
o, _ = run('''docker exec coolify-db psql -U coolify -d blue_dreams_v2 -c "SELECT email, \\\"isActive\\\", substring(password,1,15) as pwd FROM \\\"AdminUser\\\";" 2>&1''')
print(f"DB:\n{o}")

# Test 4: Test login with the new user
print("\n=== Test 4: Login with new user ===")
o, _ = run(f'''docker exec {CNAME} curl -s -v -X POST "http://localhost:3000/tr/admin/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=testapi@bluedreams.com&password=Test123456" 2>&1 | head -c 500''')
print(f"Login result:\n{o[:400]}")

# Test 5: Check container logs for any errors
print("\n=== Test 5: Recent logs ===")
o, _ = run(f'docker logs {CNAME} --tail 5 2>&1')
print(f"Logs:\n{o}")

c.close()
