# Oracle Cloud VPS Complete Setup Guide

## Prerequisites
- Credit/Debit card for Oracle Cloud account verification (free tier doesn't charge)
- SSH client (OpenSSH on Windows 10+, Linux, macOS)
- Your domain name registered and accessible

---

## Part 0: Oracle Cloud Account & Instance Creation

### Step 1: Create Oracle Cloud Account

1. **Visit Oracle Cloud**: https://www.oracle.com/cloud/free/
2. **Click "Start for free"**
3. **Fill in account details**:
   - Country/Territory
   - Your name and email
   - Create password
4. **Enter payment verification** (required but won't be charged on free tier)
5. **Complete phone verification**
6. **Verify email** via the link sent to your inbox

### Step 2: Create Virtual Cloud Network (VCN)

After logging into Oracle Cloud Console:

1. **Navigate to Networking**:
   - Click hamburger menu (☰) → **Networking** → **Virtual Cloud Networks**
2. **Create VCN**:
   - Click **"Start VCN Wizard"**
   - Select **"Create VCN with Internet Connectivity"**
   - Click **"Start VCN Wizard"**
3. **Configure VCN**:
   - **VCN Name**: `alsakr-vcn`
   - **Compartment**: Select your compartment (usually root)
   - **VCN CIDR Block**: `10.0.0.0/16` (default is fine)
   - **Public Subnet CIDR**: `10.0.0.0/24`
   - **Private Subnet CIDR**: `10.0.1.0/24`
   - Click **"Next"** then **"Create"**

### Step 3: Configure Security List (Before Creating Instance)

1. **In your newly created VCN**, click **"Security Lists"**
2. **Click on "Default Security List for alsakr-vcn"**
3. **Add Ingress Rules** by clicking **"Add Ingress Rules"**

Add these three rules one by one:

#### Rule 1: HTTP (Port 80)
```
Stateless: No
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 80
Description: HTTP Web Traffic
```

#### Rule 2: HTTPS (Port 443)
```
Stateless: No
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 443
Description: HTTPS Web Traffic
```

#### Rule 3: SSH (Port 22) - IMPORTANT
```
Stateless: No
Source Type: CIDR
Source CIDR: 0.0.0.0/0  (You can restrict this to YOUR_IP/32 after instance creation)
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 22
Description: SSH Access
```

### Step 4: Generate SSH Key Pair (On Your Local Machine)

**On Windows (PowerShell), Linux, or macOS:**

```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/oracle_vps_key

# When prompted:
# - Enter file name: (Press Enter to use default)
# - Enter passphrase: (Optional, but recommended)

# View your public key (you'll need this for instance creation)
cat ~/.ssh/oracle_vps_key.pub
```

**Save this public key content** - you'll paste it during instance creation.

### Step 5: Create Compute Instance

1. **Navigate to Compute**:
   - Click hamburger menu (☰) → **Compute** → **Instances**
2. **Click "Create Instance"**

#### Instance Configuration:

**Name**: `alsakr-server`

**Placement**:
- Availability Domain: Choose any (AD-1, AD-2, AD-3)

**Image and Shape**:
1. Click **"Change Image"**
   - Select **"Canonical Ubuntu"**
   - Version: **22.04** (or latest LTS)
   - Click **"Select Image"**

2. Click **"Change Shape"**
   - Click **"Ampere"** (ARM processor - free tier eligible)
   - Select: **VM.Standard.A1.Flex**
   - **OCPUs**: 4 (or 2-4 depending on availability)
   - **Memory (GB)**: 24 (or 12-24 GB)
   - Click **"Select Shape"**

> **💡 TIP**: The free tier allows up to 4 OCPUs and 24GB RAM total across all instances. You can use it all on one instance.

**Networking**:
- **Virtual Cloud Network**: Select `alsakr-vcn`
- **Subnet**: Select the Public Subnet
- **Assign a public IPv4 address**: ✅ **YES** (checked)

**Add SSH Keys**:
- Select **"Paste public keys"**
- Paste the content from `~/.ssh/oracle_vps_key.pub`

**Boot Volume**:
- Boot volume size: **100 GB** (or 50GB minimum)
- Leave other defaults

3. **Click "Create"**

**Wait 1-2 minutes** for the instance to provision. Status will change from **"Provisioning"** to **"Running"**.

### Step 6: Note Your Instance Details

Once the instance is running:

1. **Copy your Public IP Address** (you'll see it on the instance details page)
2. **Note your Username**: For Ubuntu images, it's `ubuntu`

### Step 7: First Connection to Your Instance

**On your local machine:**

```bash
# Connect via SSH (replace YOUR_PUBLIC_IP with actual IP)
ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96

# If you see a fingerprint verification prompt, type 'yes'
```

**Expected output:**
```
Welcome to Ubuntu 22.04.x LTS (GNU/Linux ...)
ubuntu@alsakr-server:~$
```

🎉 **Success! You're now connected to your Oracle Cloud VPS.**

---

## Part 0.5: Budget & Cost Management (Critical!)

### Step 1: Set Up Budget Alerts

**Prevent unexpected charges** by setting up budget notifications:

1. **Navigate to Billing**:
   - Click hamburger menu (☰) → **Billing & Cost Management** → **Budgets**
2. **Click "Create Budget"**
3. **Configure Budget**:
   - **Scope**: Select your compartment (usually root)
   - **Target**: Select **Cost-Tracking Tags** or **All Resources**
   - **Budget Amount**: `$1.00` (this ensures you get alerts for ANY spending)
   - **Budget Name**: `free-tier-protection`
   - **Description**: `Alert for any charges beyond free tier`
   - **Reset Period**: Monthly

4. **Set Alert Rules**:
   - **Alert Rule 1**:
     - **Type**: Actual Spend
     - **Threshold Metric**: Percentage of Budget
     - **Threshold**: `50%` (alert at $0.50)
     - **Recipients**: Your email address
   
   - **Click "Add Alert Rule"** for a second alert:
   - **Alert Rule 2**:
     - **Type**: Actual Spend
     - **Threshold**: `100%` (alert at $1.00)
     - **Recipients**: Your email address

5. **Click "Create"**

> **💡 TIP**: With a $1 budget and 50%/100% alerts, you'll be notified immediately if any charges appear.

### Step 2: Understand Free Tier Limits

**Always-Free Resources** (these NEVER expire):

| Resource | Free Tier Limit | Our Usage |
|----------|----------------|-----------|
| **Compute (ARM)** | 4 OCPUs + 24 GB RAM | ✅ 4 OCPUs + 24 GB (1 instance) |
| **Block Storage** | 200 GB total | ✅ 100 GB boot volume |
| **Public IP** | 2 IPv4 addresses | ✅ 1 IPv4 |
| **Outbound Data** | 10 TB/month | ✅ Well within limit |
| **Load Balancer** | 1 instance, 10 Mbps | ❌ Not used (using Caddy instead) |

**What Could Cause Charges:**
- ❌ Creating additional x86 (non-ARM) instances
- ❌ Exceeding 200 GB total storage
- ❌ Creating a second instance without stopping the first
- ❌ Using paid services (Oracle Database, Object Storage beyond free tier)

### Step 3: Monitor Your Usage

1. **Navigate to Cost Analysis**:
   - Hamburger menu → **Billing & Cost Management** → **Cost Analysis**
2. **View Dashboard**:
   - Check **"Cost"** tab - should show $0.00 if staying within free tier
   - Check **"Usage"** tab - monitor your compute and storage usage
3. **Set up a weekly check** reminder on your calendar

### Step 4: Enable Usage Tracking

1. **Go to Account Settings**:
   - Click your profile icon (top right) → **Tenancy: [Your Tenancy Name]**
2. **Enable Usage Tracking**:
   - Find **Cost Analysis** section
   - Enable **Daily Usage Reports**
   - This helps you track trends

---

## Part 0.6: Storage Management

### Understanding Your Storage Allocation

**Boot Volume**: 100 GB (attached to your instance)
**Free Tier Total**: 200 GB available

This means you have **100 GB remaining** for backups or additional volumes.

### Step 1: Monitor Storage Usage on Instance

**After connecting to your VPS:**

```bash
# Check disk usage
df -h

# Expected output:
# /dev/sda1        98G   5.2G   93G   6% /
```

### Step 2: Set Up Storage Monitoring

```bash
# Install monitoring script
cat > ~/check_storage.sh << 'EOF'
#!/bin/bash
THRESHOLD=80
USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $USAGE -gt $THRESHOLD ]; then
    echo "WARNING: Disk usage is at ${USAGE}%"
    echo "Run: docker system prune -a to free space"
fi
EOF

chmod +x ~/check_storage.sh

# Add to crontab (runs daily at 9 AM)
(crontab -l 2>/dev/null; echo "0 9 * * * ~/check_storage.sh") | crontab -
```

### Step 3: Storage Best Practices

**Prevent storage issues:**

```bash
# 1. Clean Docker regularly (weekly)
docker system prune -a --volumes

# 2. Rotate logs (already configured in Docker daemon)

# 3. Check large files
du -h --max-depth=1 / 2>/dev/null | sort -hr | head -10

# 4. Set up automatic cleanup cron
# Add to crontab: Run cleanup every Sunday at 3 AM
(crontab -l 2>/dev/null; echo "0 3 * * 0 docker system prune -af --volumes") | crontab -
```

---

## Part 0.7: Database & Data Storage Strategy

### Our Database Stack (No Oracle Database Needed)

**This project uses:**
1. **PocketBase** - User authentication & relational data (SQLite-based)
2. **Qdrant** - Vector database for AI search
3. **Redis** - Caching layer

> **Note**: We do NOT use Oracle Database (which has limited free tier). Our stack is optimized for the Always-Free compute tier.

### Data Persistence Strategy

**All data is persisted using Docker volumes**:

```yaml
volumes:
  ollama_data:      # AI models (~5-10 GB per model)
  qdrant_data:      # Vector embeddings (~1-5 GB for 10k products)
  pocketbase_data:  # User/Auth data (~100-500 MB)
  n8n_data:         # Workflow definitions (~10-50 MB)
  redis_data:       # Cache (volatile, ~100 MB)
  prometheus_data:  # Metrics (~500 MB)
  grafana_data:     # Dashboards (~50 MB)
```

**Estimated total storage**: 10-20 GB (well within 100 GB boot volume)

### Backup Strategy

**Create regular backups of critical data:**

```bash
# Create backup script
cat > ~/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

# Backup PocketBase (users, auth)
docker run --rm -v pocketbase_data:/data -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/pocketbase-$DATE.tar.gz -C /data .

# Backup Qdrant (vectors)
docker run --rm -v qdrant_data:/data -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/qdrant-$DATE.tar.gz -C /data .

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x ~/backup.sh

# Schedule weekly backups (Sundays at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * 0 ~/backup.sh") | crontab -
```

**Download backups to your local machine:**

```bash
# On your local machine
scp -i ~/.ssh/oracle_vps_key ubuntu@YOUR_VPS_IP:~/backups/*.tar.gz ./local_backups/
```

---

## Part 0.8: Oracle Cloud Monitoring Dashboard

### Step 1: Enable Compute Instance Metrics

1. **Navigate to your instance**:
   - Compute → Instances → `alsakr-server`
2. **Click "Metrics" tab** (left sidebar)
3. **View metrics**:
   - CPU Utilization
   - Memory Utilization
   - Disk Read/Write
   - Network In/Out

### Step 2: Set Up Alarm for High CPU

1. **While viewing instance, click "Create Alarm"**
2. **Configure Alarm**:
   - **Name**: `high-cpu-usage`
   - **Metric**: CPU Utilization
   - **Threshold**: `> 90%` for `5 minutes`
   - **Destination**: Create notification topic → Add your email
3. **Save**

This alerts you if the server is overloaded.

---

## Part 0.9: Free Tier Compliance Checklist

**Before deploying, verify:**

- [ ] **Only 1 instance** of type **VM.Standard.A1.Flex** is running
- [ ] **Total OCPUs**: 4 or less
- [ ] **Total RAM**: 24 GB or less
- [ ] **Total Boot Volumes**: 100 GB (one per instance)
- [ ] **Total Block Storage**: Under 200 GB
- [ ] **Budget alerts** set to $1.00 with email notifications
- [ ] **No x86 instances** (they are NOT free)
- [ ] **No Oracle Database** service enabled
- [ ] **No Object Storage** usage (or under 10 GB free tier)

**If any item is unchecked, you might incur charges!**

---

## Part 1: Oracle Cloud Port Configuration

### Step 1: Configure Security List (Ingress Rules)

Oracle Cloud uses **Security Lists** to control network traffic. You need to open specific ports:

#### Access Oracle Cloud Console:
1. Navigate to: **Networking** → **Virtual Cloud Networks**
2. Click on your VCN (Virtual Cloud Network)
3. Click **Security Lists** → **Default Security List**
4. Click **Add Ingress Rules**

#### Required Ingress Rules:

| Service | Protocol | Source CIDR | Destination Port | Description |
|---------|----------|-------------|------------------|-------------|
| HTTP | TCP | 0.0.0.0/0 | 80 | Public HTTP access (Caddy) |
| HTTPS | TCP | 0.0.0.0/0 | 443 | Public HTTPS access (Caddy) |
| SSH | TCP | YOUR_IP/32 | 22 | SSH access (restrict to your IP) |

**Add each rule separately:**
```
Stateless: No
Source Type: CIDR
Source CIDR: 0.0.0.0/0 (or YOUR_IP/32 for SSH)
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 80 (or 443, 22)
Description: HTTP Web Traffic (or HTTPS, SSH)
```

> **🔒 SECURITY TIP**: For SSH (port 22), use `YOUR_IP/32` instead of `0.0.0.0/0` to restrict access to only your IP address.

### Step 2: Configure Network Security Group (Optional but Recommended)

For better security isolation:
1. **Compute** → **Instances** → Your Instance
2. **Attached VNICs** → Primary VNIC
3. **Network Security Groups** → **Create Network Security Group**
4. Add the same rules as above

---

## Part 2: VPS Firewall Configuration (UFW)

Even with Oracle's security lists, configure the OS-level firewall:

### Initial Firewall Setup

```bash
# SSH into your VPS
ssh ubuntu@your-vps-ip

# Install UFW (should be pre-installed on Ubuntu)
sudo apt update
sudo apt install ufw -y

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (IMPORTANT: Do this FIRST to avoid lockout!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

Expected output:
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                     ALLOW       Anywhere
```

> **⚠️ WARNING**: Always allow SSH (port 22) BEFORE enabling UFW, or you'll lock yourself out!

---

## Part 3: DNS Configuration

### Step 1: Point Domain to VPS IP

In your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):

```
Type    Name                Value               TTL
A       @                   YOUR_VPS_IP         300
A       app                 YOUR_VPS_IP         300
A       api.app             YOUR_VPS_IP         300
A       crm.app             YOUR_VPS_IP         300
A       workflows.app       YOUR_VPS_IP         300
```

**Alternatively (using CNAME for subdomains):**
```
Type    Name                Value                       TTL
A       @                   YOUR_VPS_IP                 300
A       app                 YOUR_VPS_IP                 300
CNAME   api.app             app.alsakronline.com        300
CNAME   crm.app             app.alsakronline.com        300
CNAME   workflows.app       app.alsakronline.com        300
```

### Step 2: Verify DNS Propagation

```bash
# On your local machine
nslookup app.alsakronline.com
nslookup api.app.alsakronline.com

# Or use online tools:
# https://dnschecker.org
```

DNS propagation can take 5-60 minutes.

---

## Part 4: Initial VPS Security Hardening

### Step 1: Create Non-Root User (Recommended)

```bash
# SSH as ubuntu user is already non-root on Oracle Cloud
# But verify you're not using root
whoami  # Should show: ubuntu
```

### Step 2: Disable Root Login & Password Authentication

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Find and modify these lines:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# Save and restart SSH
sudo systemctl restart sshd
```

### Step 3: Set Up SSH Key Authentication (If Not Already Done)

**On your local machine:**
```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key to server
ssh-copy-id ubuntu@your-vps-ip

# Test connection
ssh ubuntu@your-vps-ip
```

### Step 4: Install Fail2Ban (Prevents Brute Force)

```bash
sudo apt install fail2ban -y

# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit config
sudo nano /etc/fail2ban/jail.local

# Find [sshd] section and ensure:
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status sshd
```

### Step 5: Configure Automatic Security Updates

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
# Select "Yes" when prompted
```

### Step 6: Set Up Swap (For 4GB RAM instances)

```bash
# Check if swap exists
sudo swapon --show

# If empty, create swap
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

## Part 5: Docker Security Configuration

### Step 1: Run Docker Rootless (Advanced - Optional)

For even better security, run Docker without root privileges:

```bash
# Install rootless Docker
curl -fsSL https://get.docker.com/rootless | sh

# Follow the instructions to set PATH
```

### Step 2: Enable Docker Log Rotation

```bash
sudo nano /etc/docker/daemon.json
```

Add:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
sudo systemctl restart docker
```

---

## Part 6: Monitoring & Maintenance

### Set Up Basic Monitoring

```bash
# Install htop for system monitoring
sudo apt install htop -y

# Check resource usage
htop

# Monitor Docker containers
docker stats

# Check disk usage
df -h

# Check logs
docker compose logs -f --tail=100
```

### Regular Maintenance Commands

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up Docker
docker system prune -a --volumes

# Check failed services
sudo systemctl --failed

# View system logs
sudo journalctl -xe
```

---

## Part 7: SSL Certificate Setup (Automatic with Caddy)

Caddy automatically handles SSL certificates via Let's Encrypt. After DNS is configured:

1. Ensure your domain points to the VPS IP
2. Start Docker Compose: `docker compose up -d`
3. Caddy will automatically request and renew SSL certificates
4. Verify: `https://app.alsakronline.com`

**Check Caddy logs for SSL issues:**
```bash
docker logs alsakr-caddy
```

---

## Complete Setup Checklist

- [ ] **Oracle Cloud Security List**: Opened ports 80, 443, 22
- [ ] **UFW Firewall**: Configured and enabled
- [ ] **DNS Records**: A/CNAME records pointing to VPS IP
- [ ] **SSH Security**: Key-based auth enabled, password auth disabled
- [ ] **Fail2Ban**: Installed and configured
- [ ] **Automatic Updates**: Enabled
- [ ] **Swap Memory**: Created (for 4GB instances)
- [ ] **Docker**: Installed and configured
- [ ] **Environment Variables**: `.env` file created and secured
- [ ] **Git Repository**: Code cloned to server
- [ ] **Docker Compose**: All containers running
- [ ] **SSL Certificates**: Verified HTTPS works
- [ ] **Monitoring**: Prometheus/Grafana accessible locally

---

## Troubleshooting Common Issues

### Issue: Can't Access Port 80/443 from Browser

**Check:**
1. Oracle Security List has ingress rules for 80/443
2. UFW allows 80/443: `sudo ufw status`
3. Docker containers are running: `docker ps`
4. Caddy is listening: `docker logs alsakr-caddy`

**Fix:**
```bash
# Reload UFW
sudo ufw reload

# Restart Caddy
docker restart alsakr-caddy
```

### Issue: SSH Connection Refused

**Check:**
1. Oracle Security List allows port 22 from your IP
2. SSH service is running: `sudo systemctl status sshd`
3. Your IP hasn't changed (if restricted)

### Issue: SSL Certificate Not Working

**Check:**
1. DNS has propagated: `nslookup app.alsakronline.com`
2. Domain resolves to correct IP
3. Ports 80 and 443 are accessible
4. Caddy logs: `docker logs alsakr-caddy`

**Wait 5-10 minutes** - Let's Encrypt has rate limits and validation takes time.

---

## Quick Reference: Port Summary

| Port | Service | Access | Bound To |
|------|---------|--------|----------|
| 22 | SSH | Your IP only | 0.0.0.0 |
| 80 | HTTP (Caddy) | Public | 0.0.0.0 |
| 443 | HTTPS (Caddy) | Public | 0.0.0.0 |
| 3000 | Frontend | Internal only | 127.0.0.1 |
| 8000 | Backend API | Internal only | 127.0.0.1 |
| 6333 | Qdrant | Internal only | 127.0.0.1 |
| 8090 | PocketBase | Internal only | 127.0.0.1 |
| 5678 | n8n | Internal only | 127.0.0.1 |
| 9090 | Prometheus | Internal only | 127.0.0.1 |
| 3001 | Grafana | Internal only | 127.0.0.1 |

**Only Caddy (80/443) is exposed to the internet** - all other services are protected by `127.0.0.1` binding.
