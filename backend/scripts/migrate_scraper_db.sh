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
    pip install alembic
fi

# Navigate to backend directory
cd "$(dirname "$0")/.."

echo "Generating migration for scraper tables..."
alembic revision --autogenerate -m "Add scraper tables for job tracking and product storage"

echo ""
echo "Applying migration..."
alembic upgrade head

echo ""
echo "✅ Scraper tables created successfully!"
echo ""
echo "Tables created:"
echo "  - scraper_jobs (job execution tracking)"
echo "  - scraped_products (product data storage)"
