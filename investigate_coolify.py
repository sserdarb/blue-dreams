import paramiko, sys, time, json
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=60):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

print("=== 1. Container Status ===")
out, _ = run('docker ps -a --filter "name=vgk8" --format "{{.ID}} {{.Status}} {{.Image}}"')
print(out)
cid = out.split()[0] if out else ''

print("\n=== 2. Coolify Web UI Port ===")
# Check what port Coolify is listening on
out, _ = run('docker inspect coolify --format "{{json .NetworkSettings.Ports}}" 2>/dev/null')
print(f"Coolify ports: {out[:300]}")

# Check if Coolify has a web port mapped
out, _ = run('docker port coolify 2>/dev/null')
print(f"Port mappings: {out}")

# Try accessing Coolify on common ports
for port in [8000, 80, 3000, 443]:
    out, _ = run(f'curl -s -o /dev/null -w "%{{http_code}}" --max-time 3 http://localhost:{port} 2>&1')
    print(f"  Port {port}: {out}")

print("\n=== 3. Coolify Start Command ===")
out, _ = run('docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "SELECT start_command FROM applications WHERE uuid=\'vgk8cscos8os8wwsogkss004\';"')
print(f"Current: {out.strip()}")

print("\n=== 4. Coolify Build Command ===")
out, _ = run('docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "SELECT build_command FROM applications WHERE uuid=\'vgk8cscos8os8wwsogkss004\';"')
print(f"Build cmd: {out.strip()}")

print("\n=== 5. Application deploy info ===")
out, _ = run('docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "SELECT id, server_id, destination_id, git_repository, git_branch, git_commit_sha FROM applications WHERE uuid=\'vgk8cscos8os8wwsogkss004\';"')
print(f"App info: {out.strip()}")

# Check if there's a way to trigger deploy via Coolify CLI/artisan
print("\n=== 6. Coolify artisan commands ===")
out, _ = run('docker exec coolify php artisan list 2>/dev/null | grep -i "deploy\\|queue\\|dispatch"')
print(f"Deploy cmds: {out}")

print("\n=== 7. Coolify Horizon/Queue ===")
out, _ = run('docker exec coolify php artisan queue:list 2>/dev/null | head -5')
print(f"Queue: {out}")

c.close()
