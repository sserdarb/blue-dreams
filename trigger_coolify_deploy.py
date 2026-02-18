import paramiko
import base64
import time

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

# Clone from successful job 142, using SQL INSERT (KI-documented pattern)
# Then dispatch via Tinker
CLONE_SQL = """INSERT INTO application_deployment_queues (application_id, server_id, deployment_uuid, commit, force_rebuild, status, is_webhook, git_type, created_at, updated_at) SELECT application_id, server_id, gen_random_uuid()::text, 'main', true, 'queued', false, git_type, NOW(), NOW() FROM application_deployment_queues WHERE id = 142 RETURNING id, status;"""

DISPATCH_PHP = r"""
$latestJob = App\Models\ApplicationDeploymentQueue::where('status', 'queued')->orderBy('id', 'desc')->first();
if ($latestJob) {
    dispatch(new App\Jobs\ApplicationDeploymentJob($latestJob->id));
    echo 'Dispatched job ' . $latestJob->id;
} else {
    echo 'No queued job found';
}
"""

def run_remote(client, cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    return out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print(f"Connecting to {SERVER}...")
        client.connect(SERVER, username=USER, password=PASSWORD)
        
        # First, delete the stuck queued job 145
        print("Cleaning up stuck job 145...")
        run_remote(client, 'docker exec coolify-db psql -U coolify coolify -c "DELETE FROM application_deployment_queues WHERE id=145;"')
        
        # Clone job 142 (known successful) with new commit
        print("\nCloning successful job 142...")
        out, err = run_remote(client, f'docker exec coolify-db psql -U coolify coolify -c "{CLONE_SQL}"')
        print(f"  Result: {out}")
        if err: print(f"  Err: {err[:200]}")
        
        time.sleep(2)
        
        # Check what we created
        print("\n=== Latest jobs ===")
        out, _ = run_remote(client, 'docker exec coolify-db psql -U coolify coolify -t -c "SELECT id, status, server_id FROM application_deployment_queues ORDER BY id DESC LIMIT 3;"')
        print(out)
        
        # Now dispatch via Tinker
        b64 = base64.b64encode(DISPATCH_PHP.encode()).decode()
        print("\nDispatching via Tinker...")
        cmd = f"echo '{b64}' | base64 -d | docker exec -i coolify php artisan tinker"
        out, err = run_remote(client, cmd, timeout=30)
        print(f"  Output: {out[:500]}")
        
        time.sleep(5)
        
        # Check status
        print("\n=== Status ===")
        out, _ = run_remote(client, 'docker exec coolify-db psql -U coolify coolify -t -c "SELECT id, status FROM application_deployment_queues ORDER BY id DESC LIMIT 3;"')
        print(out)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
