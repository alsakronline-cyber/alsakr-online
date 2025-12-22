# Alsakr Online - Deployment Guide

Choose your deployment method:

## 🎯 Method 1: Coolify (Recommended)
**Web-based deployment with automatic SSL, monitoring, and Git integration**

👉 **Follow**: [COOLIFY_SETUP.md](./COOLIFY_SETUP.md)

**Quick Install:**
```bash
ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
# Access: http://144.24.208.96:8000
```

**Advantages:**
- ✅ Web dashboard (no SSH needed after setup)
- ✅ Automatic SSL certificates
- ✅ One-click deploy & rollback
- ✅ Built-in monitoring
- ✅ Git auto-deploy on push

---

## ⚙️ Method 2: Direct SSH Deployment
**Traditional Docker Compose via terminal**

👉 **Follow**: [SSH_DEPLOYMENT.md](./SSH_DEPLOYMENT.md)

**Quick Deploy:**
```bash
# Upload files
scp -i ~/.ssh/oracle_vps_key -r backend frontend infrastructure ubuntu@144.24.208.96:~/alsakr-online/

# SSH and deploy
ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96
cd ~/alsakr-online/infrastructure
docker compose up -d --build
```

**Advantages:**
- ✅ Direct control
- ✅ No additional layer
- ✅ Traditional Docker workflow

---

## Server Details
- **IP**: 144.24.208.96
- **SSH**: `ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96`
- **Password**: alsakr
- **Resources**: 24GB RAM, 95GB Disk

## Required DNS Records
```
Type    Host              Value             TTL
A       app               144.24.208.96     300
A       api.app           144.24.208.96     300
A       crm.app           144.24.208.96     300
A       workflows.app     144.24.208.96     300
A       coolify           144.24.208.96     300  (if using Coolify)
```

## After Deployment
**Test these endpoints:**
- Frontend: https://app.alsakronline.com
- API: https://api.app.alsakronline.com/docs
- CRM: https://crm.app.alsakronline.com
- Workflows: https://workflows.app.alsakronline.com

---

## Additional Resources
- **Oracle VPS Setup**: [ORACLE_VPS_SETUP.md](./ORACLE_VPS_SETUP.md) - Complete server setup from scratch
- **Git & Environment**: [GIT_AND_ENV_SETUP.md](./GIT_AND_ENV_SETUP.md) - Git workflow and .env management
