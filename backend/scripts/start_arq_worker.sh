#!/bin/bash
#
# ARQ Worker Startup Script
# Starts the ARQ worker for background scraping jobs
#
# Usage: ./start_arq_worker.sh
#

set -e

echo "======================================"
echo "Starting ARQ Scraper Worker"
echo "======================================"

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Check Redis connection
echo "Checking Redis connection..."
if ! timeout 2 bash -c "</dev/tcp/redis/6379" 2>/dev/null; then
    echo "⚠️  Warning: Cannot connect to Redis on 'redis:6379'"
    echo "   Make sure Redis is running (docker-compose up -d redis)"
    echo "   Or update REDIS_SETTINGS in app/scraper/scheduler.py"
fi

# Navigate to backend directory
cd "$(dirname "$0")/.."

echo ""
echo "Starting ARQ worker..."
echo "Worker configuration:"
echo "  - Max concurrent jobs: 1 (memory constraint)"
echo "  - Job timeout: 3600s (1 hour)"
echo "  - Retry attempts: 3"
echo ""

# Start ARQ worker
# The worker will process jobs from Redis queue and run cron jobs
python3 -m arq app.scraper.scheduler.WorkerSettings

# If we get here, worker has stopped
echo ""
echo "❌ ARQ worker stopped"
