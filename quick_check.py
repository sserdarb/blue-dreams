import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8')
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=60, look_for_keys=False, allow_agent=False)
c.get_transport().set_keepalive(15)
CID = '15609eb83e88'

def run(cmd, t=30):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8','replace').strip()

# Full list of all Can't resolve errors
print("=== ALL WEBPACK ERRORS ===", flush=True)
out = run("cat /tmp/inplace_build.txt 2>/dev/null | grep -E 'Module not found|resolve' | head -20")
print(out, flush=True)

# Check recharts
print("\n=== RECHARTS CHECK ===", flush=True)
out = run(f'docker exec {CID} ls /app/node_modules/recharts/package.json 2>/dev/null && echo FOUND || echo NOT_FOUND')
print(f"recharts: {out}", flush=True)

# Check tsconfig @ alias
print("\n=== TSCONFIG ===", flush=True)
out = run(f'docker exec {CID} cat /app/tsconfig.json 2>/dev/null')
print(out, flush=True)

# Check file size on container
print("\n=== ANALYTICS FILE SIZES ===", flush=True)
out = run(f'docker exec {CID} wc -c /app/components/admin/analytics/*.tsx 2>/dev/null')
print(out, flush=True)

c.close()
