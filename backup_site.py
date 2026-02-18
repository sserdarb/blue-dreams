import paramiko, time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

CID = 'f15c4f581451'
ts = '20260211_1703'
backup_dir = f'/root/backups/blue-dreams-{ts}'

print('=== Creating full backup ===')
run(f'mkdir -p {backup_dir}')

# 1. Backup the entire /app directory from container
print('  1. Backing up /app from container...')
out, err = run(f'docker cp {CID}:/app {backup_dir}/app', t=300)
if err:
    print(f'  Note: {err[:200]}')
print('  App backup done')

# 2. Backup the database
print('  2. Backing up database...')
out, err = run(f'docker exec coolify-db pg_dump -U coolify blue_dreams_v2 > {backup_dir}/database.sql', t=60)
if err:
    print(f'  Note: {err[:200]}')
print('  DB backup done')

# 3. Verify backup sizes
print('  3. Verifying...')
out, _ = run(f'du -sh {backup_dir}/*')
print(f'  Sizes:\n{out}')

out2, _ = run(f'ls -la {backup_dir}/')
print(f'  Files:\n{out2}')

c.close()
print('\n=== Backup complete ===')
