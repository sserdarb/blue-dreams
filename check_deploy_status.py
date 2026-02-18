"""Check deploy #156 status."""
import paramiko, sys, json
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=60)

def run(cmd, t=60):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip()

# Check status
status = run("docker exec coolify-db psql -U coolify coolify -t -c \"SELECT status FROM application_deployment_queues WHERE id=156;\"").strip()
print(f"Job #156 status: {status}")

if status == 'finished':
    print("✅ Deployment SUCCEEDED!")
    # Check new container
    print("\nNew container:")
    print(run("docker ps --format '{{.ID}} {{.Names}} {{.Image}} {{.Status}}' | grep -iE 'blue|dream|sserdarb'"))
elif status == 'failed':
    print("❌ FAILED. Error logs:")
    out = run("docker exec coolify-db psql -U coolify coolify -t -c \"SELECT logs FROM application_deployment_queues WHERE id=156;\"", t=30)
    try:
        logs = json.loads(out)
        for entry in logs:
            if isinstance(entry, dict):
                line = entry.get('output','').strip()
                if line:
                    print(f"  {line}")
    except:
        print(out[-2000:])
elif status == 'in_progress':
    print("⏳ Still building...")
    # Get last few log entries
    out = run("docker exec coolify-db psql -U coolify coolify -t -c \"SELECT logs FROM application_deployment_queues WHERE id=156;\"", t=30)
    try:
        logs = json.loads(out)
        for entry in logs[-5:]:
            if isinstance(entry, dict):
                print(f"  {entry.get('output','')}")
    except:
        print(out[-500:])
else:
    print(f"Status: '{status}'")

c.close()
