import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')
cmd = '''
for id in $(docker ps -q); do
    docker exec $id grep -q '"temp_app"' /app/package.json 2>/dev/null && docker ps --filter "id=$id" --format "{{.ID}} {{.Image}} {{.Names}}"
done
'''
_, so, _ = c.exec_command(cmd)
print("APP CONTAINER:")
print(so.read().decode('utf-8'))
c.close()
