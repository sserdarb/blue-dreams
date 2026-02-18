"""
Final verification
"""
import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8')

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(SERVER, username=USER, password=PASSWORD, timeout=30)
c.get_transport().set_keepalive(10)

# Container status
si, so, se = c.exec_command('docker ps --filter name=blue-dreams-app --format "{{.ID}} {{.Status}}"', timeout=10)
print(f"Container: {so.read().decode('utf-8','replace').strip()}")

# Internal tests 
si, so, se = c.exec_command('docker exec blue-dreams-app curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/tr"', timeout=15)
print(f"Internal /tr: {so.read().decode('utf-8','replace').strip()}")

si, so, se = c.exec_command('docker exec blue-dreams-app curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/admin"', timeout=15)
print(f"Internal /admin: {so.read().decode('utf-8','replace').strip()}")

# External tests
si, so, se = c.exec_command('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/', timeout=15)
print(f"External /: {so.read().decode('utf-8','replace').strip()}")

si, so, se = c.exec_command('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/tr', timeout=15)
print(f"External /tr: {so.read().decode('utf-8','replace').strip()}")

si, so, se = c.exec_command('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/en', timeout=15)
print(f"External /en: {so.read().decode('utf-8','replace').strip()}")

si, so, se = c.exec_command('curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://new.bluedreamsresort.com/admin', timeout=15)
print(f"External /admin: {so.read().decode('utf-8','replace').strip()}")

# Container logs
si, so, se = c.exec_command('docker logs blue-dreams-app --tail 10 2>&1', timeout=15)
print(f"\nLogs:\n{so.read().decode('utf-8','replace').strip()}")

c.close()
