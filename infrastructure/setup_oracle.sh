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
echo "Creating directory structure..."
mkdir -p alsakr-online/{backend,frontend,infrastructure}
mkdir -p alsakr-online/infrastructure/{caddy,monitoring}
# Create data directories (even if using named volumes, having the structure is good practice as per prompt)
mkdir -p alsakr-online/infrastructure/data/{ollama,qdrant,pocketbase}

cd alsakr-online

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
# Enable without prompting
echo "y" | sudo ufw enable
sudo ufw status verbose

# 4. (Manual Step) Copy files from your local machine to this VPS
# scp -r backend frontend infrastructure user@your-oracle-ip:~/alsakr-online/

# 5. Start Production Stack
cd infrastructure
docker compose up -d --build

# 6. Verify Status
docker compose ps
curl http://localhost:8000/api/health
