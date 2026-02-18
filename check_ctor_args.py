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
    
    # PHP Code
    php_code = """
    try {
        new App\Jobs\ApplicationDeploymentJob();
    } catch (Throwable $e) {
        echo "Constructor Error: " . $e->getMessage() . "\\n";
    }
    """
    
    # Minify
    php_code_oneline = php_code.replace('\n', ' ').replace('    ', ' ').replace('"', '\\"')
    
    cmd = f'docker exec {container_id} sh -c "echo \\"{php_code_oneline}\\" | php artisan tinker"'
    
    print("\n=== Checking Constructor Arguments ===\n")
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
