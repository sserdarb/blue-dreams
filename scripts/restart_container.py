import paramiko

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
CID = 'f15c4f581451'

def restart():
    print(f"Connecting to {SERVER}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(SERVER, username=USER, password=PASSWORD)

    print(f"Starting container {CID}...")
    stdin, stdout, stderr = client.exec_command(f"docker start {CID}")
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print(f"Error: {err}")
    
    # Check status
    stdin, stdout, stderr = client.exec_command(f"docker ps --filter id={CID} --format '{{{{.Status}}}}'")
    status = stdout.read().decode().strip()
    print(f"Status: {status}")
    
    client.close()

if __name__ == '__main__':
    restart()
