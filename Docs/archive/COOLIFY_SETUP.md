# Coolify Setup Guide for Oracle VPS

## What is Coolify?

Coolify is a **self-hosted Heroku/Vercel alternative** that provides:
- ✅ Web-based deployment dashboard
- ✅ Automatic SSL certificates (via Caddy)
- ✅ Git integration (auto-deploy on push)
- ✅ Database management
- ✅ Environment variable management
- ✅ Built-in reverse proxy
- ✅ Docker Compose support

**Perfect for managing Alsakr Online!**

---

## Prerequisites

- **Server**: Oracle VPS (144.24.208.96)
- **SSH**: `ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96` (password: alsakr)
- **Resources**: 24GB RAM, 95GB Disk ✅
- **Domain**: app.alsakronline.com pointing to 144.24.208.96
- **Ports**: 22, 80, 443, 8000 (Coolify dashboard)

---

## Part 1: Install Coolify

### Step 1: SSH into Server

```bash
ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96
# Password: alsakr
```

### Step 2: Install Docker (if not already installed)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# Verify
docker --version
```

### Step 3: Install Coolify

```bash
# Run official Coolify installer
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

**Installation will:**
- Install Docker Compose (if needed)
- Pull Coolify images
- Start Coolify services
- Configure firewall rules
- Take 3-5 minutes

### Step 4: Access Coolify Dashboard

**After installation completes:**

1. **Open in browser**: `http://144.24.208.96:8000`
2. **First-time setup**:
   - Create admin account
   - Set admin email
   - Set strong password
3. **Login** to Coolify dashboard

---

## Part 2: Configure Coolify

### Step 1: Setup Server in Coolify

1. **Navigate to**: Servers → Localhost
2. **Verify server is connected** (green status)
3. **Set server name**: `alsakr-production`

### Step 2: Configure Email (Optional but Recommended)

1. **Go to**: Settings → Email
2. **SMTP Settings**:
   ```
   Host: smtp.hostinger.com
   Port: 465
   Encryption: SSL
   Username: admin@alsakronline.com
   Password: <your_hostinger_password>
   From Address: admin@alsakronline.com
   ```
3. **Test connection** → Save

### Step 3: Setup Domain for Coolify Dashboard

1. **Go to**: Settings → Configuration
2. **Set Coolify URL**: `https://coolify.alsakronline.com`
3. **Enable automatic SSL**
4. **Add DNS record** in your domain registrar:
   ```
   Type: A
   Host: coolify
   Value: 144.24.208.96
   TTL: 300
   ```
5. Wait 5 minutes for DNS propagation
6. **Access**: `https://coolify.alsakronline.com` (SSL auto-configured)

---

## Part 3: Deploy Alsakr Online via Coolify

### Method 1: Docker Compose Deployment (Recommended)

#### Step 1: Create New Project

1. **In Coolify Dashboard**: Projects → **Create New Project**
2. **Project Name**: `Alsakr Online`
3. **Description**: `AI-powered industrial spare parts marketplace`

#### Step 2: Add Docker Compose Service

1. **Click** on the project
2. **Add Resource** → **Docker Compose**
3. **Configuration**:
   - **Name**: `alsakr-stack`
   - **Server**: localhost
   - **Network**: Create new → `alsakr-network`

#### Step 3: Configure Docker Compose

1. **Paste your `docker-compose.yml` content** (from `infrastructure/docker-compose.yml`)
2. **Click** "Save" (Coolify will validate the file)

#### Step 4: Setup Environment Variables

1. **Go to**: Environment Variables tab
2. **Add variables** (from your `.env` file):
   ```
   ENV=production
   DOMAIN=app.alsakronline.com
   JWT_SECRET=<generate with: openssl rand -base64 32>
   OLLAMA_HOST=http://ollama:11434
   QDRANT_HOST=http://qdrant:6333
   REDIS_URL=redis://redis:6379
   N8N_USER=admin
   N8N_PASS=<your_secure_password>
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_USER=admin@alsakronline.com
   SMTP_PASS=<your_hostinger_password>
   ```

#### Step 5: Configure Domains

1. **Go to**: Domains tab
2. **Add domains** for each service:
   ```
   Frontend: app.alsakronline.com
   Backend: api.app.alsakronline.com
   PocketBase: crm.app.alsakronline.com
   n8n: workflows.app.alsakronline.com
   ```
3. **Enable SSL** for each domain (auto via Caddy)

#### Step 6: Deploy

1. **Click**: Deploy button
2. **Watch logs** in real-time
3. **Wait** for deployment to complete (5-10 minutes first time)

### Method 2: Git Integration (Alternative)

#### Step 1: Push to Git Repository

```bash
# On your local machine
cd "c:\Users\pc shop\Downloads\alsakr-online"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/alsakr-online.git
git push -u origin main
```

#### Step 2: Connect Git in Coolify

1. **In Coolify**: Add Resource → **Git Repository**
2. **Repository URL**: `https://github.com/yourusername/alsakr-online.git`
3. **Branch**: `main`
4. **Build Pack**: Docker Compose
5. **Dockerfile Path**: `infrastructure/docker-compose.yml`

#### Step 3: Configure Auto-Deploy

1. **Enable**: Auto Deploy on Git Push
2. **Coolify generates a webhook URL**
3. **Add webhook to GitHub**:
   - Settings → Webhooks → Add webhook
   - Payload URL: (from Coolify)
   - Content type: application/json
   - Events: Push events

---

## Part 4: Post-Installation Tasks

### Step 1: Verify All Services Running

1. **In Coolify Dashboard**: View all containers
2. **Check status**: All should be "Running" (green)
3. **Check logs**: Click any service → View Logs

### Step 2: Test Endpoints

**Open in browser:**
- ✅ `https://app.alsakronline.com` → Frontend
- ✅ `https://api.app.alsakronline.com/docs` → API Docs
- ✅ `https://crm.app.alsakronline.com` → PocketBase
- ✅ `https://workflows.app.alsakronline.com` → n8n
- ✅ `https://coolify.alsakronline.com` → Coolify Dashboard

### Step 3: Setup Backups in Coolify

1. **Go to**: Settings → Backups
2. **Configure S3** (optional) or local backups
3. **Schedule**: Daily at 2 AM
4. **Retention**: 7 days

### Step 4: Setup Monitoring

Coolify includes built-in monitoring:
1. **Go to**: Servers → localhost → Metrics
2. **View**:
   - CPU usage
   - Memory usage
   - Disk usage
   - Network traffic

---

## Coolify vs Direct Docker Compose

| Feature | Coolify | Direct Docker Compose |
|---------|---------|----------------------|
| Web UI | ✅ Yes | ❌ Terminal only |
| SSL Auto-Config | ✅ Automatic | 🔧 Manual (Caddy) |
| Git Integration | ✅ Auto-deploy | 🔧 Manual pull |
| Rollback | ✅ One-click | 🔧 Manual |
| Logs | ✅ Web dashboard | 🔧 Terminal commands |
| Monitoring | ✅ Built-in | 🔧 Setup Prometheus/Grafana |
| Updates | ✅ Web UI | 🔧 SSH + commands |
| Learning Curve | Easy | Medium |

**Recommendation**: Use Coolify for easier management!

---

## Troubleshooting

### Issue: Can't access Coolify dashboard (port 8000)

**Fix:**
```bash
# Check if Coolify is running
docker ps | grep coolify

# Check Oracle Cloud Security List
# Add ingress rule for port 8000 from your IP

# Check UFW
sudo ufw allow 8000/tcp
sudo ufw reload
```

### Issue: Deployment failed

**Check:**
1. Coolify logs: Dashboard → Service → Logs
2. Docker Compose file syntax
3. Environment variables are set correctly
4. Domains point to correct IP

### Issue: SSL not working

**Wait 5-10 minutes** for Let's Encrypt to issue certificates. Check:
1. DNS is propagated: `nslookup app.alsakronline.com`
2. Ports 80 and 443 are open
3. Coolify logs for certificate errors

---

## Quick Commands

```bash
# Coolify status
sudo systemctl status coolify

# Restart Coolify
sudo systemctl restart coolify

# View Coolify logs
docker logs -f coolify

# Update Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Uninstall Coolify (if needed)
docker stop $(docker ps -a -q)
docker system prune -a --volumes
```

---

## Success Checklist

- [ ] Coolify installed and accessible at `:8000`
- [ ] Coolify dashboard has custom domain with SSL
- [ ] Project created in Coolify
- [ ] Docker Compose uploaded
- [ ] Environment variables configured
- [ ] Domains configured with SSL
- [ ] All containers running
- [ ] Frontend accessible via HTTPS
- [ ] API accessible via HTTPS
- [ ] Backups configured

---

## Next Steps After Coolify Setup

1. **Initial Setup**: Create PocketBase admin user
2. **Configure n8n**: Setup workflows
3. **Test Features**: AI search, scraping, RFQ
4. **Monitor**: Check Coolify metrics daily
5. **Update**: Push to Git → Auto-deploy!

**Coolify makes deployment and management significantly easier!**
