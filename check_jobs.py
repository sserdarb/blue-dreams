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
    
    print("\n=== Listing app/Jobs ===")
    cmd = f'docker exec {container_id} ls -F /var/www/html/app/Jobs'
    stdin, stdout, stderr = c.exec_command(cmd)
    jobs = stdout.read().decode()
    print(jobs)
    
    # Check for likely candidates
    candidates = ['DeployApplicationJob.php', 'ApplicationDeploymentJob.php']
    found_job = None
    for job in jobs.split('\n'):
        job = job.strip()
        if 'Deploy' in job and 'Application' in job:
            found_job = job
            break
            
    if found_job:
        print(f"\n=== Reading {found_job} (Head 50) ===")
        cmd = f'docker exec {container_id} head -n 50 /var/www/html/app/Jobs/{found_job}'
        stdin, stdout, stderr = c.exec_command(cmd)
        print(stdout.read().decode())
    else:
        print("No DeployApplicationJob found in list.")

    c.close()

except Exception as e:
    print(f"Error: {e}")
