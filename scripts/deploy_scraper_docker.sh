#!/bin/bash
#
# Docker-only scraper deployment for VPS
# Pre-built Docker containers - no host Python required
#
# Usage: ./deploy_scraper_docker.sh
#

set -e

echo "=============================================="
echo "   Alsakr Online - Scraper Deployment"
echo "   Docker-Based Deployment for VPS"
echo "=============================================="
echo ""

# Ensure we're in the right directory
if [ ! -f "infrastructure/docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from project root (alsakr-online/)"
    exit 1
fi

echo "Step 1/4: Checking Prerequisites..."
echo "--------------------------------------------"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi
echo "✅ Docker is running"

# Check if docker compose exists (V2)
if ! docker compose version &> /dev/null; then
    echo "❌ docker compose not found. Please install Docker Compose V2."
    exit 1
fi
echo "✅ docker compose found"

echo ""
echo "Step 2/4: Rebuilding Docker Services..."
echo "--------------------------------------------"

cd infrastructure

# Rebuild backend and ARQ worker with new dependencies
echo "Rebuilding backend service (includes scraper dependencies)..."
docker compose build backend

echo "Rebuilding ARQ worker service..."
docker compose build arq-worker

echo ""
echo "Step 3/4: Restarting Services..."
echo "--------------------------------------------"

# Stop old services
echo "Stopping services..."
docker compose stop backend arq-worker

# Start updated services
echo "Starting updated services..."
docker compose up -d backend arq-worker

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

echo ""
echo "Step 4/4: Creating Scraper Database Tables..."
echo "--------------------------------------------"

# Run Python script to create tables (simpler than Alembic)
echo "Creating database tables in backend container..."
docker exec -w /app alsakr-backend python create_scraper_tables.py

echo "✅ Database tables created"

echo ""
echo "=============================================="
echo "   ✅ Scraper Deployment Complete!"
echo "=============================================="
echo ""
echo "Service Status:"
docker compose ps | grep -E "backend|arq-worker"

echo ""
echo "Installed Packages in Backend:"
docker exec alsakr-backend pip list | grep -E "arq|httpx|pyyaml|playwright"

echo ""
echo "=============================================="
echo "Next Steps:"
echo "=============================================="
echo ""
echo "1. Test scraper manually:"
echo "   curl -X POST http://localhost:8000/api/scraper/jobs/trigger/sick-ag-products"
echo ""
echo "2. Check job status:"
echo "   curl http://localhost:8000/api/scraper/jobs"
echo ""
echo "3. View ARQ worker logs:"
echo "   docker compose logs -f arq-worker"
echo ""
echo "4. Monitor scraper statistics:"
echo "   curl http://localhost:8000/api/scraper/stats"
echo ""
echo "=============================================="
