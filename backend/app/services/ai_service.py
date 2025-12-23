import re

class AIService:
    @staticmethod
    def parse_vendor_quote(email_content: str) -> dict:
        """
        Parses raw email content using regex (mocking LLM) to extract quote details.
        Expected format in email for this mock:
        "Price: 100 USD"
        "Lead Time: 2 weeks"
        "Availability: In Stock"
        """
        
        # Mock regex extraction to simulate AI
        price_match = re.search(r"Price:\s*([\d\.]+)", email_content, re.IGNORECASE)
        currency_match = re.search(r"Price:.*?([A-Z]{3})", email_content, re.IGNORECASE)
        lead_time_match = re.search(r"Lead Time:\s*(.+)", email_content, re.IGNORECASE)
        availability_match = re.search(r"Availability:\s*(.+)", email_content, re.IGNORECASE)
        
        price = float(price_match.group(1)) if price_match else 0.0
        currency = currency_match.group(1) if currency_match else "USD"
        lead_time = lead_time_match.group(1).strip() if lead_time_match else "Unknown"
        availability = availability_match.group(1).strip() if availability_match else "Check with vendor"
        
        return {
            "price": price,
            "currency": currency,
            "lead_time": lead_time,
            "availability": availability,
            "shipping_cost": 0.0 # Default/Mock
        }
