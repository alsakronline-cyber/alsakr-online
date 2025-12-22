# Backend Build Fix

## Issue:
PyAV (required by faster-whisper) needs system libraries to compile on ARM64.

## Fix Applied:
Added system dependencies to backend Dockerfile:
- pkg-config
- ffmpeg
- libavcodec-dev, libavformat-dev, libavutil-dev
- gcc, g++ (compilers)

## Upload Fixed File:

```powershell
Get-Content "c:\Users\pc shop\Downloads\alsakr-online\backend\Dockerfile" | ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96 "cat > ~/alsakr-online/backend/Dockerfile"
```
Password: `alsakr`

## Deploy:

```bash
cd ~/alsakr-online/infrastructure
docker compose up -d --build
```

This build will take longer (~10-15 min) but should complete successfully!
