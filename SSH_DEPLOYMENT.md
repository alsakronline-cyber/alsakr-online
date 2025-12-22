# SSH Direct Deployment Guide

Deploy Alsakr Online using traditional Docker Compose via SSH terminal.

**Server**: 144.24.208.96 | **SSH**: `ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96` | **Password**: alsakr

---

## Prerequisites

- Oracle VPS running (144.24.208.96)
- SSH access configured
- Domain DNS pointing to server IP

---

## Step 1: Install Docker

```bash
# SSH into server
ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96
# Password: alsakr

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

## Step 2: Configure Firewall

```bash
# Allow required ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

---

## Step 3: Setup Swap (Optional but Recommended)

```bash
# Create 4GB swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

---

## Step 4: Upload Project Files

**From your local machine (Windows PowerShell):**

```powershell
# Navigate to project directory
cd "c:\Users\pc shop\Downloads\alsakr-online"

# Upload to server
scp -i ~/.ssh/oracle_vps_key -r backend frontend infrastructure ubuntu@144.24.208.96:~/alsakr-online/
# Enter password: alsakr when prompted
```

**This will upload:**
- `backend/` - FastAPI application
- `frontend/` - Next.js application
- `infrastructure/` - Docker Compose, Caddyfile, config

---

## Step 5: Configure Environment Variables

**On the server:**

```bash
cd ~/alsakr-online/infrastructure

# Copy example to .env
cp .env.example .env

# Edit with nano
nano .env
```

**Update these values:**

```bash
# Generate JWT secret
openssl rand -base64 32
# Copy the output and paste it as JWT_SECRET below

ENV=production
DOMAIN=app.alsakronline.com
JWT_SECRET=<paste_generated_secret_here>
OLLAMA_HOST=http://ollama:11434
QDRANT_HOST=http://qdrant:6333
REDIS_URL=redis://redis:6379
N8N_USER=admin
N8N_PASS=<your_secure_password_here>
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=admin@alsakronline.com
SMTP_PASS=<your_hostinger_email_password>
```

**Save**: `Ctrl+X`, then `Y`, then `Enter`

**Secure the file:**
```bash
chmod 600 .env
ls -la .env  # Should show: -rw-------
```

---

## Step 6: Deploy with Docker Compose

```bash
cd ~/alsakr-online/infrastructure

# Start all services
docker compose up -d --build
```

**This will:**
- Download required Docker images (~10 minutes first time)
- Build backend and frontend containers
- Start 11 services (Backend, Frontend, Caddy, Databases, etc.)

---

## Step 7: Monitor Deployment

```bash
# Check container status (all should show "Up")
docker compose ps

# View logs (Ctrl+C to exit)
docker compose logs -f

# View specific service logs
docker compose logs caddy
docker compose logs backend
docker compose logs frontend
```

---

## Step 8: Verify SSL Certificates

```bash
# Check Caddy logs for SSL
docker logs alsakr-caddy | grep -i certificate

# Wait 2-3 minutes for Let's Encrypt to issue certificates
```

---

## Step 9: Test Deployment

**Open in browser:**
- ✅ https://app.alsakronline.com (Frontend)
- ✅ https://api.app.alsakronline.com/docs (API Documentation)
- ✅ https://crm.app.alsakronline.com (PocketBase Admin)
- ✅ https://workflows.app.alsakronline.com (n8n Workflows)

**API Health Check:**
```bash
curl http://localhost:8000/api/health
# Should return: {"status":"healthy"}
```

---

## Step 10: Initialize Services

### PocketBase (CRM)
1. Visit: https://crm.app.alsakronline.com/_/
2. Create first admin user
3. Import schema (optional): `backend/pb_schema.json`

### n8n (Workflows)
1. Visit: https://workflows.app.alsakronline.com
2. Login with N8N_USER and N8N_PASS from `.env`
3. Import workflow: `infrastructure/workflows/rfq_flow.json`

---

## Maintenance Commands

### View Container Status
```bash
docker compose ps
docker stats --no-stream
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f caddy
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Update After Code Changes
```bash
# On local machine: push to Git
git add .
git commit -m "Update description"
git push

# On server: pull and rebuild
cd ~/alsakr-online
git pull origin main
cd infrastructure
docker compose down
docker compose up -d --build
```

### Stop All Services
```bash
docker compose down
```

### Clean Up Resources
```bash
# Remove stopped containers, unused images, volumes
docker system prune -a --volumes

# WARNING: This will delete all unused data!
```

---

## Backup Strategy

### Setup Automated Backups

```bash
# Create backup script
cat > ~/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

# Backup PocketBase
docker run --rm -v pocketbase_data:/data -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/pocketbase-$DATE.tar.gz -C /data .

# Backup Qdrant
docker run --rm -v qdrant_data:/data -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/qdrant-$DATE.tar.gz -C /data .

# Keep last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
echo "Backup completed: $DATE"
EOF

chmod +x ~/backup.sh

# Schedule weekly backups (Sundays at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * 0 ~/backup.sh") | crontab -
```

### Download Backups to Local Machine

```powershell
# From local machine
scp -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96:~/backups/*.tar.gz ./local_backups/
```

---

## Troubleshooting

### Containers Not Starting
```bash
# Check logs
docker compose logs

# Restart specific container
docker compose restart backend

# Full restart
docker compose down
docker compose up -d
```

### Port Conflicts
```bash
# Check what's using ports
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Kill process if needed
sudo kill <PID>
```

### SSL Not Working
- Wait 5-10 minutes for Let's Encrypt
- Check DNS: `nslookup app.alsakronline.com`
- Check Caddy logs: `docker logs alsakr-caddy`
- Verify ports 80/443 open in Oracle Cloud Security List

### Out of Disk Space
```bash
# Check usage
df -h

# Clean Docker
docker system prune -a --volumes

# Check large directories
du -sh ~/alsakr-online/*
```

---

## Performance Monitoring

```bash
# System resources
htop

# Docker stats
docker stats

# Disk usage
df -h

# Memory usage
free -h
```

---

## Success Checklist

- [ ] All 11 containers running (`docker compose ps`)
- [ ] HTTPS working (green padlock in browser)
- [ ] Frontend loads without errors
- [ ] API docs accessible at /docs
- [ ] PocketBase admin accessible
- [ ] n8n workflows accessible
- [ ] Disk usage < 20%
- [ ] Memory usage < 80%
- [ ] Backups scheduled

---

## Next Steps

1. **Configure AI Models**: Download Ollama models for RAG
2. **Setup Scrapers**: Configure SICK scraper in admin panel
3. **Test Features**: Try AI search, voice input, image search
4. **Monitor**: Check logs daily for errors
5. **Scale**: Optimize based on usage patterns

**Need easier management? Consider switching to [Coolify](./COOLIFY_SETUP.md)!**
