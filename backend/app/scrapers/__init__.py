from app.scrapers.abb_scraper import ABBScraper
from app.scrapers.siemens_scraper import SiemensScraper
from app.scrapers.schneider_scraper import SchneiderScraper
from app.scrapers.sick_scraper import SICKScraper
from app.scrapers.murrelektronik_scraper import MurrelektronikScraper

class ScraperManager:
    def __init__(self, db_session):
        self.db = db_session
        self.scrapers = {
            "abb": ABBScraper(self.db),
            "siemens": SiemensScraper(self.db),
            "schneider": SchneiderScraper(self.db),
            "sick": SICKScraper(self.db),
            "murrelektronik": MurrelektronikScraper(self.db)
        }

    def get_scraper(self, brand_name: str):
        return self.scrapers.get(brand_name.lower())

    async def run_all_scrapers(self):
        results = {}
        for brand, scraper in self.scrapers.items():
            print(f"Starting scrape for {brand}...")
            try:
                await scraper.scrape_catalog()
                results[brand] = "Completed"
            except Exception as e:
                results[brand] = f"Failed: {str(e)}"
        return results

    def get_scraping_stats(self):
        # Placeholder for stats implementation
        return {"status": "Stats not implemented yet"}
