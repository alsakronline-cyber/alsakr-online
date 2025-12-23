from app.scrapers.base_scraper import BaseScraper

class SICKScraper(BaseScraper):
    def __init__(self, db_session):
        super().__init__("SICK", "https://www.sick.com", db_session)

    async def scrape_catalog(self):
        print(f"[{self.brand_name}] Starting catalog scrape...")
        pass

    async def extract_part_details(self, product_url: str) -> dict:
        print(f"[{self.brand_name}] Scraping URL: {product_url}")
        
        from playwright.async_api import async_playwright
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                # 1. Navigate and Wait
                await page.goto(product_url, timeout=30000)
                await page.wait_for_selector('h1', timeout=15000)
                
                # 2. Extract Basic Info
                # Get Part Number (Type Code from H1)
                h1_element = await page.query_selector('h1')
                h1_text = await h1_element.inner_text() if h1_element else "Unknown Part"
                part_number = h1_text.strip().replace("\n", " ")

                # Get Description (fallback to H1 if specific desc not found)
                description = part_number

                # 3. Extract Image
                # Look for the main image in the gallery
                image_url = None
                img_element = await page.query_selector('ui-akamai-image figure picture img')
                if img_element:
                    image_url = await img_element.get_attribute('src') or await img_element.get_attribute('data-src')
                    if image_url and not image_url.startswith('http'):
                        image_url = f"https://www.sick.com{image_url}"
                
                # 4. Extract Technical Specs
                specs = {}
                
                # Expand technical details if needed (accordion)
                # Ensure the 'Technical details' section is visible/loaded
                # In the provided HTML, it seems tabs are used inside the accordion.
                # We'll try to select all keys and values from tables inside the technical details area.
                
                # Wait for tables to be present - sometimes loaded async
                try:
                    await page.wait_for_selector('div.tech-table table', timeout=5000)
                except:
                    print("Timeout waiting for tech tables")

                # Iterate over all rows in all tech tables
                rows = await page.query_selector_all('div.tech-table table tr')
                
                for row in rows:
                    cells = await row.query_selector_all('td')
                    if len(cells) == 2:
                        key = await cells[0].inner_text()
                        value = await cells[1].inner_text()
                        if key and value:
                            specs[key.strip()] = value.strip()

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
                print(f"Playwright scraping failed: {e}")
                # Save screenshot for debugging
                await page.screenshot(path="error_screenshot.png")
                raise e
            finally:
                await browser.close()
