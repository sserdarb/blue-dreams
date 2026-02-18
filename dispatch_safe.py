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
    
    # PHP Script - Corrected fields
    php_code = """
    try {
        $app = App\\Models\\Application::find(5);
        if (!$app) {
            fwrite(STDERR, "App not found\\n");
            exit(1);
        }
        
        fwrite(STDERR, "Found App: " . $app->name . "\\n");
        
        $uuid = (string) \\Illuminate\\Support\\Str::uuid();
        
        // Ensure fillable
        $queue = App\\Models\\ApplicationDeploymentQueue::create([
            'application_id' => $app->id,
            'application_name' => $app->name,
            'deployment_uuid' => $uuid,
            'status' => 'queued',
            'destination_id' => $app->destination_id,
            'server_id' => 0, 
            'force_rebuild' => true,
            'commit' => 'HEAD', // Explicitly set commit
            // 'is_manual' => true, REMOVED
        ]);
        
        fwrite(STDERR, "Created Queue ID: " . $queue->id . "\\n");
        
        dispatch(new App\\Jobs\\ApplicationDeploymentJob(
            application_deployment_queue_id: $queue->id
        ));
        
        fwrite(STDERR, "SUCCESS: Job Dispatched with Queue ID " . $queue->id . "\\n");
        
    } catch (Throwable $e) {
        fwrite(STDERR, "Error: " . $e->getMessage() . "\\n");
        fwrite(STDERR, "Trace: " . $e->getTraceAsString() . "\\n");
    }
    """
    
    # Encode
    b64_code = base64.b64encode(php_code.encode('utf-8')).decode('utf-8')
    
    print("\n=== Executing Script (Safe Mode) ===\n")
    
    # Write to file
    cmd = f'docker exec {container_id} sh -c "echo {b64_code} | base64 -d > /tmp/dispatch_safe.php"'
    c.exec_command(cmd)
    
    # Run tinker
    cmd = f'docker exec {container_id} sh -c "cat /tmp/dispatch_safe.php | php artisan tinker"'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode()) # We wrote to stderr in PHP for visibility

    c.close()

except Exception as e:
    print(f"Error: {e}")
