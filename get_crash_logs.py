import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')
_, so, se = c.exec_command('docker logs -n 50 a8b3075aba34')
out = so.read()
with open('container_crash_logs.txt', 'wb') as f:
    f.write(out)
err = se.read()
if err:
    with open('container_crash_logs_err.txt', 'wb') as f:
        f.write(err)
c.close()
