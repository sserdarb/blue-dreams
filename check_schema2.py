import paramiko, sys, time
sys.stdout.reconfigure(encoding='utf-8')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=10)

def run(cmd, t=120):
    si, so, se = c.exec_command(cmd, timeout=t)
    return so.read().decode('utf-8', errors='replace').strip(), se.read().decode('utf-8', errors='replace').strip()

CID = '3815dea559c9'

# First let's see the problem: read the schema from the container
print("=== Current schema in container (grep AdminUser) ===")
out, _ = run(f'docker run --rm --entrypoint /bin/bash blue-dreams-rebuild:latest -c "wc -l /app/prisma/schema.prisma && echo --- && grep -n AdminUser /app/prisma/schema.prisma"', t=15)
print(out)

# Check if there's maybe a second schema file
print("\n=== Find all schema files ===")
out, _ = run(f'docker run --rm --entrypoint /bin/bash blue-dreams-rebuild:latest -c "find /app -name schema.prisma 2>/dev/null"', t=15)
print(f"Schema files: {out}")

# Let's look at the actual file around the duplicate area
# It's line 258 and there must be another one
print("\n=== Schema tail (last 40 lines) ===")
out, _ = run(f'docker run --rm --entrypoint /bin/bash blue-dreams-rebuild:latest -c "tail -40 /app/prisma/schema.prisma"', t=15)
print(out)

# The issue might be that the OLD container already had an AdminUser model added by a previous
# session, AND then we added a second one via our schema update.
# Let's check: where is the FIRST AdminUser model?
print("\n=== Schema lines 230-270 ===")
out, _ = run(f'docker run --rm --entrypoint /bin/bash blue-dreams-rebuild:latest -c "sed -n \'230,270p\' /app/prisma/schema.prisma"', t=15)
print(out)

# Also check if there's an AdminUser earlier in the file
print("\n=== Full grep with line numbers ===")
out, _ = run(f'docker run --rm --entrypoint /bin/bash blue-dreams-rebuild:latest -c "grep -n \'model \\|AdminUser\' /app/prisma/schema.prisma"', t=15)
print(out)

c.close()
