import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def run(c, cmd, timeout=30):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    db_cid = '7b196ff456e5'
    
    # Update the start_command in Coolify to include the seed step
    new_start = "npx prisma db push && node prisma/seed.js && npm start"
    print(f"Setting start_command to: {new_start}")
    
    out, _ = run(c, f"""docker exec {db_cid} psql -U coolify -d coolify -c "UPDATE applications SET start_command = '{new_start}' WHERE uuid = 'vgk8cscos8os8wwsogkss004';" """)
    print(f"Update result: {out}")
    
    # Verify
    out, _ = run(c, f'docker exec {db_cid} psql -U coolify -d coolify -t -c "SELECT start_command FROM applications WHERE uuid=\'vgk8cscos8os8wwsogkss004\';"')
    print(f"Verified start_command: [{out.strip()}]")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
