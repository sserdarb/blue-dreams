import paramiko, sys, time, os, datetime

# ─── Configuration ───────────────────────────────────────
SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
DB_USER = 'coolify'
DB_NAME = 'blue_dreams_v2'

def run_ssh(cmd, client):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    o = stdout.read().decode().strip()
    e = stderr.read().decode().strip()
    if e: print(f"STDERR: {e}")
    return o, e

def backup():
    print(f"Connecting to {SERVER}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(SERVER, username=USER, password=PASSWORD)

    # Force coolify-db
    db_container = 'coolify-db'
    
    # Check if container exists
    out, _ = run_ssh(f"docker ps -f name={db_container} --format '{{{{.Names}}}}'", client)
    if db_container not in out:
        print(f"❌ Container {db_container} not found. Searching for others...")
        # Fallback to 'postgres'
        out, _ = run_ssh("docker ps --format '{{.Names}}' | grep postgres", client)
        if out:
            db_container = out.split('\n')[0]
            print(f"Found alternative: {db_container}")
        else:
            print("❌ No postgres container found.")
            client.close()
            return

    print(f"✅ Using database container: {db_container}")

    # List databases to confirm
    print("Listing databases...")
    out, err = run_ssh(f"docker exec {db_container} psql -U {DB_USER} -lqt", client)
    print(f"Databases found:\n{out}")

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    remote_file = f"/tmp/backup_{DB_NAME}_{timestamp}.sql"
    local_file = f"backup_{DB_NAME}_{timestamp}.sql"

    # Decide dump command
    if DB_NAME in out:
        print(f"Database {DB_NAME} found. Dumping...")
        dump_cmd = f"docker exec {db_container} pg_dump -U {DB_USER} -d {DB_NAME} > {remote_file}"
    else:
        print(f"⚠️ Database {DB_NAME} NOT found. Dumping ALL databases...")
        remote_file = f"/tmp/backup_ALL_{timestamp}.sql"
        local_file = f"backup_ALL_{timestamp}.sql"
        dump_cmd = f"docker exec {db_container} pg_dumpall -U {DB_USER} > {remote_file}"

    # Execute Dump
    out, err = run_ssh(dump_cmd, client)
    
    # Check if file exists
    out, _ = run_ssh(f"ls -lh {remote_file}", client)
    if "No such file" in out or not out:
        print("❌ Dump failed to create file.")
        client.close()
        return
        
    print(f"Dump created: {out}")

    # Download
    print(f"Downloading to {local_file}...")
    sftp = client.open_sftp()
    try:
        sftp.get(remote_file, local_file)
        print(f"✅ Backup complete! Saved to {local_file}")
    except Exception as e:
        print(f"❌ Download failed: {e}")
    finally:
        sftp.close()

    # Cleanup
    print("Cleaning up remote file...")
    run_ssh(f"rm {remote_file}", client)

    client.close()

if __name__ == '__main__':
    backup()
