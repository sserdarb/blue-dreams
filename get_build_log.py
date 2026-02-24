import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')
_, so, se = c.exec_command('tail -n 100 /tmp/inplace_build.txt')
out = so.read()
with open('build_output.txt', 'wb') as f:
    f.write(out)
c.close()
