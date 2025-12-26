#!/bin/bash
#
# Quick Deployment Script for VPS
# Simplified version for fast deployments
#

echo "🚀 Alsakr Online - Quick Deploy"
echo "================================"

cd ~/alsakr-online

# Pull latest
echo "📥 Pulling latest code..."
git pull origin main

# Rebuild and restart
echo "🔧 Rebuilding services..."
cd infrastructure
docker compose build backend frontend
docker compose up -d

echo "✅ Deployment complete!"
echo ""
echo "View logs: docker compose logs -f"
echo "Check status: docker compose ps"
