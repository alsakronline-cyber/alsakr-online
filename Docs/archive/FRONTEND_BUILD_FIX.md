# Frontend Build Fix

## Issue:
`npm ci` failed because it requires an exact `package-lock.json` file.

## Fix Applied:
Changed `RUN npm ci` to `RUN npm install --legacy-peer-deps` in `frontend/Dockerfile`

## Upload Fixed Files to Server:

```powershell
# Upload frontend Dockerfile
scp -i ~/.ssh/oracle_vps_key "c:\Users\pc shop\Downloads\alsakr-online\frontend\Dockerfile" ubuntu@144.24.208.96:~/alsakr-online/frontend/
```

Password: `alsakr`

## Deploy Again:

```bash
# On server
cd ~/alsakr-online/infrastructure
docker compose up -d --build
```

The build should complete successfully now!
