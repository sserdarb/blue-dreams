import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')
_, so, _ = c.exec_command('docker ps --format "{{.ID}} | {{.Image}} | {{.Command}}"')
print(so.read().decode('utf-8'))
c.close()
