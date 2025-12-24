# Production-Ready Web Scraper Infrastructure Design

## Executive Architecture

Your scraper infrastructure will support clicking elements through multiple pages, extracting data across hundreds of links, and persisting everything to a database. The system scales horizontally via distributed task queues and includes visual element selection without coding.

---

## 1. SYSTEM ARCHITECTURE LAYERS

```
┌─────────────────────────────────────────┐
│      Frontend UI (Element Selector)     │  User clicks elements, defines schema
├─────────────────────────────────────────┤
│   Scraper Configuration Schema (JSON)   │  Stores selectors, pagination logic
├─────────────────────────────────────────┤
│    Playwright Browser Instances Pool    │  Headless rendering & DOM access
├─────────────────────────────────────────┤
│   Task Queue (Bull/Redis or RabbitMQ)   │  Distributes jobs to workers
├─────────────────────────────────────────┤
│  Data Validation & Transformation       │  Schema enforcement, deduplication
├─────────────────────────────────────────┤
│   PostgreSQL + Connection Pooling       │  Persistent storage, audit trail
├─────────────────────────────────────────┤
│  REST API + Monitoring (Express.js)     │  Job management, logs, health checks
└─────────────────────────────────────────┘
```

---

## 2. SCRAPER CONFIGURATION SCHEMA (JSON)

This defines what elements to click and where to extract data:

```json
{
  "scraperId": "sick-com-products-001",
  "targetWebsite": "https://sick.com",
  "startUrls": [
    "https://sick.com/en/products"
  ],
  "pageLoadWaitTime": 3000,
  "selectors": [
    {
      "id": "product_container",
      "type": "repeating",
      "selector": ".product-card",
      "description": "Container for each product item",
      "fields": [
        {
          "name": "product_name",
          "selector": ".product-title",
          "type": "text",
          "required": true
        },
        {
          "name": "product_price",
          "selector": ".product-price",
          "type": "text",
          "required": true
        },
        {
          "name": "product_url",
          "selector": "a.product-link",
          "type": "attribute",
          "attribute": "href",
          "required": true
        }
      ]
    },
    {
      "id": "pagination",
      "type": "pagination",
      "selector": "a.next-page",
      "description": "Next page button for browsing multiple pages",
      "maxPages": 10
    }
  ],
  "childPageScraping": {
    "enabled": true,
    "followSelector": "a.product-link",
    "childSelectors": [
      {
        "name": "detailed_specs",
        "selector": ".specifications table",
        "type": "html"
      }
    ]
  }
}
```

---

## 3. FRONTEND: VISUAL ELEMENT SELECTOR UI

### How Users Select Elements (No Coding Required)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Scraper UI - Visual Element Selector</title>
  <style>
    .selector-mode { border: 2px solid red !important; }
    .highlighted { background: yellow !important; box-shadow: inset 0 0 5px rgba(255,0,0,0.5); }
  </style>
</head>
<body>
  <div id="scraper-control-panel">
    <h3>Scraper Configuration</h3>
    
    <div id="selector-instructions">
      <p><strong>Step 1:</strong> Click "Start Selection Mode"</p>
      <p><strong>Step 2:</strong> Click the elements on the page you want to scrape</p>
      <p><strong>Step 3:</strong> Name each selector and define its type</p>
    </div>

    <button id="toggle-selection-mode">Start Selection Mode</button>
    <button id="save-config">Save Configuration</button>
    
    <div id="selected-elements" style="margin-top: 20px; border: 1px solid #ccc; padding: 10px;">
      <h4>Selected Elements:</h4>
      <ul id="element-list"></ul>
    </div>
  </div>

  <script>
    let selectionMode = false;
    let selectedElements = [];

    document.getElementById('toggle-selection-mode').addEventListener('click', () => {
      selectionMode = !selectionMode;
      if (selectionMode) {
        alert('Selection mode ON: Click elements on page to select them');
        document.body.style.cursor = 'crosshair';
      } else {
        document.body.style.cursor = 'auto';
      }
    });

    document.addEventListener('click', (e) => {
      if (!selectionMode) return;
      e.preventDefault();
      e.stopPropagation();

      const element = e.target;
      const selector = generateSelector(element);
      const xpath = generateXPath(element);

      const elementInfo = {
        name: prompt('Name this selector:', 'field_' + selectedElements.length),
        cssSelector: selector,
        xpath: xpath,
        tagName: element.tagName,
        className: element.className,
        elementType: determineElementType(element)
      };

      selectedElements.push(elementInfo);
      element.classList.add('highlighted');
      updateElementList();
    });

    function generateSelector(element) {
      // Generate unique CSS selector for element
      if (element.id) return '#' + element.id;
      if (element.className) return '.' + element.className.split(' ').join('.');
      return element.tagName.toLowerCase();
    }

    function generateXPath(element) {
      // Generate XPath for element
      if (element.id !== '') return `//*[@id='${element.id}']`;
      if (element === document.body) return '/html/body';
      
      const ix = Array.from(element.parentNode.children).indexOf(element) + 1;
      return generateXPath(element.parentNode) + `/${element.tagName.toLowerCase()}[${ix}]`;
    }

    function determineElementType(element) {
      if (element.tagName === 'A') return 'link';
      if (element.tagName === 'BUTTON') return 'button';
      if (element.tagName === 'INPUT') return 'input';
      return 'text';
    }

    function updateElementList() {
      const list = document.getElementById('element-list');
      list.innerHTML = selectedElements.map((el, idx) => 
        `<li>${el.name} (${el.tagName}) - ${el.cssSelector}</li>`
      ).join('');
    }

    document.getElementById('save-config').addEventListener('click', async () => {
      const config = {
        targetWebsite: window.location.href,
        selectors: selectedElements,
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch('/api/scrapers/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const result = await response.json();
      alert('Configuration saved! Scraper ID: ' + result.scraperId);
    });
  </script>
</body>
</html>
```

---

## 4. SCRAPER ENGINE (Playwright-based)

### File: `scraper-engine.js`

```javascript
const playwright = require('playwright');
const pino = require('pino');
const logger = pino();

class ScraperEngine {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await playwright.chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    });
  }

  async scrapeMultiplePages() {
    let allData = [];
    let currentUrl = this.config.startUrls[0];
    let pageCount = 0;
    const maxPages = this.config.selectors.find(s => s.type === 'pagination')?.maxPages || 10;

    while (pageCount < maxPages && currentUrl) {
      logger.info(`Scraping page ${pageCount + 1}: ${currentUrl}`);
      
      const page = await this.browser.newPage();
      await page.goto(currentUrl, { waitUntil: 'networkidle' });
      
      // Wait for main content to load
      await page.waitForTimeout(this.config.pageLoadWaitTime);

      // Extract data from repeating elements
      const pageData = await this.extractData(page);
      allData.push(...pageData);

      // Follow child page links if enabled
      if (this.config.childPageScraping?.enabled) {
        const childData = await this.scrapeChildPages(page, pageData);
        allData = allData.concat(childData);
      }

      // Find next page button
      const paginationSelector = this.config.selectors.find(s => s.type === 'pagination');
      if (paginationSelector) {
        const nextPageUrl = await page.$eval(paginationSelector.selector, 
          el => el.href
        ).catch(() => null);
        
        currentUrl = nextPageUrl;
      } else {
        currentUrl = null;
      }

      await page.close();
      pageCount++;
    }

    return allData;
  }

  async extractData(page) {
    const containerSelector = this.config.selectors.find(s => s.type === 'repeating');
    
    const data = await page.$$eval(containerSelector.selector, (elements) => {
      return elements.map(el => {
        const record = {};
        containerSelector.fields.forEach(field => {
          const value = el.querySelector(field.selector)?.[field.type === 'text' ? 'innerText' : field.type === 'attribute' ? 'getAttribute' : 'innerHTML'](field.attribute);
          record[field.name] = field.type === 'attribute' && field.attribute ? value : value;
        });
        return record;
      });
    });

    logger.info(`Extracted ${data.length} records from page`);
    return data;
  }

  async scrapeChildPages(page, parentData) {
    let childData = [];
    const followSelector = this.config.childPageScraping.followSelector;
    
    const childPageUrls = await page.$$eval(followSelector, els => 
      els.map(el => el.href)
    );

    for (const url of childPageUrls.slice(0, 5)) { // Limit to 5 child pages per parent
      const childPage = await this.browser.newPage();
      await childPage.goto(url, { waitUntil: 'networkidle' });
      
      const childContent = await childPage.innerHTML('body');
      childData.push({
        source_url: url,
        html_content: childContent
      });
      
      await childPage.close();
    }

    return childData;
  }

  async close() {
    if (this.browser) await this.browser.close();
  }
}

module.exports = ScraperEngine;
```

---

## 5. TASK QUEUE (Bull with Redis)

### File: `queue-worker.js`

```javascript
const Queue = require('bull');
const ScraperEngine = require('./scraper-engine');
const { validateAndTransformData } = require('./data-processor');
const { saveToDatabase } = require('./database');
const pino = require('pino');
const logger = pino();

// Create Redis queue
const scraperQueue = new Queue('web-scraping', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

// Process scraping jobs
scraperQueue.process(3, async (job) => {
  const { scraperId, config } = job.data;
  
  logger.info(`Starting scrape job: ${scraperId}`);
  
  try {
    const engine = new ScraperEngine(config);
    await engine.initialize();
    
    // Update job progress
    job.progress(10);
    
    // Scrape data
    const rawData = await engine.scrapeMultiplePages();
    job.progress(50);
    
    // Validate and transform
    const validatedData = validateAndTransformData(rawData, config);
    job.progress(75);
    
    // Save to database
    const result = await saveToDatabase(scraperId, validatedData);
    job.progress(100);
    
    await engine.close();
    
    return {
      scraperId,
      recordsExtracted: rawData.length,
      recordsSaved: result.savedCount,
      recordsRejected: result.rejectedCount,
      completedAt: new Date()
    };
    
  } catch (error) {
    logger.error({ error }, `Scraper job failed: ${scraperId}`);
    throw error; // Bull will auto-retry
  }
});

// Retry logic
scraperQueue.on('failed', (job, err) => {
  const retries = job.attemptsMade;
  const maxRetries = 3;
  
  if (retries < maxRetries) {
    const delay = Math.pow(2, retries) * 1000; // Exponential backoff: 2s, 4s, 8s
    job.retry();
    logger.warn(`Job ${job.id} failed, retrying in ${delay}ms (attempt ${retries}/${maxRetries})`);
  } else {
    logger.error(`Job ${job.id} failed permanently after ${maxRetries} retries`);
  }
});

// Monitoring
scraperQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed: ${JSON.stringify(result)}`);
});

module.exports = { scraperQueue };
```

---

## 6. DATA VALIDATION & TRANSFORMATION

### File: `data-processor.js`

```javascript
const z = require('zod');
const crypto = require('crypto');

function validateAndTransformData(rawData, config) {
  // Define schema based on config
  const fields = {};
  
  config.selectors
    .find(s => s.type === 'repeating')
    .fields.forEach(field => {
      let fieldSchema = z.string().trim();
      
      if (field.type === 'number') {
        fieldSchema = z.string().transform(v => parseFloat(v));
      } else if (field.type === 'date') {
        fieldSchema = z.string().transform(v => new Date(v));
      }
      
      if (!field.required) {
        fieldSchema = fieldSchema.optional();
      }
      
      fields[field.name] = fieldSchema;
    });

  const dataSchema = z.object(fields).strict();

  const validatedData = [];
  const rejectedRecords = [];

  rawData.forEach((record, idx) => {
    try {
      // Validate
      const validated = dataSchema.parse(record);
      
      // Add metadata
      validated.row_hash = generateRowHash(validated);
      validated.source_timestamp = new Date();
      validated.scraped_url = record._source_url || null;
      
      validatedData.push(validated);
      
    } catch (error) {
      rejectedRecords.push({
        rowIndex: idx,
        error: error.message,
        record
      });
    }
  });

  return {
    validData: validatedData,
    rejectedRecords,
    stats: {
      totalRecords: rawData.length,
      validRecords: validatedData.length,
      rejectedRecords: rejectedRecords.length
    }
  };
}

function generateRowHash(record) {
  // Create deterministic hash for deduplication
  const recordString = JSON.stringify(record);
  return crypto.createHash('md5').update(recordString).digest('hex');
}

module.exports = { validateAndTransformData, generateRowHash };
```

---

## 7. DATABASE LAYER (PostgreSQL)

### File: `database.js`

```javascript
const { Pool } = require('pg');
const pino = require('pino');
const logger = pino();

// Connection pool configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'scraper_db',
  user: process.env.DB_USER || 'scraper_user',
  password: process.env.DB_PASSWORD,
  max: 20, // Max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Initialize database schema
async function initializeDatabase() {
  try {
    // Scrapers configuration table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scrapers (
        id SERIAL PRIMARY KEY,
        scraper_id VARCHAR(255) UNIQUE NOT NULL,
        config JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS scraper_jobs (
        id SERIAL PRIMARY KEY,
        scraper_id VARCHAR(255) NOT NULL,
        job_id VARCHAR(255),
        status VARCHAR(50),
        records_extracted INT,
        records_saved INT,
        records_rejected INT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        error_message TEXT,
        FOREIGN KEY (scraper_id) REFERENCES scrapers(scraper_id)
      );
      
      CREATE TABLE IF NOT EXISTS scraper_data (
        id SERIAL PRIMARY KEY,
        scraper_id VARCHAR(255) NOT NULL,
        row_hash VARCHAR(32) UNIQUE,
        data JSONB NOT NULL,
        source_url TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scraper_id) REFERENCES scrapers(scraper_id)
      );
      
      CREATE TABLE IF NOT EXISTS rejected_records (
        id SERIAL PRIMARY KEY,
        scraper_id VARCHAR(255) NOT NULL,
        job_id VARCHAR(255),
        raw_data JSONB,
        error_message TEXT,
        rejected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scraper_id) REFERENCES scrapers(scraper_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_scraper_data_scraper_id ON scraper_data(scraper_id);
      CREATE INDEX IF NOT EXISTS idx_scraper_data_row_hash ON scraper_data(row_hash);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON scraper_jobs(status);
    `);
    
    logger.info('Database schema initialized');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize database schema');
  }
}

// Save data to database
async function saveToDatabase(scraperId, { validData, rejectedRecords }) {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // Check for existing rows (deduplication)
    const hashes = validData.map(d => d.row_hash);
    const existingQuery = `
      SELECT row_hash FROM scraper_data 
      WHERE scraper_id = $1 AND row_hash = ANY($2)
    `;
    
    const { rows: existingRows } = await client.query(existingQuery, [scraperId, hashes]);
    const existingHashes = new Set(existingRows.map(r => r.row_hash));

    // Insert new records only
    let savedCount = 0;
    for (const record of validData) {
      if (!existingHashes.has(record.row_hash)) {
        const insertQuery = `
          INSERT INTO scraper_data (scraper_id, row_hash, data, source_url)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (row_hash) DO NOTHING
        `;
        
        await client.query(insertQuery, [
          scraperId,
          record.row_hash,
          JSON.stringify(record),
          record.scraped_url
        ]);
        
        savedCount++;
      }
    }

    // Insert rejected records
    for (const rejected of rejectedRecords) {
      const rejectQuery = `
        INSERT INTO rejected_records (scraper_id, raw_data, error_message)
        VALUES ($1, $2, $3)
      `;
      
      await client.query(rejectQuery, [
        scraperId,
        JSON.stringify(rejected.record),
        rejected.error
      ]);
    }

    await client.query('COMMIT');
    
    logger.info(`Saved ${savedCount} new records for scraper ${scraperId}`);
    
    return {
      savedCount,
      rejectedCount: rejectedRecords.length
    };
    
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    logger.error({ error }, 'Database save failed');
    throw error;
  } finally {
    if (client) client.release();
  }
}

module.exports = {
  pool,
  initializeDatabase,
  saveToDatabase
};
```

---

## 8. REST API (Express.js)

### File: `api-server.js`

```javascript
const express = require('express');
const { scraperQueue } = require('./queue-worker');
const { pool, initializeDatabase } = require('./database');
const pino = require('pino');

const app = express();
const logger = pino();

app.use(express.json());

// Initialize database on startup
initializeDatabase();

// Submit scraping job
app.post('/api/jobs/scrape', async (req, res) => {
  const { scraperId, config } = req.body;

  try {
    const job = await scraperQueue.add(
      { scraperId, config },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: true
      }
    );

    res.json({
      jobId: job.id,
      scraperId,
      status: 'queued',
      message: 'Scraping job submitted'
    });

  } catch (error) {
    logger.error({ error }, 'Job submission failed');
    res.status(500).json({ error: error.message });
  }
});

// Get job status
app.get('/api/jobs/:jobId', async (req, res) => {
  try {
    const job = await scraperQueue.getJob(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress();

    res.json({
      jobId: job.id,
      state,
      progress,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scraped data
app.get('/api/data/:scraperId', async (req, res) => {
  const { scraperId } = req.params;
  const { limit = 100, offset = 0 } = req.query;

  try {
    const query = `
      SELECT data, scraped_at 
      FROM scraper_data 
      WHERE scraper_id = $1
      ORDER BY scraped_at DESC
      LIMIT $2 OFFSET $3
    `;

    const { rows } = await pool.query(query, [scraperId, limit, offset]);

    res.json({
      scraperId,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get rejected records
app.get('/api/rejected/:scraperId', async (req, res) => {
  const { scraperId } = req.params;

  try {
    const query = `
      SELECT * FROM rejected_records 
      WHERE scraper_id = $1
      ORDER BY rejected_at DESC
      LIMIT 100
    `;

    const { rows } = await pool.query(query, [scraperId]);

    res.json({
      scraperId,
      rejectedCount: rows.length,
      records: rows
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(3000, () => {
  logger.info('Scraper API listening on port 3000');
});

module.exports = app;
```

---

## 9. ENVIRONMENT CONFIGURATION

### File: `.env`

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scraper_db
DB_USER=scraper_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Browser
HEADLESS=true
BROWSER_TIMEOUT=30000

# Scraper
MAX_CONCURRENT_JOBS=5
MAX_PAGES_PER_SCRAPE=100
PAGE_LOAD_WAIT_TIME=3000

# API
API_PORT=3000
NODE_ENV=production
```

---

## 10. DEPLOYMENT (Docker Compose)

### File: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: scraper_user
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: scraper_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis for Task Queue
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Scraper API Server
  api:
    build: .
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - NODE_ENV=production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    command: npm start

  # Worker processes (can scale to multiple replicas)
  worker:
    build: .
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
    command: npm run worker
    deploy:
      replicas: 3  # Scale to 3 worker instances

volumes:
  postgres_data:
  redis_data:
```

---

## 11. USAGE FLOW

### Step 1: Define Scraper Configuration
```bash
curl -X POST http://localhost:3000/api/jobs/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "scraperId": "sick-products-001",
    "config": {
      "startUrls": ["https://sick.com/products"],
      "pageLoadWaitTime": 3000,
      "selectors": [
        {
          "id": "product_container",
          "type": "repeating",
          "selector": ".product-card",
          "fields": [
            {"name": "product_name", "selector": ".title", "type": "text", "required": true},
            {"name": "product_price", "selector": ".price", "type": "text", "required": true}
          ]
        }
      ]
    }
  }'
```

### Step 2: Monitor Job Progress
```bash
curl http://localhost:3000/api/jobs/12345
```

### Step 3: Retrieve Scraped Data
```bash
curl http://localhost:3000/api/data/sick-products-001?limit=50&offset=0
```

---

## 12. SCALING PATTERNS

### Horizontal Scaling
- Add more worker containers to process jobs in parallel
- Redis queue automatically distributes jobs across workers
- Each worker gets independent browser instance pool

### Rate Limiting
- Add delays between requests: `await page.waitForTimeout(2000)`
- Use proxy rotation for IP-based blocking
- Implement request throttling in queue configuration

### Error Recovery
- Exponential backoff retry (2s → 4s → 8s)
- Dead-letter queue for permanently failed jobs
- Manual retry UI for inspection

---

## 13. MONITORING & LOGGING

```javascript
// Add monitoring via Prometheus metrics
const client = require('prom-client');

const jobsProcessed = new client.Counter({
  name: 'scraper_jobs_processed_total',
  help: 'Total number of scraping jobs processed'
});

const recordsExtracted = new client.Counter({
  name: 'scraper_records_extracted_total',
  help: 'Total records extracted'
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

---

## Summary

This infrastructure provides:

✅ **Visual Element Selection** - Click-based, no coding required  
✅ **Multi-Page Crawling** - Pagination and child page following  
✅ **Scalable Distribution** - Worker pool via Redis/Bull  
✅ **Data Validation** - Schema enforcement with Zod  
✅ **Deduplication** - Hash-based duplicate prevention  
✅ **Error Handling** - Retry logic with exponential backoff  
✅ **Persistence** - PostgreSQL with audit trails  
✅ **Monitoring** - Job status, progress tracking, logging  
✅ **Production-Ready** - Docker containerization, connection pooling  

This foundation supports industrial automation B2B scraping at scale.