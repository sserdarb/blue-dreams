import paramiko
import sys

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
    # We use App ID 5.
    # We need to fill destination_id, server_id etc from App.
    
    php_code = """
    try {
        $app = App\\Models\\Application::find(5);
        if (!$app) die("App not found");
        
        $uuid = (string) \\Illuminate\\Support\\Str::uuid();
        
        $queue = App\\Models\\ApplicationDeploymentQueue::create([
            'application_id' => $app->id,
            'application_name' => $app->name,
            'deployment_uuid' => $uuid,
            'environment_name' => 'production', // Guessing or optional
            'server_id' => $app->destination->server_id ?? 0, 
            'server_name' => 'localhost', // Metadata
            'destination_id' => $app->destination_id,
            'git_type' => 'github',
            'status' => 'queued',
            'is_manual' => true, // Might fail if column missing, remove if error
            'force_rebuild' => true,
        ]);
        
        echo "Created Queue ID: " . $queue->id . "\\n";
        
        dispatch(new App\\Jobs\\ApplicationDeploymentJob(
            application_deployment_queue_id: $queue->id
        ));
        
        echo "Dispatched Job!\\n";
        
    } catch (Throwable $e) {
        echo "Error: " . $e->getMessage() . "\\n";
        echo "Trace: " . $e->getTraceAsString() . "\\n";
    }
    """
    
    # Remove `is_manual` if it wasn't in list.
    # List: id, application_id, deployment_uuid, status, ... is_webhook, is_api...
    # I don't see is_manual. I see 'force_rebuild'.
    # I will remove 'is_manual'.
    
    php_code_safe = """
    try {
        $app = App\\Models\\Application::find(5);
        if (!$app) die("App not found");
        
        $uuid = (string) \\Illuminate\\Support\\Str::uuid();
        
        echo "App Destination ID: " . $app->destination_id . "\\n";
        
        $queue = App\\Models\\ApplicationDeploymentQueue::create([
            'application_id' => $app->id,
            'application_name' => $app->name,
            'deployment_uuid' => $uuid,
            'status' => 'queued',
            'destination_id' => $app->destination_id,
            'server_id' => 0, // Fallback, let Job handle it
            'force_rebuild' => true,
        ]);
        
        echo "Created Queue ID: " . $queue->id . "\\n";
        
        dispatch(new App\\Jobs\\ApplicationDeploymentJob(
            application_deployment_queue_id: $queue->id
        ));
        
        echo "Dispatched Job!\\n";
        
    } catch (Throwable $e) {
        echo "Error: " . $e->getMessage() . "\\n";
    }
    """
    
    # Minify
    php_code_oneline = php_code_safe.replace('\n', ' ').replace('    ', ' ').replace('"', '\\"')
    
    cmd = f'docker exec {container_id} sh -c "echo \\"{php_code_oneline}\\" | php artisan tinker"'
    
    print("\n=== Creating Queue & Dispatching ===\n")
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
