"""
Memory-optimized web scraper engine

Supports:
- Playwright for JavaScript-heavy sites (SICK AG, etc.)
- HTTP requests for static HTML sites (faster, lower memory)
- Browser reuse across pages (single instance per job)
- Automatic table parsing for specifications
"""

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup
import httpx
import yaml
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, field_validator
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class ScraperConfig(BaseModel):
    """Configuration model with validation"""
    id: str
    vendor_name: str
    base_url: str
    start_urls: List[str]
    scraping_method: str
    selectors: Dict[str, str]
    pagination: Dict[str, Any]
    child_pages: Dict[str, Any]
    limits: Dict[str, int]
    schedule: Optional[str] = None
    
    @field_validator('base_url')
    @classmethod
    def validate_url(cls, v):
        if not v.startswith('https'):
            raise ValueError('HTTPS required for security')
        return v
    
    @field_validator('scraping_method')
    @classmethod
    def validate_method(cls, v):
        if v not in ['playwright', 'http']:
            raise ValueError('scraping_method must be "playwright" or "http"')
        return v


class ScraperEngine:
    """
    Memory-optimized scraper engine
    
    CRITICAL CONSTRAINTS:
    - Single browser instance per job (700MB RAM)
    - Browser reused across all pages
    - Pages closed immediately after extraction
    - Total memory budget: ~1.5GB peak
    """
    
    def __init__(self, config_path: str):
        """Load scraper configurations from YAML"""
        config_file = Path(config_path)
        if not config_file.exists():
            raise FileNotFoundError(f"Config file not found: {config_path}")
        
        with open(config_file) as f:
            configs = yaml.safe_load(f)['scrapers']
            self.configs = {c['id']: ScraperConfig(**c) for c in configs}
        
        logger.info(f"Loaded {len(self.configs)} scraper configurations")
    
    async def scrape_vendor(self, scraper_id: str) -> List[Dict]:
        """
        Execute scraping job for specified vendor
        
        Args:
            scraper_id: ID from scraper_config.yaml (e.g., 'sick-ag-products')
        
        Returns:
            List of product dictionaries
        
        Raises:
            ValueError: If scraper_id not found
        """
        config = self.configs.get(scraper_id)
        if not config:
            raise ValueError(f"Scraper '{scraper_id}' not found in configuration")
        
        logger.info(f"Starting scraper: {scraper_id} ({config.vendor_name})")
        
        if config.scraping_method == "playwright":
            return await self._scrape_with_playwright(config)
        else:
            return await self._scrape_with_http(config)
    
    async def _scrape_with_playwright(self, config: ScraperConfig) -> List[Dict]:
        """
        Playwright scraper with CRITICAL memory optimizations:
        1. Single browser instance (reused across all pages)
        2. Single context (shared for all pages)
        3. Headless mode with minimal args (saves 34% RAM)
        4. Pages closed immediately after extraction
        
        Memory budget: ~700MB for browser + 300MB for data processing
        """
        async with async_playwright() as p:
            # CRITICAL: Memory-optimized browser launch
            logger.info("Launching Playwright browser (headless, optimized)")
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',              # ARM64 safety
                    '--disable-dev-shm-usage',   # Use RAM not /dev/shm
                    '--disable-gpu',             # No GPU overhead
                    '--disable-extensions',      # Skip extensions
                    '--disable-background-networking',
                    '--disable-background-timer-throttling',
                ]
            )
            
            # Single context reused for all pages (saves ~200MB)
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            
            all_products = []
            
            for start_url in config.start_urls:
                current_url = start_url
                page_count = 0
                max_pages = config.pagination.get('max_pages', 50)
                
                logger.info(f"Starting pagination from: {start_url}")
                
                while current_url and page_count < max_pages:
                    page = await context.new_page()
                    
                    try:
                        logger.info(f"Scraping page {page_count + 1}: {current_url}")
                        
                        # Navigate to page
                        await page.goto(
                            current_url,
                            wait_until='networkidle',
                            timeout=config.limits['page_timeout_ms']
                        )
                        
                        try:
                            # CRITICAL: SICK.com is an SPA - wait for specific element
                            logger.info("Waiting for product card selector...")
                            try:
                                await page.wait_for_selector(config.selectors['product_card'], timeout=10000)
                            except PlaywrightTimeout:
                                logger.warning("Timeout waiting for product cards. Dumping HTML body for debug...")
                                body_html = await page.content()
                                logger.warning(f"HTML Content Preview: {body_html[:2000]}")
                                # continue anyway to return 0 products and trigger the log
                        
                        # Extract products from current page
                        products = await page.evaluate(f"""() => {{
                            const containers = document.querySelectorAll('{config.selectors['product_card']}');
                            return Array.from(containers).map(el => ({{
                                name: el.querySelector('{config.selectors['product_name']}')?.innerText?.trim(),
                                part_number: el.querySelector('{config.selectors['part_number']}')?.innerText?.trim(),
                                category: el.querySelector('{config.selectors.get('category', '')}')?.innerText?.trim(),
                                image_url: el.querySelector('{config.selectors.get('image', '')}')?.src,
                                product_url: el.querySelector('a')?.href
                            }}));
                        }}""")
                        
                        if len(products) == 0:
                            logger.warning(f"Found 0 products on {current_url}. Selectors might be wrong.")
                            body_html = await page.content()
                            logger.warning(f"Page HTML Dump (First 2000 chars): {body_html[:2000]}")
                        
                        logger.info(f"Extracted {len(products)} products from page {page_count + 1}")
                        
                        # Visit child pages if enabled
                        if config.child_pages.get('enabled'):
                            for idx, product in enumerate(products):
                                if product.get('product_url'):
                                    try:
                                        await self._scrape_product_details(
                                            page,
                                            product,
                                            config
                                        )
                                        logger.debug(f"Scraped details for product {idx + 1}/{len(products)}")
                                    except Exception as e:
                                        logger.warning(f"Failed to scrape details for {product.get('product_url')}: {e}")
                        
                        all_products.extend(products)
                        
                        # Find next page
                        next_button = config.pagination.get('next_button')
                        if next_button:
                            current_url = await page.evaluate(
                                f"() => document.querySelector('{next_button}')?.href"
                            )
                        else:
                            current_url = None
                        
                        page_count += 1
                        
                    except PlaywrightTimeout:
                        logger.error(f"Timeout loading page: {current_url}")
                        break
                    except Exception as e:
                        logger.error(f"Error scraping page {current_url}: {e}", exc_info=True)
                        break
                    finally:
                        # CRITICAL: Close page immediately to free memory
                        await page.close()
            
            await context.close()
            await browser.close()
            
            logger.info(f"Scraping complete: {len(all_products)} total products")
            return all_products
    
    async def _scrape_product_details(
        self,
        page,
        product: Dict,
        config: ScraperConfig
    ):
        """Navigate to product detail page and extract specifications"""
        product_url = product['product_url']
        
        try:
            await page.goto(product_url, wait_until='networkidle', timeout=30000)
            
            # Extract specifications table
            specs_selector = config.selectors.get('specs_table', '')
            if specs_selector:
                specs_html = await page.evaluate(
                    f"() => document.querySelector('{specs_selector}')?.outerHTML"
                )
                
                if specs_html:
                    product['specifications'] = self._parse_table_html(specs_html)
            
            # Extract PDF links
            pdf_selector = config.selectors.get('pdf_link', 'a[href$=".pdf"]')
            pdf_links = await page.evaluate(
                f"() => Array.from(document.querySelectorAll('{pdf_selector}')).map(a => a.href)"
            )
            product['pdf_urls'] = pdf_links if pdf_links else []
            
        except Exception as e:
            logger.warning(f"Failed to extract details from {product_url}: {e}")
            product['specifications'] = {}
            product['pdf_urls'] = []
    
    async def _scrape_with_http(self, config: ScraperConfig) -> List[Dict]:
        """
        Lightweight HTTP scraper for static sites
        
        Memory budget: ~50MB (vs 700MB for Playwright)
        Use this for sites that don't require JavaScript rendering
        """
        logger.info("Using HTTP scraper (lightweight mode)")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            all_products = []
            
            for start_url in config.start_urls:
                try:
                    response = await client.get(start_url)
                    response.raise_for_status()
                    
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    containers = soup.select(config.selectors['product_card'])
                    logger.info(f"Found {len(containers)} products on {start_url}")
                    
                    for container in containers:
                        product = {
                            'name': self._extract_text(container, config.selectors['product_name']),
                            'part_number': self._extract_text(container, config.selectors['part_number']),
                            'source_url': start_url
                        }
                        
                        # Extract optional fields
                        if 'category' in config.selectors:
                            product['category'] = self._extract_text(container, config.selectors['category'])
                        
                        if 'image' in config.selectors:
                            img = container.select_one(config.selectors['image'])
                            product['image_url'] = img.get('src') if img else None
                        
                        all_products.append(product)
                
                except httpx.HTTPError as e:
                    logger.error(f"HTTP error fetching {start_url}: {e}")
            
            logger.info(f"HTTP scraping complete: {len(all_products)} products")
            return all_products
    
    @staticmethod
    def _extract_text(element, selector: str) -> Optional[str]:
        """Extract text from BeautifulSoup element"""
        el = element.select_one(selector)
        return el.text.strip() if el else None
    
    @staticmethod
    def _parse_table_html(html: str) -> Dict[str, str]:
        """
        Parse HTML table into key-value specifications
        
        Args:
            html: HTML string containing a table element
        
        Returns:
            Dictionary of spec_name: spec_value
        """
        soup = BeautifulSoup(html, 'html.parser')
        specs = {}
        
        for row in soup.find_all('tr'):
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                key = cells[0].text.strip()
                value = cells[1].text.strip()
                if key and value:
                    specs[key] = value
        
        return specs
