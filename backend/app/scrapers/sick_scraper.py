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
                    # User specified: <span class="part-no">1072635</span>
                    part_no_span = page.locator('span.part-no').first
                    if await part_no_span.count() > 0:
                        part_number = await part_no_span.inner_text()
                    else:
                        # Fallback: ui-product-part-number .font-bold
                        part_num_loc = page.locator('ui-product-part-number .font-bold').first
                        if await part_num_loc.count() > 0:
                            part_number = await part_num_loc.inner_text()
                    
                    if part_number != "Unknown":
                        part_number = part_number.strip()
                    
                    # Fallback Search in Table
                    if part_number == "Unknown":
                        # tr containing "Part no.:"
                        part_row = page.locator('tr', has_text="Part no.:").first
                        if await part_row.count() > 0:
                            row_text = await part_row.inner_text() 
                            clean_text = row_text.replace("Part no.:", "").strip()
                            if clean_text:
                                part_number = clean_text.split()[0]

                    # Description
                    # User specified: <h1 class="headline"><span class="title uppercase">...</span></h1>
                    headline_title = ""
                    headline_cat = ""
                    
                    # Title
                    title_loc = page.locator('h1.headline .title, ui-headline .title').first
                    if await title_loc.count() > 0:
                        headline_title = await title_loc.inner_text()
                    
                    # Category
                    cat_loc = page.locator('span.category, ui-headline .category').first
                    if await cat_loc.count() > 0:
                        headline_cat = await cat_loc.inner_text()
                        
                    if headline_title:
                        description = headline_title
                        if headline_cat:
                            description = f"{headline_cat}: {headline_title}"
                            
                    # Breadcrumbs Fallback
                    # User specified: <syn-breadcrumb-item>...</syn-breadcrumb-item>
                    if description == "Unknown" or description == "":
                        breadcrumb_texts = []
                        breadcrumbs = page.locator('syn-breadcrumb-item')
                        count = await breadcrumbs.count()
                        for i in range(count):
                            # Try to get text from the item itself or its label slot
                            txt = await breadcrumbs.nth(i).inner_text()
                            if txt:
                                # Clean up formatting often found in breadcrumbs (newlines, "Home")
                                lines = txt.split('\n')
                                clean_lines = [l.strip() for l in lines if l.strip() and l.strip() != "Home" and l.strip() != "Products"]
                                breadcrumb_texts.extend(clean_lines)
                        
                        # Remove duplicates while preserving order
                        unique_crumbs = []
                        [unique_crumbs.append(x) for x in breadcrumb_texts if x not in unique_crumbs]
                        
                        if unique_crumbs:
                            description = " - ".join(unique_crumbs)

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
                    # User specified: <img alt="PowerProx, WTT12L" ... src="...">
                    # We look for large product images first
                    
                    # Selector: imgs inside gallery
                    imgs = page.locator('cms-product-variant-image-gallery img, ui-gallery img')
                    count = await imgs.count()
                    for i in range(count):
                        # Get src
                        src = await imgs.nth(i).get_attribute('src')
                        if not src:
                            src = await imgs.nth(i).get_attribute('data-src')
                        
                        # Check size or class to avoid thumbnails if possible, but taking first valid product img is usually safe
                        if src:
                            if src.startswith("//"):
                                src = "https:" + src
                            elif src.startswith("/"):
                                src = "https://www.sick.com" + src
                            
                            # Filter out youtube thumbs if possible (usually contain 'ytimg' or 'youtube')
                            if "youtube" not in src and "ytimg" not in src:
                                if src not in processed_images:
                                    processed_images.append(src)
                    
                    if processed_images:
                        image_url = processed_images[0]
                    
                    # Fallback to meta
                    if not image_url:
                        og_img = await page.query_selector('meta[property="og:image"]')
                        if og_img:
                            image_url = await og_img.get_attribute('content')

                except Exception as e:
                    print(f"[{self.brand_name}] Image Error: {e}")

                # 3. Technical Specifications & Drawings
                technical_specs = {}
                
                try:
                    # User specified: grid/table structure. 
                    # "Functional Principle: <div>Functional principle</div> ..." suggests div logic too, 
                    # but dump showed distinct tables. We will hunt for both.
                    
                    # A. Table Scan (Most reliable from dump)
                    # Look for ANY table inside the main product detail area
                    tables = page.locator('webx-product-detail table, ui-technical-product-detail table, ui-generic-table table')
                    table_count = await tables.count()
                    
                    for i in range(table_count):
                        rows = tables.nth(i).locator('tr')
                        row_count = await rows.count()
                        for j in range(row_count):
                            cols = rows.nth(j).locator('td')
                            if await cols.count() >= 2:
                                key = await cols.nth(0).inner_text()
                                val = await cols.nth(1).inner_text()
                                # Clean data
                                if key and val:
                                    # Fix: Remove footnotes like "1)" from values if present
                                    # val = val.split("1)")[0].strip() # Simplistic, maybe just raw is better
                                    technical_specs[key.strip()] = val.strip()

                    # B. Div/Grid Scan (Based on user note "<div>Functional principle</div>")
                    # If tables didn't yield much, or to supplement
                    # Finding pairs of divs is tricky without a common parent class. 
                    # We'll assume the tables covered it, but we can look for "tech-table" divs if they aren't actual <table> elements
                    # (The dump showed they ARE tables, so we rely on A)
                    
                    # C. Technical Drawings
                    drawings_list = []
                    d_imgs = page.locator('ui-technical-drawings img')
                    d_count = await d_imgs.count()
                    for i in range(d_count):
                        src = await d_imgs.nth(i).get_attribute('src') or await d_imgs.nth(i).get_attribute('data-src')
                        if src:
                             if src.startswith("//"):
                                src = "https:" + src
                             elif src.startswith("/"):
                                src = "https://www.sick.com" + src
                             drawings_list.append(src)
                    
                    if drawings_list:
                        technical_specs["TechnicalDrawings"] = drawings_list
                        
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
