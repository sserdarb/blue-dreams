"""
Recreate container with Traefik labels
"""
import paramiko, sys, time
sys.stdout.reconfigure(encoding='utf-8')

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(SERVER, username=USER, password=PASSWORD, timeout=30)
c.get_transport().set_keepalive(10)

# Service ID for routing (using the Coolify-style naming)
SVC = 'blue-dreams-app'
DOMAIN = 'new.bluedreamsresort.com'

script = f'''#!/bin/sh
echo "Stopping old container..."
docker stop {SVC} 2>/dev/null
docker rm {SVC} 2>/dev/null
sleep 2

echo "Starting with Traefik labels..."
docker run -d --name {SVC} \\
  --restart=unless-stopped \\
  --network coolify \\
  --env-file /tmp/blue_dreams_env.txt \\
  --entrypoint "" \\
  -w /app \\
  -e "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \\
  --label "traefik.enable=true" \\
  --label "traefik.http.routers.{SVC}-https.rule=Host(\\`{DOMAIN}\\`)" \\
  --label "traefik.http.routers.{SVC}-https.entryPoints=https" \\
  --label "traefik.http.routers.{SVC}-https.tls=true" \\
  --label "traefik.http.routers.{SVC}-https.tls.certresolver=letsencrypt" \\
  --label "traefik.http.routers.{SVC}-http.rule=Host(\\`{DOMAIN}\\`)" \\
  --label "traefik.http.routers.{SVC}-http.entryPoints=http" \\
  --label "traefik.http.routers.{SVC}-http.middlewares={SVC}-redirect" \\
  --label "traefik.http.middlewares.{SVC}-redirect.redirectscheme.scheme=https" \\
  --label "traefik.http.middlewares.{SVC}-redirect.redirectscheme.permanent=true" \\
  --label "traefik.http.services.{SVC}.loadbalancer.server.port=3000" \\
  --label "coolify.managed=true" \\
  blue-dreams-final:latest \\
  sh -c "npx prisma db push --accept-data-loss 2>&1 && npx next start -p 3000"

sleep 5
STATUS=$(docker ps --filter name={SVC} --format '{{{{.Status}}}}')
echo "Status 5s: $STATUS"

if echo "$STATUS" | grep -q "Up"; then
    echo "Waiting 25s for warmup..."
    sleep 25
    STATUS2=$(docker ps --filter name={SVC} --format '{{{{.Status}}}}')
    echo "Status 30s: $STATUS2"
    
    # Internal test
    HTTP=$(docker exec {SVC} curl -s -o /dev/null -w "%{{http_code}}" "http://localhost:3000/tr" 2>&1)
    echo "Internal TR: $HTTP"
    
    # External test  
    HTTP_EXT=$(curl -s -o /dev/null -w "%{{http_code}}" --max-time 10 https://{DOMAIN}/tr 2>&1)
    echo "External TR: $HTTP_EXT"
    
    HTTP_ROOT=$(curl -s -o /dev/null -w "%{{http_code}}" --max-time 10 https://{DOMAIN}/ 2>&1)
    echo "External Root: $HTTP_ROOT"
    
    # Check labels
    echo "Labels:"
    docker inspect {SVC} --format '{{{{json .Config.Labels}}}}' | python3 -m json.tool 2>/dev/null || docker inspect {SVC} --format '{{{{json .Config.Labels}}}}'
else
    echo "NOT RUNNING!"
    docker logs {SVC} --tail 20 2>&1
fi
echo "ALL_DONE"
'''

sftp = c.open_sftp()
with sftp.file('/tmp/start_traefik.sh', 'w') as f:
    f.write(script)
sftp.close()

si, so, se = c.exec_command('nohup sh /tmp/start_traefik.sh > /tmp/start_traefik.log 2>&1 &', timeout=10)
so.read()
print("Started...")
c.close()

for i in range(8):
    time.sleep(10)
    try:
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        c.connect(SERVER, username=USER, password=PASSWORD, timeout=30)
        c.get_transport().set_keepalive(10)
        si, so, se = c.exec_command('cat /tmp/start_traefik.log', timeout=10)
        log = so.read().decode('utf-8','replace').strip()
        c.close()
        if 'ALL_DONE' in log:
            print(f"\nCompleted ({(i+1)*10}s):")
            print(log)
            break
        print(f"  ⏳ ({(i+1)*10}s)...")
    except Exception as e:
        print(f"  ⚠ {e}")
