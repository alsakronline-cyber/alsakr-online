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
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            )
            page = await context.new_page()
            
            try:
                print(f"[{self.brand_name}] Navigating to {product_url}...")
                # Increase timeout and wait for network idle to handle SPA loading
                await page.goto(product_url, timeout=90000, wait_until='networkidle')
                await page.wait_for_timeout(2000) # Safety sleep
                
                # Debug: Print Title to confirm access
                page_title = await page.title()
                print(f"[{self.brand_name}] Page Title: {page_title}")
                
                # Wait for main product container to ensure page is rendered
                try:
                    await page.wait_for_selector('webx-product-detail', state='attached', timeout=10000)
                except:
                    print(f"[{self.brand_name}] Warning: webx-product-detail not found")

                # Take a screenshot for debugging (saved in backend container)
                await page.screenshot(path="last_scrape_debug.png", full_page=True)

                # 1. Part Number & Description
                part_number = "Unknown"
                description = "Unknown"
                
                # Strategy A: Precise Selectors (using Locator to wait)
                try:
                    # Part Number
                    # Try finding valid part number in ui-product-part-number
                    part_num_loc = page.locator('ui-product-part-number .font-bold').first
                    if await part_num_loc.count() > 0:
                        part_number = await part_num_loc.inner_text()
                        part_number = part_number.strip()
                    
                    # Fallback: Look for "Part no.:" text in table row 
                    if part_number == "Unknown":
                        # tr containing "Part no.:"
                        part_row = page.locator('tr', has_text="Part no.:").first
                        if await part_row.count() > 0:
                            # Extract all text from row and try to isolate number
                            row_text = await part_row.inner_text() 
                            # row_text might be "Part no.: 1072635"
                            clean_text = row_text.replace("Part no.:", "").strip()
                            if clean_text:
                                part_number = clean_text.split()[0] # Take first word if multiple

                    # Description from Headline
                    headline_cat = ""
                    headline_title = ""
                    
                    cat_loc = page.locator('ui-headline .category').first
                    if await cat_loc.count() > 0:
                        headline_cat = await cat_loc.inner_text()
                        
                    title_loc = page.locator('ui-headline .title').first
                    if await title_loc.count() > 0:
                        headline_title = await title_loc.inner_text()
                        
                    if headline_title:
                        description = headline_title
                        if headline_cat:
                            description = f"{headline_cat}: {headline_title}"
                            
                    # Breadcrumbs Fallback
                    if description == "Unknown" or description == "":
                        breadcrumb_texts = []
                        # Provide a generous timeout for breadcrumbs as they might load late
                        breadcrumbs = page.locator('syn-breadcrumb-item .breadcrumb-item__label')
                        count = await breadcrumbs.count()
                        for i in range(count):
                            txt = await breadcrumbs.nth(i).inner_text()
                            if txt and txt.strip() != "Home":
                                breadcrumb_texts.append(txt.strip())
                        
                        if breadcrumb_texts:
                            description = " - ".join(breadcrumb_texts)

                except Exception as e:
                    print(f"[{self.brand_name}] Selector Error (Strategy A): {e}")

                # Strategy B: Meta Tags (Fallback)
                if part_number == "Unknown" or description == "Unknown" or description == "":
                    try:
                        og_title_el = await page.query_selector('meta[property="og:title"]')
                        if og_title_el:
                            og_txt = await og_title_el.get_attribute('content')
                            if og_txt:
                                if description == "Unknown" or description == "":
                                    description = og_txt
                                if part_number == "Unknown" and " | " in og_txt:
                                    part_number = og_txt.split(" | ")[0]
                    except Exception as meta_e:
                        print(f"Meta tag extraction error: {meta_e}")

                # 2. Images
                image_url = None
                processed_images = []
                
                try:
                    # Main Gallery Images (ui-akamai-image inside gallery)
                    imgs = page.locator('cms-product-variant-image-gallery ui-akamai-image img')
                    count = await imgs.count()
                    for i in range(count):
                        src = await imgs.nth(i).get_attribute('src') or await imgs.nth(i).get_attribute('data-src')
                        if src:
                            if src.startswith("//"):
                                src = "https:" + src
                            elif src.startswith("/"):
                                src = "https://www.sick.com" + src
                            
                            if src not in processed_images:
                                processed_images.append(src)
                    
                    if processed_images:
                        image_url = processed_images[0]

                except Exception as e:
                    print(f"[{self.brand_name}] Image Error: {e}")

                # 3. Technical Specifications & Drawings
                technical_specs = {}
                
                try:
                    # A. Standard Tech Tables
                    # Locate all tables inside div.tech-table
                    tables = page.locator('div.tech-table table')
                    table_count = await tables.count()
                    
                    for i in range(table_count):
                        rows = tables.nth(i).locator('tr')
                        row_count = await rows.count()
                        for j in range(row_count):
                            cols = rows.nth(j).locator('td')
                            if await cols.count() == 2:
                                key = await cols.nth(0).inner_text()
                                val = await cols.nth(1).inner_text()
                                if key and val:
                                    technical_specs[key.strip()] = val.strip()

                    # B. Technical Drawings (often separate images)
                    drawing_imgs = page.locator('ui-technical-drawings ui-akamai-image img')
                    d_count = await drawing_imgs.count()
                    drawings_list = []
                    for i in range(d_count):
                        d_src = await drawing_imgs.nth(i).get_attribute('src') or await drawing_imgs.nth(i).get_attribute('data-src')
                        if d_src:
                            if d_src.startswith("//"):
                                d_src = "https:" + d_src
                            elif d_src.startswith("/"):
                                d_src = "https://www.sick.com" + d_src
                            drawings_list.append(d_src)
                    
                    if drawings_list:
                        technical_specs["TechnicalDrawings"] = drawings_list

                    # C. Customs Data (Unit weight, Country of origin etc.)
                    # Often in specific tables or generic tables we already parsed, but let's double check specific customs-table class if exists
                    customs_rows = page.locator('ui-generic-table.customs-table tr')
                    c_count = await customs_rows.count()
                    for i in range(c_count):
                        cols = customs_rows.nth(i).locator('td')
                        if await cols.count() >= 2:
                            key = await cols.nth(0).inner_text()
                            val = await cols.nth(1).inner_text()
                            if key and val:
                                technical_specs[key.strip()] = val.strip()

                except Exception as e:
                    print(f"[{self.brand_name}] Specs Error: {e}")
                    import traceback
                    traceback.print_exc()

                return {
                    "part_number": part_number,
                    "manufacturer": self.brand_name,
                    "description": description,
                    "description_en": description,
                    "specifications": technical_specs, # Qdrant expects 'specifications'
                    "technical_specs": technical_specs, # Frontend might expect this
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
