import paramiko
import os
import time
import sys

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = os.getenv('SSH_PASSWORD')

def main():
    if not PASSWORD:
        print("Error: SSH_PASSWORD environment variable is not set.")
        return

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {SERVER}...")
        client.connect(SERVER, username=USER, password=PASSWORD)
        
        print("Monitoring latest deployment job...")
        
        while True:
            # Query the latest job status
            cmd = 'docker exec coolify-db psql -U coolify coolify -t -c "SELECT id, status, created_at FROM application_deployment_queues ORDER BY id DESC LIMIT 1;"'
            stdin, stdout, stderr = client.exec_command(cmd)
            result = stdout.read().decode().strip()
            
            if not result:
                print("No jobs found.")
                break
                
            parts = result.split('|')
            if len(parts) >= 2:
                job_id = parts[0].strip()
                status = parts[1].strip()
                
                # Clear line and print status
                sys.stdout.write(f"\rJob ID: {job_id} | Status: {status}    ")
                sys.stdout.flush()
                
                if status == 'finished':
                    print("\n\n✅ Deployment finished successfully!")
                    break
                elif status == 'failed':
                    print("\n\n❌ Deployment failed.")
                    # Get logs if failed
                    print("Fetching failure logs...")
                    log_cmd = f'docker exec coolify-db psql -U coolify coolify -t -c "SELECT logs FROM application_deployment_queues WHERE id={job_id};"'
                    stdin, stdout, stderr = client.exec_command(log_cmd)
                    print(stdout.read().decode()[:1000] + "...")
                    break
            
            time.sleep(5)
            
    except Exception as e:
        print(f"\nError: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
