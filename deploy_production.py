import paramiko
import base64
import time
import os
import uuid

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = os.getenv('SSH_PASSWORD')

# Create a new deployment job by cloning the latest one for Application ID 5
# application_id 5 matches 'sserdarb/blue-dreams' (Next.js)
CLONE_SQL = """
INSERT INTO application_deployment_queues (application_id, server_id, deployment_uuid, status, logs, created_at, updated_at, commit, git_type)
SELECT application_id, server_id, '{}', 'queued', '[]', NOW(), NOW(), 'HEAD', git_type
FROM application_deployment_queues 
WHERE application_id = '5' 
ORDER BY id DESC 
LIMIT 1 
RETURNING id;
"""

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
    if not PASSWORD:
        print("Error: SSH_PASSWORD environment variable is not set.")
        return

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {SERVER}...")
        client.connect(SERVER, username=USER, password=PASSWORD)
        
        deploy_uuid = str(uuid.uuid4())
        print(f"Triggering deployment {deploy_uuid}...")
        
        # Insert job
        sql = CLONE_SQL.format(deploy_uuid)
        out, err = run_remote(client, f'docker exec coolify-db psql -U coolify coolify -c "{sql}"')
        print(f"  DB Insert Result: {out}")
        if err: print(f"  DB Insert Err: {err}")
        
        time.sleep(2)
        
        # Dispatch via Tinker
        b64 = base64.b64encode(DISPATCH_PHP.encode()).decode()
        print("Dispatching job via Coolify Tinker...")
        cmd = f"echo '{b64}' | base64 -d | docker exec -i coolify php artisan tinker"
        out, err = run_remote(client, cmd, timeout=30)
        print(f"  Dispatch Result: {out}")
        
        print("\n✅ Deployment triggered successfully.")
        print("The build process usually takes 2-5 minutes.")
        print("Once the new container is running, execute 'python seed_remote.py' to create the admin user.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
