import paramiko
import os
import uuid

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
        
        print("Adding NIXPACKS_BUILD_CMD...")
        
        key = 'NIXPACKS_BUILD_CMD'
        val = 'npm install && npx prisma generate && npm run build'
        env_uuid = str(uuid.uuid4())
        
        # resourceable_id='5', resourceable_type='App\Models\Application'
        # is_buildtime=true, is_runtime=false (build cmd is only for build)
        
        sql = f"INSERT INTO environment_variables (key, value, resourceable_id, resourceable_type, is_buildtime, is_preview, is_runtime, uuid, is_literal, created_at, updated_at) VALUES ('{key}', '{val}', '5', 'App\\\\Models\\\\Application', true, false, false, '{env_uuid}', true, NOW(), NOW());"
        
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
