import paramiko
import os
import time

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
        
        print("Locating application container by image name 'blue-dreams'...")
        # Find container ID where image name contains 'blue-dreams' (Next.js app likely has this in name)
        # Exclude postgres/redis/mongo/proxy if they happen to match (unlikely with just blue-dreams)
        cmd = "docker ps --format '{{.ID}} {{.Image}}' | grep 'blue-dreams' | awk '{print $1}' | head -n 1"
        stdin, stdout, stderr = client.exec_command(cmd)
        container_id = stdout.read().decode().strip()
        
        if not container_id:
            print("Error: Could not find running container with image 'blue-dreams-final'.")
            print("Please check if the deployment finished successfully.")
            return

        print(f"Found container ID: {container_id}")
        
        # Verify it's the right one by checking names (optional debugging)
        stdin, stdout, stderr = client.exec_command(f"docker ps --format '{{{{.Names}}}}' --filter id={container_id}")
        print(f"Container Name: {stdout.read().decode().strip()}")

        print("Inspecting container environment...")
        
        # Try finding a working node command by running 'node -v'
        node_cmd = ""
        candidates = ["node", "nodejs", "/usr/local/bin/node", "/usr/bin/node"]
        
        for candidate in candidates:
            print(f"Testing '{candidate} -v'...")
            stdin, stdout, stderr = client.exec_command(f"docker exec {container_id} {candidate} -v")
            version = stdout.read().decode().strip()
            if version.startswith("v"):
                print(f"✅ Found working node: {candidate} ({version})")
                node_cmd = candidate
                break
        
        if not node_cmd:
            print("❌ Could not execute node in container. Inspecting logs for clues...")
            stdin, stdout, stderr = client.exec_command(f"docker logs {container_id} --tail 10")
            print(f"Logs:\n{stdout.read().decode()}")

            # Check for Python
            print("Checking for Python...")
            stdin, stdout, stderr = client.exec_command(f"docker exec {container_id} python3 --version")
            py_ver = stdout.read().decode().strip()
            if py_ver:
                print(f"✅ Found Python: {py_ver}")
                # We can try to seed using Python if DB is sqlite
                # Find DB file
                stdin, stdout, stderr = client.exec_command(f"docker exec {container_id} find /app -name '*.db'")
                db_files = stdout.read().decode().strip().split('\n')
                if db_files and db_files[0]:
                    print(f"Found DB files: {db_files}")
                    # Construct Python script to insert user
                    # Need bcrypt
                    # This is getting complex. If it's a Python app, maybe it has a `manage.py`?
                    
                    return

            print("Checking for sqlite3...")
            stdin, stdout, stderr = client.exec_command(f"docker exec {container_id} sqlite3 --version")
            sqlite_ver = stdout.read().decode().strip()
            if sqlite_ver:
                print(f"✅ Found sqlite3: {sqlite_ver}")
                
            return
        # This script creates the user directly using the available Runtime dependencies.
        
        node_script = """
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'burak@bluedreamsresort.com';
  console.log('Checking user ' + email);
  try {
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      console.log('User already exists');
    } else {
      const hashedPassword = await bcrypt.hash('Burak132.', 10);
      await prisma.adminUser.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Burak',
          role: 'admin',
          isActive: true,
        }
      });
      console.log('User created successfully');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
"""
        # Escape quotes for shell safety if needed, but paramiko.exec_command simply sends the string.
        # However, passing newlines in docker exec can be tricky.
        # We'll minify the script to one line or use 'EOF' heredoc logic if possible.
        # Safest is to write to a temp file in the container and run it, OR stick to one-liner.
        
        # Let's try one-liner.
        one_liner = node_script.replace('\n', ' ').replace('"', '\\"').strip()
        
        print(f"Executing custom Node.js user creation script using {node_cmd}...")
        
        # Use simple string checks to avoid 'js' execution issues with docker exec
        # We will wrap in sh -c to be safe
        
        # One-liner
        one_liner = node_script.replace('\n', ' ').replace('"', '\\"').strip()
        
        cmd = f'docker exec {container_id} {node_cmd} -e "{one_liner}"'
        
        print(f"Command: {cmd[:100]}...")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode()
        err = stderr.read().decode()
        
        print("\n=== Execution Output ===")
        print(out)
        if err:
            print("=== Execution Errors ===")
            print(err)
            
        print("\n✅ Admin User Creation Check Completed.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
