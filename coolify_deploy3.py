import paramiko, sys, time, uuid
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=60):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip()

APP_UUID = 'vgk8cscos8os8wwsogkss004'

# Get application_id and server_id
print("=== Getting app info ===")
out = run(f'docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "SELECT id, server_id, destination_id, name FROM applications WHERE uuid=\'{APP_UUID}\';"')
print(f"App info: {out}")

parts = [p.strip() for p in out.strip().split('|')]
app_id = parts[0]
server_id = parts[1]
dest_id = parts[2]
app_name = parts[3]
print(f"app_id={app_id}, server_id={server_id}, dest_id={dest_id}, name={app_name}")

# Get server name
srv = run(f'docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "SELECT name FROM servers WHERE id={server_id};"')
print(f"Server: {srv.strip()}")

# Create deployment UUID
deploy_uuid = str(uuid.uuid4())[:8]
print(f"\nDeploy UUID: {deploy_uuid}")

# Insert deployment queue entry
print("\n=== Inserting deployment queue entry ===")
insert_sql = f"""INSERT INTO application_deployment_queues 
    (application_id, deployment_uuid, pull_request_id, force_rebuild, commit, status, 
     is_webhook, created_at, updated_at, server_id, application_name, server_name, 
     destination_id, only_this_server, rollback, is_api)
VALUES 
    ({app_id}, '{deploy_uuid}', 0, true, 'HEAD', 'queued', 
     false, NOW(), NOW(), {server_id}, '{app_name}', '{srv.strip()}', 
     '{dest_id}', false, false, true)
RETURNING id, deployment_uuid, status;"""

out = run(f'docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c "{insert_sql}"')
print(f"Insert result: {out}")

if out:
    print("\n✅ Deployment queued! Coolify should pick it up shortly.")
    # Wait a bit and check status
    time.sleep(10)
    out = run(f"docker exec 7b196ff456e5 psql -U coolify -d coolify -t -c \"SELECT status, logs FROM application_deployment_queues WHERE deployment_uuid='{deploy_uuid}';\"")
    print(f"\nDeployment status: {out[:300]}")
else:
    print("\n❌ Insert failed")

c.close()
