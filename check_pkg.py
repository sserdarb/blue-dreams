import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')
_, so, _ = c.exec_command('docker exec a8b3075aba34 cat /app/package.json')
out = so.read()
with open('container_pkg.json', 'wb') as f:
    f.write(out)
# Also check if react-dom exists in node_modules
_, so2, _ = c.exec_command('docker exec a8b3075aba34 ls /app/node_modules/react-dom/client.js 2>&1')
print("react-dom/client:", so2.read().decode())
c.close()
