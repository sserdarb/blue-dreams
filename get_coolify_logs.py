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
        
        print("Fetching coolify logs (tail 200)...")
        stdin, stdout, stderr = client.exec_command('docker logs coolify --tail 200')
        print(stdout.read().decode())
        print("STDERR:", stderr.read().decode())
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
