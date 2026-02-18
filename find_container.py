"""Find the actual Next.js Blue Dreams container."""
import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=60)

def run(cmd, t=30):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip()

# List ALL running containers with details
print("=== ALL running containers ===")
containers = run("docker ps --format '{{.ID}}'").split('\n')

for cid in containers:
    cid = cid.strip()
    if not cid:
        continue
    name = run(f"docker inspect {cid} --format '{{{{.Name}}}}'").strip('/')
    image = run(f"docker inspect {cid} --format '{{{{.Config.Image}}}}'")
    cmd = run(f"docker inspect {cid} --format '{{{{.Config.Cmd}}}}'")
    status = run(f"docker ps --filter id={cid} --format '{{{{.Status}}}}'")
    
    # Check if it has node/npm/next
    has_next = run(f"docker exec {cid} ls /app/.next/BUILD_ID 2>/dev/null") != ''
    has_node = run(f"docker exec {cid} which node 2>/dev/null") != ''
    has_server_js = run(f"docker exec {cid} ls /app/server.js 2>/dev/null") != ''
    
    markers = []
    if has_next: markers.append('NEXT.JS')
    if has_node: markers.append('NODE')
    if has_server_js: markers.append('server.js')
    
    print(f"\n  {cid[:12]} | {name[:40]} | {image[:30]}")
    print(f"    Status: {status}")
    print(f"    Cmd: {cmd[:60]}")
    if markers:
        print(f"    ★ Markers: {', '.join(markers)}")

c.close()
