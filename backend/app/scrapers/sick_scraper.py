from app.scrapers.base_scraper import BaseScraper
from playwright.async_api import async_playwright

class SICKScraper(BaseScraper):
    def __init__(self, db_session):
        super().__init__("SICK", "https://www.sick.com", db_session)

    async def scrape_catalog(self):
        print(f"[{self.brand_name}] Starting catalog scrape logic (placeholder)...")
        # Implementation would look for product links and call extract_part_details
        pass

    async def extract_part_details(self, product_url: str) -> dict:
        print(f"[{self.brand_name}] Scraping URL: {product_url}")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True, 
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            
            try:
                await page.goto(product_url, timeout=60000, wait_until='domcontentloaded')
                
                # Check for the specific structure mentioned in the plan: ui-product-detail
                # If not found, fall back to generic selectors
                
                # 1. Part Number & Description
                part_number = "Unknown"
                description = "Unknown"
                
                # Try H1
                h1 = await page.title()
                if h1:
                    description = h1
                    parts = h1.split(" | ")
                    if parts:
                        part_number = parts[0]

                # 2. Image
                image_url = None
                # Updated selector based on "ui-product-detail" hint
                img_el = await page.query_selector('ui-product-detail img.product-image') or await page.query_selector('img.main-image')
                if img_el:
                    image_url = await img_el.get_attribute('src')
                    if image_url and not image_url.startswith('http'):
                        image_url = f"https://www.sick.com{image_url}"

                # 3. Technical Specs
                specs = {}
                # Look for tables within the product detail area
                rows = await page.query_selector_all('ui-product-detail table tr')
                if not rows:
                     rows = await page.query_selector_all('.tech-data table tr')

                for row in rows:
                    cells = await row.query_selector_all('td')
                    if len(cells) >= 2:
                        key = await cells[0].inner_text()
                        val = await cells[1].inner_text()
                        if key and val:
                            specs[key.strip()] = val.strip()

                return {
                    "part_number": part_number,
                    "manufacturer": "SICK",
                    "description_en": description,
                    "image_url": image_url,
                    "technical_specs": specs,
                    "source_url": product_url,
                    "status": "active"
                }

            except Exception as e:
                print(f"[{self.brand_name}] Error: {e}")
                return None
            finally:
                await browser.close()
