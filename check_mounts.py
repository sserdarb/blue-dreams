import paramiko
import json

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"
CID = 'f15c4f581451'

def check_mounts():
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER, username=USER, password=PASSWORD)
    
    cmd = f"docker inspect {CID} --format '{{{{json .Mounts}}}}'"
    stdin, stdout, stderr = c.exec_command(cmd)
    
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    
    if err:
        print(f"Error: {err}")
    else:
        print(f"Mounts: {out}")
        try:
            mounts = json.loads(out)
            for m in mounts:
                print(f"  - {m['Type']}: {m['Source']} -> {m['Destination']}")
        except:
            print("  Could not parse JSON")

    c.close()

if __name__ == '__main__':
    check_mounts()
