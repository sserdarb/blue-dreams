import paramiko, sys, time
sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
print('Connected. Killing stuck build processes...')

# Kill any stuck nohup build processes
stdin, stdout, stderr = c.exec_command('docker exec f15c4f581451 bash -c "pkill -f next || true"')
stdout.read()
print('Killed lingering Next.js processes')

# Restart the container
print('Restarting container...')
stdin, stdout, stderr = c.exec_command('docker restart f15c4f581451')
out = stdout.read().decode()
print(f'Restart result: {out.strip()}')

time.sleep(5)

# Verify it's up
stdin, stdout, stderr = c.exec_command('docker ps --filter id=f15c4f581451 --format "table {{.Status}}"')
status = stdout.read().decode().strip()
print(f'Container status: {status}')

c.close()
print('Done - container restarted and ready for deploy')
