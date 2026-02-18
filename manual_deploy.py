import paramiko
import sys
import base64
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    coolify_container = '3fe99f2525ce'
    db_container = '7b196ff456e5'
    
    # Step 1: Create Queue Entry directly in DB
    print("\n=== Creating Deployment Queue Entry ===")
    sql = """
    INSERT INTO application_deployment_queues 
    (application_id, deployment_uuid, force_rebuild, status, created_at, updated_at)
    VALUES 
    (5, gen_random_uuid(), true, 'queued', NOW(), NOW())
    RETURNING id, deployment_uuid;
    """
    cmd = f'docker exec {db_container} psql -U coolify -d coolify -c "{sql}"'
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode()
    print("Queue Created:", out)
    
    # Extract queue ID
    lines = [l.strip() for l in out.strip().split('\n') if '|' in l and 'id' not in l.lower()]
    queue_id = None
    if lines:
        parts = lines[0].split('|')
        queue_id = parts[0].strip()
        print(f"Queue ID: {queue_id}")
    
    if queue_id:
        # Step 2: Dispatch Job via PHP
        print("\n=== Dispatching Job ===")
        php_code = f"""
        <?php
        require '/var/www/html/vendor/autoload.php';
        $app = require_once '/var/www/html/bootstrap/app.php';
        $kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
        $kernel->bootstrap();
        
        use App\\Models\\ApplicationDeploymentQueue;
        use App\\Jobs\\ApplicationDeploymentJob;
        
        $queue = ApplicationDeploymentQueue::find({queue_id});
        if ($queue) {{
            dispatch(new ApplicationDeploymentJob(application_deployment_queue: $queue));
            echo "Dispatched! Queue ID: {queue_id}";
        }} else {{
            echo "Queue {queue_id} not found";
        }}
        """
        
        b64_php = base64.b64encode(php_code.encode('utf-8')).decode('utf-8')
        
        cmd = f'docker exec {coolify_container} sh -c "echo {b64_php} | base64 -d > /tmp/dispatch_now.php"'
        c.exec_command(cmd)
        
        cmd = f'docker exec {coolify_container} php /tmp/dispatch_now.php'
        stdin, stdout, stderr = c.exec_command(cmd)
        print("STDOUT:", stdout.read().decode())
        print("STDERR:", stderr.read().decode())
        
        # Step 3: Monitor
        print("\n=== Monitoring Build ===")
        for i in range(60):
            cmd = f'docker exec {db_container} psql -U coolify -d coolify -t -c "SELECT status FROM application_deployment_queues WHERE id = {queue_id}"'
            stdin, stdout, stderr = c.exec_command(cmd)
            status = stdout.read().decode().strip()
            print(f"[{i}] Status: {status}")
            
            if status in ('finished', 'failed'):
                print(f"\nBuild {status}!")
                break
            time.sleep(5)
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
