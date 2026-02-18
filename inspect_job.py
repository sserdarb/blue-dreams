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
    
    # PHP code to run in tinker
    php_code = """
    $r = new ReflectionClass('App\Jobs\ApplicationDeploymentJob');
    $c = $r->getConstructor();
    foreach ($c->getParameters() as $p) {
        echo $p->getName() . ' (' . ($p->getType() ? $p->getType()->getName() : 'mixed') . ')\\n';
    }
    """
    # Remove newlines for cleaner command line execution or pass as input
    # Best way: echo "CODE" | php artisan tinker
    
    # We need to escape quotes in php_code for shell
    # Use simple quote for php code, single quotes for shell
    
    # Clean up code for one-liner
    php_code_oneline = "$r = new ReflectionClass('App\\\\Jobs\\\\ApplicationDeploymentJob'); $c = $r->getConstructor(); foreach ($c->getParameters() as $p) { echo $p->getName() . ' (' . ($p->getType() ? $p->getType()->getName() : 'mixed') . ') '; }"
    
    cmd = f'docker exec {container_id} sh -c "echo \\"{php_code_oneline}\\" | php artisan tinker"'
    
    print("\n=== Inspeting Constructor ===\n")
    stdin, stdout, stderr = c.exec_command(cmd)
    print(stdout.read().decode())
    print(stderr.read().decode())

    c.close()

except Exception as e:
    print(f"Error: {e}")
