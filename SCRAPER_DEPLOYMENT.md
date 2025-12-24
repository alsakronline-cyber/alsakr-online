# Scraper Deployment Guide

## Quick Start

Deploy the complete scraper infrastructure on Oracle VPS:

```bash
# From project root
chmod +x scripts/deploy_scraper.sh
./scripts/deploy_scraper.sh
```

This script will:
1. ✅ Install Python dependencies (arq, httpx, pyyaml, playwright)
2. ✅ Install Playwright Chromium browser
3. ✅ Run database migrations (create scraper tables)
4. ✅ Rebuild Docker containers
5. ✅ Restart backend and ARQ worker services

---

## Manual Deployment Steps

If you prefer manual deployment or script fails:

### 1. Install Dependencies

```bash
cd backend
chmod +x scripts/install_scraper_deps.sh
./scripts/install_scraper_deps.sh
```

### 2. Run Database Migrations

```bash
chmod +x scripts/migrate_scraper_db.sh
./scripts/migrate_scraper_db.sh
```

### 3. Update Docker Services

```bash
cd ../infrastructure
docker-compose build backend arq-worker
docker-compose up -d backend arq-worker
```

---

## Testing the Scraper

### Trigger Manual Scrape

```bash
curl -X POST http://localhost:8000/api/scraper/jobs/trigger/sick-ag-products
```

Response:
```json
{
  "message": "Scraper 'sick-ag-products' triggered successfully",
  "scraper_id": "sick-ag-products",
  "arq_job_id": "scraper-sick-ag-products-1735067890",
  "status": "queued"
}
```

### Check Job Status

```bash
# List all jobs
curl http://localhost:8000/api/scraper/jobs

# Get specific job
curl http://localhost:8000/api/scraper/jobs/1
```

### View Scraped Products

```bash
curl "http://localhost:8000/api/scraper/products/SICK%20AG?limit=10"
```

### View Statistics

```bash
curl http://localhost:8000/api/scraper/stats
```

---

## Monitoring

### ARQ Worker Logs

```bash
docker-compose logs -f arq-worker
```

Expected output:
```
arq-worker  | Starting ARQ worker...
arq-worker  | Worker configuration:
arq-worker  |   - Max concurrent jobs: 1
arq-worker  |   - Job timeout: 3600s
arq-worker  | Scheduled cron job: sick-ag-products at 0 2 * * *
```

### Backend API Logs

```bash
docker-compose logs -f backend
```

### Check Service Health

```bash
# Overall health
curl http://localhost:8000/api/health

# Scraper health
curl http://localhost:8000/api/scraper/health
```

---

## Scheduled Jobs

The ARQ worker automatically runs scrapers based on the schedule in `scraper_config.yaml`:

```yaml
scrapers:
  - id: "sick-ag-products"
    schedule: "0 2 * * *"  # Daily at 2 AM UTC
```

**Cron format**: `minute hour day month weekday`
- `0 2 * * *` = Daily at 2:00 AM
- `0 */6 * * *` = Every 6 hours
- `0 0 * * 0` = Weekly on Sunday midnight

---

## Resource Monitoring

### Check Memory Usage

```bash
docker stats alsakr-arq-worker alsakr-backend
```

**Expected during scrape**:
- **ARQ worker**: 1.5-1.8 GB (Playwright browser active)
- **Backend**: 500-800 MB (normal API traffic)

**Critical**: If ARQ worker exceeds 2GB, scraper will be OOM killed.

### View Container Resource Limits

```bash
docker inspect alsakr-arq-worker | grep -A 10 "Memory"
```

---

## Troubleshooting

### ARQ Worker Not Starting

```bash
# Check Redis connection
docker exec -it alsakr-redis redis-cli ping
# Should return: PONG

# Restart ARQ worker
docker-compose restart arq-worker
```

### Scraper Job Failing

```bash
# View detailed error logs
docker-compose logs arq-worker | grep ERROR

# Check database connection
docker exec -it alsakr-backend python -c "from app.database import engine; engine.connect()"
```

### Playwright Browser Errors

```bash
# Reinstall browser inside container
docker exec -it alsakr-arq-worker playwright install chromium --with-deps
```

### Database Migration Errors

```bash
# Check current migration version
cd backend
alembic current

# View migration history
alembic history

# Rollback last migration if needed
alembic downgrade -1
```

---

## Configuration Updates

### Adding New Vendor

Edit `backend/app/scraper/scraper_config.yaml`:

```yaml
scrapers:
  - id: "new-vendor-products"
    vendor_name: "New Vendor"
    schedule: "15 2 * * *"  # Stagger 15 min after SICK
    # ... selectors ...
```

Then restart ARQ worker:
```bash
docker-compose restart arq-worker
```

### Changing Scrape Schedule

Edit `scraper_config.yaml`, then:
```bash
docker-compose restart arq-worker
```

ARQ will pick up new cron schedule automatically.

---

## Production Checklist

Before going live:

- [ ] Test manual scrape completes successfully
- [ ] Verify products appear in database
- [ ] Check memory usage stays <2GB during scrape
- [ ] Confirm cron schedule triggers at right time
- [ ] Monitor logs for errors during first scheduled run
- [ ] Set up alerts for failed jobs (>2 consecutive failures)
- [ ] Verify scraped products searchable via main API
- [ ] Test vendor product listing endpoint
- [ ] Check scraper job history endpoint

---

## Performance Tuning

### Reduce Memory Usage

If memory is too high, edit `scraper_engine.py`:

```python
# Reduce concurrent page operations
config.limits['max_pages'] = 25  # Instead of 50

# Skip child page details temporarily
config.child_pages['enabled'] = False
```

### Speed Up Scraping

```python
# Reduce wait times (if site is fast)
config.limits['page_timeout_ms'] = 20000  # From 30000
```

### Increase Scrape Frequency

```yaml
# Edit scraper_config.yaml
schedule: "0 */12 * * *"  # Every 12 hours instead of daily
```

---

## Support

For issues:
1. Check ARQ worker logs: `docker-compose logs arq-worker`
2. Verify Redis connectivity: `docker exec -it alsakr-redis redis-cli ping`
3. Test API manually: `curl http://localhost:8000/api/scraper/health`
4. Review error in job status: `curl http://localhost:8000/api/scraper/jobs/{job_id}`
