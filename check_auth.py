import paramiko, sys, time, json
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

CNAME = 'vgk8cscos8os8wwsogkss004-222918143524'

# Step 1: Check container status
st, _ = run(f'docker ps --filter "name={CNAME}" --format "{{{{.Status}}}}"')
print(f"Container: {st}")

# Step 2: Check if AdminUser table exists
print("\n=== Check AdminUser table ===")
out, _ = run(f'''docker exec {CNAME} npx prisma db execute --stdin 2>&1 <<'EOF'
SELECT table_name FROM information_schema.tables WHERE table_name = 'AdminUser';
EOF''', t=15)
print(f"Table check: {out}")

# Alternative: check via psql directly
out, _ = run('''docker exec coolify-db psql -U coolify -d blue_dreams_v2 -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='AdminUser';" 2>&1''', t=10)
print(f"Direct DB check: {out}")

# Step 3: If table doesn't exist, run prisma db push
if 'AdminUser' not in out:
    print("\n⚠️ AdminUser table NOT found! Running prisma db push...")
    out, _ = run(f'docker exec -w /app {CNAME} npx prisma db push --accept-data-loss 2>&1', t=60)
    print(f"Push: {out[-300:]}")
    
    # Re-check
    out, _ = run('''docker exec coolify-db psql -U coolify -d blue_dreams_v2 -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='AdminUser';" 2>&1''', t=10)
    print(f"After push: {out}")
else:
    print("✅ AdminUser table exists")

# Step 4: List existing users
out, _ = run('''docker exec coolify-db psql -U coolify -d blue_dreams_v2 -c "SELECT id, email, name, role, \\\"isActive\\\" FROM \\\"AdminUser\\\";" 2>&1''', t=10)
print(f"\nExisting users:\n{out}")

# Step 5: Test API - create a test user
print("\n=== Test: Create user via API ===")
out, _ = run(f'''docker exec {CNAME} curl -s -X POST "http://localhost:3000/api/admin/users" \
    -H "Content-Type: application/json" \
    -H "Cookie: admin_session=%7B%22email%22%3A%22sserdarb%40gmail.com%22%2C%22role%22%3A%22superadmin%22%2C%22name%22%3A%22Admin%22%7D" \
    -d '{{"email":"test@test.com","password":"test123","name":"Test User","role":"admin"}}' 2>&1''', t=15)
print(f"Create: {out}")

# Step 6: Test login with that user
print("\n=== Test: Login with created user ===")
out, _ = run(f'''docker exec {CNAME} curl -s -X POST "http://localhost:3000/tr/admin/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=test@test.com&password=test123" 2>&1 | head -c 500''', t=15)
print(f"Login response: {out[:300]}")

# Step 7: Verify the user was actually stored
out, _ = run('''docker exec coolify-db psql -U coolify -d blue_dreams_v2 -c "SELECT id, email, name, role, \\\"isActive\\\", password FROM \\\"AdminUser\\\";" 2>&1''', t=10)
print(f"\nAll users after test:\n{out}")

# Step 8: Clean up test user
run('''docker exec coolify-db psql -U coolify -d blue_dreams_v2 -c "DELETE FROM \\\"AdminUser\\\" WHERE email='test@test.com';" 2>&1''')

# Step 9: Check container logs for errors
print("\n=== Recent container logs ===")
logs, _ = run(f'docker logs {CNAME} --tail 10 2>&1')
print(logs)

c.close()
