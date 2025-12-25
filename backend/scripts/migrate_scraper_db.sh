#!/bin/bash
#
# Database Migration Script for Scraper Tables
# Creates scraper_jobs and scraped_products tables
#

set -e

echo "======================================"
echo "Creating Scraper Database Tables"
echo "======================================"

# Check if alembic is available
if ! command -v alembic &> /dev/null; then
    echo "❌ Alembic not found. Installing..."
    python3 -m pip install alembic
fi

# Navigate to backend directory
cd "$(dirname "$0")/.."

echo "Generating migration for scraper tables..."
python3 -m alembic revision --autogenerate -m "Add scraper tables for job tracking and product storage"

echo ""
echo "Applying migration..."
python3 -m alembic upgrade head

echo ""
echo "✅ Scraper tables created successfully!"
echo ""
echo "Tables created:"
echo "  - scraper_jobs (job execution tracking)"
echo "  - scraped_products (product data storage)"
