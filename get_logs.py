import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=30):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

CID = 'f15c4f581451'

# Full logs
logs, _ = run(f'docker logs {CID} --tail 50 2>&1')
with open('server_logs.txt', 'w', encoding='utf-8') as f:
    f.write(logs)
print(logs)
c.close()
