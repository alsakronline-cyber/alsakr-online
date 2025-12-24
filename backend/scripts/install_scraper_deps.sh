#!/bin/bash
#
# Install Scraper Dependencies
# Run this script on the VPS to install required Python packages for the scraper
#

set -e  # Exit on error

echo "======================================"
echo "Installing Scraper Dependencies"
echo "======================================"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Install core scraper dependencies
echo "Installing Python packages..."
pip install --no-cache-dir \
    arq==0.25.0 \
    httpx==0.27.0 \
    pyyaml==6.0.1

echo ""
echo "Installing Playwright browser..."
# Install Playwright and Chromium browser
playwright install chromium --with-deps

echo ""
echo "✅ Scraper dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Run database migrations: alembic upgrade head"
echo "2. Start ARQ worker: arq app.scraper.scheduler.WorkerSettings"
echo "3. Trigger test scrape: curl -X POST http://localhost:8000/api/scraper/jobs/trigger/sick-ag-products"
