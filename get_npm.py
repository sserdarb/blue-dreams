import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')
_, so, _ = c.exec_command('docker exec a2ba21f305ff bash -c "ls -la /usr/local/bin && which npm || which yarn || which pnpm || which bun"')
print(so.read().decode('utf-8'))
c.close()
