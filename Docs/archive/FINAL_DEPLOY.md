# Final Build Fixes

## Issues Fixed:
1. ✅ Backend: Added system dependencies for PyAV (pkg-config, ffmpeg, libavcodec-dev, etc.)
2. ✅ Frontend: Added @radix-ui/react-slot dependency
3. ✅ Both Dockerfiles uploaded to server

## Files have been uploaded to server automatically

## Deploy Command:

```bash
# SSH into server (if not already connected)
ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96

# Deploy
cd ~/alsakr-online/infrastructure
docker compose up -d --build
```

## What to Expect:
- Build will take **10-15 minutes** (compiling PyAV from source on ARM64)
- Backend build: ~10 min
- Frontend build: ~2 min
- Container startup: ~1 min

## Monitor Progress:
```bash
# Watch logs during build
docker compose logs -f

# Check container status
docker compose ps
```

## Success Check:
All 11 containers should show "Up":
- alsakr-backend
- alsakr-frontend
- alsakr-caddy
- alsakr-qdrant
- alsakr-pocketbase
- alsakr-ollama
- alsakr-n8n
- alsakr-redis
- alsakr-prometheus
- alsakr-grafana
- alsakr-selenium

**Then visit: https://app.alsakronline.com**
