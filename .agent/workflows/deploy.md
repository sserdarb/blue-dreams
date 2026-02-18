---
description: Deploy Blue Dreams Resort admin panel changes to production via SSH + Docker
---
# Blue Dreams Deploy Workflow

Uses in-container build approach with nohup polling to handle long build times without SSH timeouts.

## Prerequisites

- Python 3 with `paramiko` installed
- SSH access to `76.13.0.113` as root
- Container ID: `15609eb83e88`

## Steps

1. **Update the FILES list** in `deploy_sheets.py` to include any new source files you've created or modified.

2. **Run the deploy script**:

// turbo

```
cd c:\Users\sserd\OneDrive\Belgeler\Antigravity\blue-dreams-fix
python deploy_sheets.py
```

1. **Wait for output** — the script takes 7-10 minutes for the build step. Watch for:
   - `BUILD SUCCEEDED` → all good
   - `BUILD FAILED` → check the build log on server at `/tmp/inplace_build.txt`
   - Smoke test status codes: 200 (OK), 307 (redirect to login — expected for admin pages), 403 (auth required — expected for API routes)

2. **Verify in browser** — after deploy:
   - Check `https://new.bluedreamsresort.com/tr/admin` loads
   - Login and verify the changed pages work

## How the Deploy Works

The script (`deploy_sheets.py`) follows this pipeline:

1. **Ensure container running** → Starts the container if stopped
2. **Upload & inject source files** → Creates tar.gz, uploads via SFTP, and uses tar pipe (`tar cf - . | docker exec -i CID tar xf - -C /app`) to inject into container — this handles `[locale]` bracket paths correctly
3. **Build in-container via nohup** → Runs the full build command inside the container using `nohup` + polling:
   - `npm install bcryptjs`
   - `npx prisma db push --accept-data-loss` (applies any schema changes)
   - `npx prisma generate`
   - `rm -rf .next && npm run build`
4. **Restart & smoke test** → Stops container, sets restart policy, starts, waits 35s warmup, runs HTTP checks

### Key Technical Details

- **Tar pipe for brackets**: `docker cp` cannot handle `[locale]` paths, but `tar cf - | docker exec -i tar xf -` works perfectly
- **In-container build**: Builds directly inside the running container — avoids the slow `docker commit` step (old approach timed out SSH)
- **nohup + polling**: Long operations run in server background via `nohup`, script polls for completion markers every 10s — prevents SSH read timeouts
- **prisma db push**: Automatically applies schema changes (new fields, etc.) to the production DB during build
- **bcryptjs install**: Must be installed before build since `auth.ts` uses it
- **Container ID**: Currently `f15c4f581451` — update if container changes

### Why Not `deploy.py`?

The original `deploy.py` uses a commit+builder pattern that causes SSH timeouts during `docker commit` (~2 min) and `npm run build` (~5 min). `deploy_sheets.py` uses in-container builds with nohup polling to solve this.
