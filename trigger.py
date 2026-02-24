import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password='tvONwId?Z.nm\'c/M-k7N')
cmd = "curl -s -w '\\n%{http_code}' -X POST 'http://localhost:8080/api/v1/applications/vgk8cscos8os8wwsogkss004/deploy?force=true' -H 'Authorization: Bearer 2|E5H1n3Ys97aCYpAbWnSA5bJV7APpuKzpEpMmIjwE077a9e55' -H 'Accept: application/json'"
_, so, se = c.exec_command(cmd)
print("OUT:", so.read().decode('utf-8'))
print("ERR:", se.read().decode('utf-8'))
c.close()
