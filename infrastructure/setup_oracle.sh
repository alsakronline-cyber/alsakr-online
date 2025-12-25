#!/bin/bash

# Alsakr Online - Oracle Cloud Setup Script
# Run this on your Oracle VPS (Ubuntu 22.04 ARM)

# 1. Update System
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker & Docker Compose
sudo apt-get install -y ca-certificates curl gnupg
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Setup Project Directory Structure
# Detect if we are already inside the repo
if [ -d "infrastructure" ] && [ -d "backend" ]; then
    echo "Running from project root."
    PROJECT_ROOT=$(pwd)
else
    echo "Setting up in ~/alsakr-online..."
    mkdir -p ~/alsakr-online
    cd ~/alsakr-online
    PROJECT_ROOT=$(pwd)
fi

# 4. Configure Firewall (UFW)
echo "Configuring UFW..."
# Check if UFW is installed
if ! command -v ufw &> /dev/null; then
    sudo apt-get install -y ufw
fi

sudo ufw default deny incoming
sudo ufw default allow outgoing
# Allow SSH (Port 22) - CRITICAL to do this first
sudo ufw allow 22/tcp
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp

# Enable without prompting
echo "y" | sudo ufw enable
sudo ufw status verbose

# 5. Environment Setup
if [ ! -f "$PROJECT_ROOT/infrastructure/.env" ]; then
    echo "Creating .env from example..."
    cp "$PROJECT_ROOT/infrastructure/.env.example" "$PROJECT_ROOT/infrastructure/.env"
fi

# 6. Start Production Stack
cd "$PROJECT_ROOT/infrastructure"
docker compose up -d --build

# 7. Verify Status
docker compose ps
curl http://localhost:8000/api/health
