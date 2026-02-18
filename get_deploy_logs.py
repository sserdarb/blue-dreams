import paramiko
import os
import json

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = os.getenv('SSH_PASSWORD')
JOB_ID = 154

def main():
    if not PASSWORD:
        print("Error: SSH_PASSWORD environment variable is not set.")
        return

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {SERVER}...")
        client.connect(SERVER, username=USER, password=PASSWORD)
        
        print(f"Fetching logs for Job {JOB_ID}...")
        # Use COPY to extract logs cleanly without psql formatting issues
        cmd = f'docker exec coolify-db psql -U coolify coolify -c "COPY (SELECT logs FROM application_deployment_queues WHERE id={JOB_ID}) TO STDOUT;"'
        
        stdin, stdout, stderr = client.exec_command(cmd)
        raw_logs = stdout.read().decode()
        
        # Logs are likely a JSON array string
        try:
            # Postgres COPY might duplicate backslashes? 
            # Or it returns the raw text.
            # If it's pure text, we try to parse it or just print the last 20 lines.
            print("Raw logs length:", len(raw_logs))
            filename = f"deploy_logs_{JOB_ID}.json"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(raw_logs)
            print(f"Logs saved to {filename}")
            
            # Try to print the error section (tail)
            # Inspect the file content locally or print tail
            print("Last 2000 characters of logs:")
            print(raw_logs[-2000:])
            
        except Exception as e:
            print(f"Error parsing logs: {e}")
            print(raw_logs[-1000:])
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
