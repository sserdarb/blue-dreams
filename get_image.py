import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')
si, so, se = c.exec_command('docker ps --format "{{.ID}} - {{.Image}} - {{.Names}}" | grep blue')
print("Blue:", so.read().decode('utf-8'))
si, so, se = c.exec_command('docker ps --format "{{.ID}} - {{.Image}} - {{.Names}}"')
full = so.read().decode('utf-8')
if "blue" not in full.lower():
    print("All:")
    print(full)
c.close()
