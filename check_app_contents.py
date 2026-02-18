import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    app_dirs = ['vgk8cscos8os8wwsogkss00', 'focw448cg0gg4wckko04csc']
    base_path = '/data/coolify/applications'
    
    for app in app_dirs:
        print(f"\n=== Contents of {app} ===")
        stdin, stdout, stderr = c.exec_command(f'ls -F {base_path}/{app}')
        print(stdout.read().decode())
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
