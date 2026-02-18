import paramiko
import os

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
        
        print("Updating DATABASE_URL to be literal...")
        # Update is_literal = true for the row I inserted regarding App 5
        sql = "UPDATE environment_variables SET is_literal = true WHERE key = 'DATABASE_URL' AND resourceable_id = '5';"
        
        cmd = f'docker exec coolify-db psql -U coolify coolify -c "{sql}"'
        
        stdin, stdout, stderr = client.exec_command(cmd)
        print(f"Output: {stdout.read().decode()}")
        print(f"Error: {stderr.read().decode()}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
