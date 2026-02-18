import paramiko, sys

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def read_log():
    try:
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        c.connect(SERVER, username=USER, password=PASSWORD, timeout=10)
        
        # Read the build log
        stdin, stdout, stderr = c.exec_command('cat /tmp/inplace_build.txt')
        content = stdout.read().decode('utf-8', 'replace')
        print(content)
        
        c.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    read_log()
