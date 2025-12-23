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
                
                # Strategy A: Precise Selectors (User Provided)
                try:
                    # Part Number from ui-product-part-number
                    part_num_el = await page.query_selector('ui-product-part-number .font-bold')
                    if part_num_el:
                        part_number = await part_num_el.inner_text()
                        part_number = part_number.strip()
                    
                    # Description from Headline & Breadcrumbs
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
                            description = f"{headline_cat}: {headline_title}" # e.g. "Laser distance sensors: WTT12L-B2532"
                    
                    # Breadcrumbs for fallback or extra metadata
                    if description == "Unknown":
                        breadcrumb_texts = []
                        breadcrumbs = await page.query_selector_all('syn-breadcrumb-item .breadcrumb-item__label')
                        for bc in breadcrumbs:
                            txt = await bc.inner_text()
                            if txt and txt.strip() != "Home":
                                breadcrumb_texts.append(txt.strip())
                        
                        if breadcrumb_texts:
                            description = " - ".join(breadcrumb_texts)

                except Exception as e:
                    print(f"[{self.brand_name}] Selector Error: {e}")

                # Strategy B: Meta Tags (Fallback)
                if part_number == "Unknown" or description == "Unknown":
                    og_title_el = await page.query_selector('meta[property="og:title"]')
                    if og_title_el:
                        og_title = await og_title_el.get_attribute('content')
                        if og_title:
                            if description == "Unknown":
                                description = og_title
                            if part_number == "Unknown":
                                if " | " in og_title:
                                    part_number = og_title.split(" | ")[0]
                                elif " - " in og_title:
                                    part_number = og_title.split(" - ")[0]

                # Strategy C: URL Analysis (Last Resort)
                if part_number == "Unknown" or len(part_number) > 20: 
                    import re
                    match = re.search(r'/([^/]+)/p/p\d+', product_url)
                    if match:
                        part_number = match.group(1).upper()

                # 2. Image
                image_url = None
                # Strategy A: Meta Tag
                og_image_el = await page.query_selector('meta[property="og:image"]')
                if og_image_el:
                    image_url = await og_image_el.get_attribute('content')
                
                # Strategy B: Common Image Selectors
                if not image_url:
                    selectors = [
                        'ui-product-detail img.product-image', 
                        'img.product-image', 
                        '.gallery-image img',
                        'img[itemprop="image"]'
                    ]
                    for sel in selectors:
                        img_el = await page.query_selector(sel)
                        if img_el:
                            src = await img_el.get_attribute('src')
                            if src:
                                image_url = src
                                break
                
                if image_url and not image_url.startswith('http'):
                    image_url = f"https://www.sick.com{image_url}"

                # 3. Technical Specs
                specs = {}
                # Strategy: Look for ANY tables
                try:
                    tables = await page.query_selector_all('table')
                    for table in tables:
                        rows = await table.query_selector_all('tr')
                        for row in rows:
                            cells = await row.query_selector_all('td')
                            if len(cells) >= 2:
                                k = await cells[0].inner_text()
                                v = await cells[1].inner_text()
                                if k and v and len(k) < 50:
                                    specs[k.strip()] = v.strip()
                except Exception as e:
                    print(f"Spec extraction error: {e}")

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
                import traceback
                print(f"[{self.brand_name}] Scraper Error: {str(e)}")
                traceback.print_exc()
                return None
            finally:
                if 'browser' in locals():
                    await browser.close()
