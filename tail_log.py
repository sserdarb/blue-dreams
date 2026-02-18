import paramiko
HOST = "76.13.0.113"
USER = "root"
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def tail():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(HOST, username=USER, password=PASSWORD, timeout=10, look_for_keys=False, allow_agent=False)
        stdin, stdout, stderr = client.exec_command("tail -n 20 /tmp/inplace_build.txt")
        print("--- TAIL LOG ---\n")
        print(stdout.read().decode())
        client.close()
    except Exception as e:
        print(e)

if __name__ == "__main__":
    tail()
