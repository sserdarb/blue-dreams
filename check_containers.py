import paramiko
import os

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = os.getenv('SSH_PASSWORD')

def main():
    if not PASSWORD:
        print("Error: SSH_PASSWORD env var not set")
        return

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {SERVER}...")
        client.connect(SERVER, username=USER, password=PASSWORD, timeout=10)
        
        print("\n=== Running Docker Containers ===")
        stdin, stdout, stderr = client.exec_command("docker ps --format '{{.ID}} {{.Names}} {{.Image}}'")
        print(stdout.read().decode())
        
        print("\n=== Checking for SQLite DBs in containers ===")
        # Try to find containers related to 'blue' or 'aura' and check for db file
        stdin, stdout, stderr = client.exec_command("docker ps --format '{{.Names}}' | grep -E 'blue|aura|app' | xargs -I {} docker exec {} find / -name '*.db' 2>/dev/null")
        print(stdout.read().decode())
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
