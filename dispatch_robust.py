import paramiko
import sys
import base64

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    container_id = '3fe99f2525ce'
    
    # PHP Script
    # Ensure correct namespace and variable usage
    php_code = """
    try {
        $app = App\\Models\\Application::find(5);
        if (!$app) {
            echo "App not found\\n";
        } else {
            echo "Found App: " . $app->name . "\\n";
            echo "Destination ID: " . $app->destination_id . "\\n";
            
            $uuid = (string) \\Illuminate\\Support\\Str::uuid();
            
            // Create Queue
            $queue = App\\Models\\ApplicationDeploymentQueue::create([
                'application_id' => $app->id,
                'application_name' => $app->name,
                'deployment_uuid' => $uuid,
                'status' => 'queued',
                'destination_id' => $app->destination_id,
                'server_id' => 0, 
                'force_rebuild' => true,
                'is_manual' => true, // Attempt valid column if exists in model parsing
            ]);
            
            echo "Created Queue ID: " . $queue->id . "\\n";
            
            // Dispatch
            dispatch(new App\\Jobs\\ApplicationDeploymentJob(
                application_deployment_queue_id: $queue->id
            ));
            
            echo "SUCCESS: Job Dispatched with Queue ID " . $queue->id . "\\n";
        }
    } catch (Throwable $e) {
        echo "Error: " . $e->getMessage() . "\\n";
    }
    """
    
    # Encode
    b64_code = base64.b64encode(php_code.encode('utf-8')).decode('utf-8')
    
    # Upload and Run
    print("\n=== Uploading and Executing Script ===\n")
    
    # 1. Write B64 to file inside container, decode it
    cmd = f'docker exec {container_id} sh -c "echo {b64_code} | base64 -d > /tmp/dispatch_job.php"'
    c.exec_command(cmd)
    
    # 2. Run tinker
    cmd = f'docker exec {container_id} sh -c "cat /tmp/dispatch_job.php | php artisan tinker"'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    output = stdout.read().decode()
    print(output)
    
    if "SUCCESS: Job Dispatched" in output:
        print("\nDeployment Triggered Successfully!")
        
        # Check logs immediately
        print("\n=== Checking Logs (Last 50) ===")
        cmd = f'docker logs --tail 50 {container_id}'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(stderr.read().decode()) # Coolify logs to stderr usually

    c.close()

except Exception as e:
    print(f"Error: {e}")
