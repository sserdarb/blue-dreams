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
    
    app_container = '3fe99f2525ce' # Coolify
    
    php_code = f"""
    <?php
    require '/var/www/html/vendor/autoload.php';
    $app = require_once '/var/www/html/bootstrap/app.php';
    $kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
    $kernel->bootstrap();
    
    use App\\Models\\Application;
    use App\\Models\\ApplicationDeploymentQueue;
    use App\\Jobs\\ApplicationDeploymentJob;
    use Illuminate\\Support\\Str;
    
    $app = Application::where('git_repository', 'like', '%blue-dreams%')->first();
    if (!$app) {{
        $app = Application::find(5);
    }}
    
    if ($app) {{
        echo "Found App ID: " . $app->id . "\\n";
        
        $queue = ApplicationDeploymentQueue::create([
            'application_id' => $app->id,
            'deployment_uuid' => Str::uuid(),
            'force_rebuild' => true,
            'status' => 'queued',
        ]);
        
        dispatch(new ApplicationDeploymentJob(
            application_deployment_queue: $queue
        ));
        
        echo "Dispatched Deployment! Queue ID: " . $queue->id . "\\n";
    }} else {{
        echo "App not found.";
    }}
    """
    
    b64_php = base64.b64encode(php_code.encode('utf-8')).decode('utf-8')
    
    cmd = f'docker exec {app_container} sh -c "echo {b64_php} | base64 -d > /tmp/dispatch_verbose.php"'
    c.exec_command(cmd)
    
    cmd = f'docker exec {app_container} php /tmp/dispatch_verbose.php'
    stdin, stdout, stderr = c.exec_command(cmd)
    
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
