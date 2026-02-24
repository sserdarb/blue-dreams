import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')
_, so, se = c.exec_command('docker exec -u root a8b3075aba34 sh -c "cd /app && npm install typescript tailwindcss eslint && npm run build"')
print('OUT:', so.read().decode('utf-8'))
print('ERR:', se.read().decode('utf-8'))
c.close()
