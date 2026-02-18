import paramiko
import time
import sys

# Server Details
HOST = '76.13.0.113'
USER = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def run_command(ssh, command):
    print(f"Executing: {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    return out, err

def check_server_status():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print(f"Connecting to {HOST}...")
        ssh.connect(HOST, username=USER, password=PASSWORD, timeout=10)
        print(f"Successfully connected to {HOST}")

        # 1. Check CPU/RAM Usage
        print("\n--- System Resources ---")
        out, _ = run_command(ssh, "free -h && echo '---' && top -b -n 1 | head -n 10")
        print(out)

        # 2. Check Docker Container Status
        print("\n--- Docker Containers ---")
        out, _ = run_command(ssh, "docker ps --format 'table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Names}}'")
        print(out)

        # 3. Check for Running Build Processes
        print("\n--- Build Processes (npm/node/prisma) ---")
        out, _ = run_command(ssh, "ps aux | grep -E 'npm|node|prisma' | grep -v grep")
        print(out)

        # 4. Tail the Build Log
        print("\n--- Last 50 lines of Build Log ---")
        out, _ = run_command(ssh, "tail -n 50 /tmp/inplace_build.txt")
        print(out)

        ssh.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    check_server_status()
