import paramiko
import time

SERVER = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def run_remote(client, cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    return out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print(f"Connecting to {SERVER}...")
        client.connect(SERVER, username=USER, password=PASSWORD)
        
        # Test network connectivity from VPS to Prisma CDN
        print("=== Testing VPS network to Prisma CDN ===")
        out, err = run_remote(client, 'curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://binaries.prisma.sh/', timeout=15)
        print(f"  Prisma CDN: HTTP {out}")
        
        # Test npm registry
        out, err = run_remote(client, 'curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://registry.npmjs.org/', timeout=15)
        print(f"  npm registry: HTTP {out}")
        
        # Test GitHub
        out, err = run_remote(client, 'curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://api.github.com/', timeout=15)
        print(f"  GitHub API: HTTP {out}")
        
        # Check server disk space
        print("\n=== Disk Space ===")
        out, _ = run_remote(client, 'df -h / | tail -1')
        print(f"  {out}")
        
        # Check memory
        print("\n=== Memory ===")
        out, _ = run_remote(client, 'free -m | head -2')
        print(f"  {out}")
        
        # Docker system info
        print("\n=== Docker Disk Usage ===")
        out, _ = run_remote(client, 'docker system df')
        print(out)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
