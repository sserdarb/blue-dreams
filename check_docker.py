import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')
_, so, se = c.exec_command("docker ps --filter 'label=coolify.projectName=blue-dreams-resort'")
print("Containers:")
print(so.read().decode('utf-8'))
print(se.read().decode('utf-8'))
c.close()
