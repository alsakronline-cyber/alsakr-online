#!/bin/bash
# Coolify Installation Script for Oracle VPS (144.24.208.96)
# Run this on the server after SSH connection

set -e

echo "=== Coolify Installation for Alsakr Online ==="
echo "Server: 144.24.208.96"
echo "Starting installation at $(date)"
echo ""

# 1. Update system
echo "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Step 2: Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    newgrp docker
    echo "Docker installed: $(docker --version)"
else
    echo "Step 2: Docker already installed: $(docker --version)"
fi

# 3. Configure firewall
echo "Step 3: Configuring UFW firewall..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 8000/tcp # Coolify Dashboard
sudo ufw --force enable
echo "Firewall configured!"

# 4. Install Coolify
echo "Step 4: Installing Coolify..."
echo "This will take 3-5 minutes..."
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

echo ""
echo "=== Installation Complete! ==="
echo ""
echo "✅ Coolify is now running!"
echo ""
echo "📱 Access Coolify Dashboard:"
echo "   http://144.24.208.96:8000"
echo ""
echo "📋 Next Steps:"
echo "   1. Open the URL above in your browser"
echo "   2. Create your admin account"
echo "   3. Follow COOLIFY_SETUP.md for full configuration"
echo ""
echo "🔒 For secure access, setup custom domain:"
echo "   - Add DNS: coolify.alsakronline.com → 144.24.208.96"
echo "   - Configure in Coolify: Settings → Configuration"
echo ""
