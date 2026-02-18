import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to 89.252.191.168...")
    c.connect('89.252.191.168', username='root', password='dx3ui0X41Q', timeout=10)
    
    print("=== Listing Docker Containers (filtering for 'blue') ===")
    stdin, stdout, stderr = c.exec_command('docker ps | grep -iE "blue|dreams"')
    print(stdout.read().decode())
    
    c.close()
except Exception as e:
    print(f"Error: {e}")
