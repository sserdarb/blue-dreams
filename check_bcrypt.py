"""Quick check: what bcrypt package exists in the container"""
import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8')
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=15)
CID = 'f15c4f581451'
def run(cmd):
    si, so, se = c.exec_command(cmd, timeout=20)
    return so.read().decode('utf-8', errors='replace').strip() or se.read().decode('utf-8', errors='replace').strip()

# Check original auth.ts (what was there before our update)
print('=== package.json bcrypt ===')
print(run(f'docker exec {CID} grep -i bcrypt /app/package.json'))

# Check node_modules for bcrypt packages
print('\n=== node_modules bcrypt* ===')
print(run(f'docker exec {CID} ls -d /app/node_modules/bcrypt* 2>&1'))

# Check the container status
print('\n=== container status ===')
print(run(f'docker ps --filter "id={CID}" --format "{{{{.Status}}}}"'))

# Check the original auth.ts on the server (before our change)
print('\n=== what import does auth.ts use ===')
print(run(f'docker exec {CID} grep -i "import.*bcrypt" /app/app/actions/auth.ts'))

c.close()
print('\nDONE')
