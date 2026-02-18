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
    
    # PHP Code to test dispatch
    # Using 'uuid' 'vgk8cscos8os8wwsogkss00' (from previous steps)
    
    php_code = """
    try {
        $app = App\Models\Application::where('uuid', 'vgk8cscos8os8wwsogkss00')->first();
        if (!$app) {
            echo "App not found\\n";
        } else {
            echo "Found App: " . $app->name . "\\n";
            // Try dispatching with just App
            dispatch(new App\Jobs\ApplicationDeploymentJob(
                application_deployment_queue_id: 'test' 
            ));
            // Wait, assume arg name? No, just try positionals
            // Try with App model first
            // dispatch(new App\Jobs\ApplicationDeploymentJob($app));
        }
    } catch (Throwable $e) {
        echo "Error: " . $e->getMessage() . "\\n";
    }
    """
    
    # Let's try passing the App model first.
    php_code_model = """
    try {
        $app = App\Models\Application::where('uuid', 'vgk8cscos8os8wwsogkss00')->first();
        echo "Found App: " . ($app ? $app->name : 'No') . "\\n";
        if ($app) {
             dispatch(new App\Jobs\ApplicationDeploymentJob($app));
             echo "Dispatched with Model!\\n";
        }
    } catch (Throwable $e) {
        echo "Error (Model): " . $e->getMessage() . "\\n";
    }
    """
    
    # Minify
    php_code_oneline = php_code_model.replace('\n', ' ').replace('    ', ' ').replace('"', '\\"')
    
    cmd = f'docker exec {container_id} sh -c "echo \\"{php_code_oneline}\\" | php artisan tinker"'
    
    print("\n=== Trying Dispatch (Model) ===\n")
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
