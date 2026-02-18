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
        
        print("Adding DATABASE_URL env var for App ID 5...")
        # Check if exists first to avoid duplicate key error
        # But for speed, try INSERT ON CONFLICT DO NOTHING (if Postgres supports it, yes)
        # OR just INSERT and catch error.
        # application_id is likely string '5' based on previous error.
        
        import uuid
        env_uuid = str(uuid.uuid4())
        val = 'file:./dev.db'
        
        # Use proper columns based on schema check
        # resourceable_id='5', resourceable_type='App\Models\Application'
        # is_buildtime=true, is_runtime=true
        # uuid is mandatory
        
        sql = f"INSERT INTO environment_variables (key, value, resourceable_id, resourceable_type, is_buildtime, is_preview, is_runtime, uuid, created_at, updated_at) VALUES ('DATABASE_URL', '{val}', '5', 'App\\\\Models\\\\Application', true, false, true, '{env_uuid}', NOW(), NOW());"
        
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
