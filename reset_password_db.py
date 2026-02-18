import paramiko
import time
import os

HOST = "76.13.0.113"
USER = "root"
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
CID = "48466875cb9e" # From deploy_sheets.py

def run_reset():
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
import bcrypt from 'bcryptjs' // verify import name, likely 'bcryptjs' based on install

const prisma = new PrismaClient()

async function main() {
  const email = 'sserdarb@gmail.com'
  const newPassword = 'Tuba@2015Tuana.'
  
  console.log(`Resetting password for ${email}...`)
  
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const user = await prisma.adminUser.update({
      where: { email },
      data: { password: hashedPassword }
    })
    console.log('Password updated successfully for:', user.email)
  } catch (e) {
    console.error('Error updating password:', e)
  } finally {
    await prisma.$disconnect()
  }
}
main()
"""
    
    print("Creating reset script on server...")
    # Escape single quotes in script content?
    # Using cat via sftp is safer.
    
    sftp = client.open_sftp()
    with sftp.file("/tmp/reset_pass.ts", "w") as f:
        f.write(script_content)
    
    print("Copying to container...")
    stdin, stdout, stderr = client.exec_command(f"docker cp /tmp/reset_pass.ts {CID}:/app/reset_pass.ts")
    exit_status = stdout.channel.recv_exit_status()
    if exit_status != 0:
        print("Docker cp failed")
        print(stderr.read().decode())
        return

    print("Running reset script...")
    stdin, stdout, stderr = client.exec_command(f"docker exec {CID} npx tsx /app/reset_pass.ts")
    
    print("\n--- OUTPUT ---")
    print(stdout.read().decode())
    print("\n--- ERRORS ---")
    print(stderr.read().decode())

    client.close()

if __name__ == "__main__":
    run_reset()
