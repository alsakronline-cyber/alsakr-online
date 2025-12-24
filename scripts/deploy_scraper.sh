#!/bin/bash
#
# Complete scraper deployment script for Oracle VPS
# Installs dependencies, runs migrations, and starts services
#
# Usage: ./deploy_scraper.sh
#

set -e

echo "=============================================="
echo "   Alsakr Online - Scraper Deployment"
echo "   Oracle VPS ARM64"
echo "=============================================="
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

echo "Step 1/5: Checking Prerequisites..."
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
echo "Step 2/5: Installing Python Dependencies..."
echo "--------------------------------------------"
cd backend
bash scripts/install_scraper_deps.sh
cd ..

echo ""
echo "Step 3/5: Running Database Migrations..."
echo "--------------------------------------------"
cd backend
bash scripts/migrate_scraper_db.sh
cd ..

echo ""
echo "Step 4/5: Rebuilding Docker Containers..."
echo "--------------------------------------------"
cd infrastructure

# Rebuild backend and ARQ worker
echo "Rebuilding backend service..."
docker compose build backend

echo "Rebuilding ARQ worker service..."
docker compose build arq-worker

echo ""
echo "Step 5/5: Restarting Services..."
echo "--------------------------------------------"

# Restart services to pick up changes
echo "Stopping old services..."
docker compose stop backend arq-worker

echo "Starting updated services..."
docker compose up -d backend arq-worker

echo ""
echo "=============================================="
echo "   ✅ Scraper Deployment Complete!"
echo "=============================================="
echo ""
echo "Service Status:"
docker compose ps | grep -E "backend|arq-worker"

echo ""
echo "Next Steps:"
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
