import time
import logging
import json
import hashlib
import os
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from app.scrapers.base import BaseScraper
# Database imports
from app.database import SessionLocal
from sqlalchemy import text

logger = logging.getLogger(__name__)

class SickScraper(BaseScraper):
    """
    Scraper for SICK (sick.com) using Selenium to handle dynamic content.
    Extracts product details, specifications, images, and datasheets.
    """
    def __init__(self, headless=True):
        super().__init__("https://www.sick.com")
        self.headless = headless
        self.driver = self._setup_driver()

    def _setup_driver(self):
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        try:
            selenium_host = os.getenv("SELENIUM_HOST", "selenium")
            logger.info(f"Connecting to Remote Selenium at http://{selenium_host}:4444/wd/hub ...")
            driver = webdriver.Remote(
                command_executor=f'http://{selenium_host}:4444/wd/hub',
                options=chrome_options
            )
        except Exception as e:
            logger.warning(f"Remote Selenium failed, trying local Chrome: {e}")
            # Fallback for local testing if driver is installed
            try:
                driver = webdriver.Chrome(options=chrome_options)
            except:
                logger.error("Could not initialize local Chrome driver either.")
                raise e
            
        return driver

    def fetch(self, url: str) -> Optional[str]:
        """Fetch dynamic page content using Selenium with Retries"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                logger.info(f"Navigating to {url} (Attempt {attempt+1}/{max_retries})")
                self.driver.get(url)
                
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
                
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
                time.sleep(2)
                
                return self.driver.page_source
            except Exception as e:
                logger.warning(f"Error fetching {url}: {e}")
                time.sleep(2 * (attempt + 1))
                
        logger.error(f"Failed to fetch {url} after {max_retries} attempts.")
        return None

    def scrape_category(self, start_url: str, max_products=100):
        all_products = []
        visited_urls = set()
        
        logger.info(f"Navigating to {start_url}")
        self.driver.get(start_url)
        time.sleep(3)
        
        products_collected = 0
        while products_collected < max_products:
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            page_links = soup.find_all('a', href=True)
            candidate_urls = []
            for link in page_links:
                href = link['href']
                if '/p/' in href:
                     if not href.startswith('http'):
                         href = "https://www.sick.com" + href if href.startswith('/') else "https://www.sick.com/" + href
                     candidate_urls.append(href)
                     
            unique_candidates = list(set(candidate_urls))
            
            for p_url in unique_candidates:
                if products_collected >= max_products:
                    break
                if p_url in visited_urls:
                    continue
                
                visited_urls.add(p_url)
                self.driver.execute_script(f"window.open('{p_url}', '_blank');")
                self.driver.switch_to.window(self.driver.window_handles[-1])
                
                try:
                    p_data = self._scrape_product_page(p_url)
                    if p_data:
                        all_products.extend(p_data)
                        products_collected += 1
                        self.save_products(p_data) # Save incrementally
                except Exception as e:
                    logger.error(f"Error processing {p_url}: {e}")
                finally:
                    self.driver.close()
                    self.driver.switch_to.window(self.driver.window_handles[0])

            if products_collected >= max_products:
                break
            
            # Pagination Logic
            try:
                load_more_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Load more') or contains(text(), 'Show more')]")
                if load_more_btn and load_more_btn.is_displayed():
                    self.driver.execute_script("arguments[0].scrollIntoView(true);", load_more_btn)
                    time.sleep(1)
                    self.driver.execute_script("arguments[0].click();", load_more_btn)
                    time.sleep(3)
                else:
                    break
            except:
                break

        return all_products

    def _scrape_product_page(self, url: str) -> List[Dict]:
        logger.info(f"Scraping Product: {url}")
        content = self.fetch(url)
        if content:
            return self.parse(content, url=url)
        return []

    def parse(self, content: str, url: str = "") -> List[Dict]:
        soup = BeautifulSoup(content, 'html.parser')
        product = {
            "source": "SICK",
            "url": url,
            "language": "en",
            "category": ""
        }

        # 1. Product Name
        title_elem = soup.select_one('ui-headline h1.headline span.title') or soup.find('h1')
        product['product_name'] = title_elem.get_text(strip=True) if title_elem else "Unknown Product"
        
        # 2. SKU
        sku_elem = soup.select_one('ui-product-part-number .font-bold') or soup.find('span', class_='product-id')
        if sku_elem:
            product['sku_id'] = sku_elem.get_text(strip=True).replace('Part no.:', '').strip()
        else:
            product['sku_id'] = f"unknown-{hashlib.md5(url.encode()).hexdigest()[:8]}"

        # 3. Description
        desc_elem = soup.find('div', class_='product-description')
        product['description'] = desc_elem.get_text(strip=True) if desc_elem else ""

        # 4. Specifications
        specs = {}
        tables = soup.select('.tech-table table') or soup.find_all('table')
        for table in tables:
             rows = table.find_all('tr')
             for row in rows:
                 cols = row.find_all(['th', 'td'])
                 if len(cols) == 2:
                     k = cols[0].get_text(strip=True)
                     v = cols[1].get_text(strip=True)
                     if k and v:
                        specs[k] = v
        product['specifications'] = specs

        # 5. Images
        images = []
        for img in soup.find_all('img'):
            src = img.get('src')
            if src and 'im00' in src.lower():
                if not src.startswith('http'):
                    src = "https://www.sick.com" + src
                images.append(src)
        product['images'] = list(set(images))
        
        # 6. Technical Drawings (Mock logic based on doc)
        product['technical_drawings'] = [] 

        # 7. Datasheet
        ds_link = soup.select_one('a[href$=".pdf"]')
        if ds_link:
             href = ds_link.get('href')
             product['datasheet_url'] = "https://www.sick.com" + href if href.startswith('/') else href
        else:
             product['datasheet_url'] = None

        return [product]

    def close(self):
        if self.driver:
            self.driver.quit()

    def save_products(self, products: List[Dict]):
        """Save products using the centralized FastAPI DB session"""
        session = SessionLocal()
        try:
            for p in products:
                # Upsert logic - simplified for demo
                # In production, use proper SQLAlchemy ORM or Core Upsert
                # Here uses raw SQL for compatibility with the reference doc
                session.execute(text("""
                    INSERT INTO products (sku_id, product_name, description, specifications, images)
                    VALUES (:sku, :name, :desc, :specs, :imgs)
                    ON CONFLICT(sku_id) DO UPDATE SET
                    product_name = EXCLUDED.product_name,
                    description = EXCLUDED.description
                """), {
                    "sku": p['sku_id'],
                    "name": p['product_name'],
                    "desc": p['description'],
                    "specs": json.dumps(p['specifications']),
                    "imgs": json.dumps(p['images'])
                })
            session.commit()
            logger.info(f"Saved {len(products)} products to DB.")
        except Exception as e:
            logger.error(f"DB Error: {e}")
            session.rollback()
        finally:
            session.close()
