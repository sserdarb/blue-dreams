import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')
cmd = 'docker exec 7b196ff456e5 psql -U coolify -d coolify -x -c "SELECT id, status, application_id FROM application_deployment_queues ORDER BY id DESC LIMIT 5"'
_, so, se = c.exec_command(cmd)
print("OUT:", so.read().decode('utf-8'))
print("ERR:", se.read().decode('utf-8'))
c.close()
