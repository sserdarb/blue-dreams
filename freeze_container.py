import paramiko
import time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')

print("Backing up server.js...")
c.exec_command('docker cp a8b3075aba34:/app/server.js /tmp/server.js.bak')
time.sleep(2)

print("Writing dummy server.js...")
c.exec_command("echo \"setInterval(() => console.log('Sleeping to await build...'), 60000);\" > /tmp/dummy.js")
c.exec_command('docker cp /tmp/dummy.js a8b3075aba34:/app/server.js')
time.sleep(2)

print("Restarting container to freeze it in running state...")
c.exec_command('docker restart a8b3075aba34')
time.sleep(5)

_, so, _ = c.exec_command('docker ps --filter "id=a8b3075aba34" --format "{{.Status}}"')
print("Status:", so.read().decode().strip())

c.close()
