import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8')

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
CID = 'f15c4f581451'

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(SERVER, username=USER, password=PASSWORD)

def run(cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = c.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out: print(f"OUT: {out}")
    if err: print(f"ERR: {err}")

run(f'docker exec {CID} ls -l /app/lib/admin-translations.ts')
run(f'docker exec {CID} ls -l /app/app/[locale]/admin/extras/page.tsx')
run(f'docker exec {CID} ls -l /app/app/[locale]/admin/statistics/ReportsClient.tsx')

print("\n--- Service Logs ---")
run(f'docker logs {CID} --tail 50')
