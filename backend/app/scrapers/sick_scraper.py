from app.scrapers.base_scraper import BaseScraper
from playwright.async_api import async_playwright

class SICKScraper(BaseScraper):
    def __init__(self, db_session):
        super().__init__("SICK", "https://www.sick.com", db_session)

    async def scrape_catalog(self):
        print(f"[{self.brand_name}] Starting catalog scrape logic (placeholder)...")
        # Implementation would look for product links and call extract_part_details
        pass

    async def extract_part_details(self, product_url: str):
        print(f"[{self.brand_name}] Scraping URL: {product_url}")
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            )
            page = await context.new_page()
            
            try:
                # Use networkidle to wait for redirects/SPA hydration to finish (Fixes Execution Context Error)
                await page.goto(product_url, timeout=90000, wait_until='networkidle')
                await page.wait_for_timeout(2000) # Safety sleep
                
                # 1. Part Number & Description
                part_number = "Unknown"
                description = "Unknown"
                
                # Part Number
                part_num_el = await page.query_selector('ui-product-part-number .font-bold')
                if part_num_el:
                    part_number = await part_num_el.inner_text()
                    part_number = part_number.strip()
                
                # Description (Headline)
                headline_cat = ""
                headline_title = ""
                
                cat_el = await page.query_selector('ui-headline .category')
                if cat_el:
                    headline_cat = await cat_el.inner_text()
                    
                title_el = await page.query_selector('ui-headline .title')
                if title_el:
                    headline_title = await title_el.inner_text()
                    
                if headline_title:
                    description = headline_title
                    if headline_cat:
                        description = f"{headline_cat}: {headline_title}"

                # Fallback implementation if specific selectors fail
                if part_number == "Unknown":
                     og_title_el = await page.query_selector('meta[property="og:title"]')
                     if og_title_el:
                         og_txt = await og_title_el.get_attribute('content')
                         if og_txt and " | " in og_txt:
                             part_number = og_txt.split(" | ")[0]

                # 2. Images
                image_url = None
                technical_drawings = []
                
                # Main Gallery Images
                gallery_imgs = await page.query_selector_all('cms-product-variant-image-gallery img')
                for img in gallery_imgs:
                    src = await img.get_attribute('data-src') or await img.get_attribute('src')
                    if src:
                        if not src.startswith('http'):
                            src = f"https://www.sick.com{src}"
                        if not image_url:
                            image_url = src # First image is main
                        # Break after finding one good image? Or collect all?
                        # For now, just getting the main one is often sufficient for the 'image_url' field.
                        break
                
                # Technical Drawings
                drawing_imgs = await page.query_selector_all('ui-technical-drawings img')
                for img in drawing_imgs:
                     src = await img.get_attribute('data-src') or await img.get_attribute('src')
                     if src:
                        if not src.startswith('http'):
                            src = f"https://www.sick.com{src}"
                        technical_drawings.append(src)

                # 3. Technical Specs (Iterate all tech tables)
                specs = {}
                rows = await page.query_selector_all('div.tech-table tr')
                for row in rows:
                    cols = await row.query_selector_all('td')
                    if len(cols) == 2:
                        key = await cols[0].inner_text()
                        val = await cols[1].inner_text()
                        if key and val:
                            specs[key.strip()] = val.strip()
                
                # Add Technical Drawings to specs if found
                if technical_drawings:
                    specs["Technical Drawings"] = technical_drawings

                return {
                    "part_number": part_number,
                    "manufacturer": "SICK",
                    "description": description,
                    "description_en": description,
                    "specifications": specs,
                    "technical_specs": specs,
                    "image_url": image_url,
                    "source_url": product_url
                }

            except Exception as e:
                import traceback
                print(f"[{self.brand_name}] Scraper Error: {str(e)}")
                traceback.print_exc()
                return None
            finally:
                if 'browser' in locals():
                    await browser.close()
