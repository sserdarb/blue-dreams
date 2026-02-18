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
            'server_id' => 0, 
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
    
    # Minify and ESCAPE for shell
    # 1. Newlines to spaces
    # 2. Double quotes escaped for shell echo
    # 3. Dollar signs escaped for shell interpolation
    php_code_oneline = php_code_safe.replace('\n', ' ').replace('    ', ' ')
    php_code_oneline = php_code_oneline.replace('"', '\\"').replace('$', '\\$')
    
    # Use single quotes for the echo command to avoid some interpolation, but we have single quotes in PHP code
    # Using double quotes for outer echo is safer if we escaped internal " and $
    
    cmd = f'docker exec {container_id} sh -c "echo \\"{php_code_oneline}\\" | php artisan tinker"'
    
    print("\n=== Creating Queue & Dispatching (Fixed) ===\n")
    stdin, stdout, stderr = c.exec_command(cmd)
    output = stdout.read().decode()
    print(output)
    
    # Check if successful
    if "Dispatched Job" in output:
        print("SUCCESS: Job Dispatched.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
