import paramiko
import sys

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
CID = '48466875cb9e'

def ssh():
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER, username=USER, password=PASSWORD)
    return c

def run(c, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = c.exec_command(cmd)
    o = stdout.read().decode().strip()
    e = stderr.read().decode().strip()
    if o: print(o)
    if e: print(f"STDERR: {e}")
    return o, e

def main():
    print("=== Post-Deploy Sync ===")
    c = ssh()

    # 1. Upload fetch-elektra-history.ts via SFTP
    print("Uploading fetch-elektra-history.ts...")
    sftp = c.open_sftp()
    local_path = r'scripts/fetch-elektra-history.ts'
    remote_tmp = '/tmp/fetch-elektra-history.ts'
    sftp.put(local_path, remote_tmp)
    sftp.close()
    
    # Move into container
    run(c, f"docker cp {remote_tmp} {CID}:/app/scripts/")
    run(c, f"rm {remote_tmp}")
    print("File uploaded.")

    # 2. Run Prisma DB Push
    print("\nRunning Prisma DB Push (Migration)...")
    run(c, f"docker exec {CID} bash -c 'cd /app && npx prisma db push --accept-data-loss'")

    # 3. Run History Sync
    print("\nRunning History Sync...")
    run(c, f"docker exec {CID} bash -c 'cd /app && npx tsx scripts/fetch-elektra-history.ts'")
    
    c.close()
    print("\nDone.")

if __name__ == "__main__":
    main()
