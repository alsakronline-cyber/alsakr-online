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
                    '--disable-blink-features=AutomationControlled', # Stealth: Hide navigator.webdriver
                ]
            )
            
            # Single context reused for all pages (saves ~200MB)
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            
            all_products = []
            processed_parts = set()
            
            for start_url in config.start_urls:
                current_url = start_url
                page_count = 0
                max_pages = config.pagination.get('max_pages', 50)
                
                logger.info(f"Starting pagination from: {start_url}")
                max_pages = config.pagination.get('max_pages', 5) # Default to 5 pages for 'Show More'
                
                page = await context.new_page() # Main listing page, persistent
                try:
                    logger.info(f"Starting pagination from: {start_url}")
                    await page.goto(current_url, wait_until='networkidle', timeout=30000)
                    
                    while page_count < max_pages:
                        # Wait for content to load
                        logger.info(f"Scraping page {page_count + 1} (interaction {page_count + 1})...")
                        try:
                            await page.wait_for_selector(config.selectors['product_card'], timeout=10000)
                        except PlaywrightTimeout:
                            logger.warning("Timeout waiting for product cards. No more products or selector issue.")
                            break # No more products or selector issue, exit loop
                        
                        # Extract products (entire set currently on page)
                        products = await page.evaluate(f"""() => {{
                            const containers = document.querySelectorAll("{config.selectors['product_card']}");
                            return Array.from(containers).map(el => {{
                                const img = el.querySelector("{config.selectors.get('image', '')}");
                                
                                let partNo = null;
                                try {{
                                    partNo = el.querySelector("{config.selectors['part_number']}")?.innerText?.trim();
                                }} catch (e) {{}}
                                
                                if (!partNo) {{
                                    // Fallback: Regex for "Part no.: 12345"
                                    const match = el.innerText.match(/Part no\.?:\\s*([0-9]+)/i);
                                    if (match) partNo = match[1];
                                }}

                                return {{
                                    product_name: el.querySelector("{config.selectors['product_name']}")?.innerText?.trim(),
                                    part_number: partNo,
                                    category: el.querySelector("{config.selectors.get('category', '')}")?.innerText?.trim(),
                                    image_urls: img ? [(img.getAttribute('data-src') || img.src)] : [],
                                    source_url: el.querySelector("{config.selectors.get('product_name', 'a')}")?.href
                                }};
                            }});
                        }}""")
                        
                        if len(products) == 0:
                            logger.warning(f"Found 0 products on {current_url}. Selectors might be wrong.")
                            body_html = await page.content()
                            logger.warning(f"Page HTML Dump (First 2000 chars): {body_html[:2000]}")
                            break # No products found, exit loop
                        
                        # Only process NEW products (avoid re-scraping details)
                        new_products = [p for p in products if p['part_number'] and p['part_number'] not in processed_parts]
                        
                        if not new_products:
                            logger.info("No new products found on this page interaction.")
                        else:
                            logger.info(f"Found {len(new_products)} new products (Total on page: {len(products)})")
                            
                            # Visit child pages if enabled
                            if config.child_pages.get('enabled'):
                                for idx, product in enumerate(new_products):
                                    if product.get('source_url'):
                                        try:
                                            # Use a temporary page to avoid losing state of the list page
                                            detail_page = await context.new_page()
                                            await self._scrape_product_details(detail_page, product, config)
                                            await detail_page.close()
                                            logger.debug(f"Scraped details for product {idx + 1}/{len(new_products)}")
                                        except Exception as e:
                                            logger.warning(f"Failed to scrape details for {product.get('source_url')}: {e}")
                            
                            all_products.extend(new_products)
                            for p in new_products:
                                if p['part_number']:
                                    processed_parts.add(p['part_number'])
                        
                        # Check for Next Page / Show More
                        next_selector = config.pagination.get('next_button')
                        if not next_selector:
                            logger.info("No next button selector configured. Ending pagination.")
                            break # No next button configured, end pagination
                            
                        next_el = await page.query_selector(next_selector)
                        if not next_el:
                            logger.info("Next button not found on page. Ending pagination.")
                            break # Next button not found, end pagination
                            
                        href = await next_el.get_attribute('href')
                        if href:
                            # Link-based pagination
                            logger.info(f"Navigating to next page via link: {href}")
                            current_url = page.url.split('?')[0] + href if href.startswith('?') else href
                            await page.goto(current_url, wait_until='networkidle')
                        else:
                            # Button-based pagination (e.g., SICK 'Show more')
                            logger.info("Clicking 'Show More' button.")
                            await next_el.click()
                            await page.wait_for_load_state('networkidle')
                            await asyncio.sleep(2) # Extra buffer for AJAX render
                            
                        page_count += 1
                        
                except PlaywrightTimeout:
                    logger.error(f"Timeout loading page: {current_url}")
                except Exception as e:
                    logger.error(f"Error on {current_url}: {e}", exc_info=True)
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
        product_url = product['source_url']
        
        try:
            # Wait longer for SICK's Angular SPA to fully render
            await page.goto(product_url, wait_until='networkidle', timeout=45000)
            await page.wait_for_timeout(3000) # Buffer for lazy-loaded components
            
            # 1. Extract Category (Robust Breadcrumb & Headline)
            try:
                category = await page.evaluate("""() => {
                    // Try to find breadcrumbs (may be in shadow DOM)
                    const breadcrumbs = Array.from(document.querySelectorAll('syn-breadcrumb-item, .breadcrumb-item'));
                    if (breadcrumbs.length >= 2) {
                        return breadcrumbs[breadcrumbs.length - 2].innerText.trim();
                    }
                    
                    // Fallback: Product Type or Series headline
                    const subHeadline = document.querySelector('h1.headline .category, span.category');
                    if (subHeadline) return subHeadline.innerText.trim();
                    
                    return null;
                }""")
                if category: product['category'] = category
            except Exception as e:
                logger.debug(f"Category extraction failed: {e}")

            # 2. Extract Images (Detail Level)
            try:
                img_selector = config.selectors.get('image', 'picture img.loaded')
                image_urls = await page.evaluate(f"""() => {{
                    const imgs = document.querySelectorAll("{img_selector}");
                    // Map data-src first, then fall back to src
                    return Array.from(imgs).map(img => img.getAttribute('data-src') || img.src).filter(url => url && !url.includes('spacer.gif'));
                }}""")
                if image_urls: product['image_urls'] = image_urls
            except Exception as e:
                logger.debug(f"Image extraction failed: {e}")

            # 3. Extract Merged Specifications
            # SICK often hides tables in tabs; we try to find all tech-tables/customs-tables in the DOM
            specs_selector = config.selectors.get('specs_table', '.tech-table table, .customs-table table')
            try:
                # Wait for at least one table to appear
                try: 
                    await page.wait_for_selector('.tech-table', timeout=5000)
                except:
                    pass

                specs_html_list = await page.evaluate(f"""() => {{
                    const tables = document.querySelectorAll("{specs_selector}");
                    return Array.from(tables).map(t => t.outerHTML);
                }}""")
                
                merged_specs = product.get('specifications', {})
                for html in specs_html_list:
                    merged_specs.update(self._parse_table_html(html))
                product['specifications'] = merged_specs
            except Exception as e:
                logger.warning(f"Specs extraction failed for {product_url}: {e}")
            
            # 4. Extract PDF Link Button (Wait for split-button)
            pdf_selector = config.selectors.get('pdf_link', '[data-test-id="split-button-main"]')
            try:
                pdf_data = await page.evaluate(f"""() => {{
                    const buttons = document.querySelectorAll("{pdf_selector}");
                    return Array.from(buttons).map(btn => {{
                        const text = btn.innerText.trim();
                        // Check for common label patterns
                        if (text.toLowerCase().includes("english") || text.toLowerCase().includes("download")) {{
                            return "Download Available: " + text;
                        }}
                        return null;
                    }}).filter(v => v !== null);
                }}""")
                if pdf_data: product['pdf_urls'] = pdf_data
            except Exception as e:
                logger.debug(f"PDF extraction failed: {e}")

            # 5. Extract Suitable Accessories
            accessories_selector = config.selectors.get('accessories_tile', 'ui-product-teaser-tile')
            try:
                accessories = await page.evaluate(f"""() => {{
                    const tiles = document.querySelectorAll("{accessories_selector}");
                    return Array.from(tiles).map(tile => {{
                        const nameEl = tile.querySelector('h4.format-xs');
                        const partNoEl = tile.querySelector('.text-semibold');
                        const imgEl = tile.querySelector('img.loaded');
                        const linkEl = tile.querySelector('syn-button a');
                        
                        // Extract text and clean up
                        const name = nameEl ? nameEl.innerText.trim() : null;
                        const partNumber = partNoEl ? partNoEl.innerText.replace('Part no.:', '').trim() : null;
                        const imageUrl = imgEl ? (imgEl.getAttribute('data-src') || imgEl.src) : null;
                        let productUrl = linkEl ? linkEl.getAttribute('href') : null;
                        
                        if (productUrl && !productUrl.startsWith('http')) {{
                            productUrl = window.location.origin + productUrl;
                        }}
                        
                        if (name && partNumber) {{
                            return {{
                                name: name,
                                part_number: partNumber,
                                image_url: imageUrl,
                                product_url: productUrl
                            }};
                        }}
                        return null;
                    }}).filter(v => v !== null);
                }}""")
                product['accessories'] = accessories
            except Exception as e:
                logger.debug(f"Accessories extraction failed: {e}")
                
        except Exception as e:
            logger.warning(f"Failed to load detail page {product_url}: {e}")
            # Ensure fields exist for validation even on failure
            if 'specifications' not in product: product['specifications'] = {}
            if 'pdf_urls' not in product: product['pdf_urls'] = []
            if 'accessories' not in product: product['accessories'] = []
    
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
        Parse HTML table into key-value specifications, handling nested tables.
        """
        soup = BeautifulSoup(html, 'html.parser')
        specs = {}
        
        # We look for all TRs that have at least 2 direct child TDs or THs
        # Or TRs that contain sub-tables
        for row in soup.find_all('tr'):
            # Check for direct children only to avoid double-processing nested tables in same loop
            cells = row.find_all(['td', 'th'], recursive=False)
            
            if len(cells) >= 2:
                key = cells[0].text.strip()
                # If the second cell has its own table, BeautifulSoup find_all('tr') will handle it
                # because it's recursive. We just need to make sure we don't add the parent key if it's 
                # just a header for a sub-table.
                
                # Check if second cell has text or is just a container
                value_text = cells[1].get_text(strip=True, separator=' ')
                
                if key and value_text and not cells[1].find('table'):
                    specs[key] = value_text
            
            # Special case for SICK: rows with a sub-table inside a colspan=2 cell
            elif len(cells) == 1 and cells[0].get('colspan') == '2' and cells[0].find('table'):
                 # These rows are just containers; the recursive find_all('tr') will pick up the inner rows.
                 pass
        
        return specs
