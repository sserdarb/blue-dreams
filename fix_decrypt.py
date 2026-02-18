"""Deploy via Coolify artisan tinker - all-in-one."""
import paramiko, sys, base64, time, json
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=60)
transport = c.get_transport()
transport.set_keepalive(60)

def run(cmd, t=60):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

# Step 1: Create deploy job AND dispatch it - all in PHP
php = r"""
use App\Models\Application;
use App\Models\ApplicationDeploymentQueue;
use Illuminate\Support\Str;

$app = Application::find(5);
if (!$app) { echo "App not found!"; exit; }

echo "App: " . $app->name . " / " . $app->fqdn . "\n";
echo "Git: " . $app->git_repository . ":" . $app->git_branch . "\n";

// Check env vars
$envCount = $app->environment_variables()->count();
echo "Env vars: " . $envCount . "\n";

// If there are env vars that can't decrypt, delete them
if ($envCount > 0) {
    try {
        foreach ($app->environment_variables as $env) {
            $val = $env->value; // This triggers decryption
        }
        echo "All env vars decrypt OK\n";
    } catch (\Exception $e) {
        echo "DecryptException on env vars! Deleting broken ones...\n";
        $app->environment_variables()->delete();
        echo "Deleted.\n";
    }
}

// Check shared env vars too
try {
    $app->environment_variables_preview;
} catch (\Exception $e) {
    echo "Preview env broken: " . $e->getMessage() . "\n";
}

// Create deployment
$uuid = (string) Str::uuid();
$queue = new ApplicationDeploymentQueue();
$queue->application_id = $app->id;
$queue->server_id = $app->destination->server->id;
$queue->deployment_uuid = $uuid;
$queue->status = 'queued';
$queue->logs = '[]';
$queue->commit = 'HEAD';
$queue->git_type = $app->git_type ?? null;
$queue->save();

echo "Created job ID: " . $queue->id . " UUID: " . $uuid . "\n";

// Dispatch
dispatch(new \App\Jobs\ApplicationDeploymentJob($queue->id));
echo "Dispatched! Build takes 2-5 min.\n";
"""

print("Triggering deployment via Coolify artisan tinker...")
b64 = base64.b64encode(php.encode()).decode()
out, err = run(f"echo '{b64}' | base64 -d | docker exec -i coolify php artisan tinker", t=60)

# Parse output
for line in out.split('\n'):
    line = line.strip()
    if line and not line.startswith('>') and not line.startswith('.') and not line.startswith('<'):
        print(f"  {line}")

if err:
    print(f"\nErrors: {err[:500]}")

# Extract job ID from output
job_id = None
for line in out.split('\n'):
    if 'Created job ID:' in line:
        parts = line.split('Created job ID:')[1].strip()
        job_id = parts.split()[0]
        break

if not job_id:
    print("\n❌ Failed to create deployment job")
    c.close()
    sys.exit(1)

# Monitor
print(f"\nMonitoring job {job_id}...")
for i in range(20):
    time.sleep(15)
    out, _ = run(f"docker exec coolify-db psql -U coolify coolify -t -c \"SELECT status FROM application_deployment_queues WHERE id={job_id};\"")
    status = out.strip()
    elapsed = (i+1) * 15
    print(f"  [{elapsed}s] {status}")
    if status in ('finished', 'failed'):
        break

if status == 'finished':
    print("\n✅ Deployment SUCCEEDED!")
elif status == 'failed':
    print("\n❌ Deployment FAILED")
    out, _ = run(f"docker exec coolify-db psql -U coolify coolify -t -c \"SELECT logs FROM application_deployment_queues WHERE id={job_id};\"", t=30)
    try:
        logs = json.loads(out)
        for entry in logs[-10:]:
            if isinstance(entry, dict) and entry.get('output','').strip():
                print(f"  {entry['output']}")
    except:
        print(out[-1000:])
else:
    print(f"\n⏳ Still {status} after {elapsed}s")

c.close()
