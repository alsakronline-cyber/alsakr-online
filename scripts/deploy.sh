#!/bin/bash
set -e

echo "🚀 Deploying Nexus Industrial..."

# 1. Pull latest code
echo "📦 Pulling latest changes..."
git pull origin main

# 2. Rebuild Backend (With new AI dependencies)
echo "🧠 Rebuilding Backend (This may take a while for AI models)..."
cd infrastructure
docker compose build backend

# 3. Rebuild Frontend (With new Styles)
echo "🎨 Rebuilding Frontend..."
docker compose build frontend

# 4. Restart Services
echo "🔄 Restarting Containers..."
docker compose up -d

echo "✅ Deployment Complete!"
echo "   - Frontend: https://app.alsakronline.com"
