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
    
    container_id = 'c9a09c7f9a16'
    
    print("\n=== Finding schema.prisma ===")
    cmd = f'docker exec {container_id} find / -name schema.prisma 2>/dev/null'
    stdin, stdout, stderr = c.exec_command(cmd)
    files = stdout.read().decode().strip().split('\n')
    
    print("Found schemas:")
    for f in files:
        if f:
            print(f)
            # Read first few lines of the first one found
            print(f"\n--- Content of {f} ---")
            cat_cmd = f'docker exec {container_id} cat {f} | head -n 20' # Pipe head inside exec might fail if shell not avail?
            # Better: docker exec ... cat ... and read in python
            
            cat_cmd = f'docker exec {container_id} cat {f}'
            stdin2, stdout2, stderr2 = c.exec_command(cat_cmd)
            content = stdout2.read().decode()
            print("\n".join(content.split('\n')[:20]))
            break
            
    c.close()

except Exception as e:
    print(f"Error: {e}")
