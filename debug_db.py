import paramiko
import time
import os

HOST = "76.13.0.113"
USER = "root"
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
CID = "48466875cb9e" # From deploy_sheets.py

def run_debug():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    print(f"Connecting to {HOST}...")
    try:
        client.connect(HOST, username=USER, password=PASSWORD, timeout=10, look_for_keys=False, allow_agent=False)
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    # Create script
    script_content = """
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  try {
    const users = await prisma.adminUser.findMany()
    console.log('USERS FOUND:', users.length)
    users.forEach(u => {
        console.log(`- ${u.email} (Role: ${u.role}, ID: ${u.id})`)
    })
  } catch (e) {
    console.error('DB Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}
main()
"""
    
    print("Creating debug script on server...")
    # Escape quotes for echo
    # Actually, simplest is to cat <<EOF
    cmd_create = f"cat <<EOF > /app/debug_users.ts\n{script_content}\nEOF"
    
    # We need to run this command INSIDE the container?
    # Or creates file in container?
    # docker exec -i {CID} sh -c 'cat > debug_users.ts' <<EOF ...
    # Paramiko exec_command doesn't support stdin stream easily in one go? 
    # It does.
    
    # Let's try separate copy.
    # Write to host /tmp, then docker cp.
    
    sftp = client.open_sftp()
    with sftp.file("/tmp/debug_users.ts", "w") as f:
        f.write(script_content)
    
    print("Copying to container...")
    stdin, stdout, stderr = client.exec_command(f"docker cp /tmp/debug_users.ts {CID}:/app/debug_users.ts")
    exit_status = stdout.channel.recv_exit_status()
    if exit_status != 0:
        print("Docker cp failed")
        print(stderr.read().decode())
        return

    print("Running debug script...")
    stdin, stdout, stderr = client.exec_command(f"docker exec {CID} npx tsx /app/debug_users.ts")
    
    print("\n--- OUTPUT ---")
    print(stdout.read().decode())
    print("\n--- ERRORS ---")
    print(stderr.read().decode())

    client.close()

if __name__ == "__main__":
    run_debug()
