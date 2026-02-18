import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8')
CID = '48466875cb9e'

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=60, look_for_keys=False, allow_agent=False)
c.get_transport().set_keepalive(15)

def run(cmd, t=30):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8','replace').strip()

# Container status
st = run(f'docker ps -a --filter "id={CID}" --format "{{{{.Status}}}}"')
print(f"Container status: {st}", flush=True)

# Start if needed
if 'Up' not in st:
    print("Starting container...", flush=True)
    run(f'docker start {CID}', t=10)
    import time; time.sleep(5)
    st = run(f'docker ps -a --filter "id={CID}" --format "{{{{.Status}}}}"')
    print(f"After start: {st}", flush=True)

# Check build log for errors
print("\n=== BUILD LOG (last 40 lines) ===", flush=True)
log = run('tail -40 /tmp/inplace_build.txt 2>/dev/null')
print(log, flush=True)

# Check if source files were injected
print("\n=== Check injected files ===", flush=True)
rbw = run(f'docker exec {CID} ls -la /app/components/widgets/RoomBookingWidget.tsx 2>/dev/null || echo "NOT FOUND"')
print(f"RoomBookingWidget.tsx: {rbw}", flush=True)
wr = run(f'docker exec {CID} ls -la /app/components/widgets/WidgetRenderer.tsx 2>/dev/null || echo "NOT FOUND"')
print(f"WidgetRenderer.tsx: {wr}", flush=True)

# Check BUILD_ID
bid = run(f'docker exec {CID} cat /app/.next/BUILD_ID 2>/dev/null || echo NO_BUILD')
print(f"\nBUILD_ID: {bid}", flush=True)

c.close()
print("\nDone!", flush=True)
