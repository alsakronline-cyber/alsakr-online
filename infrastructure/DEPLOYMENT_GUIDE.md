# Complete Deployment Guide

## Quick Deployment

### On VPS:

```bash
# Make script executable
chmod +x infrastructure/deploy.sh

# Run deployment
cd ~/alsakr-online
./infrastructure/deploy.sh production
```

This will:
1. ✅ Backup current state
2. ✅ Pull latest code
3. ✅ Build all Docker images
4. ✅ Run database migrations
5. ✅ Start all services
6. ✅ Verify deployment
7. ✅ Display service URLs

---

## Manual Deployment Steps

If you prefer step-by-step deployment:

### 1. Prepare Environment

```bash
# SSH into VPS
ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96

# Navigate to project
cd ~/alsakr-online

# Pull latest code
git pull origin main
```

### 2. Configure Environment Variables

```bash
# Backend
nano backend/.env

# Add:
DATABASE_URL=postgresql://user:pass@db:5432/alsakr
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
REDIS_HOST=redis
N8N_WEBHOOK_URL=http://n8n:5678/webhook
```

```bash
# Frontend
nano frontend/.env.local

# Add:
NEXT_PUBLIC_API_URL=https://api.app.alsakronline.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
```

### 3. Build and Deploy

```bash
cd infrastructure

# Stop existing containers
docker compose down

# Build images
docker compose build --no-cache backend frontend

# Start all services
docker compose up -d

# Check status
docker compose ps
```

### 4. Run Migrations

```bash
# Run database migrations
docker compose exec backend alembic upgrade head
```

### 5. Verify Deployment

```bash
# Check logs
docker compose logs -f backend
docker compose logs -f frontend

# Test API
curl https://api.app.alsakronline.com/health

# Test frontend
curl https://app.alsakronline.com
```

---

## Service Management

### View Logs
```bash
cd infrastructure

# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f n8n
```

### Restart Services
```bash
# Restart specific service
docker compose restart backend
docker compose restart frontend

# Restart all
docker compose restart
```

### Stop Services
```bash
# Stop all
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Update Single Service
```bash
# Update backend only
docker compose build backend
docker compose up -d backend

# Update frontend only
docker compose build frontend
docker compose up -d frontend
```

---

## Troubleshooting

### Backend Issues

```bash
# Check backend logs
docker compose logs backend | tail -100

# Enter backend container
docker exec -it alsakr-backend bash

# Check dependencies
docker exec alsakr-backend pip list
```

### Frontend Issues

```bash
# Check frontend logs
docker compose logs frontend | tail -100

# Rebuild without cache
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Database Issues

```bash
# Check database connection
docker exec -it alsakr-db psql -U alsakr -d alsakr

# View migrations
docker exec alsakr-backend alembic current

# Reset database (⚠️ DATA LOSS)
docker compose down -v
docker compose up -d db
docker compose exec backend alembic upgrade head
```

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Stop new containers
docker compose down

# 2. Restore from backup
cp backups/YYYYMMDD_HHMMSS/alsakr.db backend/alsakr.db

# 3. Checkout previous commit
git log --oneline -5  # Find working commit
git checkout <commit-hash>

# 4. Rebuild and start
docker compose build
docker compose up -d
```

---

## Performance Monitoring

### Resource Usage
```bash
# Monitor containers
docker stats

# Disk usage
docker system df
```

### Application Metrics
```bash
# API response times
docker compose logs backend | grep "INFO:"

# Request counts
docker compose logs caddy | grep "status"
```

---

## Security Checklist

- [ ] Environment variables configured
- [ ] SSL certificates active (Caddy handles this)
- [ ] Firewall configured (allow 80, 443, deny others)
- [ ] Database passwords strong
- [ ] API keys rotated regularly
- [ ] Backups automated
- [ ] Logs monitored

---

## Automated Backups

Add to crontab:

```bash
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/ubuntu/alsakr-online/infrastructure/backup.sh
```

Create `infrastructure/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups/$(date +\%Y\%m\%d)"
mkdir -p $BACKUP_DIR

# Backup database
docker exec alsakr-db pg_dump -U alsakr alsakr > $BACKUP_DIR/database.sql

# Backup volumes
cp -r /var/lib/docker/volumes $BACKUP_DIR/volumes

# Keep only last 7 days
find /home/ubuntu/backups -type d -mtime +7 -exec rm -rf {} +
```

---

## CI/CD Integration

For automated deployment on git push, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd ~/alsakr-online
            ./infrastructure/deploy.sh production
```

---

## Monitoring & Alerts

Setup with Grafana (already in docker-compose):

```bash
# Access Grafana
http://localhost:3001

# Default credentials
admin / admin
```

Configure alerts for:
- High CPU/Memory usage
- Failed requests
- Slow response times
- Container restarts

---

## Resources

- **Deployment Script**: `infrastructure/deploy.sh`
- **Docker Compose**: `infrastructure/docker-compose.yml`
- **Environment Template**: `backend/.env.example`
- **Logs Directory**: `infrastructure/logs/`
- **Backups Directory**: `infrastructure/backups/`
