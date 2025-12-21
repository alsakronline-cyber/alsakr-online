# Git Repository & Environment Setup Guide

## Part 1: Pushing to Git Repository

### Step 1: Create .gitignore File

First, ensure you have a `.gitignore` file in your project root to exclude sensitive files:

```bash
# Navigate to project root
cd "c:\Users\pc shop\Downloads\ai marketplace"

# Create .gitignore
echo .env > .gitignore
echo **/.env >> .gitignore
echo *.db >> .gitignore
echo __pycache__/ >> .gitignore
echo node_modules/ >> .gitignore
echo .next/ >> .gitignore
echo dist/ >> .gitignore
echo qdrant_data/ >> .gitignore
echo ollama_data/ >> .gitignore
```

### Step 2: Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add your remote repository (replace with your actual repo URL)
git remote add origin https://github.com/yourusername/alsakr-online.git

# Or if using SSH:
# git remote add origin git@github.com:yourusername/alsakr-online.git
```

### Step 3: Stage and Commit Files

```bash
# Stage all files (respecting .gitignore)
git add .

# Commit with a meaningful message
git commit -m "Initial commit: Alsakr Online - Complete project structure"

# Push to remote repository
git push -u origin main
```

> **⚠️ IMPORTANT**: Never commit `.env` files with real credentials! Only commit `.env.example`.

---

## Part 2: Managing Environment Variables on Server

### Step 1: SSH into Your Oracle VPS

```bash
ssh ubuntu@your-oracle-vps-ip
```

### Step 2: Clone Repository to Server

```bash
# On the server
cd ~
git clone https://github.com/yourusername/alsakr-online.git
cd alsakr-online/infrastructure
```

### Step 3: Create Real .env File on Server

```bash
# Copy the example file
cp .env.example .env

# Edit with nano or vim
nano .env
```

### Step 4: Configure Environment Variables

Update the `.env` file with your **real production values**:

```bash
# General
ENV=production
DOMAIN=app.alsakronline.com

# Backend / AI
JWT_SECRET=REPLACE_WITH_STRONG_RANDOM_STRING_MIN_32_CHARS
OLLAMA_HOST=http://ollama:11434

# n8n
N8N_USER=admin
N8N_PASS=REPLACE_WITH_SECURE_PASSWORD

# Email (SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=admin@alsakronline.com
SMTP_PASS=REPLACE_WITH_YOUR_ACTUAL_EMAIL_PASSWORD
```

**How to generate a secure JWT secret:**
```bash
# On server, run:
openssl rand -base64 32
```

### Step 5: Secure the .env File

```bash
# Set strict permissions (only owner can read/write)
chmod 600 .env

# Verify permissions
ls -la .env
# Should show: -rw------- 1 ubuntu ubuntu
```

### Step 6: Verify Configuration

```bash
# Check that .env is loaded properly (without showing values)
cat .env | grep -v "^#" | grep -v "^$"
```

---

## Part 3: Updating Code After Changes

### On Your Local Machine:

```bash
# After making code changes
git add .
git commit -m "Description of changes"
git push origin main
```

### On the Server:

```bash
# SSH into server
ssh ubuntu@your-oracle-vps-ip

# Navigate to project
cd ~/alsakr-online

# Pull latest changes
git pull origin main

# Rebuild and restart containers
cd infrastructure
docker compose down
docker compose up -d --build

# Check logs
docker compose logs -f
```

---

## Part 4: Environment Variable Best Practices

### ✅ DO:
- Keep `.env.example` in Git with placeholder values
- Use different values for development and production
- Store production secrets in a password manager
- Set restrictive file permissions (600) on `.env`
- Rotate secrets regularly (JWT, passwords)

### ❌ DON'T:
- Never commit `.env` files to Git
- Never share `.env` files via email/chat
- Don't use weak or default passwords in production
- Don't reuse passwords across services

---

## Part 5: Backup Strategy

### Backup Environment Configuration

```bash
# On server - create encrypted backup
tar -czf env-backup-$(date +%Y%m%d).tar.gz .env
gpg -c env-backup-*.tar.gz  # Will prompt for password
rm env-backup-*.tar.gz      # Remove unencrypted version

# Download to local machine
scp ubuntu@your-vps-ip:~/alsakr-online/infrastructure/env-backup-*.tar.gz.gpg ./backups/
```

### Restore from Backup

```bash
# Upload to server
scp ./backups/env-backup-*.tar.gz.gpg ubuntu@your-vps-ip:~/

# On server - decrypt and extract
gpg -d env-backup-*.tar.gz.gpg > env-backup.tar.gz
tar -xzf env-backup.tar.gz
```

---

## Quick Reference Commands

```bash
# Check if .env is being used by containers
docker compose config

# Restart specific service after .env change
docker compose restart backend

# View environment variables in running container
docker exec alsakr-backend env | grep SMTP

# Test SMTP connection
docker exec -it alsakr-backend python -c "
import smtplib
import os
smtp = smtplib.SMTP_SSL(os.getenv('SMTP_HOST'), int(os.getenv('SMTP_PORT')))
smtp.login(os.getenv('SMTP_USER'), os.getenv('SMTP_PASS'))
print('SMTP connection successful!')
smtp.quit()
"
```
