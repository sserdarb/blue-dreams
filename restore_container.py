import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')

print("Restoring server.js from backup...")
c.exec_command('docker cp /tmp/server.js.bak a8b3075aba34:/app/server.js')
print("Restarting container to apply new build...")
c.exec_command('docker restart a8b3075aba34')
c.close()

print("Container restored!")
