import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')
_, so, se = c.exec_command('docker exec -u root a8b3075aba34 sh -c "cd /app && npm run build"')
out = so.read()
err = se.read()
with open('manual_build_out.txt', 'wb') as f:
    f.write(out)
with open('manual_build_err.txt', 'wb') as f:
    f.write(err)
c.close()
