
import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Credentials from deploy_sheets.py
SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def ssh():
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"DEBUG: Connecting to {SERVER}...", flush=True)
    try:
        c.connect(SERVER, username=USER, password=PASSWORD, timeout=30, look_for_keys=False, allow_agent=False)
        print("DEBUG: Connected!", flush=True)
    except Exception as e:
        print(f"DEBUG: Connection failed: {e}", flush=True)
        raise e
    return c

def run(c, cmd):
    si, so, se = c.exec_command(cmd, timeout=30)
    return so.read().decode('utf-8','replace').strip(), se.read().decode('utf-8','replace').strip()

def main():
    c = ssh()
    
    print("\n--- /tmp/deploy.log (Last 20 lines) ---")
    o, _ = run(c, 'tail -n 20 /tmp/deploy.log')
    print(o)
    
    print("\n--- /tmp/inplace_build.txt (Last 50 lines) ---")
    o, _ = run(c, 'tail -n 50 /tmp/inplace_build.txt')
    print(o)
    
    c.close()

if __name__ == '__main__':
    main()
