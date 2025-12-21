from abc import ABC, abstractmethod
from typing import Dict, Optional, List
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseScraper(ABC):
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        })

    @abstractmethod
    def fetch(self, url: str) -> Optional[str]:
        """Fetch content from the URL."""
        pass

    @abstractmethod
    def parse(self, content: str) -> List[Dict]:
        """Parse the content and return a list of product dictionaries."""
        pass
    
    # Save method removed from Base as we will handle DB saving in the implementation or manager
    # to use the centralized app.database connection.
